<script setup lang="ts">
import FileUpload from '@/components/file-upload/FileUpload.vue';
import { UploadedFile } from '@/components/file-upload/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import AcademicPeriodSelect from '@/pages/masterdata/components/AcademicPeriodSelect.vue';
import ActivityItemSelect from '@/pages/masterdata/components/ActivityItemSelect.vue';
import ActivitySelect from '@/pages/masterdata/components/ActivitySelect.vue';
import BudgetCategorySelect from '@/pages/masterdata/components/BudgetCategorySelect.vue';
import FiscalYearSelect from '@/pages/masterdata/components/FiscalYearSelect.vue';
import UnitSelect from '@/pages/masterdata/components/UnitSelect.vue';
import { BreadcrumbItem } from '@/types';
import { ActivityItem } from '@/types/datamaster';
import { router } from '@inertiajs/vue3';
import axios, { AxiosError } from 'axios';
import { debounce } from 'lodash';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Info,
    ListChecks,
    Package,
    Pencil,
    Plus,
    RotateCcw,
    Save,
    Send,
    Target,
    Trash2,
    Upload,
    X,
} from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import GoodsPanel from '../components/GoodsPanel.vue';

interface BudgetRequestDetail {
    id: number;
    description: string;
    activity_item_id: number | null;
    quantity: number;
    unit_measure_id?: number | null;
    unit_price: number;
    total_price: number;
    unit_measure_name?: string;
    trans_type_group?: string;
    goods?: BudgetRequestItemGood[];
}

interface BudgetRequestItemGood {
    id?: number;
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

interface BudgetActivity {
    id: number;
    activity_id: number;
    description: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    showItems: boolean;
    request_items: BudgetRequestDetail[];
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
    budget_type: string;
    budget_category_id: number;
    sub_budget_category_id: number;
    description: string;
    status: string;
    status_display: string;
    total_amount: number;
}

// Props
const props = defineProps<{
    id?: number | string;
}>();

// State data
const mode = ref<'create' | 'edit' | 'view'>('create');
const isPosting = ref(false);
const isLoading = ref(false);
const isBackgroundProcessing = ref(false);

// Goods Panel State (hanya state panel, bukan state goods)
const showGoodsPanel = ref(false);
const currentActivityIndex = ref<number>(-1);
const currentItemIndex = ref<number>(-1);

// Computed property for form read-only
const isReadOnly = computed(() => {
    if (mode.value === 'create') {
        return false;
    }

    if (mode.value === 'edit' || mode.value === 'view') {
        const status = formData.value.status?.toUpperCase();
        return !['DRAFT', 'RETURNED'].includes(status);
    }

    return true;
});

// Form data
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

// ID counters
let activityIdCounter = 1;
let detailIdCounter = 1;

// Debounced functions
const debouncedCalculateItemTotal = debounce(
    (activityId: number, itemId: number) => {
        calculateActivityItemTotal(activityId, itemId);
    },
    300,
);

// Breadcrumbs
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Perencanaan Anggaran',
        href: '/perencanaan-anggaran',
    },
    {
        title:
            mode.value === 'create'
                ? 'Perencanaan Anggaran Baru'
                : 'Detail Perencanaan Anggaran',
        href: '',
    },
]);

// Enum definitions
const BudgetTypeEnum = {
    BUDGETER: 'budgeter',
    NON_BUDGETER: 'non_budgeter',
} as const;

// Budget type options
const budgetTypeOptions = [
    { value: BudgetTypeEnum.BUDGETER, label: 'Budgeter' },
    { value: BudgetTypeEnum.NON_BUDGETER, label: 'Non Budgeter' },
];

// Format current date
const currentDate = computed(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
});

// Format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
};

// Format file size
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDateForActivityInput = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return {
        today: today.toISOString().split('T')[0],
        nextWeek: nextWeek.toISOString().split('T')[0],
    };
};

// Status description
const statusDescription = computed(() => {
    const status = (formData.value.status ?? 'DRAFT').toUpperCase();
    switch (status) {
        case 'DRAFT':
            return 'Masih dalam penyusunan';
        case 'SUBMITTED':
            return 'Menunggu persetujuan';
        case 'APPROVED':
            return 'Telah disetujui';
        case 'RETURNED':
            return 'Dikembalikan, perlu revisi';
        case 'REJECTED':
            return 'Ditolak';
        default:
            return '';
    }
});

// Total budget computed
const totalBudget = computed(() => {
    const total = budgetActivities.value.reduce((sum, activity) => {
        const amount = parseFloat(String(activity.total_amount)) || 0;
        return sum + amount;
    }, 0);

    return total.toFixed(2);
});

// Check if item has VENDOR trans_type_group
const hasVendorType = (item: BudgetRequestDetail): boolean => {
    return item.trans_type_group?.toUpperCase() === 'VENDOR';
};

// ==================== GOODS PANEL FUNCTIONS (SIMPLIFIED) ====================

// Toggle goods panel for a specific item
const toggleGoodsPanel = (activityIndex: number, itemIndex: number) => {
    if (
        showGoodsPanel.value &&
        currentActivityIndex.value === activityIndex &&
        currentItemIndex.value === itemIndex
    ) {
        closeGoodsPanel();
        return;
    }

    currentActivityIndex.value = activityIndex;
    currentItemIndex.value = itemIndex;
    showGoodsPanel.value = true;
};

// Close goods panel
const closeGoodsPanel = () => {
    showGoodsPanel.value = false;
    currentActivityIndex.value = -1;
    currentItemIndex.value = -1;
};

// Update item goods from GoodsPanel
const updateItemGoods = (
    activityIndex: number,
    itemIndex: number,
    goods: BudgetRequestItemGood[],
) => {
    const activity = budgetActivities.value[activityIndex];
    const item = activity.request_items[itemIndex];

    item.goods = goods;

    const goodsTotal = goods.reduce(
        (sum, good) => sum + (good.subtotal || 0),
        0,
    );
    item.total_price = goodsTotal;

    calculateActivityTotal(activity.id);
};

// ==================== END GOODS PANEL FUNCTIONS ====================

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
                    activity_item_id: detail.activity_item_id,
                    description: detail.description || '',
                    quantity: detail.volume || 0,
                    unit_measure_id: detail.unit_measure_id || 0,
                    unit_measure_name: detail.unit_measure?.name || '',
                    unit_price: detail.unit_price || 0,
                    total_price: detail.total_amount || 0,
                    trans_type_group:
                        detail.activity_item?.trans_type?.group_code || '',
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

// Proses background untuk update counters
const updateCountersInBackground = () => {
    isBackgroundProcessing.value = true;

    setTimeout(() => {
        try {
            if (budgetActivities.value.length > 0) {
                activityIdCounter =
                    Math.max(...budgetActivities.value.map((a) => a.id)) + 1;
            }

            const allDetails = budgetActivities.value.flatMap(
                (a) => a.request_items,
            );
            if (allDetails.length > 0) {
                detailIdCounter =
                    Math.max(...allDetails.map((d) => d.id ?? 0)) + 1;
            }
        } catch (error) {
            console.error('Error updating counters:', error);
        } finally {
            isBackgroundProcessing.value = false;
        }
    }, 0);
};

// Load budget request
const loadBudgetRequest = async (id: number | string) => {
    isLoading.value = true;

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
        };

        budgetActivities.value = transformActivities(
            data.request_activities || [],
        );

        const status = data.status?.toUpperCase();
        mode.value = status === 'DRAFT' ? 'edit' : 'view';

        updateCountersInBackground();
    } catch (error) {
        console.error('Failed to load budget request:', error);
        toast.error('Gagal memuat data perencanaan anggaran');
        router.visit('/perencanaan-anggaran');
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    try {
        if (props.id) {
            await loadBudgetRequest(props.id);
        } else {
            mode.value = 'create';
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

const updateActivityData = (
    index: number,
    selected: { id: number; name: string; code: string } | null,
) => {
    if (selected) {
        budgetActivities.value[index].description = selected.name;
    } else {
        budgetActivities.value[index].description = '';
    }
};

const updateActivityItem = (
    activityIndex: number,
    itemIndex: number,
    selectedItem: ActivityItem | null,
) => {
    const activity = budgetActivities.value[activityIndex];
    const item = activity.request_items[itemIndex];

    if (selectedItem) {
        item.activity_item_id = selectedItem.id;
        item.description = selectedItem.item_name;
        item.unit_measure_id = selectedItem.unit_measure_id;
        item.unit_price = selectedItem.estimation_price;
        item.unit_measure_name = selectedItem.unit_measure?.name;
        item.trans_type_group = selectedItem.trans_type?.group_code || '';

        if (selectedItem.trans_type?.group_code.toUpperCase() !== 'VENDOR') {
            item.goods = [];
        }
    } else {
        item.activity_item_id = null;
        item.description = '';
        item.unit_measure_id = null;
        item.unit_measure_name = '';
        item.unit_price = 0;
        item.trans_type_group = '';
        item.goods = [];
    }

    if (
        showGoodsPanel.value &&
        currentActivityIndex.value === activityIndex &&
        currentItemIndex.value === itemIndex
    ) {
        closeGoodsPanel();
    }

    debouncedCalculateItemTotal(activity.id, item.id);
};

// Add new activity
const addNewActivity = () => {
    const dates = formatDateForActivityInput();
    budgetActivities.value.unshift({
        id: -activityIdCounter++,
        activity_id: 0,
        description: '',
        start_date: dates.today,
        end_date: dates.nextWeek,
        total_amount: 0,
        showItems: true,
        request_items: [],
        files: [],
        output_indicator: '',
    });
};

// Remove activity
const removeActivity = (index: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
        budgetActivities.value.splice(index, 1);
    }
};

// Toggle activity detail
const toggleActivityDetail = (index: number) => {
    budgetActivities.value[index].showItems =
        !budgetActivities.value[index].showItems;
};

// Add new activity item
const addNewActivityItem = (activityIndex: number) => {
    budgetActivities.value[activityIndex].request_items.push({
        id: -detailIdCounter++,
        activity_item_id: null,
        description: '',
        quantity: 1,
        unit_measure_id: 0,
        unit_price: 0,
        total_price: 0,
        trans_type_group: '',
        goods: [],
    });
    calculateActivityTotal(budgetActivities.value[activityIndex].id);
};

// Remove activity item
const removeActivityItem = (activityIndex: number, itemIndex: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
        if (
            showGoodsPanel.value &&
            currentActivityIndex.value === activityIndex &&
            currentItemIndex.value === itemIndex
        ) {
            closeGoodsPanel();
        }

        budgetActivities.value[activityIndex].request_items.splice(
            itemIndex,
            1,
        );
        calculateActivityTotal(budgetActivities.value[activityIndex].id);
    }
};

// Handle input price
const handleUnitPrice = (event: Event, activityId: number, item: any) => {
    const target = event.target as HTMLInputElement;
    const rawValue = target.value.replace(/\D/g, '');
    item.unit_price = rawValue.slice(0, 15);
    debouncedCalculateItemTotal(activityId, item.id);
};

const formatPrice = (value: string | number): string => {
    if (!value && value !== 0) return '';

    let numStr = String(value);

    if (numStr.includes('.')) {
        const parts = numStr.split('.');
        const integerPart = parts[0].replace(/\D/g, '');

        if (!integerPart) return '';

        return Number(integerPart).toLocaleString('id-ID');
    }

    const cleanNum = numStr.replace(/\D/g, '');
    if (!cleanNum) return '';

    return Number(cleanNum).toLocaleString('id-ID');
};

// Calculate activity item total
const calculateActivityItemTotal = (activityId: number, itemId: number) => {
    const activity = budgetActivities.value.find((a) => a.id === activityId);
    if (activity) {
        const item = activity.request_items.find((i) => i.id === itemId);
        if (item) {
            if (item.goods && item.goods.length > 0) {
                item.total_price = item.goods.reduce(
                    (sum, good) => sum + (good.subtotal || 0),
                    0,
                );
            } else {
                const quantity = parseFloat(item.quantity.toString()) || 0;
                const unitPrice = parseFloat(item.unit_price.toString()) || 0;
                item.total_price = quantity * unitPrice;
            }
            calculateActivityTotal(activityId);
        }
    }
};

// Calculate activity total
const calculateActivityTotal = (activityId: number) => {
    const activity = budgetActivities.value.find((a) => a.id === activityId);
    if (activity) {
        activity.total_amount = activity.request_items.reduce((sum, item) => {
            const price = Number(item.total_price) || 0;
            return sum + price;
        }, 0);
        return activity.total_amount;
    }
    return 0;
};

// File upload handlers
const handleFileAdded = (activityId: number, file: UploadedFile) => {
    console.log(`File added to activity ${activityId}:`, file.name);
};

const handleFileRemoved = (activityId: number, index: number) => {
    console.log(`File removed from activity ${activityId} at index ${index}`);
};

const handleFileError = (error: string) => {
    console.error('File upload error:', error);
};

const formatTotalFileSize = (files: UploadedFile[]) => {
    const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
    return formatFileSize(totalBytes);
};

const buildFormData = () => {
    const fd = new FormData();

    fd.append('request_date', String(formData.value.request_date));
    fd.append('fiscal_year_id', String(formData.value.fiscal_year_id));
    fd.append('academic_period_id', String(formData.value.academic_period_id));
    fd.append('unit_id', String(formData.value.unit_id));
    fd.append('budget_type', String(formData.value.budget_type));
    fd.append('budget_category_id', String(formData.value.budget_category_id));
    fd.append(
        'sub_budget_category_id',
        String(formData.value.sub_budget_category_id),
    );
    fd.append('notes', formData.value.description ?? '');
    fd.append('total_amount', String(totalBudget.value));

    const structuredActivities = budgetActivities.value.map(
        (activity, aIndex) => {
            const items =
                activity.request_items?.map((item) => {
                    const validGoods =
                        item.goods
                            ?.filter(
                                (g) =>
                                    g &&
                                    g.item_name &&
                                    g.item_name.trim() !== '',
                            )
                            .map((g) => ({
                                id: g.id && g.id > 0 ? g.id : null,
                                item_name: g.item_name,
                                goods_type: g.goods_type || 'bhp',
                                specification: g.specification || '',
                                brand: g.brand || '',
                                quantity: g.quantity || 1,
                                unit_measure: g.unit_measure || '',
                                unit_price: g.unit_price || 0,
                                subtotal:
                                    g.subtotal || g.quantity * g.unit_price,
                                notes: g.notes || '',
                            })) || [];

                    return {
                        id: item.id && item.id > 0 ? item.id : null,
                        activity_item_id: item.activity_item_id,
                        description: item.description,
                        volume: item.quantity,
                        unit_measure_id: item.unit_measure_id,
                        unit_price: item.unit_price,
                        total_amount: item.total_price,
                        goods: validGoods,
                    };
                }) || [];

            const documents =
                activity.files?.map((file, fIndex) => {
                    if (!file.isExisting) {
                        fd.append(
                            `activity_files[${aIndex}][${fIndex}]`,
                            file.file,
                            file.name,
                        );
                    }

                    return {
                        id: file.isExisting ? file.id : null,
                        document_name: file.name,
                        file_name: file.name,
                        isExisting: file.isExisting,
                        file_path: file.isExisting ? (file.url ?? '') : '',
                        file_size: file.size ?? 0,
                        file_type: file.type ?? '',
                    };
                }) || [];

            return {
                id: activity.id && activity.id > 0 ? activity.id : null,
                activity_id: activity.activity_id,
                description: activity.description ?? '',
                start_date: activity.start_date ?? '',
                end_date: activity.end_date ?? '',
                total_amount: activity.total_amount,
                output_indicator: activity.output_indicator ?? '',
                documents: documents,
                request_items: items,
            };
        },
    );

    fd.append(
        'budget_request_activities_json',
        JSON.stringify(structuredActivities),
    );

    return fd;
};

// Save as draft
const saveAsDraft = async () => {
    if (!validateForm()) return;

    if (showGoodsPanel.value) {
        closeGoodsPanel();
    }

    isPosting.value = true;

    try {
        const formDataToSend = buildFormData();
        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
        };

        if (mode.value === 'create') {
            const res = await axios.post(
                '/api/v1/budget-requests',
                formDataToSend,
                config,
            );
            toast.info('Draft berhasil disimpan', {
                description: `Perencanaan anggaran ${res.data?.data?.request_no}`,
            });

            const id = res.data?.data?.id;
            if (id) {
                formData.value.id = id;
                mode.value = 'edit';
            }

            router.visit('/perencanaan-anggaran');
        } else {
            await axios.post(
                `/api/v1/budget-requests/${formData.value.id}?_method=PUT`,
                formDataToSend,
                config,
            );

            toast.info('Draft berhasil diperbarui', {
                description: `Perencanaan anggaran dengan kode ${formData.value.request_no}`,
            });
            await loadBudgetRequest(formData.value.id!);
        }
    } catch (error: any) {
        console.error(error);
        handleApiError(error, 'Gagal menyimpan draft. Silakan coba lagi.');
    } finally {
        isPosting.value = false;
    }
};

// Submit form
const submitForm = async () => {
    if (!validateForm()) return;

    if (showGoodsPanel.value) {
        closeGoodsPanel();
    }

    isPosting.value = true;

    try {
        let id = formData.value.id;
        if (mode.value === 'create') {
            const res = await axios.post(
                '/api/v1/budget-requests',
                buildFormData(),
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                },
            );

            id = res.data?.data?.id;
            formData.value.id = id;
            mode.value = 'edit';
        } else {
            await axios.post(
                `/api/v1/budget-requests/${id}?_method=PUT`,
                buildFormData(),
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                },
            );
        }

        const status = formData.value.status?.toUpperCase();
        const endpoint =
            status === 'RETURNED'
                ? `/api/v1/budget-requests/${id}/resubmit`
                : `/api/v1/budget-requests/${id}/submit`;

        await axios.post(endpoint);

        toast.success(
            status === 'RETURNED'
                ? 'Berhasil diajukan ulang'
                : 'Berhasil diajukan untuk approval',
            {
                description: `Perencanaan anggaran dengan kode ${formData.value.request_no}`,
            },
        );

        router.visit('/perencanaan-anggaran');
    } catch (error: any) {
        console.error(error);
        toast.error(
            error.response?.data?.message ??
                'Gagal submit perencanaan anggaran',
        );
    } finally {
        isPosting.value = false;
    }
};

const handleApiError = (error: unknown, defaultMessage: string) => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{
            message: string;
            errors?: Record<string, string[]>;
        }>;
        const statusCode = axiosError.response?.status;
        const errorMessage =
            axiosError.response?.data?.message || axiosError.message;

        switch (statusCode) {
            case 422:
                toast.error(errorMessage || 'Data tidak valid.');
                break;
            case 404:
                toast.error(errorMessage || 'Data tidak ditemukan.');
                break;
            case 409:
                toast.error(errorMessage || 'Terjadi konflik data.');
                break;
            case 500:
                toast.error('Terjadi kesalahan pada server.');
                break;
            default:
                toast.error(defaultMessage);
        }
    } else {
        toast.error(defaultMessage);
    }
};

// Reset form
const resetForm = () => {
    if (
        confirm(
            'Apakah Anda yakin ingin mereset form? Semua data yang belum disimpan akan hilang.',
        )
    ) {
        formData.value = {
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
        };
        budgetActivities.value = [];
        activityIdCounter = 1;
        detailIdCounter = 1;
        closeGoodsPanel();
    }
};

// Form validation
const validateForm = () => {
    const requiredFields = [
        'unit_id',
        'fiscal_year_id',
        'academic_period_id',
        'budget_type',
        'budget_category_id',
        'description',
    ];

    for (const field of requiredFields) {
        if (
            !formData.value[field as keyof BudgetRequestHeader] ||
            formData.value[field as keyof BudgetRequestHeader] === 0
        ) {
            const fieldLabels: Record<string, string> = {
                unit_id: 'Unit',
                fiscal_year_id: 'Tahun Anggaran',
                academic_period_id: 'Periode Akademik',
                budget_type: 'Tipe Anggaran',
                budget_category_id: 'Kategori Anggaran',
                description: 'Deskripsi',
            };

            toast.info(`${fieldLabels[field]} harus diisi!`);
            return false;
        }
    }

    if (budgetActivities.value.length === 0) {
        toast.info('Minimal harus ada satu kegiatan!');
        return false;
    }

    for (const activity of budgetActivities.value) {
        if (!activity.activity_id) {
            toast.info('Kode kegiatan harus dipilih!');
            return false;
        }

        if (!activity.start_date) {
            toast.info(
                `Kegiatan "${activity.description || 'Belum diberi nama'}" harus memiliki tanggal mulai!`,
            );
            return false;
        }

        if (!activity.end_date) {
            toast.info(
                `Kegiatan "${activity.description || 'Belum diberi nama'}" harus memiliki tanggal selesai!`,
            );
            return false;
        }

        if (!activity.output_indicator || !activity.output_indicator.trim()) {
            toast.info(
                `Kegiatan "${activity.description || 'Belum diberi nama'}" harus memiliki indikator output!`,
            );
            return false;
        }

        if (activity.request_items.length === 0) {
            toast.info(
                `Kegiatan "${activity.description || 'Belum diberi nama'}" harus memiliki minimal satu item!`,
            );
            return false;
        }

        for (const item of activity.request_items) {
            if (
                hasVendorType(item) &&
                (!item.goods || item.goods.length === 0)
            ) {
                toast.info(
                    `Item "${item.description || 'Belum diberi nama'}" bertipe VENDOR harus memiliki minimal satu barang!`,
                );
                return false;
            }

            if ((item.quantity || 0) <= 0 && !hasVendorType(item)) {
                toast.info('Volume item harus lebih dari 0!');
                return false;
            }
            if (!item.unit_measure_id) {
                toast.info('Satuan item harus dipilih!');
                return false;
            }
            if ((item.unit_price || 0) < 0 && !hasVendorType(item)) {
                toast.info('Harga satuan tidak boleh negatif!');
                return false;
            }
        }
    }

    return true;
};

// Go back
const goBack = () => {
    if (
        mode.value === 'create' &&
        (formData.value.fiscal_year_id ||
            formData.value.description ||
            budgetActivities.value.length > 0)
    ) {
        if (
            confirm(
                'Apakah Anda yakin ingin keluar? Semua data yang belum disimpan akan hilang.',
            )
        ) {
            router.visit('/perencanaan-anggaran');
        }
    } else {
        router.visit('/perencanaan-anggaran');
    }
};
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="rounded-lg border bg-background p-6 shadow-sm">
            <!-- Loading Indicator -->
            <div
                v-if="isLoading"
                class="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white shadow-lg"
            >
                <div
                    class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                ></div>
                <span class="text-sm font-medium">Mengambil data...</span>
            </div>

            <!-- Alert untuk mode read-only -->
            <div
                v-if="!isLoading && isReadOnly"
                class="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
            >
                <div class="flex items-center gap-2">
                    <AlertCircle
                        class="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                    />
                    <p
                        class="text-sm font-medium text-yellow-700 dark:text-yellow-200"
                    >
                        Form dalam mode baca saja dan tidak dapat diedit.
                    </p>
                </div>
            </div>

            <!-- Header Form -->
            <div class="mb-6 border-b pb-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-foreground">
                            {{
                                mode === 'create'
                                    ? 'Perencanaan Anggaran Baru'
                                    : 'Detail Perencanaan Anggaran'
                            }}
                        </h1>
                        <p class="mt-1 text-sm text-muted-foreground">
                            Formulir perencanaan anggaran
                        </p>
                    </div>
                </div>

                <div class="mt-4 flex flex-wrap gap-4 text-sm">
                    <div
                        v-if="mode !== 'create' && formData.request_no"
                        class="flex items-center gap-2"
                    >
                        <CalendarDays class="h-4 w-4 text-muted-foreground" />
                        <span class="font-bold text-foreground"
                            >No Perencanaan:</span
                        >
                        <span class="font-medium text-foreground">{{
                            formData.request_no
                        }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <Calendar class="h-4 w-4 text-muted-foreground" />
                        <span class="font-bold text-foreground">Tanggal:</span>
                        <span class="font-medium text-foreground"
                            >[ {{ currentDate }} ]</span
                        >
                    </div>
                    <div
                        v-if="mode !== 'create' && formData.request_no"
                        class="ml-auto flex items-center gap-2"
                    >
                        <Info
                            class="h-4 w-4 text-blue-500 dark:text-blue-400"
                        />
                        <span class="font-bold text-foreground">Status:</span>
                        <span class="text-sm font-bold text-foreground">{{
                            statusDescription
                        }}</span>
                    </div>
                </div>
            </div>

            <!-- Form Fields -->
            <form @submit.prevent="submitForm" class="space-y-6">
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div class="space-y-6">
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground"
                                >Unit <span class="text-red-500">*</span></Label
                            >
                            <UnitSelect
                                v-model="formData.unit_id"
                                :disabled="isReadOnly || isLoading"
                                :searchable="true"
                            />
                        </div>
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground"
                                >Tahun Anggaran
                                <span class="text-red-500">*</span></Label
                            >
                            <FiscalYearSelect
                                v-model="formData.fiscal_year_id"
                                :disabled="isReadOnly || isLoading"
                            />
                        </div>
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground"
                                >Periode Akademik
                                <span class="text-red-500">*</span></Label
                            >
                            <AcademicPeriodSelect
                                v-model="formData.academic_period_id"
                                :disabled="isReadOnly || isLoading"
                            />
                        </div>
                    </div>
                    <div class="space-y-6">
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground"
                                >Tipe Anggaran
                                <span class="text-red-500">*</span></Label
                            >
                            <Select
                                v-model="formData.budget_type"
                                :disabled="isReadOnly || isLoading"
                            >
                                <SelectTrigger
                                    id="create-budget-type"
                                    class="w-full"
                                >
                                    <SelectValue
                                        placeholder="Pilih Tipe Anggaran"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="option in budgetTypeOptions"
                                        :key="option.value"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground"
                                >Kategori Anggaran
                                <span class="text-red-500">*</span></Label
                            >
                            <BudgetCategorySelect
                                v-if="formData.budget_type && formData.unit_id"
                                v-model="formData.budget_category_id"
                                level="root"
                                :budget-type="formData.budget_type"
                                :with-budget-type="true"
                                :unit-id="formData.unit_id"
                                :searchable="true"
                                :disabled="isReadOnly || isLoading"
                            />
                        </div>
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground"
                                >Sub Kategori Anggaran</Label
                            >
                            <BudgetCategorySelect
                                v-if="
                                    formData.budget_type &&
                                    formData.unit_id &&
                                    formData.budget_category_id
                                "
                                v-model="formData.sub_budget_category_id"
                                level="child"
                                :parent-id="formData.budget_category_id"
                                :withParent="true"
                                :unit-id="formData.unit_id"
                                :searchable="true"
                                :disabled="isReadOnly || isLoading"
                            />
                        </div>
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <Label
                                    class="text-sm font-medium text-foreground"
                                    >Deskripsi
                                    <span class="text-red-500">*</span></Label
                                >
                                <span class="text-xs text-muted-foreground"
                                    >{{
                                        formData.description?.length ?? 0
                                    }}/500</span
                                >
                            </div>
                            <Textarea
                                v-model="formData.description"
                                placeholder="Isikan deskripsi perencanaan..."
                                class="min-h-[80px] resize-none"
                                :maxlength="500"
                                :disabled="isReadOnly || isLoading"
                            />
                        </div>
                    </div>
                </div>

                <!-- Detail Activity Table Section -->
                <div class="border-t pt-6">
                    <div class="mb-4 flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-semibold text-foreground">
                                Rincian Kegiatan
                            </h3>
                            <p class="text-sm text-muted-foreground">
                                Rincian kegiatan yang akan dianggarkan
                            </p>
                        </div>
                        <Button
                            v-if="!isReadOnly && !isLoading && formData.unit_id"
                            type="button"
                            variant="outline"
                            size="sm"
                            @click="addNewActivity"
                            class="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                            <Plus class="h-4 w-4" />
                            Tambah Kegiatan
                        </Button>
                    </div>

                    <div
                        v-if="isLoading"
                        class="flex items-center justify-center py-12"
                    >
                        <div class="text-center">
                            <div
                                class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
                            ></div>
                            <p class="text-sm text-muted-foreground">
                                Memuat data kegiatan...
                            </p>
                        </div>
                    </div>

                    <div v-else class="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead class="w-12">No</TableHead>
                                    <TableHead class="w-100"
                                        >Kegiatan</TableHead
                                    >
                                    <TableHead class="w-32"
                                        >Tgl Mulai</TableHead
                                    >
                                    <TableHead class="w-32"
                                        >Tgl Selesai</TableHead
                                    >
                                    <TableHead class="w-40">Total</TableHead>
                                    <TableHead class="w-24">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <template
                                    v-for="(
                                        activity, index
                                    ) in budgetActivities"
                                    :key="activity.id"
                                >
                                    <TableRow>
                                        <TableCell class="font-medium">{{
                                            index + 1
                                        }}</TableCell>
                                        <TableCell>
                                            <ActivitySelect
                                                v-model="activity.activity_id"
                                                @select="
                                                    (selected) =>
                                                        updateActivityData(
                                                            index,
                                                            selected,
                                                        )
                                                "
                                                :disabled="isReadOnly"
                                                :searchable="true"
                                                :unit-id="formData.unit_id"
                                                placeholder="Pilih Kode Kegiatan"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                v-model="activity.start_date"
                                                type="date"
                                                class="w-full"
                                                :disabled="isReadOnly"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                v-model="activity.end_date"
                                                type="date"
                                                class="w-full"
                                                :disabled="isReadOnly"
                                            />
                                        </TableCell>
                                        <TableCell class="font-medium"
                                            >Rp
                                            {{
                                                formatCurrency(
                                                    activity.total_amount,
                                                )
                                            }}</TableCell
                                        >
                                        <TableCell>
                                            <div class="flex gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    @click="
                                                        toggleActivityDetail(
                                                            index,
                                                        )
                                                    "
                                                    :title="
                                                        activity.showItems
                                                            ? 'Sembunyikan detail'
                                                            : 'Lihat detail'
                                                    "
                                                >
                                                    <ChevronDown
                                                        v-if="
                                                            !activity.showItems
                                                        "
                                                        class="h-4 w-4"
                                                    />
                                                    <ChevronUp
                                                        v-if="
                                                            activity.showItems
                                                        "
                                                        class="h-4 w-4"
                                                    />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    @click="
                                                        removeActivity(index)
                                                    "
                                                    class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    title="Hapus kegiatan"
                                                    :disabled="isReadOnly"
                                                >
                                                    <Trash2 class="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    <!-- Activity Item Details (Expanded Row) -->
                                    <TableRow
                                        v-if="activity.showItems"
                                        class="bg-muted/50"
                                    >
                                        <TableCell colspan="7" class="p-4">
                                            <div class="pl-4">
                                                <div
                                                    class="mb-3 flex items-center justify-between"
                                                >
                                                    <h4
                                                        class="font-medium text-foreground"
                                                    >
                                                        Rincian Item Kegiatan:
                                                        <span
                                                            class="font-bold text-red-600 dark:text-red-400"
                                                        >
                                                            {{
                                                                activity.description ||
                                                                'Belum diberi nama'
                                                            }}
                                                        </span>
                                                    </h4>
                                                    <Button
                                                        v-if="!isReadOnly"
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        @click="
                                                            addNewActivityItem(
                                                                index,
                                                            )
                                                        "
                                                        class="gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                                    >
                                                        <Plus class="h-3 w-3" />
                                                        Tambah Item
                                                    </Button>
                                                </div>

                                                <div
                                                    class="rounded-md border bg-background"
                                                >
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead
                                                                    class="w-12"
                                                                    >No</TableHead
                                                                >
                                                                <TableHead
                                                                    class="w-100"
                                                                    >Item
                                                                    Anggaran</TableHead
                                                                >
                                                                <TableHead
                                                                    class="w-28"
                                                                    >Volume</TableHead
                                                                >
                                                                <TableHead
                                                                    class="w-48"
                                                                    >Satuan</TableHead
                                                                >
                                                                <TableHead
                                                                    class="w-40"
                                                                    >Biaya
                                                                    Diajukan</TableHead
                                                                >
                                                                <TableHead
                                                                    class="w-40"
                                                                    >Total
                                                                    Biaya</TableHead
                                                                >
                                                                <TableHead
                                                                    class="w-32"
                                                                    >Aksi</TableHead
                                                                >
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            <template
                                                                v-for="(
                                                                    item,
                                                                    itemIndex
                                                                ) in activity.request_items"
                                                                :key="item.id"
                                                            >
                                                                <TableRow>
                                                                    <TableCell
                                                                        class="font-medium"
                                                                        >{{
                                                                            itemIndex +
                                                                            1
                                                                        }}</TableCell
                                                                    >
                                                                    <TableCell>
                                                                        <ActivityItemSelect
                                                                            v-model="
                                                                                item.activity_item_id
                                                                            "
                                                                            @select="
                                                                                (
                                                                                    selectedItem,
                                                                                ) =>
                                                                                    updateActivityItem(
                                                                                        index,
                                                                                        itemIndex,
                                                                                        selectedItem,
                                                                                    )
                                                                            "
                                                                            :disabled="
                                                                                isReadOnly
                                                                            "
                                                                            :searchable="
                                                                                true
                                                                            "
                                                                            placeholder="Pilih item anggaran"
                                                                            class="w-full"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            v-model="
                                                                                item.quantity
                                                                            "
                                                                            type="number"
                                                                            min="0"
                                                                            step="1"
                                                                            @input="
                                                                                debouncedCalculateItemTotal(
                                                                                    activity.id,
                                                                                    item.id,
                                                                                )
                                                                            "
                                                                            class="w-full"
                                                                            :disabled="
                                                                                isReadOnly ||
                                                                                hasVendorType(
                                                                                    item,
                                                                                )
                                                                            "
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            v-model="
                                                                                item.unit_measure_name
                                                                            "
                                                                            placeholder="-"
                                                                            class="w-full bg-muted"
                                                                            readonly
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div
                                                                            class="relative"
                                                                        >
                                                                            <span
                                                                                class="absolute top-2 left-3 text-muted-foreground"
                                                                                >Rp</span
                                                                            >
                                                                            <Input
                                                                                :model-value="
                                                                                    formatPrice(
                                                                                        item.unit_price,
                                                                                    )
                                                                                "
                                                                                type="text"
                                                                                placeholder="0"
                                                                                @input="
                                                                                    handleUnitPrice(
                                                                                        $event,
                                                                                        activity.id,
                                                                                        item,
                                                                                    )
                                                                                "
                                                                                class="w-full pl-10"
                                                                                :disabled="
                                                                                    isReadOnly ||
                                                                                    hasVendorType(
                                                                                        item,
                                                                                    )
                                                                                "
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell
                                                                        class="font-medium"
                                                                        >Rp
                                                                        {{
                                                                            formatCurrency(
                                                                                item.total_price,
                                                                            )
                                                                        }}</TableCell
                                                                    >
                                                                    <TableCell>
                                                                        <div
                                                                            class="flex gap-1"
                                                                        >
                                                                            <Button
                                                                                v-if="
                                                                                    hasVendorType(
                                                                                        item,
                                                                                    )
                                                                                "
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                @click="
                                                                                    toggleGoodsPanel(
                                                                                        index,
                                                                                        itemIndex,
                                                                                    )
                                                                                "
                                                                                class="gap-1"
                                                                                :class="
                                                                                    showGoodsPanel &&
                                                                                    currentActivityIndex ===
                                                                                        index &&
                                                                                    currentItemIndex ===
                                                                                        itemIndex
                                                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                                                        : 'border-blue-300 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
                                                                                "
                                                                                :title="`Barang (${item.goods?.length || 0} barang)`"
                                                                            >
                                                                                <Package
                                                                                    class="h-3 w-3"
                                                                                />
                                                                                <span
                                                                                    class="text-xs"
                                                                                    >Barang</span
                                                                                >
                                                                                <span
                                                                                    v-if="
                                                                                        item.goods &&
                                                                                        item
                                                                                            .goods
                                                                                            .length >
                                                                                            0
                                                                                    "
                                                                                    class="ml-1 rounded-full px-1.5 text-xs font-medium"
                                                                                    :class="
                                                                                        showGoodsPanel &&
                                                                                        currentActivityIndex ===
                                                                                            index &&
                                                                                        currentItemIndex ===
                                                                                            itemIndex
                                                                                            ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                                                                                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        item
                                                                                            .goods
                                                                                            .length
                                                                                    }}
                                                                                </span>
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                @click="
                                                                                    removeActivityItem(
                                                                                        index,
                                                                                        itemIndex,
                                                                                    )
                                                                                "
                                                                                class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                                title="Hapus item"
                                                                                :disabled="
                                                                                    isReadOnly
                                                                                "
                                                                            >
                                                                                <Trash2
                                                                                    class="h-3 w-3"
                                                                                />
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>

                                                                <!-- GOODS PANEL (Menggunakan Komponen Terpisah) -->
                                                                <TableRow
                                                                    v-if="
                                                                        showGoodsPanel &&
                                                                        currentActivityIndex ===
                                                                            index &&
                                                                        currentItemIndex ===
                                                                            itemIndex
                                                                    "
                                                                    class="bg-blue-50/50 dark:bg-blue-950/20"
                                                                >
                                                                    <TableCell
                                                                        colspan="7"
                                                                        class="p-0"
                                                                    >
                                                                        <GoodsPanel
                                                                            :item-description="
                                                                                item.description ||
                                                                                'Item'
                                                                            "
                                                                            :goods="
                                                                                item.goods ||
                                                                                []
                                                                            "
                                                                            :is-read-only="
                                                                                isReadOnly
                                                                            "
                                                                            @close="
                                                                                closeGoodsPanel
                                                                            "
                                                                            @update:goods="
                                                                                (
                                                                                    goods,
                                                                                ) =>
                                                                                    updateItemGoods(
                                                                                        index,
                                                                                        itemIndex,
                                                                                        goods,
                                                                                    )
                                                                            "
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                                <!-- END GOODS PANEL -->
                                                            </template>
                                                            <TableRow
                                                                v-if="
                                                                    activity
                                                                        .request_items
                                                                        .length ===
                                                                    0
                                                                "
                                                            >
                                                                <TableCell
                                                                    colspan="7"
                                                                    class="py-4 text-center text-muted-foreground"
                                                                >
                                                                    Belum ada
                                                                    item. Klik
                                                                    "Tambah
                                                                    Item" untuk
                                                                    menambahkan.
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>

                                                <!-- Activity Items Summary -->
                                                <div
                                                    class="mt-4 flex justify-end"
                                                >
                                                    <div
                                                        class="w-64 space-y-1 rounded border bg-muted p-3 text-sm"
                                                    >
                                                        <div
                                                            class="flex justify-between"
                                                        >
                                                            <span
                                                                class="text-muted-foreground"
                                                                >Jumlah
                                                                Item:</span
                                                            >
                                                            <span
                                                                class="font-medium"
                                                                >{{
                                                                    activity
                                                                        .request_items
                                                                        .length
                                                                }}</span
                                                            >
                                                        </div>
                                                        <div
                                                            class="flex justify-between border-t pt-1"
                                                        >
                                                            <span
                                                                class="font-medium text-foreground"
                                                                >Subtotal
                                                                Kegiatan:</span
                                                            >
                                                            <span
                                                                class="font-bold text-primary"
                                                                >Rp
                                                                {{
                                                                    formatCurrency(
                                                                        activity.total_amount,
                                                                    )
                                                                }}</span
                                                            >
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Output Indicator Section -->
                                                <div class="mt-4 border-t pt-4">
                                                    <div
                                                        class="mb-3 flex items-center gap-2"
                                                    >
                                                        <Target
                                                            class="h-4 w-4 text-muted-foreground"
                                                        />
                                                        <h4
                                                            class="font-medium text-foreground"
                                                        >
                                                            Indikator Output
                                                            Kegiatan
                                                        </h4>
                                                        <span
                                                            class="text-xs text-muted-foreground"
                                                            >(Target output yang
                                                            akan dicapai)</span
                                                        >
                                                    </div>
                                                    <div class="space-y-2">
                                                        <Textarea
                                                            v-model="
                                                                activity.output_indicator
                                                            "
                                                            placeholder="Isikan indikator output kegiatan"
                                                            :disabled="
                                                                isReadOnly
                                                            "
                                                            class="min-h-[80px] resize-none"
                                                            rows="3"
                                                        />
                                                        <p
                                                            class="text-xs text-muted-foreground"
                                                        >
                                                            Deskripsikan
                                                            indikator output
                                                            yang akan dicapai
                                                            dari kegiatan ini
                                                        </p>
                                                    </div>
                                                </div>

                                                <!-- File Upload Section -->
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
                                                            Lampiran Dokumen
                                                            Kegiatan
                                                        </h4>
                                                        <span
                                                            class="text-xs text-muted-foreground"
                                                        >
                                                            (Upload dokumen
                                                            pendukung seperti
                                                            proposal, RAB, dll)
                                                        </span>
                                                    </div>
                                                    <FileUpload
                                                        v-model="activity.files"
                                                        :disabled="isReadOnly"
                                                        :view-only="isReadOnly"
                                                        :max-size-mb="10"
                                                        :accepted-file-types="[
                                                            '.pdf',
                                                            '.doc',
                                                            '.docx',
                                                            '.xls',
                                                            '.xlsx',
                                                            '.jpg',
                                                            '.jpeg',
                                                            '.png',
                                                        ]"
                                                        @file-added="
                                                            (file) =>
                                                                handleFileAdded(
                                                                    activity.id,
                                                                    file,
                                                                )
                                                        "
                                                        @file-removed="
                                                            (index) =>
                                                                handleFileRemoved(
                                                                    activity.id,
                                                                    index,
                                                                )
                                                        "
                                                        @file-error="
                                                            handleFileError
                                                        "
                                                    />
                                                    <div
                                                        v-if="
                                                            activity.files
                                                                ?.length > 0
                                                        "
                                                        class="mt-2 text-xs text-muted-foreground"
                                                    >
                                                        Total
                                                        {{
                                                            activity.files
                                                                .length
                                                        }}
                                                        file lampiran ({{
                                                            formatTotalFileSize(
                                                                activity.files,
                                                            )
                                                        }})
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </template>
                                <TableRow v-if="budgetActivities.length === 0">
                                    <TableCell
                                        colspan="7"
                                        class="py-8 text-center text-muted-foreground"
                                    >
                                        <div
                                            class="flex flex-col items-center gap-2"
                                        >
                                            <ListChecks class="h-8 w-8" />
                                            <p>
                                                Belum ada kegiatan. Klik "Tambah
                                                Kegiatan" untuk menambahkan.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    <!-- Summary -->
                    <div class="mt-6 flex justify-end">
                        <div
                            class="w-80 space-y-3 rounded-lg border bg-muted p-4"
                        >
                            <div class="flex justify-between">
                                <span class="text-muted-foreground"
                                    >Jumlah Kegiatan:</span
                                >
                                <span class="font-medium">{{
                                    budgetActivities.length
                                }}</span>
                            </div>
                            <div class="flex justify-between border-t pt-2">
                                <span
                                    class="text-lg font-medium text-foreground"
                                    >Total Anggaran:</span
                                >
                                <span class="text-lg font-bold text-primary"
                                    >Rp {{ formatCurrency(totalBudget) }}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Background Process Indicator -->
                <div
                    v-if="isBackgroundProcessing"
                    class="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white shadow-lg"
                >
                    <div
                        class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    ></div>
                    <span class="text-sm font-medium"
                        >Menyelesaikan proses...</span
                    >
                </div>

                <!-- Form Actions -->
                <div class="flex justify-end space-x-3 border-t pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        @click="goBack"
                        class="gap-2"
                    >
                        <ArrowLeft class="h-4 w-4" />
                        Kembali
                    </Button>

                    <div
                        v-if="!isReadOnly && !isLoading"
                        class="flex space-x-2"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            @click="resetForm"
                            :disabled="isPosting"
                        >
                            <RotateCcw class="h-4 w-4" /> Reset Form
                        </Button>

                        <Button
                            v-if="
                                mode === 'create' ||
                                formData.status?.toUpperCase() === 'DRAFT'
                            "
                            type="button"
                            variant="default"
                            @click="saveAsDraft"
                            :disabled="isPosting"
                        >
                            <Save class="h-4 w-4" /> Simpan Draft
                        </Button>

                        <Button
                            type="submit"
                            class="gap-2 bg-green-600 text-white hover:bg-green-700"
                            :disabled="isPosting"
                        >
                            <Send class="h-4 w-4" />
                            {{
                                isPosting
                                    ? 'Menyimpan...'
                                    : formData.status?.toUpperCase() ===
                                        'RETURNED'
                                      ? 'Ajukan Lagi'
                                      : 'Ajukan Sekarang'
                            }}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    </AppLayout>
</template>

<style scoped>
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
    .grid-cols-2 {
        grid-template-columns: 1fr;
    }
}
</style>
