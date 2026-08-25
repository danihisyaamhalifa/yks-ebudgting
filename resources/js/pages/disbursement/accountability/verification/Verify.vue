<script setup lang="ts">
import { UploadedFile } from '@/components/file-upload/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/AppLayout.vue';
import VerificationHistoryTab from '@/pages/budget/components/VerificationHistoryTab.vue';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import axios from 'axios';
import {
    Banknote,
    CheckCircle,
    ClipboardList,
    CreditCard,
    FileEdit,
    History,
    TrendingUp,
    Upload,
    Wallet,
    X,
    XCircle,
} from 'lucide-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';
import { toast } from 'vue-sonner';

// Interfaces
interface BudgetAccountabilityItem {
    id: number;
    expense_date: string;
    description: string;
    amount: number;
    receipt_no?: string;
    notes?: string;
}

interface BudgetAccountabilityReturn {
    id: number;
    return_date: string;
    amount: number;
    receipt_no?: string;
    fund_source_id?: number;
    fund_source?: {
        id: number;
        name: string;
        code: string;
    };
    notes?: string;
}

interface BudgetAccountability {
    id: number;
    accountability_no: string;
    accountability_date: string;
    budget_fund_release_id: number;
    total_received: number;
    total_spent: number;
    total_returned: number;
    status: string;
    status_display: string;
    notes?: string;
    rejection_reason?: string;
    verification_notes?: string;
    fund_release?: {
        id: number;
        fund_release_no: string;
        fund_release_date: string;
        total_amount: number;
        fund_source?: {
            id: number;
            name: string;
            code: string;
        };
        disbursement_header?: {
            id: number;
            disbursement_no: string;
            request_header?: {
                id: number;
                request_no: string;
                unit?: {
                    id: number;
                    unit_name: string;
                };
                fiscal_year?: {
                    id: number;
                    year: string;
                };
            };
        };
    };
    items?: BudgetAccountabilityItem[];
    returns?: BudgetAccountabilityReturn[];
    files: UploadedFile[];
}

interface Verifier {
    id: number;
    name: string;
    role: string;
    role_id?: number;
    department: string;
    verificationStatus:
        | 'pending'
        | 'waiting'
        | 'completed'
        | 'rejected'
        | 'approved';
    verifiedAt?: string;
    notes?: string;
    decision?: string;
    step: number;
    isCurrentLevel?: boolean;
}

interface AccountabilityApproval {
    id: number;
    approval_level: number;
    role: string;
    status: 'waiting' | 'pending' | 'approved' | 'rejected' | 'returned';
    approved_by: number | null;
    approved_at: string | null;
    notes: string | null;
    is_current: boolean;
}

interface ApprovalsResponse {
    success: boolean;
    message: string;
    data: {
        header_status: string;
        current_level: number;
        approvals: AccountabilityApproval[];
    };
}

interface VerificationData {
    status: 'approved' | 'returned' | 'rejected' | '';
    notes: string;
    history?: Array<{
        step: number;
        verifierId: number;
        verifierName: string;
        status: string;
        notes: string;
        verifiedAt: string;
    }>;
}

// Props
const props = defineProps<{
    id: number | string;
}>();

// State untuk tab
const activeTab = ref<'verifikasi' | 'riwayat'>('verifikasi');

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Verifikasi Pertanggungjawaban',
        href: '/verifikasi-pertanggungjawaban',
    },
    {
        title: 'Form Verifikasi Pertanggungjawaban',
        href: '',
    },
];

// Data verifikator dari API
const verifiers = ref<Verifier[]>([]);

// State untuk header status dan current level dari response
const headerStatus = ref<string>('');
const currentLevel = ref<number>(0);

// Simplified verification data
const verificationData = reactive<VerificationData>({
    status: '',
    notes: '',
    history: [],
});

// Reactive data
const isSubmitting = ref(false);
const showLoadingSkeleton = ref(true);
const isLoadingApprovals = ref(false);
const accountability = ref<BudgetAccountability | null>(null);
const accountabilityItems = ref<BudgetAccountabilityItem[]>([]);
const accountabilityReturns = ref<BudgetAccountabilityReturn[]>([]);
const showDocumentPreview = ref(false);
const previewDocumentUrl = ref('');

// Computed properties
const tabs = computed(() => [
    {
        id: 'verifikasi',
        label: 'Verifikasi',
        icon: ClipboardList,
        badge: isCurrentVerifier.value ? 'Aktif' : null,
    },
    {
        id: 'riwayat',
        label: 'Riwayat Verifikasi',
        icon: History,
        badge:
            getCompletedStepsCount.value > 0
                ? `${getCompletedStepsCount.value}/${totalVerificationSteps.value}`
                : null,
    },
]);

const expenseItemsCount = computed(() => {
    return accountabilityItems.value.length;
});

const returnItemsCount = computed(() => {
    return accountabilityReturns.value.length;
});

const totalReceived = computed(() => {
    return accountability.value?.total_received || 0;
});

const totalSpent = computed(() => {
    return accountability.value?.total_spent || 0;
});

const totalReturned = computed(() => {
    return accountability.value?.total_returned || 0;
});

const remainingBalance = computed(() => {
    return totalReceived.value - totalSpent.value - totalReturned.value;
});

const totalVerificationSteps = computed(() => verifiers.value.length);

const currentVerifierStep = computed(() => {
    if (currentLevel.value > 0) {
        return currentLevel.value;
    }

    const waitingVerifier = verifiers.value.find(
        (v) => v.verificationStatus === 'waiting',
    );
    if (waitingVerifier) {
        return waitingVerifier.step;
    }

    const completedSteps = verifiers.value.filter(
        (v) =>
            v.verificationStatus === 'completed' ||
            v.verificationStatus === 'approved',
    ).length;
    return completedSteps + 1;
});

const currentVerifier = computed(() => {
    return verifiers.value.find((v) => v.step === currentVerifierStep.value);
});

const isCurrentVerifier = computed(() => {
    const currentVerifierData = currentVerifier.value;
    if (currentVerifierData && currentVerifierData.isCurrentLevel) {
        return true;
    }

    const currentUserId = parseInt(localStorage.getItem('user_id') || '0');
    const currentUserRole = localStorage.getItem('user_role') || '';
    const currentUserRoleId = parseInt(localStorage.getItem('role_id') || '0');

    if (currentVerifierData) {
        if (currentUserId > 0 && currentVerifierData.id === currentUserId) {
            return true;
        }
        if (currentUserRole && currentVerifierData.role === currentUserRole) {
            return true;
        }
        if (
            currentUserRoleId > 0 &&
            currentVerifierData.role_id === currentUserRoleId
        ) {
            return true;
        }
    }

    return false;
});

const getCompletedStepsCount = computed(() => {
    return verifiers.value.filter(
        (v) =>
            v.verificationStatus === 'completed' ||
            v.verificationStatus === 'approved',
    ).length;
});

const isFormValid = computed(() => {
    return (
        !!verificationData.status && verificationData.notes.trim().length > 0
    );
});

const getPageDescription = () => {
    if (activeTab.value === 'verifikasi') {
        return isCurrentVerifier.value
            ? `Form verifikasi pertanggungjawaban - Tahap ${currentVerifierStep.value} dari ${totalVerificationSteps.value}`
            : 'Lihat detail pertanggungjawaban';
    } else {
        return 'Riwayat lengkap proses verifikasi multi-level';
    }
};

const submitterData = computed(() => ({
    id:
        accountability.value?.fund_release?.disbursement_header?.request_header
            ?.unit?.id || 0,
    name:
        accountability.value?.fund_release?.disbursement_header?.request_header
            ?.unit?.unit_name || '-',
    email: '-',
}));

const submissionDate = computed(
    () => accountability.value?.accountability_date || '',
);

const submitterNotes = computed(() => accountability.value?.notes || '');

// Methods
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
};

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const getStatusVariant = (
    status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const statusMap: Record<
        string,
        'default' | 'secondary' | 'destructive' | 'outline'
    > = {
        draft: 'secondary',
        submitted: 'default',
        verified: 'outline',
        approved: 'default',
        rejected: 'destructive',
        returned: 'outline',
        'Menunggu Verifikasi': 'default',
        'Perlu Revisi': 'outline',
        Disetujui: 'default',
        Ditolak: 'destructive',
    };
    return statusMap[status] || 'default';
};

const getSubmitButtonVariant = () => {
    switch (verificationData.status) {
        case 'approved':
            return 'default';
        case 'returned':
            return 'secondary';
        case 'rejected':
            return 'destructive';
        default:
            return 'default';
    }
};

const getSubmitButtonText = () => {
    return `Simpan Verifikasi Tahap ${currentVerifierStep.value}`;
};

const getDecisionFromStatus = (status: string): string => {
    const decisionMap: Record<string, string> = {
        approved: 'Disetujui',
        returned: 'Dikembalikan untuk Revisi',
        rejected: 'Ditolak',
    };
    return decisionMap[status] || status;
};

const getFinalStatusFromOverall = (status: string): string => {
    const statusMap: Record<string, string> = {
        approved: 'Disetujui',
        returned: 'Perlu Revisi',
        rejected: 'Ditolak',
    };
    return statusMap[status] || 'Menunggu Verifikasi';
};

// Initialization
onMounted(async () => {
    showLoadingSkeleton.value = true;

    try {
        if (props.id) {
            await loadAccountabilityData();
            await loadAccountabilityApprovals(props.id);
            initializeVerificationData();
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        showLoadingSkeleton.value = false;
    }
});

const loadAccountabilityData = async () => {
    try {
        const { data } = await axios.get(
            `/api/v1/budget-accountabilities/${props.id}`,
        );

        const accountabilityData = data.data;

        console.log('Accountability Data:', accountabilityData);

        // Set accountability data
        accountability.value = accountabilityData;

        // Load expense items
        if (accountabilityData.items && accountabilityData.items.length > 0) {
            accountabilityItems.value = accountabilityData.items.map(
                (item: any) => ({
                    id: item.id,
                    expense_date: item.expense_date,
                    description: item.description || '',
                    amount: parseFloat(item.amount || 0),
                    receipt_no: item.receipt_no || '',
                    notes: item.notes || '',
                }),
            );
        } else {
            accountabilityItems.value = [];
        }

        // Load return items
        if (
            accountabilityData.returns &&
            accountabilityData.returns.length > 0
        ) {
            accountabilityReturns.value = accountabilityData.returns.map(
                (item: any) => ({
                    id: item.id,
                    return_date: item.return_date,
                    amount: parseFloat(item.amount || 0),
                    receipt_no: item.receipt_no || '',
                    fund_source_id: item.fund_source_id,
                    fund_source: item.fund_source || undefined,
                    notes: item.notes || '',
                }),
            );
        } else {
            accountabilityReturns.value = [];
        }

        // Format documents to files
        if (
            accountabilityData.documents &&
            Array.isArray(accountabilityData.documents)
        ) {
            accountability.value.files = accountabilityData.documents.map(
                (att: any) => ({
                    id: att.id,
                    name: att.document_name,
                    file: att.file_path,
                    size: att.file_size,
                    type: att.file_type,
                    url: att.file_path,
                    isExisting: true,
                    status: 'success' as const,
                }),
            );
        } else {
            accountability.value.files = [];
        }
    } catch (error: any) {
        console.error('Failed to load accountability:', error);

        if (error.response) {
            toast.error(
                `Gagal memuat data: ${error.response.data.message || 'Server error'}`,
            );
        } else if (error.request) {
            toast.error(
                'Gagal terhubung ke server. Periksa koneksi internet Anda.',
            );
        } else {
            toast.error('Gagal memuat data pertanggungjawaban');
        }
    }
};

const loadAccountabilityApprovals = async (
    accountabilityId: number | string,
) => {
    isLoadingApprovals.value = true;
    try {
        const response = await axios.get(
            `/api/v1/budget-accountabilities/${accountabilityId}/approvals`,
        );
        const responseData = response.data as ApprovalsResponse;

        if (
            responseData.success &&
            responseData.data &&
            responseData.data.approvals
        ) {
            const approvals = responseData.data.approvals;
            headerStatus.value = responseData.data.header_status;
            currentLevel.value = responseData.data.current_level;

            // Transform approvals ke format Verifier
            verifiers.value = approvals.map((approval) => ({
                id: approval.id,
                name: approval.role,
                role: approval.role,
                role_id: 0,
                department: '-',
                verificationStatus: mapApprovalStatusToVerificationStatus(
                    approval.status,
                ),
                verifiedAt: approval.approved_at || undefined,
                notes: approval.notes || undefined,
                decision: approval.notes || undefined,
                step: approval.approval_level,
                isCurrentLevel: approval.is_current,
            }));

            // Urutkan berdasarkan step
            verifiers.value.sort((a, b) => a.step - b.step);

            // Load history
            const completedApprovals = approvals.filter(
                (approval) =>
                    approval.status === 'approved' ||
                    approval.status === 'rejected' ||
                    approval.status === 'returned',
            );

            if (completedApprovals.length > 0) {
                verificationData.history = completedApprovals.map(
                    (approval) => ({
                        step: approval.approval_level,
                        verifierId: approval.id,
                        verifierName: approval.role,
                        status: mapApprovalStatusToVerificationStatus(
                            approval.status,
                        ),
                        notes: approval.notes || '',
                        verifiedAt:
                            approval.approved_at || new Date().toISOString(),
                    }),
                );

                const lastHistory =
                    verificationData.history[
                        verificationData.history.length - 1
                    ];
                if (lastHistory) {
                    verificationData.status = lastHistory.status as any;
                    verificationData.notes = lastHistory.notes;
                }
            }

            if (headerStatus.value) {
                const statusDisplay = mapHeaderStatusToFormStatus(
                    headerStatus.value,
                );
                if (accountability.value) {
                    accountability.value.status_display = statusDisplay;
                }
            }
        }
    } catch (error) {
        console.error('Failed to load accountability approvals:', error);
    } finally {
        isLoadingApprovals.value = false;
    }
};

const mapHeaderStatusToFormStatus = (headerStatus: string): string => {
    const statusMap: Record<string, string> = {
        submitted: 'Menunggu Verifikasi',
        approved: 'Disetujui',
        rejected: 'Ditolak',
        returned: 'Perlu Revisi',
    };
    return statusMap[headerStatus] || headerStatus;
};

const mapApprovalStatusToVerificationStatus = (
    status: string,
): Verifier['verificationStatus'] => {
    const statusMap: Record<string, Verifier['verificationStatus']> = {
        pending: 'pending',
        waiting: 'waiting',
        approved: 'completed',
        rejected: 'rejected',
        returned: 'rejected',
    };
    return statusMap[status] || 'pending';
};

const initializeVerificationData = () => {
    if (verificationData.history?.length === 0 && verifiers.value.length > 0) {
        const completedVerifiers = verifiers.value.filter(
            (v) => v.verificationStatus === 'completed' && v.verifiedAt,
        );

        verificationData.history = completedVerifiers.map((verifier) => ({
            step: verifier.step,
            verifierId: verifier.id,
            verifierName: verifier.name,
            status:
                verifier.verificationStatus === 'completed'
                    ? 'approved'
                    : 'returned',
            notes: verifier.notes || '',
            verifiedAt: verifier.verifiedAt!,
        }));

        if (verificationData.history.length > 0) {
            const lastHistory =
                verificationData.history[verificationData.history.length - 1];
            verificationData.status = lastHistory.status as any;
            verificationData.notes = lastHistory.notes;
        }
    }
};

const validateForm = (): boolean => {
    if (!verificationData.status) {
        toast.error('Status verifikasi harus dipilih!');
        return false;
    }

    if (!verificationData.notes.trim()) {
        toast.error('Catatan verifikasi harus diisi!');
        return false;
    }

    if (verificationData.notes.length < 5) {
        toast.error('Catatan verifikasi minimal 5 karakter!');
        return false;
    }

    return true;
};

const submitVerification = async () => {
    if (!validateForm()) return;

    isSubmitting.value = true;

    try {
        const currentStep = currentVerifierStep.value;
        const currentVerifierData = currentVerifier.value;

        if (!currentVerifierData) {
            throw new Error('Verifikator saat ini tidak ditemukan');
        }

        const currentApproval = verifiers.value.find(
            (v) => v.step === currentStep && v.isCurrentLevel,
        );

        if (!currentApproval) {
            throw new Error('Data approval tidak ditemukan');
        }

        let endpoint = '';
        const payload = {
            notes: verificationData.notes,
        };

        switch (verificationData.status) {
            case 'approved':
                endpoint = `/api/v1/budget-accountability-approvals/${currentApproval.id}/approve`;
                break;
            case 'returned':
                endpoint = `/api/v1/budget-accountability-approvals/${currentApproval.id}/return`;
                break;
            case 'rejected':
                endpoint = `/api/v1/budget-accountability-approvals/${currentApproval.id}/reject`;
                break;
            default:
                toast.info(
                    'Silakan tentukan status verifikasi (Setujui/Kembalikan/Tolak).',
                );
                return;
        }

        const response = await axios.post(endpoint, payload);

        const verifierIndex = verifiers.value.findIndex(
            (v) => v.step === currentStep,
        );

        if (verifierIndex !== -1) {
            verifiers.value[verifierIndex].verificationStatus =
                verificationData.status === 'approved'
                    ? 'completed'
                    : 'rejected';
            verifiers.value[verifierIndex].verifiedAt =
                new Date().toISOString();
            verifiers.value[verifierIndex].notes = verificationData.notes;
            verifiers.value[verifierIndex].decision = getDecisionFromStatus(
                verificationData.status,
            );
            verifiers.value[verifierIndex].isCurrentLevel = false;
        }

        if (!verificationData.history) {
            verificationData.history = [];
        }

        verificationData.history.push({
            step: currentStep,
            verifierId: currentVerifierData.id,
            verifierName: currentVerifierData.name,
            status: verificationData.status,
            notes: verificationData.notes,
            verifiedAt: new Date().toISOString(),
        });

        if (
            response.data &&
            response.data.data &&
            response.data.data.current_level
        ) {
            currentLevel.value = response.data.data.current_level;
        }

        if (
            response.data &&
            response.data.data &&
            response.data.data.header_status
        ) {
            headerStatus.value = response.data.data.header_status;
            if (accountability.value) {
                accountability.value.status_display =
                    mapHeaderStatusToFormStatus(
                        response.data.data.header_status,
                    );
            }
        }

        if (
            currentStep < totalVerificationSteps.value &&
            verificationData.status === 'approved'
        ) {
            const nextVerifierIndex = verifiers.value.findIndex(
                (v) => v.step === currentStep + 1,
            );
            if (nextVerifierIndex !== -1) {
                verifiers.value[nextVerifierIndex].verificationStatus =
                    'waiting';
                verifiers.value[nextVerifierIndex].isCurrentLevel = true;
            }

            verificationData.status = '';
            verificationData.notes = '';

            toast.success(
                `Verifikasi tahap ${currentStep} berhasil disimpan! Menunggu verifikator tahap ${currentStep + 1}.`,
            );
        } else {
            const finalStatus = getFinalStatusFromOverall(
                verificationData.status,
            );
            headerStatus.value = finalStatus;
            if (accountability.value) {
                accountability.value.status_display = finalStatus;
            }

            const messages = {
                approved: 'Pertanggungjawaban berhasil disetujui!',
                returned: 'Pertanggungjawaban dikembalikan untuk revisi!',
                rejected: 'Pertanggungjawaban telah ditolak!',
            };

            toast.success(
                messages[verificationData.status as keyof typeof messages] ||
                    'Verifikasi selesai!',
            );

            await loadData();
        }
    } catch (error: any) {
        console.error('Error submitting verification:', error);

        let errorMessage =
            error.response?.data?.message ||
            'Terjadi kesalahan saat mengirim verifikasi.';

        if (errorMessage.includes('Unauthorized')) {
            errorMessage =
                'Maaf, Role Anda tidak sesuai untuk melakukan verifikasi.';
        }

        toast.error(errorMessage);
    } finally {
        isSubmitting.value = false;
    }
};

const cancelVerification = () => {
    if (isFormValid.value) {
        if (!confirm('Perubahan yang belum disimpan akan hilang. Lanjutkan?')) {
            return;
        }
    }
    window.history.back();
};

const loadData = async () => {
    if (props.id) {
        await loadAccountabilityApprovals(props.id);
        initializeVerificationData();
    }
};

const handlePreviewDocument = (file: any) => {
    previewDocumentUrl.value = file.url || file.file_path;
    showDocumentPreview.value = true;
};

const downloadDocument = (file: any) => {
    const url = file.url || file.file_path;
    window.open(url, '_blank');
};
</script>

<template>
    <Head title="Verifikasi Pertanggungjawaban" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <!-- Loading Skeleton -->
        <div
            v-if="showLoadingSkeleton || isLoadingApprovals"
            class="rounded-lg border bg-white p-6 shadow-sm"
        >
            <div class="animate-pulse">
                <!-- Header Skeleton -->
                <div class="mb-6 border-b pb-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="h-8 w-64 rounded bg-gray-200"></div>
                            <div
                                class="mt-2 h-4 w-96 rounded bg-gray-200"
                            ></div>
                        </div>
                        <div class="h-8 w-32 rounded bg-gray-200"></div>
                    </div>

                    <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div class="flex items-center gap-2">
                            <div class="h-4 w-4 rounded bg-gray-200"></div>
                            <div class="h-4 w-20 rounded bg-gray-200"></div>
                            <div class="h-4 w-32 rounded bg-gray-200"></div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="h-4 w-4 rounded bg-gray-200"></div>
                            <div class="h-4 w-20 rounded bg-gray-200"></div>
                            <div class="h-4 w-24 rounded bg-gray-200"></div>
                        </div>
                        <div></div>
                        <div class="flex items-center gap-2">
                            <div class="h-4 w-4 rounded bg-gray-200"></div>
                            <div class="h-4 w-16 rounded bg-gray-200"></div>
                            <div class="h-4 w-20 rounded bg-gray-200"></div>
                        </div>
                    </div>
                </div>

                <!-- Tab Navigation Skeleton -->
                <div class="mb-6 border-b">
                    <div class="flex space-x-6">
                        <div class="h-10 w-28 rounded bg-gray-200"></div>
                        <div class="h-10 w-36 rounded bg-gray-200"></div>
                    </div>
                </div>

                <!-- Informasi Skeleton -->
                <div class="mb-8 rounded-lg border bg-gray-50 p-4">
                    <div class="mb-3 h-5 w-48 rounded bg-gray-200"></div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="h-4 w-24 rounded bg-gray-200"></div>
                        <div class="h-4 w-32 rounded bg-gray-200"></div>
                        <div class="h-4 w-24 rounded bg-gray-200"></div>
                        <div class="h-4 w-40 rounded bg-gray-200"></div>
                        <div class="h-4 w-24 rounded bg-gray-200"></div>
                        <div class="h-4 w-36 rounded bg-gray-200"></div>
                    </div>
                </div>

                <!-- Form Verifikasi Skeleton -->
                <div class="border-t pt-6">
                    <div class="mb-6 h-6 w-64 rounded bg-gray-200"></div>
                    <div class="space-y-4">
                        <div>
                            <div
                                class="mb-2 h-4 w-32 rounded bg-gray-200"
                            ></div>
                            <div class="h-10 w-full rounded bg-gray-200"></div>
                        </div>
                        <div>
                            <div class="mb-2 flex items-center justify-between">
                                <div class="h-4 w-32 rounded bg-gray-200"></div>
                                <div class="h-3 w-16 rounded bg-gray-200"></div>
                            </div>
                            <div class="h-40 w-full rounded bg-gray-200"></div>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end space-x-3 border-t pt-6">
                        <div class="h-10 w-20 rounded bg-gray-200"></div>
                        <div class="flex space-x-2">
                            <div class="h-10 w-28 rounded bg-gray-200"></div>
                            <div class="h-10 w-32 rounded bg-gray-200"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Konten Utama -->
        <div v-else class="rounded-lg border bg-white p-6 shadow-sm">
            <!-- Header -->
            <div class="mb-6 border-b pb-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">
                            Verifikasi Pertanggungjawaban
                        </h1>
                        <p class="mt-1 text-sm text-gray-500">
                            {{ getPageDescription() }}
                        </p>
                    </div>
                    <Badge
                        :variant="
                            getStatusVariant(
                                accountability?.status_display || '',
                            )
                        "
                        class="px-3 py-1 text-sm"
                    >
                        Status: {{ accountability?.status_display || '-' }}
                    </Badge>
                </div>

                <div class="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                    <div class="flex items-center gap-2">
                        <TrendingUp class="h-4 w-4 text-gray-400" />
                        <span class="text-gray-600">Progress:</span>
                        <span class="font-medium">
                            {{ getCompletedStepsCount }} dari
                            {{ totalVerificationSteps }} Tahap
                        </span>
                    </div>
                </div>
            </div>

            <!-- Alert Penolakan -->
            <div
                v-if="
                    accountability?.status?.toUpperCase() === 'REJECTED' &&
                    accountability?.rejection_reason
                "
                class="mb-6 rounded-md border border-red-200 bg-red-50 p-4"
            >
                <div class="flex items-start gap-2">
                    <XCircle class="mt-0.5 h-5 w-5 text-red-600" />
                    <div>
                        <p class="font-medium text-red-800">
                            Alasan Penolakan:
                        </p>
                        <p class="mt-1 text-sm text-red-700">
                            {{ accountability.rejection_reason }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="mb-6 border-b">
                <div class="flex space-x-6">
                    <button
                        v-for="tab in tabs"
                        :key="tab.id"
                        @click="activeTab = tab.id as 'verifikasi' | 'riwayat'"
                        class="relative px-1 pb-3 text-sm font-medium transition-colors"
                        :class="[
                            activeTab === tab.id
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700',
                        ]"
                    >
                        <div class="flex items-center gap-2">
                            <component :is="tab.icon" class="h-4 w-4" />
                            {{ tab.label }}
                            <Badge
                                v-if="tab.badge"
                                variant="secondary"
                                class="ml-1 text-xs"
                            >
                                {{ tab.badge }}
                            </Badge>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Tab Content -->
            <div class="mt-6">
                <!-- Tab Verifikasi -->
                <div v-if="activeTab === 'verifikasi'">
                    <!-- Informasi Pertanggungjawaban -->
                    <div
                        class="mb-8 space-y-3 rounded-lg border bg-gray-50 p-4"
                    >
                        <div class="mb-3 flex items-center gap-2 border-b pb-2">
                            <CreditCard class="h-4 w-4 text-gray-500" />
                            <h3 class="font-medium text-blue-800">
                                Informasi Pertanggungjawaban
                            </h3>
                        </div>

                        <div
                            class="grid grid-cols-1 gap-x-12 gap-y-2 text-sm md:grid-cols-2"
                        >
                            <!-- Kolom Kiri -->
                            <div
                                class="grid grid-cols-[max-content_1fr] content-start gap-x-5 gap-y-2"
                            >
                                <span class="text-gray-500"
                                    >No. Pertanggungjawaban</span
                                >
                                <span class="font-medium">
                                    :
                                    {{
                                        accountability?.accountability_no || '-'
                                    }}
                                </span>

                                <span class="text-gray-500"
                                    >Tanggal Pertanggungjawaban</span
                                >
                                <span class="font-medium">
                                    :
                                    {{
                                        formatDate(
                                            accountability?.accountability_date ||
                                                '',
                                        )
                                    }}
                                </span>

                                <span class="text-gray-500"
                                    >No. Pencairan</span
                                >
                                <span class="font-medium">
                                    :
                                    {{
                                        accountability?.fund_release
                                            ?.fund_release_no || '-'
                                    }}
                                </span>

                                <span class="text-gray-500">Sumber Dana</span>
                                <span class="font-medium">
                                    :
                                    {{
                                        accountability?.fund_release
                                            ?.fund_source?.name || '-'
                                    }}
                                </span>

                                <span class="text-gray-500">Unit</span>
                                <span class="font-medium">
                                    :
                                    {{
                                        accountability?.fund_release
                                            ?.disbursement_header
                                            ?.request_header?.unit?.unit_name ||
                                        '-'
                                    }}
                                </span>

                                <span class="text-gray-500"
                                    >No. Pengajuan</span
                                >
                                <span class="font-medium">
                                    :
                                    {{
                                        accountability?.fund_release
                                            ?.disbursement_header
                                            ?.request_header?.request_no || '-'
                                    }}
                                </span>
                            </div>

                            <!-- Kolom Kanan -->
                            <div
                                class="grid grid-cols-[max-content_1fr] content-start gap-x-5 gap-y-2"
                            >
                                <span class="text-gray-500"
                                    >Total Diterima</span
                                >
                                <span class="font-bold text-green-600">
                                    : Rp {{ formatCurrency(totalReceived) }}
                                </span>

                                <span class="text-gray-500"
                                    >Total Dibelanjakan</span
                                >
                                <span class="font-bold text-orange-600">
                                    : Rp {{ formatCurrency(totalSpent) }}
                                </span>

                                <span class="text-gray-500"
                                    >Total Dikembalikan</span
                                >
                                <span class="font-bold text-blue-600">
                                    : Rp {{ formatCurrency(totalReturned) }}
                                </span>

                                <span class="text-gray-500">Sisa/Selisih</span>
                                <span
                                    class="font-bold"
                                    :class="
                                        remainingBalance >= 0
                                            ? 'text-gray-700'
                                            : 'text-red-600'
                                    "
                                >
                                    : Rp {{ formatCurrency(remainingBalance) }}
                                </span>
                            </div>
                        </div>

                        <!-- Catatan Pertanggungjawaban -->
                        <div v-if="accountability?.notes" class="border-t pt-3">
                            <span class="text-sm text-gray-500"
                                >Catatan Pertanggungjawaban :</span
                            >
                            <p
                                class="mt-1 text-sm font-medium whitespace-pre-wrap text-gray-700"
                            >
                                : {{ accountability.notes }}
                            </p>
                        </div>
                    </div>

                    <!-- Rincian Pengeluaran -->
                    <div class="border-t pt-6">
                        <div class="mb-4">
                            <div class="flex items-center gap-2">
                                <Wallet class="h-5 w-5 text-orange-600" />
                                <h3 class="text-lg font-semibold">
                                    Rincian Pengeluaran
                                </h3>
                            </div>
                            <p class="text-xs text-gray-500">
                                Rincian pengeluaran dari dana yang
                                diterima
                            </p>
                        </div>

                        <div class="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow class="bg-orange-50">
                                        <TableHead class="w-12">No</TableHead>
                                        <TableHead class="w-32"
                                            >Tanggal</TableHead
                                        >
                                        <TableHead>Uraian</TableHead>
                                        <TableHead class="w-32"
                                            >No. Resi</TableHead
                                        >
                                        <TableHead class="w-40 text-right"
                                            >Jumlah</TableHead
                                        >
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <template
                                        v-if="accountabilityItems.length > 0"
                                    >
                                        <TableRow
                                            v-for="(
                                                item, index
                                            ) in accountabilityItems"
                                            :key="item.id"
                                        >
                                            <TableCell class="font-medium">{{
                                                index + 1
                                            }}</TableCell>
                                            <TableCell>{{
                                                formatDate(item.expense_date)
                                            }}</TableCell>
                                            <TableCell>
                                                <div class="space-y-1">
                                                    <span class="text-sm">{{
                                                        item.description
                                                    }}</span>
                                                    <span
                                                        v-if="item.notes"
                                                        class="block text-xs text-gray-500"
                                                        >Catatan:
                                                        {{ item.notes }}</span
                                                    >
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    v-if="item.receipt_no"
                                                    class="text-sm"
                                                    >{{ item.receipt_no }}</span
                                                >
                                                <span
                                                    v-else
                                                    class="text-xs text-gray-400"
                                                    >-</span
                                                >
                                            </TableCell>
                                            <TableCell class="text-right">
                                                <span
                                                    class="font-semibold text-orange-700"
                                                    >Rp
                                                    {{
                                                        formatCurrency(
                                                            item.amount,
                                                        )
                                                    }}</span
                                                >
                                            </TableCell>
                                        </TableRow>
                                    </template>
                                    <TableRow v-else>
                                        <TableCell
                                            colspan="5"
                                            class="py-8 text-center text-gray-500"
                                        >
                                            <div
                                                class="flex flex-col items-center gap-2"
                                            >
                                                <Wallet
                                                    class="h-8 w-8 text-gray-300"
                                                />
                                                <p>
                                                    Tidak ada data pengeluaran
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow
                                        v-if="accountabilityItems.length > 0"
                                        class="bg-orange-50 font-bold"
                                    >
                                        <TableCell
                                            colspan="4"
                                            class="text-right"
                                            >Total Pengeluaran</TableCell
                                        >
                                        <TableCell
                                            class="text-right text-orange-700"
                                            >Rp
                                            {{
                                                formatCurrency(totalSpent)
                                            }}</TableCell
                                        >
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <!-- Rincian Pengembalian -->
                    <div class="mt-6 border-t pt-6">
                        <div class="mb-4">
                            <div class="flex items-center gap-2">
                                <Banknote class="h-5 w-5 text-blue-600" />
                                <h3 class="text-lg font-semibold">
                                    Rincian Pengembalian
                                </h3>
                            </div>
                            <p class="text-xs text-gray-500">
                                Rincian dana yang dikembalikan (sisa/tidak
                                terpakai)
                            </p>
                        </div>

                        <div class="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow class="bg-blue-50">
                                        <TableHead class="w-12">No</TableHead>
                                        <TableHead class="w-32"
                                            >Tanggal</TableHead
                                        >
                                        <TableHead>Keterangan</TableHead>
                                        <TableHead class="w-32"
                                            >No. Resi</TableHead
                                        >
                                        <TableHead class="w-32"
                                            >Sumber Dana</TableHead
                                        >
                                        <TableHead class="w-40 text-right"
                                            >Jumlah</TableHead
                                        >
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <template
                                        v-if="accountabilityReturns.length > 0"
                                    >
                                        <TableRow
                                            v-for="(
                                                item, index
                                            ) in accountabilityReturns"
                                            :key="item.id"
                                        >
                                            <TableCell class="font-medium">{{
                                                index + 1
                                            }}</TableCell>
                                            <TableCell>{{
                                                formatDate(item.return_date)
                                            }}</TableCell>
                                            <TableCell>
                                                <span class="text-sm">{{
                                                    item.notes
                                                }}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    v-if="item.receipt_no"
                                                    class="text-sm"
                                                    >{{ item.receipt_no }}</span
                                                >
                                                <span
                                                    v-else
                                                    class="text-xs text-gray-400"
                                                    >-</span
                                                >
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    v-if="
                                                        item.fund_source?.name
                                                    "
                                                    class="text-sm"
                                                    >{{
                                                        item.fund_source.name
                                                    }}</span
                                                >
                                                <span
                                                    v-else
                                                    class="text-xs text-gray-400"
                                                    >-</span
                                                >
                                            </TableCell>
                                            <TableCell class="text-right">
                                                <span
                                                    class="font-semibold text-blue-700"
                                                    >Rp
                                                    {{
                                                        formatCurrency(
                                                            item.amount,
                                                        )
                                                    }}</span
                                                >
                                            </TableCell>
                                        </TableRow>
                                    </template>
                                    <TableRow v-else>
                                        <TableCell
                                            colspan="6"
                                            class="py-8 text-center text-gray-500"
                                        >
                                            <div
                                                class="flex flex-col items-center gap-2"
                                            >
                                                <Banknote
                                                    class="h-8 w-8 text-gray-300"
                                                />
                                                <p>
                                                    Tidak ada data pengembalian
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow
                                        v-if="accountabilityReturns.length > 0"
                                        class="bg-blue-50 font-bold"
                                    >
                                        <TableCell
                                            colspan="5"
                                            class="text-right"
                                            >Total Pengembalian</TableCell
                                        >
                                        <TableCell
                                            class="text-right text-blue-700"
                                            >Rp
                                            {{
                                                formatCurrency(totalReturned)
                                            }}</TableCell
                                        >
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <!-- Lampiran Dokumen -->
                    <div class="mt-4 border-t pt-4">
                        <div class="mb-3 flex items-center gap-2">
                            <Upload class="h-4 w-4 text-gray-500" />
                            <h4 class="font-medium text-gray-700">
                                Lampiran Dokumen Pertanggungjawaban
                            </h4>
                        </div>

                        <div
                            v-if="
                                accountability?.files &&
                                accountability.files.length > 0
                            "
                            class="grid grid-cols-1 gap-3 md:grid-cols-2"
                        >
                            <div
                                v-for="(file, index) in accountability.files"
                                :key="file.id || index"
                                class="flex items-center justify-between rounded-md border p-3"
                            >
                                <div class="flex items-center gap-3">
                                    <div
                                        class="flex h-10 w-10 items-center justify-center rounded bg-gray-100"
                                    >
                                        <FileEdit
                                            class="h-5 w-5 text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium">
                                            {{ file.name }}
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            {{
                                                file.size ||
                                                'Ukuran tidak diketahui'
                                            }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        @click="handlePreviewDocument(file)"
                                    >
                                        Preview
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        @click="downloadDocument(file)"
                                    >
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div
                            v-else
                            class="rounded-lg border border-dashed border-gray-300 p-6 text-center"
                        >
                            <Upload class="mx-auto h-8 w-8 text-gray-300" />
                            <p class="mt-2 text-sm text-gray-500">
                                Tidak ada dokumen lampiran
                            </p>
                        </div>
                    </div>

                    <!-- Form Verifikasi -->
                    <form
                        v-if="isCurrentVerifier"
                        @submit.prevent="submitVerification"
                        class="border-t pt-6"
                    >
                        <div class="space-y-6">
                            <h3 class="text-lg font-semibold text-gray-900">
                                Verifikasi Pertanggungjawaban - Tahap
                                {{ currentVerifierStep }}
                            </h3>

                            <div class="space-y-2">
                                <Label for="status" class="text-sm font-medium">
                                    Status Verifikasi
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Select
                                    v-model="verificationData.status"
                                    :disabled="!isCurrentVerifier"
                                >
                                    <SelectTrigger class="w-full">
                                        <SelectValue
                                            placeholder="Pilih Status Verifikasi"
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="approved">
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <CheckCircle
                                                    class="h-4 w-4 text-green-600"
                                                />
                                                <span>Disetujui</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="returned">
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <FileEdit
                                                    class="h-4 w-4 text-yellow-600"
                                                />
                                                <span>Revisi</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <XCircle
                                                    class="h-4 w-4 text-red-600"
                                                />
                                                <span>Tolak</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    <Label class="text-sm font-medium">
                                        Catatan Verifikasi
                                        <span class="text-red-500">*</span>
                                    </Label>
                                    <span class="text-xs text-gray-500"
                                        >{{
                                            verificationData.notes.length
                                        }}/800</span
                                    >
                                </div>
                                <Textarea
                                    v-model="verificationData.notes"
                                    :placeholder="`Isikan catatan verifikasi untuk Tahap ${currentVerifierStep}...`"
                                    class="min-h-[150px] resize-none text-sm"
                                    :maxlength="800"
                                    :disabled="!isCurrentVerifier"
                                    required
                                />
                            </div>
                        </div>

                        <div
                            class="mt-6 flex justify-end space-x-3 border-t pt-6"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                @click="cancelVerification"
                                class="gap-2"
                            >
                                <X class="h-4 w-4" />
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                :variant="getSubmitButtonVariant()"
                                :disabled="
                                    isSubmitting ||
                                    !isFormValid ||
                                    !isCurrentVerifier
                                "
                                class="gap-2"
                            >
                                <CheckCircle class="h-4 w-4" />
                                {{
                                    isSubmitting
                                        ? 'Menyimpan...'
                                        : getSubmitButtonText()
                                }}
                            </Button>
                        </div>
                    </form>

                    <div v-else class="border-t pt-6">
                        <div class="rounded-lg bg-gray-50 p-6 text-center">
                            <CheckCircle
                                class="mx-auto mb-3 h-12 w-12 text-green-500"
                            />
                            <h3
                                class="mb-2 text-lg font-semibold text-gray-900"
                            >
                                Verifikasi Telah Selesai
                            </h3>
                            <p class="mb-4 text-sm text-gray-600">
                                Anda telah menyelesaikan verifikasi pada tahap
                                ini. Silakan lihat riwayat verifikasi untuk
                                detail lengkap.
                            </p>
                            <Button
                                variant="outline"
                                @click="activeTab = 'riwayat'"
                            >
                                <History class="mr-2 h-4 w-4" />
                                Lihat Riwayat Verifikasi
                            </Button>
                        </div>
                    </div>
                </div>

                <!-- Tab Riwayat Verifikasi -->
                <div v-if="activeTab === 'riwayat'">
                    <VerificationHistoryTab
                        :submitter="submitterData"
                        :submission-date="submissionDate"
                        :submitter-notes="submitterNotes"
                        :verifiers="verifiers"
                        :activities="[]"
                        :current-step="currentVerifierStep"
                        :header-verification="verificationData"
                        @refresh="loadData"
                    />
                </div>
            </div>
        </div>

        <!-- Dialog Preview Dokumen -->
        <div
            v-if="showDocumentPreview"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
            <div class="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
                <div class="mb-4 flex items-center justify-between">
                    <h3 class="text-lg font-semibold">Preview Dokumen</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        @click="showDocumentPreview = false"
                    >
                        <X class="h-4 w-4" />
                    </Button>
                </div>
                <div class="min-h-[500px]">
                    <iframe
                        v-if="previewDocumentUrl"
                        :src="previewDocumentUrl"
                        class="h-[70vh] w-full rounded border"
                    ></iframe>
                </div>
                <div class="mt-4 flex justify-end">
                    <Button
                        variant="outline"
                        @click="showDocumentPreview = false"
                    >
                        Tutup
                    </Button>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
:deep(.select-content) {
    z-index: 9999;
}

@media (max-width: 768px) {
    .grid-cols-2,
    .grid-cols-3,
    .grid-cols-4 {
        grid-template-columns: 1fr;
    }

    .overflow-x-auto {
        overflow-x: auto;
    }
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
