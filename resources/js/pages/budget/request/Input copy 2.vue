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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import axios from 'axios';
import { debounce } from 'lodash';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Download,
    FileSpreadsheet,
    Info,
    ListChecks,
    MoreHorizontal,
    Package,
    Pencil,
    Plus,
    RotateCcw,
    Save,
    Send,
    Target,
    Trash2,
    Upload,
} from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';

// Interface sesuai struktur API
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

// Goods Dialog State
const showGoodsDialog = ref(false);
const showGoodsForm = ref(false);
const currentActivityIndex = ref<number>(-1);
const currentItemIndex = ref<number>(-1);
const currentGoods = ref<BudgetRequestItemGood[]>([]);
const uploadInputRef = ref<HTMLInputElement | null>(null);

// Goods form state
const goodsForm = ref<BudgetRequestItemGood>({
    item_name: '',
    goods_type: 'bhp',
    specification: '',
    brand: '',
    quantity: 1,
    unit_measure: '',
    unit_price: 0,
    subtotal: 0,
    notes: '',
});

const editingGoodsIndex = ref<number>(-1);

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
let goodsIdCounter = 1;

// Debounced functions
const debouncedCalculateItemTotal = debounce(
    (activityId: number, itemId: number) => {
        calculateActivityItemTotal(activityId, itemId);
    },
    300,
);

const debouncedCalculateGoodsSubtotal = debounce(() => {
    calculateGoodsSubtotal();
}, 300);

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

// Goods type options
const goodsTypeOptions = [
    { value: 'bhp', label: 'BHP (Bahan Habis Pakai)' },
    { value: 'non_bhp', label: 'Non BHP' },
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

// ==================== GOODS DIALOG FUNCTIONS ====================

// Open goods dialog for a specific item
const openGoodsDialog = (activityIndex: number, itemIndex: number) => {
    currentActivityIndex.value = activityIndex;
    currentItemIndex.value = itemIndex;
    
    const item = budgetActivities.value[activityIndex].request_items[itemIndex];
    currentGoods.value = item.goods ? [...item.goods] : [];
    
    showGoodsForm.value = false;
    showGoodsDialog.value = true;
    resetGoodsForm();
};

// Close goods dialog
const closeGoodsDialog = () => {
    showGoodsDialog.value = false;
    showGoodsForm.value = false;
    currentActivityIndex.value = -1;
    currentItemIndex.value = -1;
    currentGoods.value = [];
    resetGoodsForm();
};

// Show goods form (add or edit)
const openAddGoodsForm = () => {
    resetGoodsForm();
    showGoodsForm.value = true;
};

const openEditGoodsForm = (index: number) => {
    const goods = currentGoods.value[index];
    goodsForm.value = { ...goods };
    editingGoodsIndex.value = index;
    showGoodsForm.value = true;
};

// Cancel goods form (back to list)
const cancelGoodsForm = () => {
    showGoodsForm.value = false;
    resetGoodsForm();
};

// Reset goods form
const resetGoodsForm = () => {
    goodsForm.value = {
        item_name: '',
        goods_type: 'bhp',
        specification: '',
        brand: '',
        quantity: 1,
        unit_measure: '',
        unit_price: 0,
        subtotal: 0,
        notes: '',
    };
    editingGoodsIndex.value = -1;
};

// Save goods form (add or update)
const saveGoodsForm = () => {
    if (!goodsForm.value.item_name.trim()) {
        toast.error('Nama barang harus diisi');
        return;
    }
    
    if (goodsForm.value.quantity <= 0) {
        toast.error('Quantity harus lebih dari 0');
        return;
    }
    
    if (goodsForm.value.unit_price < 0) {
        toast.error('Harga satuan tidak boleh negatif');
        return;
    }

    if (editingGoodsIndex.value >= 0) {
        // Update existing goods
        currentGoods.value[editingGoodsIndex.value] = {
            ...currentGoods.value[editingGoodsIndex.value],
            ...goodsForm.value,
        };
        toast.success('Barang berhasil diperbarui');
    } else {
        // Add new goods
        const newGoods: BudgetRequestItemGood = {
            id: -(goodsIdCounter++), // Temporary negative ID
            item_name: goodsForm.value.item_name,
            goods_type: goodsForm.value.goods_type,
            specification: goodsForm.value.specification,
            brand: goodsForm.value.brand,
            quantity: goodsForm.value.quantity,
            unit_measure: goodsForm.value.unit_measure,
            unit_price: goodsForm.value.unit_price,
            subtotal: goodsForm.value.subtotal,
            notes: goodsForm.value.notes,
        };
        currentGoods.value.push(newGoods);
        toast.success('Barang berhasil ditambahkan');
    }

    // Kembali ke list
    showGoodsForm.value = false;
    resetGoodsForm();
};

// Remove goods
const removeGoods = (index: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
        currentGoods.value.splice(index, 1);
        toast.success('Barang berhasil dihapus');
    }
};

// Calculate goods subtotal
const calculateGoodsSubtotal = () => {
    const qty = goodsForm.value.quantity || 0;
    const price = goodsForm.value.unit_price || 0;
    goodsForm.value.subtotal = qty * price;
};

// Handle goods unit price input
const handleGoodsUnitPrice = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const rawValue = target.value.replace(/\D/g, '');
    goodsForm.value.unit_price = parseInt(rawValue || '0', 10);
    debouncedCalculateGoodsSubtotal();
};

// Total goods in dialog
const totalGoodsAmount = computed(() => {
    return currentGoods.value.reduce((sum, good) => sum + (good.subtotal || 0), 0);
});

// Save goods to item and close dialog
const saveGoodsToItem = () => {
    if (currentActivityIndex.value >= 0 && currentItemIndex.value >= 0) {
        const item = budgetActivities.value[currentActivityIndex.value].request_items[currentItemIndex.value];
        item.goods = [...currentGoods.value];
        
        // Update total item jika perlu
        const goodsTotal = currentGoods.value.reduce((sum, good) => sum + (good.subtotal || 0), 0);
        if (goodsTotal > 0) {
            item.total_price = goodsTotal;
            calculateActivityTotal(budgetActivities.value[currentActivityIndex.value].id);
        }
        
        toast.success('Data barang berhasil disimpan');
        closeGoodsDialog();
    }
};

// ==================== TEMPLATE & UPLOAD FUNCTIONS ====================

// Download template Excel
const downloadTemplate = () => {
    // Buat CSV template
    const headers = [
        'Nama Barang',
        'Tipe Barang (bhp/non_bhp)',
        'Spesifikasi',
        'Brand/Merk',
        'Quantity',
        'Satuan',
        'Harga Satuan',
        'Catatan',
    ];

    const sampleData = [
        ['Contoh Barang 1', 'bhp', 'Spesifikasi A', 'Brand X', '10', 'pcs', '50000', 'Catatan opsional'],
        ['Contoh Barang 2', 'non_bhp', 'Spesifikasi B', 'Brand Y', '5', 'unit', '250000', ''],
    ];

    let csvContent = '\uFEFF'; // BOM for UTF-8
    csvContent += headers.join(',') + '\n';
    sampleData.forEach(row => {
        // Escape values that contain commas
        const escapedRow = row.map(val => {
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        });
        csvContent += escapedRow.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_barang_budget_request.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Template berhasil diunduh');
};

// Trigger file input for upload
const triggerUpload = () => {
    if (uploadInputRef.value) {
        uploadInputRef.value.click();
    }
};

// Handle file upload for goods
const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;

    // Validasi tipe file
    const validTypes = ['.csv', '.xls', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
        toast.error('Format file tidak valid. Gunakan file CSV atau Excel (.csv, .xls, .xlsx)');
        target.value = '';
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            
            if (fileExtension === '.csv') {
                parseCSVContent(content);
            } else {
                toast.error('Untuk file Excel, silakan konversi ke CSV terlebih dahulu');
            }
        } catch (error) {
            console.error('Error parsing file:', error);
            toast.error('Gagal membaca file. Pastikan format file sesuai template.');
        }
    };

    reader.onerror = () => {
        toast.error('Gagal membaca file');
    };

    reader.readAsText(file, 'UTF-8');
    
    // Reset input
    target.value = '';
};

// Parse CSV content
const parseCSVContent = (content: string) => {
    // Remove BOM if present
    const cleanContent = content.replace(/^\uFEFF/, '');
    const lines = cleanContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
        toast.error('File kosong atau hanya berisi header');
        return;
    }

    // Skip header (first line)
    const dataLines = lines.slice(1);
    const newGoods: BudgetRequestItemGood[] = [];
    let errorCount = 0;

    dataLines.forEach((line, index) => {
        try {
            // Parse CSV line (handle quoted values)
            const values = parseCSVLine(line);
            
            if (values.length < 6) {
                errorCount++;
                return;
            }

            const goodsType = values[1]?.trim().toLowerCase();
            if (goodsType !== 'bhp' && goodsType !== 'non_bhp') {
                errorCount++;
                return;
            }

            const quantity = parseInt(values[4]?.trim() || '0', 10);
            const unitPrice = parseInt(values[6]?.trim().replace(/[^\d]/g, '') || '0', 10);

            if (isNaN(quantity) || quantity <= 0 || isNaN(unitPrice) || unitPrice < 0) {
                errorCount++;
                return;
            }

            const good: BudgetRequestItemGood = {
                id: -(goodsIdCounter++),
                item_name: values[0]?.trim() || '',
                goods_type: goodsType as 'bhp' | 'non_bhp',
                specification: values[2]?.trim() || '',
                brand: values[3]?.trim() || '',
                quantity: quantity,
                unit_measure: values[5]?.trim() || '',
                unit_price: unitPrice,
                subtotal: quantity * unitPrice,
                notes: values[7]?.trim() || '',
            };

            if (good.item_name) {
                newGoods.push(good);
            } else {
                errorCount++;
            }
        } catch (e) {
            errorCount++;
        }
    });

    if (newGoods.length > 0) {
        currentGoods.value.push(...newGoods);
        toast.success(`${newGoods.length} barang berhasil diimport`);
    }

    if (errorCount > 0) {
        toast.warning(`${errorCount} baris gagal diimport karena format tidak valid`);
    }

    if (newGoods.length === 0 && errorCount === 0) {
        toast.error('Tidak ada data yang berhasil diimport');
    }
};

// Parse CSV line (handle quoted values with commas)
const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (inQuotes) {
            if (char === '"') {
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
    }
    
    result.push(current);
    return result;
};

// ==================== END GOODS DIALOG FUNCTIONS ====================

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
                    trans_type_group: detail.activity_item?.trans_type_group || '',
                    goods: detail.goods?.map((good: any) => ({
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
            
            // Update goods counter
            const allGoods = allDetails.flatMap((d) => d.goods || []);
            if (allGoods.length > 0) {
                goodsIdCounter =
                    Math.max(...allGoods.map((g) => Math.abs(g.id ?? 0))) + 1;
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
        
        // Reset goods if item type changes from VENDOR to non-VENDOR
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

    debouncedCalculateItemTotal(activity.id, item.id);
};

// Add new activity
const addNewActivity = () => {
    const dates = formatDateForActivityInput();
    budgetActivities.value.push({
        id: activityIdCounter++,
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
        id: detailIdCounter++,
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
        budgetActivities.value[activityIndex].request_items.splice(
            itemIndex,
            1,
        );
        calculateActivityTotal(budgetActivities.value[activityIndex].id);
    }
};

const handleUnitPrice = (event: Event, activityId: number, item: any) => {
    const target = event.target as HTMLInputElement;
    const rawValue = target.value.replace(/\D/g, '');
    item.unit_price = rawValue.slice(0, 15);
    debouncedCalculateItemTotal(activityId, item.id);
};

// Calculate activity item total
const calculateActivityItemTotal = (activityId: number, itemId: number) => {
    const activity = budgetActivities.value.find((a) => a.id === activityId);
    if (activity) {
        const item = activity.request_items.find((i) => i.id === itemId);
        if (item) {
            if (item.goods && item.goods.length > 0) {
                item.total_price = item.goods.reduce((sum, good) => sum + (good.subtotal || 0), 0);
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
        activity.total_amount = activity.request_items.reduce(
            (sum, item) => sum + (item.total_price || 0),
            0,
        );
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

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const buildFormData = () => {
    const fd = new FormData();

    fd.append('request_date', String(formData.value.request_date));
    fd.append('fiscal_year_id', String(formData.value.fiscal_year_id));
    fd.append('academic_period_id', String(formData.value.academic_period_id));
    fd.append('unit_id', String(formData.value.unit_id));
    fd.append('budget_type', String(formData.value.budget_type));
    fd.append('budget_category_id', String(formData.value.budget_category_id));
    fd.append('sub_budget_category_id', String(formData.value.sub_budget_category_id));
    fd.append('notes', formData.value.description ?? '');
    fd.append('total_amount', String(totalBudget.value));

    budgetActivities.value.forEach((activity, aIndex) => {
        const prefix = `budget_request_activities[${aIndex}]`;

        if (activity.id) {
            fd.append(`${prefix}[id]`, String(activity.id));
        }

        fd.append(`${prefix}[activity_id]`, String(activity.activity_id));
        fd.append(`${prefix}[description]`, activity.description ?? '');
        fd.append(`${prefix}[start_date]`, activity.start_date ?? '');
        fd.append(`${prefix}[end_date]`, activity.end_date ?? '');
        fd.append(`${prefix}[total_amount]`, String(activity.total_amount));
        fd.append(`${prefix}[output_indicator]`, activity.output_indicator ?? '');

        activity.files?.forEach((file, fIndex) => {
            const docPrefix = `${prefix}[documents][${fIndex}]`;
            fd.append(`${docPrefix}[document_name]`, file.name);
            fd.append(`${docPrefix}[file_name]`, file.name);
            fd.append(`${docPrefix}[isExisting]`, String(file.isExisting));

            if (file.isExisting) {
                if (file.id) {
                    fd.append(`${docPrefix}[id]`, String(file.id));
                }
                fd.append(`${docPrefix}[file_path]`, file.url ?? '');
                fd.append(`${docPrefix}[file_size]`, String(file.size ?? 0));
                fd.append(`${docPrefix}[file_type]`, file.type ?? '');
            } else {
                fd.append(`${docPrefix}[file]`, file.file, file.name);
                fd.append(`${docPrefix}[file_size]`, String(file.size));
                fd.append(`${docPrefix}[file_type]`, file.type);
            }
        });

        activity.request_items?.forEach((item, iIndex) => {
            const itemPrefix = `${prefix}[request_items][${iIndex}]`;

            if (item.id) {
                fd.append(`${itemPrefix}[id]`, String(item.id));
            }

            fd.append(`${itemPrefix}[activity_item_id]`, String(item.activity_item_id));
            fd.append(`${itemPrefix}[description]`, item.description);
            fd.append(`${itemPrefix}[volume]`, String(item.quantity));
            fd.append(`${itemPrefix}[unit_measure_id]`, String(item.unit_measure_id));
            fd.append(`${itemPrefix}[unit_price]`, String(item.unit_price));
            fd.append(`${itemPrefix}[total_amount]`, String(item.total_price));
            
            if (item.goods && item.goods.length > 0) {
                item.goods.forEach((good, gIndex) => {
                    const goodPrefix = `${itemPrefix}[goods][${gIndex}]`;
                    
                    if (good.id && good.id > 0) {
                        fd.append(`${goodPrefix}[id]`, String(good.id));
                    }
                    
                    fd.append(`${goodPrefix}[item_name]`, good.item_name);
                    fd.append(`${goodPrefix}[goods_type]`, good.goods_type);
                    fd.append(`${goodPrefix}[specification]`, good.specification || '');
                    fd.append(`${goodPrefix}[brand]`, good.brand || '');
                    fd.append(`${goodPrefix}[quantity]`, String(good.quantity));
                    fd.append(`${goodPrefix}[unit_measure]`, good.unit_measure || '');
                    fd.append(`${goodPrefix}[unit_price]`, String(good.unit_price));
                    fd.append(`${goodPrefix}[subtotal]`, String(good.subtotal));
                    fd.append(`${goodPrefix}[notes]`, good.notes || '');
                });
            }
        });
    });

    return fd;
};

// Save as draft
const saveAsDraft = async () => {
    if (!validateForm()) return;

    isPosting.value = true;

    try {
        const formDataToSend = buildFormData();
        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
        };

        if (mode.value === 'create') {
            const res = await axios.post('/api/v1/budget-requests', formDataToSend, config);
            toast.info('Draft berhasil disimpan');

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

            toast.info('Draft berhasil diperbarui');
            await loadBudgetRequest(formData.value.id!);
        }
    } catch (error: any) {
        console.error(error);
        toast.info(error.response?.data?.message ?? 'Gagal menyimpan draft');
    } finally {
        isPosting.value = false;
    }
};

// Submit form
const submitForm = async () => {
    if (!validateForm()) return;

    isPosting.value = true;

    try {
        let id = formData.value.id;
        if (mode.value === 'create') {
            const res = await axios.post('/api/v1/budget-requests', buildFormData(), {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            id = res.data?.data?.id;
            formData.value.id = id;
            mode.value = 'edit';
        } else {
            await axios.post(`/api/v1/budget-requests/${id}?_method=PUT`, buildFormData(), {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
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
        );

        router.visit('/perencanaan-anggaran');
    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message ?? 'Gagal submit perencanaan anggaran');
    } finally {
        isPosting.value = false;
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
        goodsIdCounter = 1;
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
        'sub_budget_category_id',
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
                sub_budget_category_id: 'Sub Kategori Anggaran',
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
            toast.info(`Kegiatan "${activity.description || 'Belum diberi nama'}" harus memiliki tanggal mulai!`);
            return false;
        }

        if (!activity.end_date) {
            toast.info(`Kegiatan "${activity.description || 'Belum diberi nama'}" harus memiliki tanggal selesai!`);
            return false;
        }

        if (!activity.output_indicator || !activity.output_indicator.trim()) {
            toast.info(`Kegiatan "${activity.description || 'Belum diberi nama'}" harus memiliki indikator output!`);
            return false;
        }

        if (activity.request_items.length === 0) {
            toast.info(`Kegiatan "${activity.description || 'Belum diberi nama'}" harus memiliki minimal satu item!`);
            return false;
        }

        for (const item of activity.request_items) {
            if (hasVendorType(item) && (!item.goods || item.goods.length === 0)) {
                toast.info(`Item "${item.description || 'Belum diberi nama'}" bertipe VENDOR harus memiliki minimal satu barang!`);
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
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span class="text-sm font-medium">Mengambil data...</span>
            </div>

            <!-- Konten Utama -->
            <div
                v-if="!isLoading && isReadOnly"
                class="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
            >
                <div class="flex items-center gap-2">
                    <AlertCircle class="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <p class="text-sm font-medium text-yellow-700 dark:text-yellow-200">
                        Form dalam mode baca saja dan tidak dapat diedit.
                    </p>
                </div>
            </div>

            <!-- Header Form -->
            <div class="mb-6 border-b pb-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-foreground">
                            {{ mode === 'create' ? 'Perencanaan Anggaran Baru' : 'Detail Perencanaan Anggaran' }}
                        </h1>
                        <p class="mt-1 text-sm text-muted-foreground">Formulir perencanaan anggaran</p>
                    </div>
                </div>

                <div class="mt-4 flex flex-wrap gap-4 text-sm">
                    <div v-if="mode !== 'create' && formData.request_no" class="flex items-center gap-2">
                        <CalendarDays class="h-4 w-4 text-muted-foreground" />
                        <span class="font-bold text-foreground">No Perencanaan:</span>
                        <span class="font-medium text-foreground">{{ formData.request_no }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <Calendar class="h-4 w-4 text-muted-foreground" />
                        <span class="font-bold text-foreground">Tanggal:</span>
                        <span class="font-medium text-foreground">[ {{ currentDate }} ]</span>
                    </div>
                    <div v-if="mode !== 'create' && formData.request_no" class="ml-auto flex items-center gap-2">
                        <Info class="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        <span class="font-bold text-foreground">Status:</span>
                        <span class="text-sm font-bold text-foreground">{{ statusDescription }}</span>
                    </div>
                </div>
            </div>

            <!-- Form Fields -->
            <form @submit.prevent="submitForm" class="space-y-6">
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <!-- Kolom Kiri -->
                    <div class="space-y-6">
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground">Unit <span class="text-red-500">*</span></Label>
                            <UnitSelect v-model="formData.unit_id" :disabled="isReadOnly || isLoading" :searchable="false" />
                        </div>
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground">Tahun Anggaran <span class="text-red-500">*</span></Label>
                            <FiscalYearSelect v-model="formData.fiscal_year_id" :disabled="isReadOnly || isLoading" />
                        </div>
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground">Periode Akademik <span class="text-red-500">*</span></Label>
                            <AcademicPeriodSelect v-model="formData.academic_period_id" :disabled="isReadOnly || isLoading" />
                        </div>
                    </div>

                    <!-- Kolom Kanan -->
                    <div class="space-y-6">
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground">Tipe Anggaran <span class="text-red-500">*</span></Label>
                            <Select v-model="formData.budget_type" :disabled="isReadOnly || isLoading">
                                <SelectTrigger id="create-budget-type" class="w-full">
                                    <SelectValue placeholder="Pilih Tipe Anggaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem v-for="option in budgetTypeOptions" :key="option.value" :value="option.value">
                                        {{ option.label }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground">Kategori Anggaran <span class="text-red-500">*</span></Label>
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
                            <Label class="text-sm font-medium text-foreground">Sub Kategori Anggaran <span class="text-red-500">*</span></Label>
                            <BudgetCategorySelect
                                v-if="formData.budget_type && formData.unit_id && formData.budget_category_id"
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
                                <Label class="text-sm font-medium text-foreground">Deskripsi <span class="text-red-500">*</span></Label>
                                <span class="text-xs text-muted-foreground">{{ formData.description?.length ?? 0 }}/500</span>
                            </div>
                            <Textarea
                                v-model="formData.description"
                                placeholder="Isikan tujuan perencanaan..."
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
                            <h3 class="text-lg font-semibold text-foreground">Rincian Kegiatan</h3>
                            <p class="text-sm text-muted-foreground">Rincian kegiatan yang akan dianggarkan</p>
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

                    <div v-if="isLoading" class="flex items-center justify-center py-12">
                        <div class="text-center">
                            <div class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            <p class="text-sm text-muted-foreground">Memuat data kegiatan...</p>
                        </div>
                    </div>

                    <div v-else class="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead class="w-12">No</TableHead>
                                    <TableHead class="w-100">Kegiatan</TableHead>
                                    <TableHead class="w-32">Tgl Mulai</TableHead>
                                    <TableHead class="w-32">Tgl Selesai</TableHead>
                                    <TableHead class="w-40">Total</TableHead>
                                    <TableHead class="w-24">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <template v-for="(activity, index) in budgetActivities" :key="activity.id">
                                    <TableRow>
                                        <TableCell class="font-medium">{{ index + 1 }}</TableCell>
                                        <TableCell>
                                            <ActivitySelect
                                                v-model="activity.activity_id"
                                                @select="(selected) => updateActivityData(index, selected)"
                                                :disabled="isReadOnly"
                                                :searchable="true"
                                                :unit-id="formData.unit_id"
                                                placeholder="Pilih Kode Kegiatan"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input v-model="activity.start_date" type="date" class="w-full" :disabled="isReadOnly" />
                                        </TableCell>
                                        <TableCell>
                                            <Input v-model="activity.end_date" type="date" class="w-full" :disabled="isReadOnly" />
                                        </TableCell>
                                        <TableCell class="font-medium">Rp {{ formatCurrency(activity.total_amount) }}</TableCell>
                                        <TableCell>
                                            <div class="flex gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    @click="toggleActivityDetail(index)"
                                                    :title="activity.showItems ? 'Sembunyikan detail' : 'Lihat detail'"
                                                >
                                                    <ChevronDown v-if="!activity.showItems" class="h-4 w-4" />
                                                    <ChevronUp v-if="activity.showItems" class="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    @click="removeActivity(index)"
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
                                    <TableRow v-if="activity.showItems" class="bg-muted/50">
                                        <TableCell colspan="7" class="p-4">
                                            <div class="pl-4">
                                                <div class="mb-3 flex items-center justify-between">
                                                    <h4 class="font-medium text-foreground">
                                                        Rincian Item Kegiatan:
                                                        <span class="font-bold text-red-600 dark:text-red-400">
                                                            {{ activity.description || 'Belum diberi nama' }}
                                                        </span>
                                                    </h4>
                                                    <Button
                                                        v-if="!isReadOnly"
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        @click="addNewActivityItem(index)"
                                                        class="gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                                    >
                                                        <Plus class="h-3 w-3" />
                                                        Tambah Item
                                                    </Button>
                                                </div>

                                                <div class="rounded-md border bg-background">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead class="w-12">No</TableHead>
                                                                <TableHead>Item Anggaran</TableHead>
                                                                <TableHead class="w-28">Volume</TableHead>
                                                                <TableHead class="w-48">Satuan</TableHead>
                                                                <TableHead class="w-40">Biaya Diajukan</TableHead>
                                                                <TableHead class="w-40">Total Biaya</TableHead>
                                                                <TableHead class="w-32">Aksi</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            <TableRow v-for="(item, itemIndex) in activity.request_items" :key="item.id">
                                                                <TableCell class="font-medium">{{ itemIndex + 1 }}</TableCell>
                                                                <TableCell>
                                                                    <ActivityItemSelect
                                                                        v-model="item.activity_item_id"
                                                                        @select="(selectedItem) => updateActivityItem(index, itemIndex, selectedItem)"
                                                                        :disabled="isReadOnly"
                                                                        :searchable="false"
                                                                        placeholder="Pilih item anggaran"
                                                                        class="w-full"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        v-model="item.quantity"
                                                                        type="number"
                                                                        min="0"
                                                                        step="1"
                                                                        @input="debouncedCalculateItemTotal(activity.id, item.id)"
                                                                        class="w-full"
                                                                        :disabled="isReadOnly || hasVendorType(item)"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input v-model="item.unit_measure_name" placeholder="-" class="w-full bg-muted" readonly />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div class="relative">
                                                                        <span class="absolute top-2 left-3 text-muted-foreground">Rp</span>
                                                                        <Input
                                                                            v-model="item.unit_price"
                                                                            type="text"
                                                                            placeholder="0"
                                                                            @input="handleUnitPrice($event, activity.id, item)"
                                                                            class="w-full pl-10"
                                                                            :disabled="isReadOnly || hasVendorType(item)"
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell class="font-medium">Rp {{ formatCurrency(item.total_price) }}</TableCell>
                                                                <TableCell>
                                                                    <div class="flex gap-1">
                                                                        <!-- Tombol Barang untuk VENDOR -->
                                                                        <Button
                                                                            v-if="hasVendorType(item)"
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            @click="openGoodsDialog(index, itemIndex)"
                                                                            class="gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                                                                            :disabled="isReadOnly"
                                                                            :title="`Barang (${item.goods?.length || 0} barang)`"
                                                                        >
                                                                            <Package class="h-3 w-3" />
                                                                            <span class="text-xs">Barang</span>
                                                                            <span
                                                                                v-if="item.goods && item.goods.length > 0"
                                                                                class="ml-1 rounded-full bg-blue-100 px-1.5 text-xs font-medium text-blue-600"
                                                                            >
                                                                                {{ item.goods.length }}
                                                                            </span>
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            @click="removeActivityItem(index, itemIndex)"
                                                                            class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                            title="Hapus item"
                                                                            :disabled="isReadOnly"
                                                                        >
                                                                            <Trash2 class="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow v-if="activity.request_items.length === 0">
                                                                <TableCell colspan="8" class="py-4 text-center text-muted-foreground">
                                                                    Belum ada item. Klik "Tambah Item" untuk menambahkan.
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>

                                                <!-- Activity Items Summary -->
                                                <div class="mt-4 flex justify-end">
                                                    <div class="w-64 space-y-1 rounded border bg-muted p-3 text-sm">
                                                        <div class="flex justify-between">
                                                            <span class="text-muted-foreground">Jumlah Item:</span>
                                                            <span class="font-medium">{{ activity.request_items.length }}</span>
                                                        </div>
                                                        <div class="flex justify-between border-t pt-1">
                                                            <span class="font-medium text-foreground">Subtotal Kegiatan:</span>
                                                            <span class="font-bold text-primary">Rp {{ formatCurrency(activity.total_amount) }}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Output Indicator Section -->
                                                <div class="mt-4 border-t pt-4">
                                                    <div class="mb-3 flex items-center gap-2">
                                                        <Target class="h-4 w-4 text-muted-foreground" />
                                                        <h4 class="font-medium text-foreground">Indikator Output Kegiatan</h4>
                                                        <span class="text-xs text-muted-foreground">(Target output yang akan dicapai)</span>
                                                    </div>
                                                    <div class="space-y-2">
                                                        <Textarea
                                                            v-model="activity.output_indicator"
                                                            placeholder="Isikan indikator output kegiatan"
                                                            :disabled="isReadOnly"
                                                            class="min-h-[80px] resize-none"
                                                            rows="3"
                                                        />
                                                        <p class="text-xs text-muted-foreground">
                                                            Deskripsikan indikator output yang akan dicapai dari kegiatan ini
                                                        </p>
                                                    </div>
                                                </div>

                                                <!-- File Upload Section -->
                                                <div class="mt-4 border-t pt-4">
                                                    <div class="mb-3 flex items-center gap-2">
                                                        <Upload class="h-4 w-4 text-muted-foreground" />
                                                        <h4 class="font-medium text-foreground">Lampiran Dokumen Kegiatan</h4>
                                                        <span class="text-xs text-muted-foreground">
                                                            (Upload dokumen pendukung seperti proposal, RAB, dll)
                                                        </span>
                                                    </div>
                                                    <FileUpload
                                                        v-model="activity.files"
                                                        :disabled="isReadOnly"
                                                        :view-only="isReadOnly"
                                                        :max-size-mb="10"
                                                        :accepted-file-types="['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png']"
                                                        @file-added="(file) => handleFileAdded(activity.id, file)"
                                                        @file-removed="(index) => handleFileRemoved(activity.id, index)"
                                                        @file-error="handleFileError"
                                                    />
                                                    <div v-if="activity.files?.length > 0" class="mt-2 text-xs text-muted-foreground">
                                                        Total {{ activity.files.length }} file lampiran ({{ formatTotalFileSize(activity.files) }})
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </template>
                                <TableRow v-if="budgetActivities.length === 0">
                                    <TableCell colspan="7" class="py-8 text-center text-muted-foreground">
                                        <div class="flex flex-col items-center gap-2">
                                            <ListChecks class="h-8 w-8" />
                                            <p>Belum ada kegiatan. Klik "Tambah Kegiatan" untuk menambahkan.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    <!-- Summary -->
                    <div class="mt-6 flex justify-end">
                        <div class="w-80 space-y-3 rounded-lg border bg-muted p-4">
                            <div class="flex justify-between">
                                <span class="text-muted-foreground">Jumlah Kegiatan:</span>
                                <span class="font-medium">{{ budgetActivities.length }}</span>
                            </div>
                            <div class="flex justify-between border-t pt-2">
                                <span class="text-lg font-medium text-foreground">Total Anggaran:</span>
                                <span class="text-lg font-bold text-primary">Rp {{ formatCurrency(totalBudget) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Background Process Indicator -->
                <div
                    v-if="isBackgroundProcessing"
                    class="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white shadow-lg"
                >
                    <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span class="text-sm font-medium">Menyelesaikan proses...</span>
                </div>

                <!-- Form Actions -->
                <div class="flex justify-end space-x-3 border-t pt-6">
                    <Button type="button" variant="outline" @click="goBack" class="gap-2">
                        <ArrowLeft class="h-4 w-4" />
                        Kembali
                    </Button>

                    <div v-if="!isReadOnly && !isLoading" class="flex space-x-2">
                        <Button type="button" variant="outline" @click="resetForm" :disabled="isPosting">
                            <RotateCcw class="h-4 w-4" /> Reset Form
                        </Button>

                        <Button
                            v-if="mode === 'create' || formData.status?.toUpperCase() === 'DRAFT'"
                            type="button"
                            variant="default"
                            @click="saveAsDraft"
                            :disabled="isPosting"
                        >
                            <Save class="h-4 w-4" /> Simpan Draft
                        </Button>

                        <Button type="submit" class="gap-2" :disabled="isPosting">
                            <Send class="h-4 w-4" />
                            {{
                                isPosting
                                    ? 'Menyimpan...'
                                    : formData.status?.toUpperCase() === 'RETURNED'
                                      ? 'Ajukan Lagi'
                                      : 'Ajukan Sekarang'
                            }}
                        </Button>
                    </div>
                </div>
            </form>
        </div>

        <!-- ==================== GOODS DIALOG ==================== -->
        <Dialog :open="showGoodsDialog" @update:open="closeGoodsDialog">
            <DialogContent class="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle class="flex items-center gap-2">
                        <Package class="h-5 w-5" />
                        Data Barang (VENDOR)
                    </DialogTitle>
                    <DialogDescription>
                        Kelola data barang untuk item yang bertipe VENDOR.
                    </DialogDescription>
                </DialogHeader>

                <!-- MODE: LIST BARANG -->
                <div v-if="!showGoodsForm" class="flex-1 space-y-4 overflow-y-auto">
                    <!-- Toolbar -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="default"
                                size="sm"
                                @click="openAddGoodsForm"
                                class="gap-1"
                            >
                                <Plus class="h-4 w-4" />
                                Tambah Barang
                            </Button>
                        </div>
                        <div class="flex items-center gap-2">
                            <!-- Dropdown Menu untuk Upload/Download -->
                            <DropdownMenu>
                                <DropdownMenuTrigger as-child>
                                    <Button variant="outline" size="sm" class="gap-1">
                                        <MoreHorizontal class="h-4 w-4" />
                                        Lainnya
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" class="w-48">
                                    <DropdownMenuItem @click="downloadTemplate" class="gap-2 cursor-pointer">
                                        <Download class="h-4 w-4" />
                                        Download Template
                                    </DropdownMenuItem>
                                    <DropdownMenuItem @click="triggerUpload" class="gap-2 cursor-pointer">
                                        <Upload class="h-4 w-4" />
                                        Upload CSV
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <!-- Hidden file input for upload -->
                            <input
                                ref="uploadInputRef"
                                type="file"
                                accept=".csv,.xls,.xlsx"
                                class="hidden"
                                @change="handleFileUpload"
                            />
                        </div>
                    </div>

                    <!-- Goods List Table -->
                    <div class="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead class="w-12">No</TableHead>
                                    <TableHead>Nama Barang</TableHead>
                                    <TableHead class="w-20">Tipe</TableHead>
                                    <TableHead class="w-20">Qty</TableHead>
                                    <TableHead class="w-24">Satuan</TableHead>
                                    <TableHead class="w-40 text-right">Harga Satuan</TableHead>
                                    <TableHead class="w-40 text-right">Subtotal</TableHead>
                                    <TableHead class="w-24">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="(good, gIndex) in currentGoods" :key="gIndex">
                                    <TableCell class="font-medium">{{ gIndex + 1 }}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div class="font-medium">{{ good.item_name }}</div>
                                            <div v-if="good.specification" class="text-xs text-muted-foreground">
                                                Spec: {{ good.specification }}
                                            </div>
                                            <div v-if="good.brand" class="text-xs text-muted-foreground">
                                                Brand: {{ good.brand }}
                                            </div>
                                            <div v-if="good.notes" class="text-xs text-muted-foreground italic">
                                                {{ good.notes }}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                            :class="
                                                good.goods_type === 'bhp'
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                            "
                                        >
                                            {{ good.goods_type === 'bhp' ? 'BHP' : 'Non BHP' }}
                                        </span>
                                    </TableCell>
                                    <TableCell>{{ good.quantity }}</TableCell>
                                    <TableCell>{{ good.unit_measure || '-' }}</TableCell>
                                    <TableCell class="text-right">Rp {{ formatCurrency(good.unit_price) }}</TableCell>
                                    <TableCell class="text-right font-medium">Rp {{ formatCurrency(good.subtotal) }}</TableCell>
                                    <TableCell>
                                        <div class="flex gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                @click="openEditGoodsForm(gIndex)"
                                                class="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                title="Edit barang"
                                            >
                                                <Pencil class="h-3 w-3" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                @click="removeGoods(gIndex)"
                                                class="text-destructive hover:bg-destructive/10"
                                                title="Hapus barang"
                                            >
                                                <Trash2 class="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow v-if="currentGoods.length === 0">
                                    <TableCell colspan="8" class="py-12 text-center text-muted-foreground">
                                        <div class="flex flex-col items-center gap-3">
                                            <Package class="h-10 w-10" />
                                            <div>
                                                <p class="font-medium">Belum ada barang</p>
                                                <p class="text-sm">Klik "Tambah Barang" atau upload CSV untuk menambahkan data barang.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    <!-- Goods Summary -->
                    <div v-if="currentGoods.length > 0" class="flex justify-end">
                        <div class="w-72 space-y-2 rounded-lg border bg-muted p-3">
                            <div class="flex justify-between">
                                <span class="text-muted-foreground">Jumlah Barang:</span>
                                <span class="font-medium">{{ currentGoods.length }}</span>
                            </div>
                            <div class="flex justify-between border-t pt-2">
                                <span class="font-medium text-foreground">Total Barang:</span>
                                <span class="font-bold text-primary">Rp {{ formatCurrency(totalGoodsAmount) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MODE: FORM INPUT BARANG -->
                <div v-else class="flex-1 space-y-4 overflow-y-auto">
                    <div class="rounded-lg border p-4">
                        <h4 class="mb-3 font-medium">
                            {{ editingGoodsIndex >= 0 ? 'Edit Barang' : 'Tambah Barang Baru' }}
                        </h4>
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <!-- Nama Barang -->
                            <div class="space-y-2">
                                <Label>Nama Barang <span class="text-red-500">*</span></Label>
                                <Input v-model="goodsForm.item_name" placeholder="Masukkan nama barang" />
                            </div>

                            <!-- Tipe Barang -->
                            <div class="space-y-2">
                                <Label>Tipe Barang</Label>
                                <Select v-model="goodsForm.goods_type">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe barang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="option in goodsTypeOptions" :key="option.value" :value="option.value">
                                            {{ option.label }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <!-- Spesifikasi -->
                            <div class="space-y-2">
                                <Label>Spesifikasi</Label>
                                <Input v-model="goodsForm.specification" placeholder="Spesifikasi barang" />
                            </div>

                            <!-- Brand -->
                            <div class="space-y-2">
                                <Label>Brand/Merk</Label>
                                <Input v-model="goodsForm.brand" placeholder="Brand atau merk" />
                            </div>

                            <!-- Quantity -->
                            <div class="space-y-2">
                                <Label>Quantity <span class="text-red-500">*</span></Label>
                                <Input
                                    v-model.number="goodsForm.quantity"
                                    type="number"
                                    min="1"
                                    step="1"
                                    @input="debouncedCalculateGoodsSubtotal"
                                    placeholder="Jumlah"
                                />
                            </div>

                            <!-- Satuan -->
                            <div class="space-y-2">
                                <Label>Satuan</Label>
                                <Input v-model="goodsForm.unit_measure" placeholder="Contoh: pcs, box, unit" />
                            </div>

                            <!-- Harga Satuan -->
                            <div class="space-y-2">
                                <Label>Harga Satuan <span class="text-red-500">*</span></Label>
                                <div class="relative">
                                    <span class="absolute top-2 left-3 text-muted-foreground">Rp</span>
                                    <Input
                                        v-model="goodsForm.unit_price"
                                        type="text"
                                        placeholder="0"
                                        @input="handleGoodsUnitPrice"
                                        class="pl-10"
                                    />
                                </div>
                            </div>

                            <!-- Subtotal (Readonly) -->
                            <div class="space-y-2">
                                <Label>Subtotal</Label>
                                <div class="relative">
                                    <span class="absolute top-2 left-3 text-muted-foreground">Rp</span>
                                    <Input :value="formatCurrency(goodsForm.subtotal)" class="pl-10 bg-muted" readonly />
                                </div>
                            </div>

                            <!-- Catatan -->
                            <div class="space-y-2 md:col-span-2">
                                <Label>Catatan</Label>
                                <Textarea
                                    v-model="goodsForm.notes"
                                    placeholder="Catatan tambahan (opsional)"
                                    class="min-h-[60px] resize-none"
                                    rows="2"
                                />
                            </div>
                        </div>

                        <div class="mt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" @click="cancelGoodsForm">
                                Batal
                            </Button>
                            <Button type="button" @click="saveGoodsForm" class="gap-1">
                                <Save class="h-4 w-4" />
                                {{ editingGoodsIndex >= 0 ? 'Update Barang' : 'Simpan Barang' }}
                            </Button>
                        </div>
                    </div>
                </div>

                <!-- Dialog Footer (hanya tampil saat mode list) -->
                <DialogFooter v-if="!showGoodsForm" class="border-t pt-4">
                    <Button type="button" variant="outline" @click="closeGoodsDialog">
                        Batal
                    </Button>
                    <Button type="button" @click="saveGoodsToItem" class="gap-1">
                        <Save class="h-4 w-4" />
                        Simpan & Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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