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
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import axios from 'axios';
import {
    Calendar,
    CheckCircle,
    ClipboardList,
    FileEdit,
    Hash,
    History,
    Target,
    TrendingUp,
    X,
    XCircle,
    Upload
} from 'lucide-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';
import { toast } from 'vue-sonner';
import VerificationHistoryTab from '../components/VerificationHistoryTab.vue';

interface BudgetRequestItem {
    id: number;
    description: string;
    coa_id: string;
    quantity: number;
    unit: number;
    unit_price: number;
    total_price: number;
    coa?: {
        account_code: string;
        account_name: string;
    };
    unit_measure?: {
        name: string;
    };
}

interface BudgetActivity {
    id: number;
    activity_id: number;
    description: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    showItems: boolean;
    request_items: BudgetRequestItem[];
    files: UploadedFile[];
    output_indicator: string;
}

interface BudgetRequestHeader {
    id?: number;
    request_no: string;
    request_date: string;
    fiscal_year_id: number;
    academic_period_id: number;
    unit_id: number;
    budget_type_id: number;
    budget_category_id: number;
    sub_budget_category_id: number;
    description: string;
    status: string;
    total_amount: number;
    status_display: string;
    fiscal_year?: {
        id: number;
        year: string;
    };
    academic_period?: {
        id: number;
        display_name: string;
    };
    unit?: {
        id: number;
        unit_name: string;
    };
}

interface Verifier {
    id: number;
    name: string;
    role: string;
    role_id?: number;
    department: string;
    verificationStatus:
        | 'pending'
        | 'in_progress'
        | 'completed'
        | 'rejected'
        | 'approved';
    verifiedAt?: string;
    notes?: string;
    decision?: string;
    step: number;
    isCurrentLevel?: boolean;
}

// Interface sesuai dengan struktur response API
interface BudgetRequestApproval {
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
        approvals: BudgetRequestApproval[];
    };
}

// Simplified verification data - hanya untuk header
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
    id?: number | string;
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
        title: 'Daftar Perencanaan',
        href: '/verifikasi-anggaran',
    },
    {
        title: 'Verifikasi & Persetujuan Perencanaan',
        href: '',
    },
];

// Data verifikator dari API
const verifiers = ref<Verifier[]>([]);

// State untuk header status dan current level dari response
const headerStatus = ref<string>('');
const currentLevel = ref<number>(0);

// Simplified verification data - hanya untuk header
const verificationData = reactive<VerificationData>({
    status: '',
    notes: '',
    history: [],
});

// Reactive data
const isSubmitting = ref(false);
const showLoadingSkeleton = ref(false);
const isLoadingApprovals = ref(false);

const getTodayDate = () => new Date().toISOString().split('T')[0];
const formData = ref<BudgetRequestHeader>({
    request_no: '',
    request_date: getTodayDate(),
    fiscal_year_id: 0,
    academic_period_id: 0,
    unit_id: 0,
    budget_type_id: 0,
    budget_category_id: 0,
    sub_budget_category_id: 0,
    description: '',
    status: 'draft',
    status_display: 'Draft',
    total_amount: 0,
});
const budgetActivities = ref<BudgetActivity[]>([]);

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

// Initialization
onMounted(async () => {
    showLoadingSkeleton.value = true;

    try {
        if (props.id) {
            await loadBudgetRequest(props.id);
            await loadBudgetRequestApprovals(props.id);
            initializeVerificationData();
            showLoadingSkeleton.value = false;
        }
    } catch (error) {
        console.error('Error during initialization:', error);
        showLoadingSkeleton.value = false;
    }
});

const loadBudgetRequest = async (id: number | string) => {
    try {
        const response = await axios.get(`/api/v1/budget-requests/${id}`);
        const data = response.data.data;

        formData.value = {
            id: data.id,
            request_no: data.request_no,
            request_date: data.request_date,
            fiscal_year_id: data.fiscal_year_id,
            academic_period_id: data.academic_period_id,
            unit_id: data.unit_id,
            budget_type_id: data.budget_type_id,
            budget_category_id: data.budget_category_id,
            sub_budget_category_id: data.sub_budget_category_id,
            description: data.notes || '',
            status: data.status,
            status_display: data.status_display,
            total_amount: data.total_amount,
            fiscal_year: data.fiscal_year,
            academic_period: data.academic_period,
            unit: data.unit,
        };

        budgetActivities.value = transformActivities(
            data.request_activities || [],
        );
    } catch (error) {
        console.error('Failed to load budget request:', error);
    }
};

const loadBudgetRequestApprovals = async (budgetRequestId: number | string) => {
    isLoadingApprovals.value = true;
    try {
        const response = await axios.get(
            `/api/v1/budget-requests/${budgetRequestId}/approvals`,
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

            // Load history dari approvals yang sudah approved atau rejected
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

                // Set status awal dari history terakhir jika ada
                const lastHistory =
                    verificationData.history[
                        verificationData.history.length - 1
                    ];
                if (lastHistory) {
                    verificationData.status = lastHistory.status as any;
                    verificationData.notes = lastHistory.notes;
                }
            }

            // Update formData status berdasarkan header_status dari response
            if (headerStatus.value) {
                formData.value.status = mapHeaderStatusToFormStatus(
                    headerStatus.value,
                );
            }
        } else {
            console.log('No approvals found, using default verifiers');
        }
    } catch (error) {
        console.error('Failed to load budget request approvals:', error);
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
        in_progress: 'Diproses',
    };
    return statusMap[headerStatus] || headerStatus;
};

const mapApprovalStatusToVerificationStatus = (
    status: string,
): Verifier['verificationStatus'] => {
    const statusMap: Record<string, Verifier['verificationStatus']> = {
        pending: 'pending',
        approved: 'completed',
        rejected: 'rejected',
        returned: 'rejected',
    };
    return statusMap[status] || 'pending';
};

const mapVerificationStatusToApprovalStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        approved: 'approved',
        returned: 'returned',
        rejected: 'rejected',
    };
    return statusMap[status] || 'pending';
};

const getDecisionFromApprovalStatus = (status: string): string => {
    const decisionMap: Record<string, string> = {
        approved: 'Disetujui',
        rejected: 'Ditolak',
        returned: 'Dikembalikan',
        pending: 'Menunggu',
    };
    return decisionMap[status] || status;
};

// Transformasi data activities
const transformActivities = (activitiesData: any[]): BudgetActivity[] => {
    return activitiesData.map((activity: any) => {
        return {
            id: activity.id,
            activity_id: activity.activity_id,
            description: activity?.activity_name || activity.description || '',
            start_date: activity.start_date
                ? activity.start_date.split('T')[0]
                : '',
            end_date: activity.end_date ? activity.end_date.split('T')[0] : '',
            total_amount: activity.total_amount || 0,
            showItems: false,
            request_items:
                activity.request_items?.map((detail: any) => ({
                    id: detail.id,
                    description: detail.description || '',
                    coa_id: detail.coa_id || '',
                    quantity: detail.volume || 0,
                    unit: detail.unit_measure_id || 0,
                    unit_price: detail.unit_price || 0,
                    total_price: detail.total_amount || 0,
                    coa: detail.coa
                        ? {
                              account_code: detail.coa.account_code || '',
                              account_name: detail.coa.account_name || '',
                          }
                        : undefined,
                    unit_measure: detail.unit_measure
                        ? {
                              name: detail.unit_measure.name || '',
                          }
                        : undefined,
                })) || [],
            files:
                activity.documents?.map((att: any) => ({
                    id: att.id,
                    name: att.document_name,
                    file: att.file_path,
                    size: att.file_size,
                    type: att.file_type,
                    url: att.file_path,
                    isExisting: true,
                    status: 'success',
                })) || [],
            output_indicator: activity.output_indicator || '',
        };
    });
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

const totalVerificationSteps = computed(() => {
    return verifiers.value.length;
});

const currentVerifierStep = computed(() => {
    if (currentLevel.value > 0) {
        return currentLevel.value;
    }

    const inProgressVerifier = verifiers.value.find(
        (v) => v.verificationStatus === 'in_progress',
    );
    if (inProgressVerifier) {
        return inProgressVerifier.step;
    }

    const completedSteps = verifiers.value.filter(
        (v) => v.verificationStatus === 'completed',
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
            ? `Form verifikasi pengajuan anggaran - Tahap ${currentVerifierStep.value} dari ${totalVerificationSteps.value}`
            : 'Lihat detail pengajuan anggaran';
    } else {
        return 'Riwayat lengkap proses verifikasi multi-level';
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
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

const validateForm = (): boolean => {
    if (!verificationData.status) {
        alert('Status verifikasi harus dipilih!');
        return false;
    }

    if (!verificationData.notes.trim()) {
        alert('Catatan verifikasi harus diisi!');
        return false;
    }

    if (verificationData.notes.length < 5) {
        alert('Catatan verifikasi minimal 5 karakter!');
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

        // Cari approval yang sedang aktif (is_current = true)
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

        // Tentukan endpoint berdasarkan status verifikasi
        switch (verificationData.status) {
            case 'approved':
                endpoint = `/api/v1/budget-request-approvals/${currentApproval.id}/approve`;
                break;
            case 'returned':
                endpoint = `/api/v1/budget-request-approvals/${currentApproval.id}/return`;
                break;
            case 'rejected':
                endpoint = `/api/v1/budget-request-approvals/${currentApproval.id}/reject`;
                break;
            default:
                toast.info(
                    'Silakan tentukan status verifikasi (Setujui/Kembalikan/Tolak).',
                );
                return;
        }

        const response = await axios.post(endpoint, payload);
        console.log('Submit approval response:', response.data);

        const verifierIndex = verifiers.value.findIndex(
            (v) => v.step === currentStep,
        );

        if (verifierIndex !== -1) {
            verifiers.value[verifierIndex].verificationStatus =
                verificationData.status === 'approved'
                    ? 'completed'
                    : verificationData.status === 'returned'
                      ? 'rejected'
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

        // Update current level dari response jika ada
        if (
            response.data &&
            response.data.data &&
            response.data.data.current_level
        ) {
            currentLevel.value = response.data.data.current_level;
        }

        // Update header status dari response jika ada
        if (
            response.data &&
            response.data.data &&
            response.data.data.header_status
        ) {
            headerStatus.value = response.data.data.header_status;
            formData.value.status = mapHeaderStatusToFormStatus(
                response.data.data.header_status,
            );
        }

        // Cek apakah masih ada tahap selanjutnya
        if (
            currentStep < totalVerificationSteps.value &&
            verificationData.status === 'approved'
        ) {
            // Update verifier selanjutnya menjadi in_progress
            const nextVerifierIndex = verifiers.value.findIndex(
                (v) => v.step === currentStep + 1,
            );
            if (nextVerifierIndex !== -1) {
                verifiers.value[nextVerifierIndex].verificationStatus =
                    'in_progress';
                verifiers.value[nextVerifierIndex].isCurrentLevel = true;
            }

            // Reset form untuk verifikasi selanjutnya (jika user yang sama)
            verificationData.status = '';
            verificationData.notes = '';

            alert(
                `Verifikasi tahap ${currentStep} berhasil disimpan! Menunggu verifikator tahap ${currentStep + 1}.`,
            );
        } else {
            // Verifikasi selesai atau ditolak/dikembalikan
            const finalStatus = getFinalStatusFromOverall(
                verificationData.status,
            );
            formData.value.status = finalStatus;
            headerStatus.value = finalStatus;

            const messages = {
                approved: 'Perencanaan anggaran berhasil disetujui!',
                returned: 'Perencanaan anggaran dikembalikan untuk revisi!',
                rejected: 'Perencanaan anggaran telah ditolak!',
            };

            alert(
                messages[verificationData.status as keyof typeof messages] ||
                    'Verifikasi selesai!',
            );

            // Reload data untuk mendapatkan status terbaru
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
        await loadBudgetRequestApprovals(props.id);
        initializeVerificationData();
    }
};

const submitterData = computed(() => ({
    id: formData.value.unit?.id || 0,
    name: formData.value.unit?.unit_name || '-',
    email: '-',
}));

const submissionDate = computed(() => formData.value.request_date);
const submitterNotes = computed(() => formData.value.description);
</script>

<template>
    <Head title="Verifikasi & Approval Perencanaan Anggaran" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <!-- Loading Skeleton dengan Animate Pulse -->
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

                <!-- Informasi Perencanaan Skeleton -->
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

                <!-- Detail Kegiatan Skeleton -->
                <div class="mb-8 border-t pt-6">
                    <div class="mb-4 flex items-center justify-between">
                        <div>
                            <div class="h-6 w-40 rounded bg-gray-200"></div>
                            <div
                                class="mt-2 h-4 w-64 rounded bg-gray-200"
                            ></div>
                        </div>
                        <div class="h-4 w-32 rounded bg-gray-200"></div>
                    </div>

                    <!-- Activity Card Skeleton -->
                    <div class="space-y-4">
                        <div class="overflow-hidden rounded-lg border">
                            <div class="border-b bg-gray-50 px-4 py-3">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="h-8 w-8 rounded-full bg-gray-200"
                                        ></div>
                                        <div>
                                            <div
                                                class="h-5 w-48 rounded bg-gray-200"
                                            ></div>
                                            <div
                                                class="mt-2 h-4 w-64 rounded bg-gray-200"
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            class="h-4 w-24 rounded bg-gray-200"
                                        ></div>
                                        <div
                                            class="mt-1 h-6 w-32 rounded bg-gray-200"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div class="p-4">
                                <div
                                    class="mb-3 h-5 w-40 rounded bg-gray-200"
                                ></div>
                                <div class="space-y-2">
                                    <div
                                        class="h-10 w-full rounded bg-gray-200"
                                    ></div>
                                    <div
                                        class="h-10 w-full rounded bg-gray-200"
                                    ></div>
                                    <div
                                        class="h-10 w-full rounded bg-gray-200"
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div class="overflow-hidden rounded-lg border">
                            <div class="border-b bg-gray-50 px-4 py-3">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="h-8 w-8 rounded-full bg-gray-200"
                                        ></div>
                                        <div>
                                            <div
                                                class="h-5 w-56 rounded bg-gray-200"
                                            ></div>
                                            <div
                                                class="mt-2 h-4 w-72 rounded bg-gray-200"
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            class="h-4 w-24 rounded bg-gray-200"
                                        ></div>
                                        <div
                                            class="mt-1 h-6 w-32 rounded bg-gray-200"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div class="p-4">
                                <div
                                    class="mb-3 h-5 w-40 rounded bg-gray-200"
                                ></div>
                                <div class="space-y-2">
                                    <div
                                        class="h-10 w-full rounded bg-gray-200"
                                    ></div>
                                    <div
                                        class="h-10 w-full rounded bg-gray-200"
                                    ></div>
                                </div>
                            </div>
                        </div>
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
                            Verifikasi Perencanaan Anggaran
                        </h1>
                        <p class="mt-1 text-sm text-gray-500">
                            {{ getPageDescription() }}
                        </p>
                    </div>
                    <Badge
                        :variant="getStatusVariant(formData.status)"
                        class="px-3 py-1 text-sm"
                    >
                        Status: {{ formData.status }}
                    </Badge>
                </div>

                <div class="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                    <div class="flex items-center gap-2">
                        <Hash class="h-4 w-4 text-gray-400" />
                        <span class="text-gray-600">No Perencanaan:</span>
                        <span class="font-medium">{{
                            formData.request_no
                        }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <Calendar class="h-4 w-4 text-gray-400" />
                        <span class="text-gray-600">Tanggal Perencanaan:</span>
                        <span class="font-medium">{{
                            formatDate(formData.request_date)
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
                    <!-- Informasi Perencanaan -->
                    <div
                        class="mb-8 space-y-3 rounded-lg border bg-gray-50 p-4"
                    >
                        <div class="flex items-center justify-between">
                            <h3 class="font-medium text-gray-700">
                                Informasi Perencanaan
                            </h3>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <span class="text-gray-500">Tahun Anggaran:</span>
                            <span class="font-medium">{{
                                formData.fiscal_year?.year || '-'
                            }}</span>

                            <span class="text-gray-500">Periode Akademik:</span>
                            <span class="font-medium">{{
                                formData.academic_period?.display_name || '-'
                            }}</span>

                            <span class="text-gray-500">Unit:</span>
                            <span class="font-medium">{{
                                formData.unit?.unit_name || '-'
                            }}</span>

                            <span class="text-gray-500">Keterangan:</span>
                            <span
                                class="font-medium whitespace-pre-wrap text-gray-700"
                                >{{ formData.description || '-' }}</span
                            >
                        </div>
                    </div>

                    <!-- Detail Kegiatan -->
                    <div class="mb-8 border-t pt-6">
                        <div class="mb-4 flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">
                                    Detail Kegiatan
                                </h3>
                                <p class="text-sm text-gray-500">
                                    Rincian kegiatan dan item anggaran yang
                                    diajukan
                                </p>
                            </div>
                            <div class="text-sm text-gray-600">
                                Total Kegiatan:
                                <span class="font-medium">{{
                                    budgetActivities.length
                                }}</span>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div
                                v-for="(activity, index) in budgetActivities"
                                :key="activity.id"
                                class="overflow-hidden rounded-lg border"
                            >
                                <div class="border-b bg-gray-50 px-4 py-3">
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800"
                                            >
                                                {{ index + 1 }}
                                            </div>
                                            <div>
                                                <h4
                                                    class="font-semibold text-gray-900"
                                                >
                                                    {{ activity.description }}
                                                </h4>
                                                <div
                                                    class="mt-1 flex items-center gap-4 text-sm text-gray-500"
                                                >
                                                    <span
                                                        class="flex items-center gap-1"
                                                    >
                                                        <Calendar
                                                            class="h-3 w-3"
                                                        />
                                                        {{
                                                            formatDate(
                                                                activity.start_date,
                                                            )
                                                        }}
                                                        -
                                                        {{
                                                            formatDate(
                                                                activity.end_date,
                                                            )
                                                        }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-sm text-gray-600">
                                                Total Kegiatan
                                            </div>
                                            <div
                                                class="text-lg font-bold text-blue-600"
                                            >
                                                Rp
                                                {{
                                                    formatCurrency(
                                                        activity.total_amount,
                                                    )
                                                }}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="p-4">
                                    <h5 class="mb-3 font-medium text-gray-700">
                                        Detail Item Anggaran:
                                    </h5>

                                    <div class="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead class="w-12"
                                                        >No</TableHead
                                                    >
                                                    <TableHead
                                                        >Uraian</TableHead
                                                    >
                                                    <TableHead class="w-32"
                                                        >COA</TableHead
                                                    >
                                                    <TableHead class="w-28"
                                                        >Volume</TableHead
                                                    >
                                                    <TableHead class="w-28"
                                                        >Satuan</TableHead
                                                    >
                                                    <TableHead class="w-40"
                                                        >Harga Satuan</TableHead
                                                    >
                                                    <TableHead class="w-40"
                                                        >Total</TableHead
                                                    >
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow
                                                    v-for="(
                                                        item, itemIndex
                                                    ) in activity.request_items"
                                                    :key="item.id"
                                                >
                                                    <TableCell
                                                        class="font-medium"
                                                        >{{
                                                            itemIndex + 1
                                                        }}</TableCell
                                                    >
                                                    <TableCell>{{
                                                        item.description
                                                    }}</TableCell>
                                                    <TableCell>
                                                        <div
                                                            class="flex flex-col"
                                                        >
                                                            <span
                                                                class="font-medium"
                                                                >{{
                                                                    item.coa
                                                                        ?.account_code
                                                                }}</span
                                                            >
                                                            <span
                                                                class="text-xs text-gray-500"
                                                                >{{
                                                                    item.coa
                                                                        ?.account_name
                                                                }}</span
                                                            >
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{{
                                                        item.quantity
                                                    }}</TableCell>
                                                    <TableCell>{{
                                                        item.unit_measure?.name
                                                    }}</TableCell>
                                                    <TableCell
                                                        >Rp
                                                        {{
                                                            formatCurrency(
                                                                item.unit_price,
                                                            )
                                                        }}</TableCell
                                                    >
                                                    <TableCell
                                                        class="font-medium"
                                                        >Rp
                                                        {{
                                                            formatCurrency(
                                                                item.total_price,
                                                            )
                                                        }}</TableCell
                                                    >
                                                </TableRow>
                                                <TableRow class="bg-gray-50">
                                                    <TableCell
                                                        colspan="6"
                                                        class="text-right font-semibold"
                                                        >Subtotal
                                                        Kegiatan:</TableCell
                                                    >
                                                    <TableCell
                                                        class="font-bold text-blue-600"
                                                        >Rp
                                                        {{
                                                            formatCurrency(
                                                                activity.total_amount,
                                                            )
                                                        }}</TableCell
                                                    >
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <!-- Indikator Output Kegiatan -->
                                    <div class="mt-4 border-t pt-4">
                                        <div
                                            class="mb-3 flex items-center gap-2"
                                        >
                                            <Target
                                                class="h-4 w-4 text-gray-500"
                                            />
                                            <h4
                                                class="font-medium text-gray-700"
                                            >
                                                Indikator Output Kegiatan
                                            </h4>
                                            <span class="text-xs text-gray-500">
                                                (Target output yang akan
                                                dicapai)
                                            </span>
                                        </div>

                                        <div class="grid grid-cols-1 gap-4">
                                            <div class="space-y-2">
                                                <Textarea
                                                    v-model="
                                                        activity.output_indicator
                                                    "
                                                    placeholder="Isikan indikator output/keberhasilan"
                                                    readonly
                                                    class="min-h-[80px] resize-none"
                                                    rows="3"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Lampiran Dokumen Kegiatan -->
                                    <div class="mt-4 border-t pt-4">
                                        <div
                                            class="mb-3 flex items-center gap-2"
                                        >
                                            <Upload
                                                class="h-4 w-4 text-gray-500"
                                            />
                                            <h4
                                                class="font-medium text-gray-700"
                                            >
                                                Lampiran Dokumen Kegiatan
                                            </h4>
                                            <span class="text-xs text-gray-500">
                                                (Dokumen pendukung
                                                seperti proposal, RAB, dll)
                                            </span>
                                        </div>

                                        <div class="grid grid-cols-1 gap-4">
                                            <div class="space-y-2">
                                                <BaseFileList
                                                    :files="activity.files"
                                                    :showDelete="false"
                                                    :showDownload="true"
                                                    :showView="true"
                                                    @remove="removeFile"
                                                    @view="viewFile"
                                                    @download="downloadFile"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Form Verifikasi Header -->
                    <form
                        v-if="isCurrentVerifier"
                        @submit.prevent="submitVerification"
                        class="border-t pt-6"
                    >
                        <div class="space-y-6">
                            <h3 class="text-lg font-semibold text-gray-900">
                                Verifikasi Pengajuan Anggaran - Tahap
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
                        :activities="budgetActivities"
                        :current-step="currentVerifierStep"
                        :header-verification="verificationData"
                        @refresh="loadData"
                    />
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
