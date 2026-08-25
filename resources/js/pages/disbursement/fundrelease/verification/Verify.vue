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
    CalendarDays,
    CheckCircle,
    ClipboardList,
    CreditCard,
    FileEdit,
    Hash,
    History,
    ListChecks,
    TrendingUp,
    Upload,
    X,
    XCircle,
} from 'lucide-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';
import { toast } from 'vue-sonner';

interface BudgetRequestItem {
    id: number;
    description: string;
    activity_item_id: number;
    coa_id: string;
    coa?: {
        id: number;
        account_code: string;
        account_name: string;
    };
}

interface BudgetFundReleaseItem {
    id: number;
    budget_request_item_id: number;
    total_amount: number;
    realized_amount?: number;
    remaining_amount?: number;
    request_item: BudgetRequestItem;
}

interface FundSource {
    id: number;
    name: string;
    code: string;
    balance?: number;
}

interface DisbursementHeader {
    id: number;
    disbursement_no: string;
    disbursement_date: string;
    budget_request_header_id: number;
    status: string;
    status_display: string;
    total_amount: number;
    notes?: string;
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
}

interface BudgetFundRelease {
    id: number;
    fund_release_no: string;
    fund_release_date: string;
    disbursement_header_id: number;
    fund_source_id: number;
    total_amount: number;
    status: string;
    status_display: string;
    notes?: string;
    rejection_reason?: string;
    verification_notes?: string;
    fund_source?: FundSource;
    disbursement_header?: DisbursementHeader;
    items?: BudgetFundReleaseItem[];
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

interface FundReleaseApproval {
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
        approvals: FundReleaseApproval[];
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
        title: 'Verifikasi Pencairan',
        href: '/verifikasi-pencairan',
    },
    {
        title: 'Form Verifikasi Pencairan',
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
const fundRelease = ref<BudgetFundRelease | null>(null);
const fundReleaseItems = ref<BudgetFundReleaseItem[]>([]);
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

const selectedItemsCount = computed(() => {
    return fundReleaseItems.value.length;
});

const totalFundRelease = computed(() => {
    return fundRelease.value?.total_amount || 0;
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
            ? `Form verifikasi pencairan dana - Tahap ${currentVerifierStep.value} dari ${totalVerificationSteps.value}`
            : 'Lihat detail pencairan dana';
    } else {
        return 'Riwayat lengkap proses verifikasi multi-level';
    }
};

const submitterData = computed(() => ({
    id: fundRelease.value?.disbursement_header?.request_header?.unit?.id || 0,
    name:
        fundRelease.value?.disbursement_header?.request_header?.unit
            ?.unit_name || '-',
    email: '-',
}));

const submissionDate = computed(
    () => fundRelease.value?.fund_release_date || '',
);
const submitterNotes = computed(() => fundRelease.value?.notes || '');

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
        Draft: 'secondary',
        'Menunggu Verifikasi': 'default',
        'Perlu Revisi': 'outline',
        Disetujui: 'default',
        Ditolak: 'destructive',
        Diproses: 'outline',
        submitted: 'default',
        approved: 'default',
        returned: 'outline',
        rejected: 'destructive',
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
            await loadFundReleaseData();
            await loadFundReleaseApprovals(props.id);
            initializeVerificationData();
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        showLoadingSkeleton.value = false;
    }
});

const loadFundReleaseData = async () => {
    try {
        const { data } = await axios.get(
            `/api/v1/budget-fund-releases/${props.id}`,
        );

        const fundReleaseData = data.data;

        // Log untuk debugging
        console.log('Fund Release Data:', fundReleaseData);
        console.log(
            'Disbursement Header:',
            fundReleaseData.disbursement_header,
        );
        console.log('Items:', fundReleaseData.disbursement_header?.items);

        // Set fund release data
        fundRelease.value = fundReleaseData;

        // Load items dari disbursement_header.items
        if (
            fundReleaseData.disbursement_header?.items &&
            fundReleaseData.disbursement_header.items.length > 0
        ) {
            fundReleaseItems.value =
                fundReleaseData.disbursement_header.items.map((item: any) => ({
                    id: item.id,
                    total_amount: parseFloat(item.total_amount || 0),
                    budget_request_item_id: item.budget_request_item_id,

                    request_item: {
                        id: item.request_item?.id,
                        description: item.request_item?.description || '',
                        activity_item_id: item.request_item?.activity_item_id,
                        coa_id: item.request_item?.coa_id || 0,
                        coa: item.request_item?.coa_id
                            ? {
                                  id: item.request_item.coa_id,
                                  account_code:
                                      item.request_item.coa?.account_code ||
                                      `COA-${item.request_item.coa_id}`,
                                  account_name:
                                      item.request_item.coa?.account_name || '',
                              }
                            : undefined,
                    } as BudgetRequestItem,

                    realized_amount: parseFloat(
                        item.request_item?.disbursed_amount || 0,
                    ),
                    remaining_amount: parseFloat(
                        item.request_item?.remaining_amount || 0,
                    ),
                }));

            console.log(
                'Processed fund release items:',
                fundReleaseItems.value,
            );
        } else {
            console.warn('No items found in disbursement_header');
            fundReleaseItems.value = [];
        }

        // Format documents to files
        if (
            fundReleaseData.documents &&
            Array.isArray(fundReleaseData.documents)
        ) {
            fundRelease.value.files = fundReleaseData.documents.map(
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
            console.log('Processed documents:', fundRelease.value.files);
        } else {
            // Initialize empty files array if no documents
            fundRelease.value.files = [];
        }
    } catch (error: any) {
        console.error('Failed to load fund release:', error);

        // Tampilkan error yang lebih informatif
        if (error.response) {
            // Server merespon dengan status error
            console.error('Error response:', error.response.data);
            toast.error(
                `Gagal memuat data: ${error.response.data.message || 'Server error'}`,
            );
        } else if (error.request) {
            // Request dibuat tapi tidak ada response
            toast.error(
                'Gagal terhubung ke server. Periksa koneksi internet Anda.',
            );
        } else {
            // Error lainnya
            toast.error('Gagal memuat data pencairan');
        }
    }
};

const loadFundReleaseApprovals = async (fundReleaseId: number | string) => {
    isLoadingApprovals.value = true;
    try {
        const response = await axios.get(
            `/api/v1/budget-fund-releases/${fundReleaseId}/approvals`,
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
                if (fundRelease.value) {
                    fundRelease.value.status_display = statusDisplay;
                }
            }
        }
    } catch (error) {
        console.error('Failed to load fund release approvals:', error);
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
                endpoint = `/api/v1/budget-fund-release-approvals/${currentApproval.id}/approve`;
                break;
            case 'returned':
                endpoint = `/api/v1/budget-fund-release-approvals/${currentApproval.id}/return`;
                break;
            case 'rejected':
                endpoint = `/api/v1/budget-fund-release-approvals/${currentApproval.id}/reject`;
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
            if (fundRelease.value) {
                fundRelease.value.status_display = mapHeaderStatusToFormStatus(
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
            if (fundRelease.value) {
                fundRelease.value.status_display = finalStatus;
            }

            const messages = {
                approved: 'Pencairan dana berhasil disetujui!',
                returned: 'Pencairan dana dikembalikan untuk revisi!',
                rejected: 'Pencairan dana telah ditolak!',
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
        await loadFundReleaseApprovals(props.id);
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
    <Head title="Verifikasi Pencairan Dana" />
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
                            Verifikasi Pencairan Dana
                        </h1>
                        <p class="mt-1 text-sm text-gray-500">
                            {{ getPageDescription() }}
                        </p>
                    </div>
                    <Badge
                        :variant="
                            getStatusVariant(fundRelease?.status_display || '')
                        "
                        class="px-3 py-1 text-sm"
                    >
                        Status: {{ fundRelease?.status_display || '-' }}
                    </Badge>
                </div>

                <div class="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                    <div class="flex items-center gap-2 md:col-span-2">
                        <Hash class="h-4 w-4 text-gray-400" />
                        <span class="text-gray-600">No. Pencairan:</span>
                        <span class="font-medium">{{
                            fundRelease?.fund_release_no
                        }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <CalendarDays class="h-4 w-4 text-gray-400" />
                        <span class="text-gray-600">Tgl. Pencairan:</span>
                        <span class="font-medium">{{
                            formatDate(fundRelease?.fund_release_date || '')
                        }}</span>
                    </div>

                    <div></div>

                    <div class="flex items-center gap-2">
                        <TrendingUp class="h-4 w-4 text-gray-400" />
                        <span class="text-gray-600">Progress:</span>
                        <span class="font-medium">
                            {{ getCompletedStepsCount }} /
                            {{ totalVerificationSteps }} Tahap
                        </span>
                    </div>
                </div>
            </div>

            <!-- Alert Penolakan -->
            <div
                v-if="
                    fundRelease?.status?.toUpperCase() === 'REJECTED' &&
                    fundRelease?.rejection_reason
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
                            {{ fundRelease.rejection_reason }}
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
                    <!-- Informasi Pencairan Dana -->
                    <div class="mb-8">
                        <div class="space-y-3 rounded-lg border bg-gray-50 p-4">
                            <div class="flex items-center gap-2">
                                <CreditCard class="h-4 w-4 text-gray-500" />
                                <h3 class="font-medium text-gray-700">
                                    Informasi Pencairan
                                </h3>
                            </div>
                            <div
                                class="grid grid-cols-1 gap-3 text-sm md:grid-cols-3"
                            >
                                <!-- Baris 1 -->
                                <div>
                                    <span class="text-gray-500"
                                        >No. Pencairan:</span
                                    >
                                    <p class="font-medium">
                                        {{
                                            fundRelease?.fund_release_no || '-'
                                        }}
                                    </p>
                                </div>

                                <div>
                                    <span class="text-gray-500"
                                        >No. Pengajuan:</span
                                    >
                                    <p class="font-medium">
                                        {{
                                            fundRelease?.disbursement_header
                                                ?.disbursement_no || '-'
                                        }}
                                    </p>
                                </div>

                                <div>
                                    <span class="text-gray-500"
                                        >Tanggal Pencairan:</span
                                    >
                                    <p class="font-medium">
                                        {{
                                            formatDate(
                                                fundRelease?.fund_release_date ||
                                                    '',
                                            )
                                        }}
                                    </p>
                                </div>

                                <!-- Baris 2 -->
                                <div>
                                    <span class="text-gray-500"
                                        >Sumber Dana:</span
                                    >
                                    <p class="font-medium">
                                        {{
                                            fundRelease?.fund_source?.name ||
                                            '-'
                                        }}
                                    </p>
                                </div>

                                <div>
                                    <span class="text-gray-500"
                                        >Kode Sumber Dana:</span
                                    >
                                    <p class="font-medium">
                                        {{
                                            fundRelease?.fund_source?.code ||
                                            '-'
                                        }}
                                    </p>
                                </div>

                                <div>
                                    <span class="text-gray-500">Unit:</span>
                                    <p class="font-medium">
                                        {{
                                            fundRelease?.disbursement_header
                                                ?.request_header?.unit
                                                ?.unit_name || '-'
                                        }}
                                    </p>
                                </div>

                                <!-- Baris 3 -->
                                <div>
                                    <span class="text-gray-500"
                                        >Total Pencairan:</span
                                    >
                                    <p class="text-lg font-bold text-blue-700">
                                        Rp
                                        {{ formatCurrency(totalFundRelease) }}
                                    </p>
                                </div>

                                <div>
                                    <span class="text-gray-500"
                                        >Jumlah Item:</span
                                    >
                                    <p class="font-medium">
                                        {{ selectedItemsCount }} Item
                                    </p>
                                </div>
                            </div>

                            <!-- Tujuan Pencairan -->
                            <div class="mt-4 border-t pt-3">
                                <span class="text-sm text-gray-500"
                                    >Tujuan Pencairan:</span
                                >
                                <p class="mt-1 text-sm">
                                    {{ fundRelease?.notes || '-' }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Detail Item Pencairan -->
                    <div class="border-t pt-6">
                        <div class="mb-4">
                            <h3 class="text-lg font-semibold">
                                Rincian Item Pencairan
                            </h3>
                            <p class="text-sm text-gray-500">
                                Seluruh item dalam pengajuan ini akan dicairkan
                            </p>
                        </div>

                        <!-- Container untuk table dan summary -->
                        <div class="max-w-3xl">
                            <!-- Items Table -->
                            <div class="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead class="w-12"
                                                >No</TableHead
                                            >
                                            <TableHead>Item Anggaran</TableHead>
                                            <TableHead class="w-32"
                                                >Kode COA</TableHead
                                            >
                                            <TableHead class="w-32"
                                                >Nilai Dicairkan</TableHead
                                            >
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <template
                                            v-if="fundReleaseItems.length > 0"
                                        >
                                            <TableRow
                                                v-for="(
                                                    item, index
                                                ) in fundReleaseItems"
                                                :key="item.id"
                                            >
                                                <TableCell
                                                    class="font-medium"
                                                    >{{ index + 1 }}</TableCell
                                                >
                                                <TableCell>
                                                    <span class="text-sm">
                                                        {{
                                                            item.request_item
                                                                ?.description
                                                        }}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span class="text-sm">
                                                        {{
                                                            item.request_item
                                                                ?.coa
                                                                ?.account_code
                                                        }}
                                                    </span>
                                                </TableCell>
                                                <TableCell
                                                    class="text-right font-medium"
                                                    >Rp
                                                    {{
                                                        formatCurrency(
                                                            item.total_amount,
                                                        )
                                                    }}</TableCell
                                                >
                                            </TableRow>
                                        </template>
                                        <TableRow v-else>
                                            <TableCell
                                                colspan="4"
                                                class="py-8 text-center text-gray-500"
                                            >
                                                <div
                                                    class="flex flex-col items-center gap-2"
                                                >
                                                    <ListChecks
                                                        class="h-8 w-8"
                                                    />
                                                    <p>
                                                        Pilih pengajuan
                                                        pencairan terlebih
                                                        dahulu untuk melihat
                                                        item
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>

                            <!-- Summary - mengikuti lebar tabel -->
                            <div class="mt-4 flex justify-end">
                                <div
                                    class="w-80 space-y-3 rounded-lg border bg-gray-50 p-4"
                                >
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600"
                                            >Jumlah Item:</span
                                        >
                                        <span class="font-medium">
                                            {{ selectedItemsCount }}
                                        </span>
                                    </div>
                                    <div
                                        class="flex justify-between border-t pt-2"
                                    >
                                        <span class="font-medium text-gray-800"
                                            >Total Dicairkan:</span
                                        >
                                        <span
                                            class="text-lg font-bold text-green-600"
                                        >
                                            Rp
                                            {{ formatCurrency(totalFundRelease) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Lampiran Dokumen -->
                    <div class="mt-4 border-t pt-4">
                        <div class="mb-3 flex items-center gap-2">
                            <Upload class="h-4 w-4 text-gray-500" />
                            <h4 class="font-medium text-gray-700">
                                Lampiran Dokumen Pencairan
                            </h4>
                        </div>

                        <div class="grid grid-cols-1 gap-4">
                            <div class="space-y-2">
                                <!-- <FileUpload v-model="fundRelease.files" :view-only="true" /> -->
                            </div>
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
                                Verifikasi Pencairan Dana - Tahap
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
