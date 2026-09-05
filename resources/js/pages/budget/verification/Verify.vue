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
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import axios from 'axios';
import {
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    ClipboardList,
    FileEdit,
    FileText,
    Hash,
    History,
    Package,
    Target,
    TrendingUp,
    Upload,
    Users,
    X,
    XCircle,
} from 'lucide-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';
import { toast } from 'vue-sonner';
import VerificationHistoryTab from '../components/VerificationHistoryTab.vue';

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Verifikasi & Persetujuan Perencanaan',
        href: '/verifikasi-anggaran',
    },
    {
        title: 'Form Verifikasi & Persetujuan Perencanaan',
        href: '',
    },
];

// ========== INTERFACES ==========
interface BudgetRequestItemGood {
    id: number;
    item_name: string;
    goods_type: 'bhp' | 'non_bhp';
    specification: string;
    brand: string;
    quantity: number;
    unit_measure: string;
    unit_price: number;
    subtotal: number;
    notes: string;
}

interface BudgetRequestItemMultiplier {
    id?: number;
    sequence: number;
    label: string;
    value: number;
}

interface BudgetRequestItemEmployee {
    id?: number;
    nik: string;
    employee_name: string;
    functional_position: string;
    teaching_hours: number;
    class_count: number;
    rate: number;
    total: number;
    notes: string;
}

interface BudgetRequestItem {
    id: number;
    description: string;
    coa_id: string;
    quantity: number;
    unit: number;
    unit_price: number;
    total_price: number;
    trans_type_group?: string;
    goods?: BudgetRequestItemGood[];
    employees?: BudgetRequestItemEmployee[];
    multipliers?: BudgetRequestItemMultiplier[];
    showGoods?: boolean;
    showEmployees?: boolean;
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
    isExpanded?: boolean;
    level?: number;
}

interface BudgetRequestHeader {
    id?: number;
    request_no: string;
    request_date: string;
    fiscal_year_id: number;
    academic_period_id: number;
    unit_id: number;
    budget_type: string;
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
    budget_category?: {
        id: number;
        name: string;
    };
    sub_budget_category?: {
        id: number;
        name: string;
    };
}

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

interface ApprovalsResponse {
    success: boolean;
    message: string;
    data: {
        header_status: string;
        current_level: number;
        approvals: BudgetRequestApproval[];
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

// ========== PROPS ==========
const props = defineProps<{
    id?: number | string;
}>();

// ========== STATE ==========
const activeTab = ref<'verifikasi' | 'riwayat'>('verifikasi');
const verifiers = ref<Verifier[]>([]);
const headerStatus = ref<string>('');
const currentLevel = ref<number>(0);

const verificationData = reactive<VerificationData>({
    status: '',
    notes: '',
    history: [],
});

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
    budget_type: '',
    budget_category_id: 0,
    sub_budget_category_id: 0,
    description: '',
    status: 'draft',
    status_display: 'Draft',
    total_amount: 0,
});
const budgetActivities = ref<BudgetActivity[]>([]);

// ========== COMPUTED ==========
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

const budgetTypeLabel = computed(() => {
    return formData.value.budget_type === 'budgeter'
        ? 'Budgeter'
        : 'Non Budgeter';
});

const totalVerificationSteps = computed(() => {
    return verifiers.value.length;
});

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

const submitterData = computed(() => ({
    id: formData.value.unit?.id || 0,
    name: formData.value.unit?.unit_name || '-',
    email: '-',
}));

const submissionDate = computed(() => formData.value.request_date);

const submitterNotes = computed(() => formData.value.description);

// ========== GOODS UTILITY FUNCTIONS ==========
const hasVendorType = (item: BudgetRequestItem): boolean => {
    return item.trans_type_group?.toUpperCase() === 'VENDOR';
};

const hasEmployeeType = (item: BudgetRequestItem): boolean => {
    return item.trans_type_group?.toUpperCase() === 'EMPLOYEE';
};

const hasGoods = (item: BudgetRequestItem): boolean => {
    return !!(item.goods && item.goods.length > 0);
};

const hasEmployees = (item: BudgetRequestItem): boolean => {
    return !!(item.employees && item.employees.length > 0);
};

const toggleGoodsDetail = (item: BudgetRequestItem) => {
    item.showGoods = !item.showGoods;
};

const toggleEmployeesDetail = (item: BudgetRequestItem) => {
    item.showEmployees = !item.showEmployees;
};

const getEmployeeTotalAmount = (
    employees: BudgetRequestItemEmployee[],
) => {
    return employees.reduce((sum, emp) => sum + (emp.total || 0), 0);
};

const getGoodsTypeBadgeClass = (goodsType: string) => {
    return goodsType === 'bhp'
        ? 'bg-primary/10 text-primary'
        : 'bg-secondary/10 text-secondary-foreground';
};

const getGoodsTotalAmount = (goods: BudgetRequestItemGood[]) => {
    return goods.reduce((sum, good) => sum + (good.subtotal || 0), 0);
};

// ========== LIFECYCLE ==========
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

// ========== DATA LOADING ==========
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
            budget_type: data.budget_type,
            budget_category_id: data.budget_category_id,
            sub_budget_category_id: data.sub_budget_category_id,
            description: data.notes || '',
            status: data.status,
            status_display: data.status_display,
            total_amount: data.total_amount,
            fiscal_year: data.fiscal_year,
            academic_period: data.academic_period,
            unit: data.unit,
            budget_category: data.budget_category,
            sub_budget_category: data.sub_budget_category,
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

            verifiers.value = approvals.map((approval) => {
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
                formData.value.status = mapHeaderStatusToFormStatus(
                    headerStatus.value,
                );
            }
        }
    } catch (error) {
        console.error('Failed to load budget request approvals:', error);
    } finally {
        isLoadingApprovals.value = false;
    }
};

// ========== MAPPING FUNCTIONS ==========
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

// ========== TRANSFORM ==========
const mapActivityVerify = (activity: any, level = 0): BudgetActivity => ({
    id: activity.id,
    activity_id: activity.activity_id,
    description:
        activity.activity?.activity_name ||
        activity.activity_name ||
        activity.description ||
        '',
    start_date: activity.start_date
        ? String(activity.start_date).split('T')[0]
        : '',
    end_date: activity.end_date ? String(activity.end_date).split('T')[0] : '',
    total_amount: activity.total_amount || 0,
    showItems: false,
    isExpanded: false,
    level,
    request_items:
        activity.request_items?.map((detail: any) => ({
            id: detail.id,
            description: detail.description || '',
            coa_id: detail.coa_id || '',
            quantity: detail.volume || 0,
            unit: detail.unit_measure_id || 0,
            unit_price: detail.unit_price || 0,
            total_price: detail.total_amount || 0,
            trans_type_group:
                detail.activity_item?.trans_type?.group_code || '',
            multipliers: (detail.multipliers || []).map((m: any) => ({
                id: m.id,
                sequence: m.sequence || 1,
                label: m.label || 'Volume',
                value: parseFloat(m.value) || 0,
            })),
            showGoods: false,
            showEmployees: false,
            goods:
                detail.goods?.map((good: any) => ({
                    id: good.id,
                    item_name: good.item_name,
                    goods_type: good.goods_type || 'bhp',
                    specification: good.specification || '',
                    brand: good.brand || '',
                    quantity: good.quantity || 1,
                    unit_measure: good.unit_measure || '',
                    unit_price: parseFloat(good.unit_price) || 0,
                    subtotal: parseFloat(good.subtotal) || 0,
                    notes: good.notes || '',
                })) || [],
            employees:
                detail.employees?.map((emp: any) => ({
                    id: emp.id,
                    nik: emp.nik || '',
                    employee_name: emp.employee_name || '',
                    functional_position: emp.functional_position || '',
                    teaching_hours: parseFloat(emp.teaching_hours) || 0,
                    class_count: parseInt(emp.class_count, 10) || 0,
                    rate: parseFloat(emp.rate) || 0,
                    total: parseFloat(emp.total) || 0,
                    notes: emp.notes || '',
                })) || [],
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
});

const transformActivities = (activitiesData: any[]): BudgetActivity[] => {
    return (activitiesData || []).flatMap((activity: any) => {
        const children = (activity.children || []).map((child: any) =>
            mapActivityVerify(child, 1),
        );
        return [mapActivityVerify(activity, 0), ...children];
    });
};

// ========== ACTIVITY TOGGLE ==========
const toggleActivityDetails = (activity: BudgetActivity) => {
    activity.isExpanded = !activity.isExpanded;
};

// ========== INITIALIZATION ==========
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

// ========== FORMATTING ==========
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
};

// Formula pengali volume untuk tampilan (14 Hari × 50 Mahasiswa)
const formatFormula = (item: BudgetRequestItem): string => {
    if (hasVendorType(item) || hasEmployeeType(item)) {
        return '-';
    }

    const multipliers = item.multipliers || [];
    if (multipliers.length === 0) {
        return item.quantity ? `${Number(item.quantity).toFixed(0)}` : '-';
    }

    return multipliers
        .filter((m) => (Number(m.value) || 0) > 0)
        .map(
            (m) =>
                `${Number(m.value).toLocaleString('id-ID')}${m.label ? ' ' + m.label : ''}`,
        )
        .join(' × ');
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

const getPageDescription = () => {
    if (activeTab.value === 'verifikasi') {
        return isCurrentVerifier.value
            ? `Form verifikasi pengajuan anggaran - Tahap ${currentVerifierStep.value} dari ${totalVerificationSteps.value}`
            : 'Lihat detail pengajuan anggaran';
    } else {
        return 'Riwayat lengkap proses verifikasi multi-level';
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

const getSubmitButtonVariant = () => {
    switch (verificationData.status) {
        case 'approved':
            return 'default';
        case 'returned':
            return 'default';
        case 'rejected':
            return 'destructive';
        default:
            return 'default';
    }
};

const getSubmitButtonText = () => {
    return `Simpan Verifikasi Tahap ${currentVerifierStep.value}`;
};

// ========== FORM ACTIONS ==========
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
                    'Silakan tentukan status verifikasi (Setujui/Perlu Revisi/Tolak).',
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
            formData.value.status = mapHeaderStatusToFormStatus(
                response.data.data.header_status,
            );
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

            alert(
                `Verifikasi tahap ${currentStep} berhasil disimpan! Menunggu verifikator tahap ${currentStep + 1}.`,
            );
        } else {
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

            await loadData();
        }
    } catch (error: any) {
        console.error('Error submitting verification:', error);

        let errorMessage =
            error.response?.data?.message ||
            'Terjadi kesalahan saat mengirim verifikasi.';

        if (errorMessage.includes('Unauthorized')) {
            errorMessage =
                'Maaf Anda tidak bisa melakukan verifikasi pada tahap ini dikarenakan Role anda tidak sesuai.';
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
        await loadBudgetRequestApprovals(props.id);
        initializeVerificationData();
    }
};

// ========== FILE HANDLERS ==========
const removeFile = () => {};
const viewFile = (file: any) => {
    if (file.url) {
        window.open(file.url, '_blank');
    }
};
const downloadFile = (file: any) => {
    if (file.url) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.click();
    }
};
</script>

<template>
    <Head title="Verifikasi & Approval Perencanaan Anggaran" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <!-- Loading Skeleton dengan Animate Pulse -->
        <div
            v-if="showLoadingSkeleton || isLoadingApprovals"
            class="rounded-lg border bg-card p-6 shadow-sm"
        >
            <div class="animate-pulse">
                <!-- Header Skeleton -->
                <div class="mb-6 border-b pb-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="h-8 w-64 rounded bg-muted"></div>
                            <div class="mt-2 h-4 w-96 rounded bg-muted"></div>
                        </div>
                        <div class="h-8 w-32 rounded bg-muted"></div>
                    </div>

                    <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div class="flex items-center gap-2">
                            <div class="h-4 w-4 rounded bg-muted"></div>
                            <div class="h-4 w-20 rounded bg-muted"></div>
                            <div class="h-4 w-32 rounded bg-muted"></div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="h-4 w-4 rounded bg-muted"></div>
                            <div class="h-4 w-20 rounded bg-muted"></div>
                            <div class="h-4 w-24 rounded bg-muted"></div>
                        </div>
                        <div></div>
                        <div class="flex items-center gap-2">
                            <div class="h-4 w-4 rounded bg-muted"></div>
                            <div class="h-4 w-16 rounded bg-muted"></div>
                            <div class="h-4 w-20 rounded bg-muted"></div>
                        </div>
                    </div>
                </div>

                <!-- Tab Navigation Skeleton -->
                <div class="mb-6 border-b">
                    <div class="flex space-x-6">
                        <div class="h-10 w-28 rounded bg-muted"></div>
                        <div class="h-10 w-36 rounded bg-muted"></div>
                    </div>
                </div>

                <!-- Informasi Perencanaan Skeleton -->
                <div class="mb-8 rounded-lg border bg-muted/30 p-4">
                    <div class="mb-3 h-5 w-48 rounded bg-muted"></div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="h-4 w-24 rounded bg-muted"></div>
                        <div class="h-4 w-32 rounded bg-muted"></div>
                        <div class="h-4 w-24 rounded bg-muted"></div>
                        <div class="h-4 w-40 rounded bg-muted"></div>
                        <div class="h-4 w-24 rounded bg-muted"></div>
                        <div class="h-4 w-36 rounded bg-muted"></div>
                    </div>
                </div>

                <!-- Detail Kegiatan Skeleton -->
                <div class="mb-8 border-t pt-6">
                    <div class="mb-4 flex items-center justify-between">
                        <div>
                            <div class="h-6 w-40 rounded bg-muted"></div>
                            <div class="mt-2 h-4 w-64 rounded bg-muted"></div>
                        </div>
                        <div class="h-4 w-32 rounded bg-muted"></div>
                    </div>

                    <div class="space-y-4">
                        <div class="overflow-hidden rounded-lg border">
                            <div class="border-b bg-muted/30 px-4 py-3">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="h-8 w-8 rounded-full bg-muted"
                                        ></div>
                                        <div>
                                            <div
                                                class="h-5 w-48 rounded bg-muted"
                                            ></div>
                                            <div
                                                class="mt-2 h-4 w-64 rounded bg-muted"
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            class="h-4 w-24 rounded bg-muted"
                                        ></div>
                                        <div
                                            class="mt-1 h-6 w-32 rounded bg-muted"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div class="p-4">
                                <div class="mb-3 h-5 w-40 rounded bg-muted"></div>
                                <div class="space-y-2">
                                    <div class="h-10 w-full rounded bg-muted"></div>
                                    <div class="h-10 w-full rounded bg-muted"></div>
                                    <div class="h-10 w-full rounded bg-muted"></div>
                                </div>
                            </div>
                        </div>

                        <div class="overflow-hidden rounded-lg border">
                            <div class="border-b bg-muted/30 px-4 py-3">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="h-8 w-8 rounded-full bg-muted"
                                        ></div>
                                        <div>
                                            <div
                                                class="h-5 w-56 rounded bg-muted"
                                            ></div>
                                            <div
                                                class="mt-2 h-4 w-72 rounded bg-muted"
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            class="h-4 w-24 rounded bg-muted"
                                        ></div>
                                        <div
                                            class="mt-1 h-6 w-32 rounded bg-muted"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div class="p-4">
                                <div class="mb-3 h-5 w-40 rounded bg-muted"></div>
                                <div class="space-y-2">
                                    <div class="h-10 w-full rounded bg-muted"></div>
                                    <div class="h-10 w-full rounded bg-muted"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Verifikasi Skeleton -->
                <div class="border-t pt-6">
                    <div class="mb-6 h-6 w-64 rounded bg-muted"></div>

                    <div class="space-y-4">
                        <div>
                            <div class="mb-2 h-4 w-32 rounded bg-muted"></div>
                            <div class="h-10 w-full rounded bg-muted"></div>
                        </div>

                        <div>
                            <div class="mb-2 flex items-center justify-between">
                                <div class="h-4 w-32 rounded bg-muted"></div>
                                <div class="h-3 w-16 rounded bg-muted"></div>
                            </div>
                            <div class="h-40 w-full rounded bg-muted"></div>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-end space-x-3 border-t pt-6">
                        <div class="h-10 w-20 rounded bg-muted"></div>
                        <div class="flex space-x-2">
                            <div class="h-10 w-28 rounded bg-muted"></div>
                            <div class="h-10 w-32 rounded bg-muted"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Konten Utama -->
        <div v-else class="rounded-lg border bg-card p-6 shadow-sm">
            <!-- Header -->
            <div class="mb-6 border-b pb-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-foreground">
                            Verifikasi Perencanaan Anggaran
                        </h1>
                        <p class="mt-1 text-sm text-muted-foreground">
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

                <div
                    class="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 md:grid-cols-4"
                >
                    <div
                        class="flex w-full min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 md:col-span-2"
                    >
                        <div
                            class="flex shrink-0 items-center gap-2 text-muted-foreground"
                        >
                            <Hash class="h-4 w-4" />
                            <span class="text-muted-foreground">No Perencanaan:</span>
                        </div>
                        <span
                            class="font-medium break-words text-foreground sm:whitespace-nowrap md:whitespace-normal"
                        >
                            {{ formData.request_no }}
                        </span>
                    </div>

                    <div class="flex min-w-0 items-center gap-2">
                        <Calendar class="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span class="shrink-0 text-muted-foreground"
                            >Tgl. Perencanaan:</span
                        >
                        <span class="font-medium text-foreground">{{
                            formatDate(formData.request_date)
                        }}</span>
                    </div>

                    <div class="flex min-w-0 items-center gap-2">
                        <TrendingUp class="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span class="shrink-0 text-muted-foreground">Progress:</span>
                        <span class="shrink-0 font-medium text-foreground">
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
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground',
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
                        class="mb-8 space-y-3 rounded-lg border bg-muted/30 p-4"
                    >
                        <div class="mb-3 flex items-center gap-2 border-b pb-2">
                            <FileText class="h-4 w-4 text-muted-foreground" />
                            <h3 class="font-medium text-primary">
                                Informasi Perencanaan
                            </h3>
                        </div>

                        <div
                            class="grid grid-cols-1 gap-x-12 gap-y-2 text-sm md:grid-cols-2"
                        >
                            <div
                                class="grid grid-cols-[max-content_1fr] content-start gap-x-5 gap-y-2"
                            >
                                <span class="text-muted-foreground">Unit:</span>
                                <span class="font-medium"
                                    >:
                                    {{ formData.unit?.unit_name || '-' }}</span
                                >
                                <span class="text-muted-foreground"
                                    >Tahun Anggaran:</span
                                >
                                <span class="font-medium"
                                    >:
                                    {{
                                        formData.fiscal_year?.year || '-'
                                    }}</span
                                >

                                <span class="text-muted-foreground"
                                    >Periode Akademik:</span
                                >
                                <span class="font-medium"
                                    >:
                                    {{
                                        formData.academic_period
                                            ?.display_name || '-'
                                    }}</span
                                >
                            </div>

                            <div
                                class="grid grid-cols-[max-content_1fr] content-start gap-x-5 gap-y-2"
                            >
                                <span class="text-muted-foreground"
                                    >Tipe Anggaran:</span
                                >
                                <span class="font-medium"
                                    >: {{ budgetTypeLabel }}</span
                                >

                                <span class="text-muted-foreground"
                                    >Kategori Anggaran:</span
                                >
                                <span class="font-medium"
                                    >:
                                    {{
                                        formData.budget_category?.name || '-'
                                    }}</span
                                >

                                <span class="text-muted-foreground"
                                    >Sub Kategori Anggaran:</span
                                >
                                <span class="font-medium"
                                    >:
                                    {{
                                        formData.sub_budget_category?.name ||
                                        '-'
                                    }}</span
                                >

                                <span class="text-muted-foreground">Deskripsi:</span>
                                <span
                                    class="font-medium whitespace-pre-wrap text-foreground"
                                    >: {{ formData.description || '-' }}</span
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Detail Kegiatan -->
                    <div class="mb-8 border-t pt-6">
                        <div class="mb-4 flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-foreground">
                                    Rincian Kegiatan
                                </h3>
                                <p class="text-sm text-muted-foreground">
                                    Rincian kegiatan dan item anggaran yang
                                    diajukan
                                </p>
                            </div>
                            <div class="text-sm text-muted-foreground">
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
                                :class="
                                    activity.level === 1
                                        ? 'ml-6 border-l-4 border-l-blue-300 dark:border-l-blue-700'
                                        : ''
                                "
                            >
                                <!-- Activity Header with Toggle Button -->
                                <div
                                    class="cursor-pointer border-b bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                                    @click="toggleActivityDetails(activity)"
                                >
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary"
                                            >
                                                {{ index + 1 }}
                                            </div>
                                            <div>
                                                <h4
                                                    class="flex items-center gap-2 font-semibold text-foreground"
                                                >
                                                    <Badge
                                                        v-if="
                                                            activity.level === 1
                                                        "
                                                        variant="secondary"
                                                        class="text-xs"
                                                    >
                                                        Sub-kegiatan
                                                    </Badge>
                                                    {{ activity.description }}
                                                </h4>
                                                <div
                                                    class="mt-1 flex items-center gap-4 text-sm text-muted-foreground"
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
                                        <div class="flex items-center gap-4">
                                            <div class="text-right">
                                                <div
                                                    class="text-sm text-muted-foreground"
                                                >
                                                    Total Kegiatan
                                                </div>
                                                <div
                                                    class="text-lg font-bold text-primary"
                                                >
                                                    Rp
                                                    {{
                                                        formatCurrency(
                                                            activity.total_amount,
                                                        )
                                                    }}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                class="p-2"
                                                @click.stop="
                                                    toggleActivityDetails(
                                                        activity,
                                                    )
                                                "
                                            >
                                                <ChevronDown
                                                    v-if="!activity.isExpanded"
                                                    class="h-5 w-5 text-muted-foreground"
                                                />
                                                <ChevronUp
                                                    v-else
                                                    class="h-5 w-5 text-muted-foreground"
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Toggleable Content -->
                                <div v-show="activity.isExpanded" class="p-4">
                                    <h3 class="mb-3 font-medium text-foreground">
                                        Rincian Item Anggaran:
                                    </h3>

                                    <div class="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead class="w-12"
                                                        >No</TableHead
                                                    >
                                                    <TableHead
                                                        >Item
                                                        Anggaran</TableHead
                                                    >
                                                    <TableHead class="w-40"
                                                        >Rincian
                                                        Volume</TableHead
                                                    >
                                                    <TableHead class="w-28"
                                                        >Satuan</TableHead
                                                    >
                                                    <TableHead
                                                        class="w-40 text-right"
                                                        >Biaya
                                                        Diajukan</TableHead
                                                    >
                                                    <TableHead
                                                        class="w-40 text-right"
                                                        >Total
                                                        Diajukan</TableHead
                                                    >
                                                    <TableHead class="w-16"
                                                        ></TableHead
                                                    >
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <template
                                                    v-for="(
                                                        item, itemIndex
                                                    ) in activity.request_items"
                                                    :key="item.id"
                                                >
                                                    <!-- Item Row -->
                                                    <TableRow
                                                        :class="{
                                                            'bg-primary/5':
                                                                (item.showGoods &&
                                                                    hasGoods(
                                                                        item,
                                                                    )) ||
                                                                (item.showEmployees &&
                                                                    hasEmployees(
                                                                        item,
                                                                    )),
                                                        }"
                                                    >
                                                        <TableCell
                                                            class="font-medium"
                                                            >{{
                                                                itemIndex + 1
                                                            }}</TableCell
                                                        >
                                                        <TableCell>
                                                            <div
                                                                class="flex items-center gap-2"
                                                            >
                                                                <span>{{
                                                                    item.description
                                                                }}</span>
                                                                <Badge
                                                                    v-if="
                                                                        hasVendorType(
                                                                            item,
                                                                        ) &&
                                                                        hasGoods(
                                                                            item,
                                                                        )
                                                                    "
                                                                    variant="secondary"
                                                                    class="ml-1 text-xs"
                                                                >
                                                                    <Package
                                                                        class="mr-1 h-3 w-3"
                                                                    />
                                                                    {{
                                                                        item
                                                                            .goods
                                                                            ?.length
                                                                    }}
                                                                    barang
                                                                </Badge>
                                                                <Badge
                                                                    v-if="
                                                                        hasEmployeeType(
                                                                            item,
                                                                        ) &&
                                                                        hasEmployees(
                                                                            item,
                                                                        )
                                                                    "
                                                                    variant="secondary"
                                                                    class="ml-1 text-xs"
                                                                >
                                                                    <Users
                                                                        class="mr-1 h-3 w-3"
                                                                    />
                                                                    {{
                                                                        item
                                                                            .employees
                                                                            ?.length
                                                                    }}
                                                                    dosen
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{{
                                                            formatFormula(item)
                                                        }}</TableCell>
                                                        <TableCell>
                                                            <span
                                                                v-if="
                                                                    hasVendorType(
                                                                        item,
                                                                    ) ||
                                                                    hasEmployeeType(
                                                                        item,
                                                                    )
                                                                "
                                                                class="text-muted-foreground"
                                                                >-</span
                                                            >
                                                            <template
                                                                v-else
                                                            >
                                                                {{
                                                                    item
                                                                        .unit_measure
                                                                        ?.name
                                                                }}
                                                            </template>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            Rp
                                                            {{
                                                                formatCurrency(
                                                                    item.unit_price,
                                                                )
                                                            }}
                                                        </TableCell>
                                                        <TableCell
                                                            align="right"
                                                            class="font-medium"
                                                            >Rp
                                                            {{
                                                                formatCurrency(
                                                                    item.total_price,
                                                                )
                                                            }}</TableCell
                                                        >
                                                        <TableCell>
                                                            <Button
                                                                v-if="
                                                                    hasVendorType(
                                                                        item,
                                                                    ) &&
                                                                    hasGoods(
                                                                        item,
                                                                    )
                                                                "
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                @click="
                                                                    toggleGoodsDetail(
                                                                        item,
                                                                    )
                                                                "
                                                                class="p-1"
                                                                :title="
                                                                    item.showGoods
                                                                        ? 'Sembunyikan detail barang'
                                                                        : 'Lihat detail barang'
                                                                "
                                                            >
                                                                <ChevronDown
                                                                    v-if="
                                                                        !item.showGoods
                                                                    "
                                                                    class="h-4 w-4 text-muted-foreground"
                                                                />
                                                                <ChevronUp
                                                                    v-else
                                                                    class="h-4 w-4 text-muted-foreground"
                                                                />
                                                            </Button>
                                                            <Button
                                                                v-if="
                                                                    hasEmployeeType(
                                                                        item,
                                                                    ) &&
                                                                    hasEmployees(
                                                                        item,
                                                                    )
                                                                "
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                @click="
                                                                    toggleEmployeesDetail(
                                                                        item,
                                                                    )
                                                                "
                                                                class="p-1"
                                                                :title="
                                                                    item.showEmployees
                                                                        ? 'Sembunyikan detail dosen'
                                                                        : 'Lihat detail dosen'
                                                                "
                                                            >
                                                                <ChevronDown
                                                                    v-if="
                                                                        !item.showEmployees
                                                                    "
                                                                    class="h-4 w-4 text-muted-foreground"
                                                                />
                                                                <ChevronUp
                                                                    v-else
                                                                    class="h-4 w-4 text-muted-foreground"
                                                                />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>

                                                    <!-- ========== GOODS DETAIL ROW ========== -->
                                                    <TableRow
                                                        v-if="
                                                            item.showGoods &&
                                                            hasGoods(item)
                                                        "
                                                        class="bg-primary/10"
                                                    >
                                                        <TableCell
                                                            colspan="7"
                                                            class="p-0"
                                                        >
                                                            <div
                                                                class="border-t-2 border-primary/20 p-3"
                                                            >
                                                                <div
                                                                    class="mb-2 flex items-center gap-2"
                                                                >
                                                                    <Package
                                                                        class="h-4 w-4 text-primary"
                                                                    />
                                                                    <span
                                                                        class="text-sm font-semibold text-primary"
                                                                    >
                                                                        Detail
                                                                        Barang
                                                                        (VENDOR)
                                                                    </span>
                                                                </div>

                                                                <div
                                                                    class="overflow-x-auto rounded-md border bg-card"
                                                                >
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow
                                                                                class="bg-muted/30"
                                                                            >
                                                                                <TableHead
                                                                                    class="w-10 text-xs"
                                                                                    >No</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="text-xs"
                                                                                    >Nama
                                                                                    Barang</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="w-16 text-xs"
                                                                                    >Tipe</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="w-16 text-xs text-center"
                                                                                    >Qty</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="w-20 text-xs"
                                                                                    >Satuan</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="w-32 text-xs text-right"
                                                                                    >Harga
                                                                                    Satuan</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="w-32 text-xs text-right"
                                                                                    >Subtotal</TableHead
                                                                                >
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            <TableRow
                                                                                v-for="(
                                                                                    good, gIndex
                                                                                ) in item.goods"
                                                                                :key="
                                                                                    good.id
                                                                                "
                                                                                class="text-sm"
                                                                            >
                                                                                <TableCell
                                                                                    class="text-xs font-medium"
                                                                                >
                                                                                    {{
                                                                                        gIndex +
                                                                                        1
                                                                                    }}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <div>
                                                                                        <div
                                                                                            class="font-medium"
                                                                                        >
                                                                                            {{
                                                                                                good.item_name
                                                                                            }}
                                                                                        </div>
                                                                                        <div
                                                                                            v-if="
                                                                                                good.specification
                                                                                            "
                                                                                            class="text-xs text-muted-foreground"
                                                                                        >
                                                                                            Spec:
                                                                                            {{
                                                                                                good.specification
                                                                                            }}
                                                                                        </div>
                                                                                        <div
                                                                                            v-if="
                                                                                                good.brand
                                                                                            "
                                                                                            class="text-xs text-muted-foreground"
                                                                                        >
                                                                                            Brand:
                                                                                            {{
                                                                                                good.brand
                                                                                            }}
                                                                                        </div>
                                                                                        <div
                                                                                            v-if="
                                                                                                good.notes
                                                                                            "
                                                                                            class="text-xs italic text-muted-foreground"
                                                                                        >
                                                                                            {{
                                                                                                good.notes
                                                                                            }}
                                                                                        </div>
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <Badge
                                                                                        :class="
                                                                                            getGoodsTypeBadgeClass(
                                                                                                good.goods_type,
                                                                                            )
                                                                                        "
                                                                                        class="text-xs"
                                                                                    >
                                                                                        {{
                                                                                            good.goods_type ===
                                                                                            'bhp'
                                                                                                ? 'BHP'
                                                                                                : 'Non BHP'
                                                                                        }}
                                                                                    </Badge>
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    class="text-center"
                                                                                >
                                                                                    {{
                                                                                        good.quantity
                                                                                    }}
                                                                                </TableCell>
                                                                                <TableCell>{{
                                                                                    good.unit_measure ||
                                                                                    '-'
                                                                                }}</TableCell>
                                                                                <TableCell
                                                                                    class="text-right"
                                                                                >
                                                                                    Rp
                                                                                    {{
                                                                                        formatCurrency(
                                                                                            good.unit_price,
                                                                                        )
                                                                                    }}
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    class="text-right font-medium"
                                                                                >
                                                                                    Rp
                                                                                    {{
                                                                                        formatCurrency(
                                                                                            good.subtotal,
                                                                                        )
                                                                                    }}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>

                                                                <!-- Goods Summary -->
                                                                <div
                                                                    class="mt-2 flex justify-end"
                                                                >
                                                                    <div
                                                                        class="rounded border bg-muted/30 px-3 py-1.5 text-xs"
                                                                    >
                                                                        <span
                                                                            class="text-muted-foreground"
                                                                            >Total
                                                                            Barang:</span
                                                                        >
                                                                        <span
                                                                            class="ml-2 font-bold text-primary"
                                                                        >
                                                                            Rp
                                                                            {{
                                                                                formatCurrency(
                                                                                    getGoodsTotalAmount(
                                                                                        item.goods!,
                                                                                    ),
                                                                                )
                                                                            }}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                    <!-- ========== END GOODS DETAIL ROW ========== -->

                                                    <!-- ========== EMPLOYEE DETAIL ROW ========== -->
                                                    <TableRow
                                                        v-if="
                                                            item.showEmployees &&
                                                            hasEmployees(item)
                                                        "
                                                        class="bg-primary/10"
                                                    >
                                                        <TableCell
                                                            colspan="7"
                                                            class="p-0"
                                                        >
                                                            <div
                                                                class="border-t-2 border-primary/20 p-3"
                                                            >
                                                                <div
                                                                    class="mb-2 flex items-center gap-2"
                                                                >
                                                                    <Users
                                                                        class="h-4 w-4 text-primary"
                                                                    />
                                                                    <span
                                                                        class="text-sm font-semibold text-primary"
                                                                    >
                                                                        Detail
                                                                        Dosen
                                                                        (EMPLOYEE)
                                                                    </span>
                                                                </div>

                                                                <div
                                                                    class="overflow-x-auto rounded-md border bg-card"
                                                                >
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow
                                                                                class="bg-muted/30"
                                                                            >
                                                                                <TableHead
                                                                                    class="w-10 text-xs"
                                                                                    >No</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="w-28 text-xs"
                                                                                    >NIK</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="text-xs"
                                                                                    >Nama
                                                                                    Dosen</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="text-xs"
                                                                                    >Jabatan
                                                                                    Fungsional</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="w-24 text-xs text-right"
                                                                                    >Jam
                                                                                    Mengajar</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="w-16 text-xs text-center"
                                                                                    >Kelas</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="w-28 text-xs text-right"
                                                                                    >Tarif</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="w-28 text-xs text-right"
                                                                                    >Total</TableHead
                                                                                >
                                                                                <TableHead
                                                                                    class="text-xs"
                                                                                    >Keterangan</TableHead
                                                                                >
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            <TableRow
                                                                                v-for="(
                                                                                    emp, eIndex
                                                                                ) in item.employees"
                                                                                :key="
                                                                                    emp.id
                                                                                "
                                                                                class="text-sm"
                                                                            >
                                                                                <TableCell
                                                                                    class="text-xs font-medium"
                                                                                >
                                                                                    {{
                                                                                        eIndex +
                                                                                        1
                                                                                    }}
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    class="text-xs"
                                                                                    >{{
                                                                                        emp.nik
                                                                                    }}</TableCell
                                                                                >
                                                                                <TableCell
                                                                                    class="text-xs font-medium"
                                                                                    >{{
                                                                                        emp.employee_name
                                                                                    }}</TableCell
                                                                                >
                                                                                <TableCell
                                                                                    class="text-xs"
                                                                                    >{{
                                                                                        emp.functional_position ||
                                                                                        '-'
                                                                                    }}</TableCell
                                                                                >
                                                                                <TableCell
                                                                                    class="text-xs text-right"
                                                                                    >{{
                                                                                        emp.teaching_hours
                                                                                    }}</TableCell
                                                                                >
                                                                                <TableCell
                                                                                    class="text-xs text-center"
                                                                                    >{{
                                                                                        emp.class_count
                                                                                    }}</TableCell
                                                                                >
                                                                                <TableCell
                                                                                    class="text-xs text-right"
                                                                                    >Rp
                                                                                    {{
                                                                                        formatCurrency(
                                                                                            emp.rate,
                                                                                        )
                                                                                    }}</TableCell
                                                                                >
                                                                                <TableCell
                                                                                    class="text-xs text-right font-medium"
                                                                                    >Rp
                                                                                    {{
                                                                                        formatCurrency(
                                                                                            emp.total,
                                                                                        )
                                                                                    }}</TableCell
                                                                                >
                                                                                <TableCell
                                                                                    class="text-xs"
                                                                                    >{{
                                                                                        emp.notes || '-'
                                                                                    }}</TableCell
                                                                                >
                                                                            </TableRow>
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>

                                                                <!-- Employee Summary -->
                                                                <div
                                                                    class="mt-2 flex justify-end"
                                                                >
                                                                    <div
                                                                        class="rounded border bg-muted/30 px-3 py-1.5 text-xs"
                                                                    >
                                                                        <span
                                                                            class="text-muted-foreground"
                                                                            >Total
                                                                            Dosen:</span
                                                                        >
                                                                        <span
                                                                            class="ml-2 font-bold text-primary"
                                                                        >
                                                                            Rp
                                                                            {{
                                                                                formatCurrency(
                                                                                    getEmployeeTotalAmount(
                                                                                        item.employees!,
                                                                                    ),
                                                                                )
                                                                            }}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                    <!-- ========== END EMPLOYEE DETAIL ROW ========== -->
                                                </template>
                                                <TableRow class="bg-muted/30">
                                                    <TableCell
                                                        colspan="5"
                                                        class="text-right font-semibold"
                                                        >Subtotal
                                                        Kegiatan:</TableCell
                                                    >
                                                    <TableCell
                                                        colspan="1"
                                                        class="text-right font-bold text-primary"
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
                                                class="h-4 w-4 text-muted-foreground"
                                            />
                                            <h3
                                                class="font-medium text-foreground"
                                            >
                                                Indikator Output Kegiatan
                                            </h3>
                                            <span class="text-xs text-muted-foreground">
                                                (Target output yang akan
                                                dicapai)
                                            </span>
                                        </div>

                                        <div class="grid grid-cols-1 gap-4">
                                            <div class="space-y-2">
                                                <Textarea
                                                    :model-value="
                                                        activity.output_indicator
                                                    "
                                                    placeholder="Isikan indikator output/keberhasilan"
                                                    readonly
                                                    class="min-h-[80px] resize-none bg-muted/30"
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
                                                class="h-4 w-4 text-muted-foreground"
                                            />
                                            <h4
                                                class="font-medium text-foreground"
                                            >
                                                Lampiran Dokumen Kegiatan
                                            </h4>
                                            <span class="text-xs text-muted-foreground">
                                                (Dokumen pendukung seperti
                                                proposal, RAB, dll)
                                            </span>
                                        </div>

                                        <div class="grid grid-cols-1 gap-4">
                                            <div class="space-y-2">
                                                <FileUpload
                                                    v-model="activity.files"
                                                    :view-only="true"
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
                            <h3 class="text-lg font-semibold text-foreground">
                                Verifikasi Pengajuan Anggaran - Tahap
                                {{ currentVerifierStep }}
                            </h3>

                            <div class="space-y-2">
                                <Label for="status" class="text-sm font-medium">
                                    Status Verifikasi
                                    <span class="text-destructive">*</span>
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
                                        <span class="text-destructive">*</span>
                                    </Label>
                                    <span class="text-xs text-muted-foreground"
                                        >{{
                                            verificationData.notes.length
                                        }}/500</span
                                    >
                                </div>
                                <Textarea
                                    v-model="verificationData.notes"
                                    :placeholder="`Isikan catatan verifikasi untuk Tahap ${currentVerifierStep}...`"
                                    class="min-h-[120px] resize-none text-sm"
                                    :maxlength="500"
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
                        <div class="rounded-lg bg-muted/30 p-6 text-center">
                            <CheckCircle
                                class="mx-auto mb-3 h-12 w-12 text-green-500"
                            />
                            <h3
                                class="mb-2 text-lg font-semibold text-foreground"
                            >
                                Verifikasi Telah Selesai
                            </h3>
                            <p class="mb-4 text-sm text-muted-foreground">
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

.cursor-pointer {
    cursor: pointer;
}
</style>