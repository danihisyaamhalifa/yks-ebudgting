<script setup lang="ts">
import FileUpload from '@/components/file-upload/FileUpload.vue';
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
    Calendar,
    CheckCircle,
    ClipboardList,
    FileEdit,
    FileText,
    Hash,
    History,
    ListChecks,
    TrendingUp,
    Upload,
    Users,
    X,
    XCircle,
} from 'lucide-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';
import { toast } from 'vue-sonner';

interface BudgetRequestItem {
    id: number;
    item_name: string;
    description: string;
    activity_item_id: number;
    volume: number;
    quantity: number;
    unit_measure_id: number;
    unit_price: number;
    total_amount: number;
    total_price: number;
    disbursed_amount?: number;
    remaining_amount?: number;
    unit_measure?: {
        id: number;
        code: string;
        name: string;
    };
}

interface BudgetDisbursementRecipient {
    id?: number;
    recipient_type: string;
    recipient_id: number;
    recipient_name: string;
    identity_no?: string;
    bank_name?: string;
    bank_account_no?: string;
    bank_account_name?: string;
    amount: number;
    notes?: string;
}

interface BudgetActivity {
    id: number;
    activity_id: number;
    description: string;
    activity_name?: string;
    activity_code?: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    disbursed_amount?: number;
    remaining_amount?: number;
    showItems: boolean;
    request_items: BudgetRequestItem[];
    files: UploadedFile[];
    output_indicator: string;
    activity?: {
        id: number;
        activity_name: string;
        activity_code: string;
    };
}

interface BudgetRequestHeader {
    id?: number;
    request_no: string;
    request_date: string;
    fiscal_year_id: number;
    academic_period_id?: number;
    unit_id: number;
    budget_type: string;
    budget_category_id?: number;
    sub_budget_category_id?: number;
    notes?: string;
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
    budget_category?: {
        id: number;
        name: string;
    };
    sub_budget_category?: {
        id: number;
        name: string;
    };
}

interface DisbursementHeader {
    id: number;
    disbursement_no: string;
    disbursement_date: string;
    budget_request_header_id: number;
    budget_request_activity_id: number;
    notes?: string;
    status: string;
    status_display: string;
    total_amount: number;
    verified_by?: string;
    verified_at?: string;
    rejection_reason?: string;
    verification_notes?: string;
    request_header?: BudgetRequestHeader;
    request_activity?: BudgetActivity;
    items?: DisbursementItem[];
    files: UploadedFile[];
}

interface DisbursementItem {
    id: number;
    total_amount: number;
    request_item?: BudgetRequestItem;
    recipients?: BudgetDisbursementRecipient[];
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
        | 'returned'
        | 'approved';
    verifiedAt?: string;
    notes?: string;
    decision?: string;
    step: number;
    isCurrentLevel?: boolean;
}

interface ActivityItem extends BudgetRequestItem {
    budget_amount:number;
    disbursed_amount: number;
    remaining_amount: number;
    recipients?: BudgetDisbursementRecipient[];
}

interface DisbursementApproval {
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
        approvals: DisbursementApproval[];
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
        title: 'Verifikasi & Persetujuan Pencairan',
        href: '/verifikasi-pengajuan',
    },
    {
        title: 'Form Verifikasi & Persetujuan Pencairan',
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
const disbursement = ref<DisbursementHeader | null>(null);
const selectedBudgetRequest = ref<BudgetRequestHeader | null>(null);
const selectedActivity = ref<BudgetActivity | null>(null);
const activityItems = ref<ActivityItem[]>([]);
const showDocumentPreview = ref(false);
const previewDocumentUrl = ref('');

// State untuk modal detail penerima
const showRecipientDetailModal = ref(false);
const selectedItemForDetail = ref<ActivityItem | null>(null);

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
    return activityItems.value.length;
});

const totalDisbursed = computed(() => {
    return activityItems.value.reduce(
        (sum, item) => sum + (item.disbursed_amount || 0),
        0,
    );
});

const totalVerificationSteps = computed(() => verifiers.value.length);

const currentVerifierStep = computed(() => {
    if (currentLevel.value > 0) {
        return currentLevel.value;
    }

    const inProgressVerifier = verifiers.value.find(
        (v) => v.verificationStatus === 'pending',
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
            ? `Form verifikasi pengajuan pencairan - Tahap ${currentVerifierStep.value} dari ${totalVerificationSteps.value}`
            : 'Lihat detail pengajuan pencairan';
    } else {
        return 'Riwayat lengkap proses verifikasi multi-level';
    }
};

const submitterData = computed(() => ({
    id: selectedBudgetRequest.value?.unit?.id || 0,
    name: selectedBudgetRequest.value?.unit?.unit_name || '-',
    email: '-',
}));

const submissionDate = computed(
    () => disbursement.value?.disbursement_date || '',
);
const submitterNotes = computed(() => disbursement.value?.notes || '');

const budgetTypeLabel = computed(() => {
    return selectedBudgetRequest.value?.budget_type === 'budgeter'
        ? 'Budgeter'
        : 'Non Budgeter';
});

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

// Methods untuk recipient
const getItemRecipients = (
    item: ActivityItem | null,
): BudgetDisbursementRecipient[] => {
    if (!item || !item.recipients) return [];
    return item.recipients;
};

const getRecipientTypeDisplay = (recipientType: string): string => {
    if (recipientType.includes('Employee')) return 'Pegawai';
    if (recipientType.includes('Vendor')) return 'Vendor';
    return 'Lainnya';
};

const getRecipientTypeBadgeClass = (recipientType: string): string => {
    if (recipientType.includes('Employee')) return 'bg-blue-100 text-blue-700';
    if (recipientType.includes('Vendor'))
        return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
};

const openRecipientDetailModal = (item: ActivityItem) => {
    selectedItemForDetail.value = item;
    showRecipientDetailModal.value = true;
};

const closeRecipientDetailModal = () => {
    showRecipientDetailModal.value = false;
    selectedItemForDetail.value = null;
};

// Initialization
onMounted(async () => {
    showLoadingSkeleton.value = true;

    try {
        if (props.id) {
            await loadDisbursementData();
            await loadDisbursementApprovals(props.id);
            initializeVerificationData();
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        showLoadingSkeleton.value = false;
    }
});

const loadDisbursementData = async () => {
    try {
        const { data } = await axios.get(
            `/api/v1/budget-disbursements/${props.id}`,
        );

        const disbursementData = data.data;
        disbursement.value = disbursementData;

        // Set budget request data
        if (disbursementData.request_header) {
            selectedBudgetRequest.value = {
                id: disbursementData.request_header.id,
                request_no: disbursementData.request_header.request_no,
                request_date: disbursementData.request_header.request_date,
                total_amount: parseFloat(
                    disbursementData.request_header.total_amount,
                ),
                status: disbursementData.request_header.status,
                unit_id: disbursementData.request_header.unit_id || 0,
                unit: disbursementData.request_header.unit,
                fiscal_year_id:
                    disbursementData.request_header.fiscal_year_id || 0,
                fiscal_year: disbursementData.request_header.fiscal_year,
                academic_period_id:
                    disbursementData.request_header.academic_period_id || 0,
                academic_period:
                    disbursementData.request_header.academic_period,
                budget_type: disbursementData.request_header.budget_type || '',
                budget_category_id:
                    disbursementData.request_header.budget_category_id || 0,
                budget_category:
                    disbursementData.request_header.budget_category,
                sub_budget_category_id:
                    disbursementData.request_header.sub_budget_category_id || 0,
                sub_budget_category:
                    disbursementData.request_header.sub_budget_category,
                notes: disbursementData.request_header.notes || '',
                status_display:
                    disbursementData.request_header.status_display || '',
            };
        }

        // Build activity data
        if (
            disbursementData.request_activity &&
            disbursementData.items &&
            disbursementData.items.length > 0
        ) {
            selectedActivity.value = {
                id: disbursementData.budget_request_activity_id,
                activity_id: disbursementData.request_activity.id,
                total_amount: parseFloat(
                    disbursementData.request_activity.total_amount,
                ),
                disbursed_amount:
                    disbursementData.request_activity.disbursed_amount || 0,
                remaining_amount:
                    disbursementData.request_activity.remaining_amount || 0,
                description:
                    disbursementData.request_activity.description || '',
                activity_name:
                    disbursementData.request_activity.description || '',
                activity_code:
                    disbursementData.request_activity.activity_code || '',
                start_date: disbursementData.request_activity.start_date || '',
                end_date: disbursementData.request_activity.end_date || '',
                showItems: true,
                request_items: [],
                files: [],
                output_indicator: '',
                activity: {
                    id: disbursementData.request_activity.id,
                    activity_name:
                        disbursementData.request_activity.description || '',
                    activity_code:
                        disbursementData.request_activity.activity
                            .activity_code || '',
                },
            };

            // Build activity items dengan recipients
            activityItems.value = disbursementData.items.map((item: any) => {
                const requestItem = item.request_item;
                const budgetAmount = parseFloat(requestItem.total_amount);
                const totalAmount = parseFloat(item.total_amount);
                const disbursedAmount = parseFloat(requestItem.disbursed_amount);
                const remainingAmount =
                    totalAmount - disbursedAmount;

                return {
                    id: requestItem.id,
                    item_name: requestItem.description,
                    description: requestItem.description,
                    volume: parseFloat(requestItem.volume),
                    quantity: parseFloat(requestItem.volume),
                    unit_measure_id: requestItem.unit_measure_id,
                    unit_price: parseFloat(requestItem.unit_price),
                    total_amount: totalAmount,
                    total_price: totalAmount,
                    budget_amount: budgetAmount,
                    remaining_amount: remainingAmount,
                    disbursed_amount: disbursedAmount,
                    unit_measure: requestItem.unit_measure,
                    recipients: item.recipients || [],
                };
            });
        }

        // Format files
        if (disbursementData.documents) {
            disbursementData.files = disbursementData.documents.map(
                (att: any) => ({
                    id: att.id,
                    name: att.document_name,
                    file: att.file_path,
                    size: att.file_size,
                    type: att.file_type,
                    url: att.file_path,
                    isExisting: true,
                    status: 'success',
                }),
            );
        }
    } catch (error) {
        console.error('Failed to load disbursement:', error);
        toast.error('Gagal memuat data pencairan');
    }
};

const loadDisbursementApprovals = async (disbursementId: number | string) => {
    isLoadingApprovals.value = true;
    try {
        const response = await axios.get(
            `/api/v1/budget-disbursements/${disbursementId}/approvals`,
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

            verifiers.value = approvals.map((approval) => {
                console.log(
                    `Status asli untuk Level ${approval.approval_level}:`,
                    mapApprovalStatusToVerificationStatus(approval.status),
                );

                return {
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
                    decision: getDecisionFromStatus(approval.status),
                    step: approval.approval_level,
                    isCurrentLevel: approval.is_current,
                };
            });

            verifiers.value.sort((a, b) => a.step - b.step);

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
                if (disbursement.value) {
                    disbursement.value.status_display = statusDisplay;
                }
            }
        }
    } catch (error) {
        console.error('Failed to load disbursement approvals:', error);
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
        returned: 'returned',
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
                endpoint = `/api/v1/budget-disbursement-approvals/${currentApproval.id}/approve`;
                break;
            case 'returned':
                endpoint = `/api/v1/budget-disbursement-approvals/${currentApproval.id}/return`;
                break;
            case 'rejected':
                endpoint = `/api/v1/budget-disbursement-approvals/${currentApproval.id}/reject`;
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
            if (disbursement.value) {
                disbursement.value.status_display = mapHeaderStatusToFormStatus(
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
                    'pending';
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
            if (disbursement.value) {
                disbursement.value.status_display = finalStatus;
            }

            const messages = {
                approved: 'Pengajuan pencairan berhasil disetujui!',
                returned: 'Pengajuan pencairan dikembalikan untuk revisi!',
                rejected: 'Pengajuan pencairan telah ditolak!',
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
        await loadDisbursementApprovals(props.id);
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
    <Head title="Verifikasi Pengajuan Pencairan" />
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
                            Verifikasi Pengajuan Pencairan
                        </h1>
                        <p class="mt-1 text-sm text-gray-500">
                            {{ getPageDescription() }}
                        </p>
                    </div>
                    <Badge
                        :variant="
                            getStatusVariant(disbursement?.status_display || '')
                        "
                        class="px-3 py-1 text-sm"
                    >
                        Status: {{ disbursement?.status_display || '-' }}
                    </Badge>
                </div>

                <div
                    class="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 md:grid-cols-4"
                >
                    <!-- Kolom 1: No Pengajuan -->
                    <div
                        class="flex w-full min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 md:col-span-2"
                    >
                        <div
                            class="flex shrink-0 items-center gap-2 text-gray-400"
                        >
                            <Hash class="h-4 w-4" />
                            <span class="text-gray-600">No Pengajuan:</span>
                        </div>
                        <span
                            class="font-medium break-words text-gray-900 sm:whitespace-nowrap md:whitespace-normal"
                        >
                            {{ disbursement?.disbursement_no }}
                        </span>
                    </div>

                    <!-- Kolom 2: Tgl. Pengajuan -->
                    <div class="flex min-w-0 items-center gap-2">
                        <Calendar class="h-4 w-4 shrink-0 text-gray-400" />
                        <span class="shrink-0 text-gray-600"
                            >Tgl. Pengajuan:</span
                        >
                        <span class="font-medium text-gray-900">{{
                            formatDate(disbursement?.disbursement_date || '')
                        }}</span>
                    </div>

                    <!-- Kolom 3: Progress -->
                    <div class="flex min-w-0 items-center gap-2">
                        <TrendingUp class="h-4 w-4 shrink-0 text-gray-400" />
                        <span class="shrink-0 text-gray-600">Progress:</span>
                        <span class="shrink-0 font-medium text-gray-900">
                            {{ getCompletedStepsCount }} /
                            {{ totalVerificationSteps }} Tahap
                        </span>
                    </div>
                </div>
            </div>

            <!-- Alert Penolakan -->
            <div
                v-if="
                    disbursement?.status?.toUpperCase() === 'REJECTED' &&
                    disbursement?.rejection_reason
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
                            {{ disbursement.rejection_reason }}
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
                    <div class="rounded-lg border bg-gray-50 p-4">
                        <div class="mb-3 flex items-center gap-2 border-b pb-2">
                            <FileText class="h-4 w-4 text-gray-500" />
                            <h3 class="font-medium text-blue-800">
                                Informasi Pengajuan
                            </h3>
                        </div>

                        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <!-- Kolom Kiri: Informasi Perencanaan -->
                            <div>
                                <h4
                                    class="mb-2 text-xs font-semibold text-gray-500 uppercase"
                                >
                                    Perencanaan Anggaran
                                </h4>
                                <div
                                    class="grid grid-cols-[max-content_1fr] gap-x-2 gap-y-2 text-sm"
                                >
                                    <span class="text-gray-500">Unit</span>
                                    <span class="font-medium"
                                        >:
                                        {{
                                            selectedBudgetRequest?.unit
                                                ?.unit_name || '-'
                                        }}</span
                                    >

                                    <span class="text-gray-500"
                                        >No. Perencanaan</span
                                    >
                                    <span class="font-medium"
                                        >:
                                        {{
                                            selectedBudgetRequest?.request_no ||
                                            '-'
                                        }}</span
                                    >

                                    <span class="text-gray-500"
                                        >Tahun Anggaran</span
                                    >
                                    <span class="font-medium"
                                        >:
                                        {{
                                            selectedBudgetRequest?.fiscal_year
                                                ?.year || '-'
                                        }}</span
                                    >

                                    <span class="text-gray-500"
                                        >Periode Akademik</span
                                    >
                                    <span class="font-medium"
                                        >:
                                        {{
                                            selectedBudgetRequest
                                                ?.academic_period
                                                ?.display_name || '-'
                                        }}</span
                                    >
                                </div>
                            </div>

                            <!-- Kolom Kanan: Informasi Kegiatan -->
                            <div v-if="selectedActivity">
                                <h4
                                    class="mb-2 text-xs font-semibold text-gray-500 uppercase"
                                >
                                    Kegiatan
                                </h4>
                                <div
                                    class="grid grid-cols-[max-content_1fr] gap-x-2 gap-y-2 text-sm"
                                >
                                    <span class="text-gray-500"
                                        >Tipe Anggaran</span
                                    >
                                    <span class="font-medium"
                                        >: {{ budgetTypeLabel || '-' }}</span
                                    >

                                    <span class="text-gray-500"
                                        >Kategori Anggaran</span
                                    >
                                    <span class="font-medium"
                                        >:
                                        {{
                                            selectedBudgetRequest
                                                ?.budget_category?.name || '-'
                                        }}</span
                                    >

                                    <span class="text-gray-500"
                                        >Sub Kategori Anggaran</span
                                    >
                                    <span class="font-medium"
                                        >:
                                        {{
                                            selectedBudgetRequest
                                                ?.sub_budget_category?.name ||
                                            '-'
                                        }}</span
                                    >

                                    <span class="text-gray-600"
                                        >Nama Kegiatan</span
                                    >
                                    <span class="font-medium"
                                        >:
                                        {{
                                            selectedActivity.activity
                                                ?.activity_name || '-'
                                        }}</span
                                    >

                                    <span class="text-gray-500">Deskripsi</span>
                                    <span
                                        class="font-medium whitespace-pre-wrap text-gray-700"
                                        >:
                                        {{ disbursement?.notes || '-' }}</span
                                    >
                                </div>
                            </div>

                            <!-- Jika tidak ada kegiatan, tampilkan placeholder -->
                            <div v-else>
                                <h4
                                    class="mb-2 text-xs font-semibold text-gray-500 uppercase"
                                >
                                    Kegiatan
                                </h4>
                                <p class="text-sm text-gray-400 italic">
                                    Data kegiatan tidak tersedia
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Lampiran Dokumen Kegiatan -->
                    <div class="mt-4 border-t pt-4">
                        <div class="mb-3 flex items-center gap-2">
                            <Upload class="h-4 w-4 text-gray-500" />
                            <h4 class="font-medium text-gray-700">
                                Lampiran Dokumen Pengajuan Pencairan
                            </h4>
                        </div>

                        <div class="grid grid-cols-1 gap-4">
                            <div class="space-y-2">
                                <FileUpload
                                    v-model="disbursement.files"
                                    :view-only="true"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Detail Item Kegiatan -->
                    <div class="mb-8 border-t pt-6">
                        <div class="mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">
                                Rincian Item Kegiatan
                            </h3>
                            <p class="text-sm text-gray-500">
                                Item Kegiatan yang diajukan untuk dicairkan
                            </p>
                        </div>

                        <div class="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead class="w-12">No</TableHead>
                                        <TableHead>Item Anggaran</TableHead>
                                        <TableHead class="w-32 text-right"
                                            >Total Anggaran</TableHead
                                        >
                                        <TableHead class="w-32 text-right"
                                            >Terealisasi</TableHead
                                        >
                                        <TableHead class="w-32 text-right"
                                            >Sisa</TableHead
                                        >
                                        <TableHead class="w-32 text-right"
                                            >Nilai Diajukan</TableHead
                                        >
                                        <TableHead class="w-48 text-center"
                                            >Penerima</TableHead
                                        >
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow
                                        v-for="(item, index) in activityItems"
                                        :key="item.id"
                                    >
                                        <TableCell class="font-medium">{{
                                            index + 1
                                        }}</TableCell>
                                        <TableCell>
                                            <span class="text-sm">{{
                                                item.description
                                            }}</span>
                                        </TableCell>
                                        <TableCell
                                            class="text-right font-medium"
                                        >
                                            Rp
                                            {{
                                                formatCurrency(
                                                    item.budget_amount,
                                                )
                                            }}
                                        </TableCell>
                                        <TableCell
                                            class="text-right font-medium"
                                        >
                                            Rp
                                            {{
                                                formatCurrency(
                                                    item.disbursed_amount,
                                                )
                                            }}
                                        </TableCell>
                                        <TableCell
                                            class="text-right font-medium text-green-600"
                                        >
                                            Rp
                                            {{
                                                formatCurrency(
                                                    item.remaining_amount,
                                                )
                                            }}
                                        </TableCell>
                                        <TableCell
                                            class="text-right font-semibold text-blue-700"
                                        >
                                            Rp
                                            {{
                                                formatCurrency(
                                                    item.total_amount,
                                                )
                                            }}
                                        </TableCell>
                                        <TableCell class="text-center">
                                            <Button
                                                v-if="
                                                    getItemRecipients(item)
                                                        .length > 0
                                                "
                                                variant="outline"
                                                size="sm"
                                                @click="
                                                    openRecipientDetailModal(
                                                        item,
                                                    )
                                                "
                                                class="gap-1"
                                            >
                                                <Users class="h-3 w-3" />
                                                Lihat Penerima
                                                <span
                                                    class="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs"
                                                >
                                                    {{
                                                        getItemRecipients(item)
                                                            .length
                                                    }}
                                                </span>
                                            </Button>
                                            <span
                                                v-else
                                                class="text-sm text-gray-400"
                                                >-</span
                                            >
                                        </TableCell>
                                    </TableRow>
                                    <TableRow v-if="activityItems.length === 0">
                                        <TableCell
                                            colspan="7"
                                            class="py-8 text-center text-gray-500"
                                        >
                                            <div
                                                class="flex flex-col items-center gap-2"
                                            >
                                                <ListChecks class="h-8 w-8" />
                                                <p>Tidak ada item</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        <!-- Summary -->
                        <div class="mt-6 flex justify-end">
                            <div
                                class="w-96 space-y-3 rounded-lg border bg-gray-50 p-4"
                            >
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600"
                                        >Jumlah Item:</span
                                    >
                                    <span class="font-medium">{{
                                        selectedItemsCount
                                    }}</span>
                                </div>
                                <div class="flex justify-between border-t pt-2">
                                    <span class="font-medium text-gray-800"
                                        >Total Diajukan:</span
                                    >
                                    <span
                                        class="text-lg font-bold text-blue-600"
                                    >
                                        Rp {{ formatCurrency(totalDisbursed) }}
                                    </span>
                                </div>
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
                                Verifikasi Pengajuan Pencairan - Tahap
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
                                                <span>Perlu Revisi</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <XCircle
                                                    class="h-4 w-4 text-red-600"
                                                />
                                                <span>Ditolak</span>
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
                        :activities="[selectedActivity].filter(Boolean)"
                        :current-step="currentVerifierStep"
                        :header-verification="verificationData"
                        @refresh="loadData"
                    />
                </div>
            </div>
        </div>

        <!-- Modal Detail Penerima -->
        <div
            v-if="showRecipientDetailModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            @click.self="closeRecipientDetailModal"
        >
            <div
                class="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
            >
                <div
                    class="mb-4 flex items-center justify-between border-b pb-3"
                >
                    <h3 class="text-lg font-semibold">
                        Detail Penerima -
                        {{ selectedItemForDetail?.description }}
                    </h3>
                    <button
                        @click="closeRecipientDetailModal"
                        class="text-gray-400 hover:text-gray-600"
                    >
                        <X class="h-5 w-5" />
                    </button>
                </div>

                <!-- Summary -->
                <div class="mb-4 rounded-lg bg-blue-50 p-3">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-600">Nilai Dicairkan:</span>
                            <span class="ml-2 font-semibold text-blue-700">
                                Rp
                                {{
                                    formatCurrency(
                                        selectedItemForDetail?.disbursed_amount ||
                                            0,
                                    )
                                }}
                            </span>
                        </div>
                        <div>
                            <span class="text-gray-600">Total Penerima:</span>
                            <span class="ml-2 font-semibold">
                                {{
                                    getItemRecipients(selectedItemForDetail)
                                        .length
                                }}
                                Pegawai/Vendor
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Tabel Penerima -->
                <div class="max-h-[400px] overflow-y-auto rounded-md border">
                    <Table>
                        <TableHeader class="sticky top-0 bg-white">
                            <TableRow>
                                <TableHead class="w-12">No</TableHead>
                                <TableHead class="w-24">Tipe</TableHead>
                                <TableHead>Nama Penerima</TableHead>
                                <TableHead>Kode/NIK</TableHead>
                                <TableHead class="text-right">Jumlah</TableHead>
                                <TableHead>Bank</TableHead>
                                <TableHead>No. Rekening</TableHead>
                                <TableHead>Catatan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <template
                                v-if="
                                    getItemRecipients(selectedItemForDetail)
                                        .length > 0
                                "
                            >
                                <TableRow
                                    v-for="(
                                        recipient, rIdx
                                    ) in getItemRecipients(
                                        selectedItemForDetail,
                                    )"
                                    :key="rIdx"
                                >
                                    <TableCell class="text-center">{{
                                        rIdx + 1
                                    }}</TableCell>
                                    <TableCell>
                                        <span
                                            class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                                            :class="
                                                getRecipientTypeBadgeClass(
                                                    recipient.recipient_type,
                                                )
                                            "
                                        >
                                            {{
                                                getRecipientTypeDisplay(
                                                    recipient.recipient_type,
                                                )
                                            }}
                                        </span>
                                    </TableCell>
                                    <TableCell class="font-medium">{{
                                        recipient.recipient_name
                                    }}</TableCell>
                                    <TableCell>{{
                                        recipient.identity_no || '-'
                                    }}</TableCell>
                                    <TableCell class="text-right"
                                        >Rp
                                        {{
                                            formatCurrency(recipient.amount)
                                        }}</TableCell
                                    >
                                    <TableCell>{{
                                        recipient.bank_name || '-'
                                    }}</TableCell>
                                    <TableCell>{{
                                        recipient.bank_account_no || '-'
                                    }}</TableCell>
                                    <TableCell class="text-gray-500">{{
                                        recipient.notes || '-'
                                    }}</TableCell>
                                </TableRow>
                            </template>
                            <TableRow v-else>
                                <TableCell
                                    colspan="8"
                                    class="py-8 text-center text-gray-500"
                                >
                                    <div
                                        class="flex flex-col items-center gap-2"
                                    >
                                        <Users class="h-8 w-8 text-gray-300" />
                                        <p>Tidak ada data penerima</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <div class="mt-6 flex justify-end border-t pt-4">
                    <Button
                        variant="outline"
                        @click="closeRecipientDetailModal"
                    >
                        Tutup
                    </Button>
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
