<script setup lang="ts">
import FileUpload from '@/components/file-upload/FileUpload.vue';
import { UploadedFile } from '@/components/file-upload/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
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
import { BudgetFundRelease } from '@/types/disburse';
import { Head, router } from '@inertiajs/vue3';
import axios from 'axios';
import {
    AlertCircle,
    ArrowLeft,
    Banknote,
    Calendar,
    CalendarDays,
    CheckCircle2,
    FileText,
    Info,
    Paperclip,
    Pencil,
    Plus,
    RotateCcw,
    Save,
    Trash2,
    Wallet,
    X,
} from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

// Interfaces
interface BudgetFundReleaseForm extends BudgetFundRelease {
    disbursement_header?: {
        id: number;
        disbursement_no: string;
        disbursement_date: string;
        total_amount: number;
        request_header?: {
            id: number;
            unit?: {
                unit_name: string;
            };
        };
        request_activity?: {
            id: number;
            description: string;
        };
    };
}

interface BudgetAccountabilityForm {
    accountability_no: string;
    accountability_date: string;
    budget_fund_release_id: number | null;
    budget_fund_release_item_id: number | null;
    total_received: number;
    total_spent: number;
    total_returned: number;
    status: string;
    notes: string;
    files: UploadedFile[];
}

interface AccountabilityItemForm {
    id?: number;
    tempId?: string;
    expense_date: string;
    description: string;
    amount: number;
    receipt_no: string;
    notes: string;
    isNew?: boolean;
    isEditing?: boolean;
    _disbursement_item_id?: number | null;
}

interface AccountabilityReturnForm {
    id?: number;
    tempId?: string;
    return_date: string;
    amount: number;
    receipt_no: string;
    fund_source_id: number | null;
    notes: string;
    isNew?: boolean;
    isEditing?: boolean;
}

interface BudgetFundReleaseItem {
    id: number;
    total_amount: number;
    description: string;
}

interface FundSource {
    id: number;
    name: string;
    code?: string;
}

// Props
const props = defineProps<{
    id?: number | string;
    mode: string;
}>();

// Reactive data
const mode = ref<'create' | 'edit' | 'view'>('create');
const isSubmitting = ref(false);
const showLoadingSkeleton = ref(true);
const isBackgroundProcessing = ref(false);
const selectedReleaseId = ref<number | null>(null);
const selectedRelease = ref<BudgetFundReleaseForm | null>(null);
const showItemForm = ref(false);
const showReturnForm = ref(false);
const editingItemIndex = ref<number | null>(null);
const editingReturnIndex = ref<number | null>(null);
const activeTab = ref<'expense' | 'return' | 'documents'>('expense');

// Data dari API
const transferredReleases = ref<BudgetFundReleaseForm[]>([]);
const fundReleaseItems = ref<BudgetFundReleaseItem[]>([]);
const fundSources = ref<FundSource[]>([]);

// Form data
const getTodayDate = () => new Date().toISOString().split('T')[0];

const formData = ref<BudgetAccountabilityForm>({
    accountability_no: '',
    accountability_date: getTodayDate(),
    budget_fund_release_id: null,
    budget_fund_release_item_id: null,
    total_received: 0,
    total_spent: 0,
    total_returned: 0,
    status: 'draft',
    notes: '',
    files: [],
});

// Selected item dari fund release item
const selectedFundReleaseItemId = ref<number | null>(null);

// Item form untuk expense (sesuai BudgetAccountabilityItem)
const expenseForm = ref<AccountabilityItemForm>({
    expense_date: getTodayDate(),
    description: '',
    amount: 0,
    receipt_no: '',
    notes: '',
});

// Item form untuk return
const returnForm = ref<AccountabilityReturnForm>({
    return_date: getTodayDate(),
    amount: 0,
    receipt_no: '',
    fund_source_id: null,
    notes: '',
});

// Items list
const accountabilityItems = ref<AccountabilityItemForm[]>([]);
const accountabilityReturns = ref<AccountabilityReturnForm[]>([]);

// Watch untuk set budget_fund_release_item_id
watch(selectedFundReleaseItemId, (newItemId) => {
    if (newItemId) {
        formData.value.budget_fund_release_item_id = newItemId;
    } else {
        formData.value.budget_fund_release_item_id = null;
    }
});

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Pertanggungjawaban Anggaran',
        href: '/pertanggungjawaban',
    },
    {
        title:
            mode.value === 'create'
                ? 'Buat Pertanggungjawaban'
                : mode.value === 'edit'
                  ? 'Edit Pertanggungjawaban'
                  : 'Detail Pertanggungjawaban',
        href: '',
    },
]);

const currentDate = computed(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
});

const isReadOnly = computed(() => {
    if (mode.value === 'create' || mode.value === 'edit') {
        return (
            formData.value.status !== 'draft' &&
            formData.value.status !== 'returned'
        );
    }
    return true;
});

const isEditMode = computed(
    () => mode.value === 'edit' || mode.value === 'create',
);

const totalSpent = computed(() => {
    return accountabilityItems.value.reduce((sum, item) => {
        return sum + (Number(item.amount) || 0);
    }, 0);
});

const totalReturnedAmount = computed(() => {
    return accountabilityReturns.value.reduce((sum, item) => {
        return sum + (Number(item.amount) || 0);
    }, 0);
});

const remainingBalance = computed(() => {
    return (
        Number(formData.value.total_received || 0) -
        totalSpent.value -
        totalReturnedAmount.value
    );
});

const canAddItem = computed(() => {
    return (
        isEditMode.value &&
        !isReadOnly.value &&
        selectedRelease.value &&
        selectedFundReleaseItemId.value
    );
});

const isExpenseFormValid = computed(() => {
    return (
        expenseForm.value.expense_date &&
        expenseForm.value.description &&
        Number(expenseForm.value.amount) > 0
    );
});

const isReturnFormValid = computed(() => {
    return (
        returnForm.value.return_date &&
        returnForm.value.notes &&
        Number(returnForm.value.amount) > 0
    );
});

const statusDescription = computed(() => {
    const status = formData.value.status || 'draft';
    switch (status) {
        case 'draft':
            return 'Masih dalam penyusunan';
        case 'submitted':
            return 'Diajukan';
        case 'verified':
            return 'Terverifikasi';
        case 'approved':
            return 'Disetujui';
        case 'returned':
            return 'Dikembalikan';
        default:
            return status;
    }
});

// Methods
const loadTransferredReleases = async () => {
    try {
        const { data } = await axios.get('/api/v1/budget-fund-releases', {
            params: {
                status: 'transferred',
                per_page: 100,
            },
        });

        transferredReleases.value = data.data || [];
    } catch (error) {
        console.error('Failed to load transferred releases:', error);
        transferredReleases.value = [];
    }
};

const loadFundSources = async () => {
    try {
        const { data } = await axios.get('/api/v1/fund-sources');
        fundSources.value = data.data || [];
    } catch (error) {
        console.error('Failed to load fund sources:', error);
        fundSources.value = [];
    }
};

const getFundSourceName = (id: number | null) => {
    if (!id) return '-';
    const source = fundSources.value.find((s) => s.id === id);
    return source?.name || '-';
};

const loadReleaseDetails = async () => {
    if (!selectedReleaseId.value) {
        selectedRelease.value = null;
        formData.value.budget_fund_release_id = null;
        formData.value.budget_fund_release_item_id = null;
        formData.value.total_received = 0;
        fundReleaseItems.value = [];
        selectedFundReleaseItemId.value = null;
        return;
    }

    try {
        isBackgroundProcessing.value = true;
        const { data } = await axios.get(
            `/api/v1/budget-fund-releases/${selectedReleaseId.value}`,
        );

        selectedRelease.value = data.data;

        formData.value.budget_fund_release_id = data.data.id;
        formData.value.total_received = parseFloat(data.data.total_amount);

        if (data.data.items) {
            fundReleaseItems.value = data.data.items.map(
                (item: any): BudgetFundReleaseItem => {
                    return {
                        id: item.id,
                        total_amount: parseFloat(item.total_amount),
                        description:
                            item.disbursement_item?.request_item?.description ||
                            '',
                    };
                },
            );
        }
    } catch (error) {
        console.error('Failed to load release details:', error);
        toast.error('Gagal memuat detail pencairan');
    } finally {
        isBackgroundProcessing.value = false;
    }
};

const loadAccountabilityData = async (id: number | string) => {
    try {
        const { data } = await axios.get(
            `/api/v1/budget-accountabilities/${id}`,
        );

        const accountability = data.data;

        if (accountability.fund_release) {
            selectedRelease.value = {
                ...accountability.fund_release,
                disbursement_header: accountability.disbursement_header || null,
            };

            selectedReleaseId.value = accountability.fund_release.id;
        }

        formData.value = {
            accountability_no: accountability.accountability_no,
            accountability_date:
                accountability.accountability_date.split('T')[0],
            budget_fund_release_id: accountability.budget_fund_release_id,
            budget_fund_release_item_id:
                accountability.budget_fund_release_item_id || null,
            total_received: parseFloat(accountability.total_received),
            total_spent: parseFloat(accountability.total_spent),
            total_returned: parseFloat(accountability.total_returned),
            status: accountability.status,
            notes: accountability.notes || '',
            files:
                accountability.documents?.map((doc: any) => ({
                    id: doc.id,
                    name: doc.document_name || doc.name,
                    file: doc.file_path || doc.file,
                    size: doc.file_size || doc.size,
                    type: doc.file_type || doc.type,
                    url: doc.file_path || doc.url,
                    isExisting: true,
                    status: 'success',
                })) || [],
        };

        if (accountability.items) {
            fundReleaseItems.value = accountability.items;
        }

        selectedFundReleaseItemId.value =
            accountability.budget_fund_release_item_id || null;
        
        console.log("selectedFundReleaseItemId ", selectedFundReleaseItemId.value);

        accountabilityItems.value = [];
        accountabilityReturns.value = [];

        if (accountability.items && accountability.items.length > 0) {
            accountabilityItems.value = accountability.items.map(
                (item: any) => ({
                    id: item.id,
                    expense_date: item.expense_date
                        ? item.expense_date.split('T')[0]
                        : getTodayDate(),
                    description: item.description || '',
                    amount: parseFloat(item.amount) || 0,
                    receipt_no: item.receipt_no || '',
                    notes: item.notes || '',
                    _disbursement_item_id:
                        accountability.budget_fund_release_item_id || null,
                }),
            );
        }

        if (accountability.returns && accountability.returns.length > 0) {
            accountabilityReturns.value = accountability.returns.map(
                (item: any) => ({
                    id: item.id,
                    return_date: item.return_date
                        ? item.return_date.split('T')[0]
                        : getTodayDate(),
                    amount: parseFloat(item.amount) || 0,
                    receipt_no: item.receipt_no || '',
                    fund_source_id: item.fund_source_id || null,
                    notes: item.notes || '',
                }),
            );
        }
    } catch (error) {
        console.error('Failed to load accountability:', error);
        toast.error('Gagal memuat data pertanggungjawaban');
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
};

// Expense item management
const resetExpenseForm = () => {
    expenseForm.value = {
        expense_date: getTodayDate(),
        description: '',
        amount: 0,
        receipt_no: '',
        notes: '',
    };
    editingItemIndex.value = null;
};

const openAddExpenseForm = () => {
    if (!selectedFundReleaseItemId.value) {
        toast.warning('Pilih item anggaran terlebih dahulu');
        return;
    }
    resetExpenseForm();
    // if (selectedFundReleaseItem.value) {
    //     expenseForm.value.description = selectedFundReleaseItem.value.request_item?.description || '';
    //     expenseForm.value.amount = selectedFundReleaseItem.value.total_amount || 0;
    // }

    showItemForm.value = true;
};

const addExpenseItem = () => {
    if (!isExpenseFormValid.value) {
        toast.error('Lengkapi data pengeluaran terlebih dahulu');
        return;
    }

    if (editingItemIndex.value !== null) {
        accountabilityItems.value[editingItemIndex.value] = {
            ...accountabilityItems.value[editingItemIndex.value],
            ...expenseForm.value,
            isEditing: false,
        };
        editingItemIndex.value = null;
    } else {
        accountabilityItems.value.push({
            ...expenseForm.value,
            tempId: `temp_${Date.now()}`,
            isNew: true,
            _disbursement_item_id: selectedFundReleaseItemId.value,
        });
    }

    resetExpenseForm();
    showItemForm.value = false;
};

const editExpenseItem = (index: number) => {
    const item = accountabilityItems.value[index];
    expenseForm.value = {
        expense_date: item.expense_date,
        description: item.description,
        amount: item.amount,
        receipt_no: item.receipt_no,
        notes: item.notes,
    };
    editingItemIndex.value = index;
    showItemForm.value = true;
    activeTab.value = 'expense';
};

const removeExpenseItem = (index: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus item pengeluaran ini?')) {
        accountabilityItems.value.splice(index, 1);
        toast.success('Item pengeluaran berhasil dihapus');
    }
};

// Return item management
const resetReturnForm = () => {
    returnForm.value = {
        return_date: getTodayDate(),
        amount: 0,
        receipt_no: '',
        fund_source_id: null,
        notes: '',
    };
    editingReturnIndex.value = null;
};

const openAddReturnForm = () => {
    resetReturnForm();
    showReturnForm.value = true;
};

const addReturnItem = () => {
    if (!isReturnFormValid.value) {
        toast.warning('Lengkapi data pengembalian terlebih dahulu');
        return;
    }

    if (editingReturnIndex.value !== null) {
        accountabilityReturns.value[editingReturnIndex.value] = {
            ...returnForm.value,
            id: accountabilityReturns.value[editingReturnIndex.value].id,
            isEditing: false,
        };
        editingReturnIndex.value = null;
    } else {
        accountabilityReturns.value.push({
            ...returnForm.value,
            tempId: `temp_${Date.now()}`,
            isNew: true,
        });
    }

    resetReturnForm();
    showReturnForm.value = false;
};

const editReturnItem = (index: number) => {
    const item = accountabilityReturns.value[index];
    returnForm.value = {
        return_date: item.return_date,
        amount: item.amount,
        receipt_no: item.receipt_no,
        fund_source_id: item.fund_source_id,
        notes: item.notes,
    };
    editingReturnIndex.value = index;
    showReturnForm.value = true;
    activeTab.value = 'return';
};

const removeReturnItem = (index: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus item pengembalian ini?')) {
        accountabilityReturns.value.splice(index, 1);
        toast.success('Item pengembalian berhasil dihapus');
    }
};

const cancelExpenseForm = () => {
    resetExpenseForm();
    showItemForm.value = false;
};

const cancelReturnForm = () => {
    resetReturnForm();
    showReturnForm.value = false;
};

// File upload handlers
const handleFileAdded = (file: UploadedFile) => {
    console.log('File added:', file.name);
};

const handleFileRemoved = (index: number) => {
    console.log('File removed:', index);
};

const handleFileError = (error: string) => {
    console.error('File upload error:', error);
    toast.error(error);
};

const formatTotalFileSize = (files: any[]) => {
    if (!files || files.length === 0) return '0 KB';
    const totalSize = files.reduce(
        (sum: number, file: any) => sum + (file.size || 0),
        0,
    );
    return formatFileSize(totalSize);
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validation
const validateForm = () => {
    if (!formData.value.budget_fund_release_id) {
        toast.warning('Pencairan dana harus dipilih!');
        return false;
    }

    if (!formData.value.budget_fund_release_item_id) {
        toast.warning('Detail item anggaran harus dipilih!');
        return false;
    }

    if (!formData.value.notes) {
        toast.warning('Catatan pertanggungjawaban harus diisi!');
        return false;
    }

    if (
        accountabilityItems.value.length === 0 &&
        accountabilityReturns.value.length === 0
    ) {
        toast.warning('Minimal harus ada 1 item pertanggungjawaban!');
        return false;
    }

    for (let i = 0; i < accountabilityItems.value.length; i++) {
        const item = accountabilityItems.value[i];
        if (!item.expense_date) {
            toast.warning(`Pengeluaran #${i + 1}: Tanggal harus diisi!`);
            return false;
        }
        if (!item.description) {
            toast.warning(`Pengeluaran #${i + 1}: Uraian harus diisi!`);
            return false;
        }
        if (!item.amount || Number(item.amount) <= 0) {
            toast.warning(`Pengeluaran #${i + 1}: Jumlah harus lebih dari 0!`);
            return false;
        }
    }

    for (let i = 0; i < accountabilityReturns.value.length; i++) {
        const item = accountabilityReturns.value[i];
        if (!item.return_date) {
            toast.warning(`Pengembalian #${i + 1}: Tanggal harus diisi!`);
            return false;
        }
        if (!item.notes) {
            toast.warning(`Pengembalian #${i + 1}: Keterangan harus diisi!`);
            return false;
        }
        if (!item.amount || Number(item.amount) <= 0) {
            toast.warning(`Pengembalian #${i + 1}: Jumlah harus lebih dari 0!`);
            return false;
        }
    }

    return true;
};

// Build payload
const buildPayload = () => {
    const expenseItemsPayload = accountabilityItems.value.map((item) => ({
        id: item.id,
        expense_date: item.expense_date,
        description: item.description,
        amount: item.amount,
        receipt_no: item.receipt_no || null,
        notes: item.notes || null,
    }));

    const returnItemsPayload = accountabilityReturns.value.map((item) => ({
        id: item.id,
        return_date: item.return_date,
        amount: item.amount,
        receipt_no: item.receipt_no || null,
        fund_source_id: item.fund_source_id || null,
        notes: item.notes || null,
    }));

    return {
        accountability_no: formData.value.accountability_no,
        accountability_date: formData.value.accountability_date,
        budget_fund_release_id: formData.value.budget_fund_release_id,
        budget_fund_release_item_id: formData.value.budget_fund_release_item_id,
        total_received: formData.value.total_received,
        total_spent: totalSpent.value,
        total_returned: totalReturnedAmount.value,
        status: formData.value.status,
        notes: formData.value.notes,
        items: expenseItemsPayload,
        returns: returnItemsPayload,
    };
};

const submitForm = async () => {
    if (!validateForm()) return;

    isSubmitting.value = true;

    try {
        const formDataToSend = new FormData();
        const payload = buildPayload();

        if (
            formData.value.status &&
            ['draft', 'returned'].includes(formData.value.status)
        ) {
            payload.status = 'submitted';
        }

        if (props.id) {
            formDataToSend.append('_method', 'PUT');
        }

        const mainFields = [
            'accountability_no',
            'accountability_date',
            'budget_fund_release_id',
            'budget_fund_release_item_id',
            'total_received',
            'total_spent',
            'total_returned',
            'status',
            'notes',
        ];

        mainFields.forEach((field: any) => {
            if (payload[field] !== undefined && payload[field] !== null) {
                formDataToSend.append(field, String(payload[field]));
            }
        });

        if (payload.items && payload.items.length > 0) {
            payload.items.forEach((item: any, index: number) => {
                const itemFields = [
                    'id',
                    'expense_date',
                    'description',
                    'amount',
                    'receipt_no',
                    'notes',
                ];
                itemFields.forEach((itemField) => {
                    if (
                        item[itemField] !== undefined &&
                        item[itemField] !== null
                    ) {
                        formDataToSend.append(
                            `items[${index}][${itemField}]`,
                            String(item[itemField]),
                        );
                    }
                });
            });
        }

        if (payload.returns && payload.returns.length > 0) {
            payload.returns.forEach((item: any, index: number) => {
                Object.entries(item).forEach(([itemKey, itemValue]) => {
                    if (itemValue !== undefined && itemValue !== null) {
                        formDataToSend.append(
                            `returns[${index}][${itemKey}]`,
                            String(itemValue),
                        );
                    }
                });
            });
        }

        if (formData.value.files?.length) {
            formData.value.files.forEach((file: any, index: number) => {
                const actualFile =
                    file instanceof File
                        ? file
                        : file.file ||
                          file.rawFile ||
                          file.originFileObj ||
                          file;

                if (actualFile instanceof File) {
                    formDataToSend.append(`files[${index}]`, actualFile);
                }
            });
        }

        const url = props.id
            ? `/api/v1/budget-accountabilities/${props.id}`
            : '/api/v1/budget-accountabilities';

        await axios.post(url, formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        toast.success('Pertanggungjawaban anggaran berhasil disimpan');
        router.visit('/pertanggungjawaban');
    } catch (error: any) {
        console.error('Submit error:', error);
        const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Terjadi kesalahan saat menyimpan data';
        toast.error(errorMessage);
    } finally {
        isSubmitting.value = false;
    }
};

const saveAsDraft = async () => {
    if (!formData.value.budget_fund_release_id) {
        toast.warning('Pencairan dana harus dipilih!');
        return;
    }

    if (!formData.value.budget_fund_release_item_id) {
        toast.warning('Pencairan dana harus dipilih!');
        return;
    }

    isSubmitting.value = true;

    try {
        const formDataToSend = new FormData();

        const expenseItemsPayload = accountabilityItems.value.map((item) => ({
            id: item.id,
            expense_date: item.expense_date,
            description: item.description,
            amount: item.amount,
            receipt_no: item.receipt_no || null,
            notes: item.notes || null,
        }));

        const returnItemsPayload = accountabilityReturns.value.map((item) => ({
            id: item.id,
            return_date: item.return_date,
            amount: item.amount,
            receipt_no: item.receipt_no || null,
            fund_source_id: item.fund_source_id || null,
            notes: item.notes || null,
        }));

        const payload = {
            accountability_no: formData.value.accountability_no,
            accountability_date: formData.value.accountability_date,
            budget_fund_release_id: formData.value.budget_fund_release_id,
            budget_fund_release_item_id:
                formData.value.budget_fund_release_item_id,
            total_received: formData.value.total_received,
            total_spent: totalSpent.value,
            total_returned: totalReturnedAmount.value,
            status: 'draft',
            notes: formData.value.notes,
            items: expenseItemsPayload,
            returns: returnItemsPayload,
        };

        if (props.id) {
            formDataToSend.append('_method', 'PUT');
        }

        const mainFields = [
            'accountability_no',
            'accountability_date',
            'budget_fund_release_id',
            'budget_fund_release_item_id',
            'total_received',
            'total_spent',
            'total_returned',
            'status',
            'notes',
        ];

        mainFields.forEach((field) => {
            if (payload[field] !== undefined && payload[field] !== null) {
                formDataToSend.append(field, String(payload[field]));
            }
        });

        if (payload.items && payload.items.length > 0) {
            payload.items.forEach((item: any, index: number) => {
                const itemFields = [
                    'id',
                    'expense_date',
                    'description',
                    'amount',
                    'receipt_no',
                    'notes',
                ];
                itemFields.forEach((itemField) => {
                    if (
                        item[itemField] !== undefined &&
                        item[itemField] !== null
                    ) {
                        formDataToSend.append(
                            `items[${index}][${itemField}]`,
                            String(item[itemField]),
                        );
                    }
                });
            });
        }

        if (payload.returns && payload.returns.length > 0) {
            payload.returns.forEach((item: any, index: number) => {
                Object.entries(item).forEach(([itemKey, itemValue]) => {
                    if (itemValue !== undefined && itemValue !== null) {
                        formDataToSend.append(
                            `returns[${index}][${itemKey}]`,
                            String(itemValue),
                        );
                    }
                });
            });
        }

        if (formData.value.files?.length) {
            formData.value.files.forEach((file: any, index: number) => {
                const actualFile =
                    file instanceof File
                        ? file
                        : file.file ||
                          file.rawFile ||
                          file.originFileObj ||
                          file;

                if (actualFile instanceof File) {
                    formDataToSend.append(`files[${index}]`, actualFile);
                }
            });
        }

        const url = props.id
            ? `/api/v1/budget-accountabilities/${props.id}`
            : '/api/v1/budget-accountabilities';

        await axios.post(url, formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        toast.success('Draft pertanggungjawaban berhasil disimpan');
        router.visit('/pertanggungjawaban');
    } catch (error: any) {
        console.error('Save draft error:', error);
        const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Terjadi kesalahan saat menyimpan draft';
        toast.error(errorMessage);
    } finally {
        isSubmitting.value = false;
    }
};

const resetForm = () => {
    if (
        confirm(
            'Apakah Anda yakin ingin mereset form? Semua data yang belum disimpan akan hilang.',
        )
    ) {
        formData.value = {
            accountability_no: '',
            accountability_date: getTodayDate(),
            budget_fund_release_id: null,
            budget_fund_release_item_id: null,
            total_received: 0,
            total_spent: 0,
            total_returned: 0,
            status: 'draft',
            notes: '',
            files: [],
        };
        selectedReleaseId.value = null;
        selectedRelease.value = null;
        selectedFundReleaseItemId.value = null;
        fundReleaseItems.value = [];
        accountabilityItems.value = [];
        accountabilityReturns.value = [];
        showItemForm.value = false;
        showReturnForm.value = false;
        resetExpenseForm();
        resetReturnForm();
        activeTab.value = 'expense';
    }
};

const goBack = () => {
    if (
        mode.value === 'create' &&
        (formData.value.budget_fund_release_id ||
            formData.value.notes ||
            accountabilityItems.value.length > 0 ||
            accountabilityReturns.value.length > 0 ||
            formData.value.files.length > 0)
    ) {
        if (
            confirm(
                'Apakah Anda yakin ingin keluar? Semua data yang belum disimpan akan hilang.',
            )
        ) {
            router.visit('/pertanggungjawaban');
        }
    } else {
        router.visit('/pertanggungjawaban');
    }
};

// Watchers
watch(selectedReleaseId, () => {
    loadReleaseDetails();
    if (mode.value === 'create') {
        accountabilityItems.value = [];
        accountabilityReturns.value = [];
        showItemForm.value = false;
        showReturnForm.value = false;
        resetExpenseForm();
        resetReturnForm();
        activeTab.value = 'expense';
    }
});

// Initialization
onMounted(async () => {
    showLoadingSkeleton.value = true;

    try {
        await loadFundSources();

        if (props.id) {
            mode.value = props.mode as 'create' | 'edit' | 'view';
            await loadAccountabilityData(props.id);
        } else {
            mode.value = 'create';
            await loadTransferredReleases();
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        showLoadingSkeleton.value = false;
    }
});
</script>

<template>
    <Head title="Pertanggungjawaban Anggaran" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="rounded-lg border bg-white p-6 shadow-sm">
            <!-- Loading Skeleton -->
            <div v-if="showLoadingSkeleton" class="space-y-6">
                <div class="mb-6 border-b pb-4">
                    <div
                        class="mb-2 h-8 w-64 animate-pulse rounded bg-gray-200"
                    ></div>
                    <div
                        class="h-4 w-48 animate-pulse rounded bg-gray-200"
                    ></div>
                </div>

                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div class="space-y-6">
                        <div v-for="i in 2" :key="i" class="space-y-2">
                            <div
                                class="h-4 w-24 animate-pulse rounded bg-gray-200"
                            ></div>
                            <div
                                class="h-10 animate-pulse rounded bg-gray-200"
                            ></div>
                        </div>
                    </div>
                    <div class="space-y-6">
                        <div v-for="i in 2" :key="i" class="space-y-2">
                            <div
                                class="h-4 w-24 animate-pulse rounded bg-gray-200"
                            ></div>
                            <div
                                class="h-10 animate-pulse rounded bg-gray-200"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Konten Utama -->
            <template v-else>
                <!-- Alert untuk mode read-only -->
                <div
                    v-if="
                        isReadOnly &&
                        formData.status !== 'draft' &&
                        formData.status !== 'returned'
                    "
                    class="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4"
                >
                    <div class="flex items-center gap-2">
                        <AlertCircle class="h-5 w-5 text-blue-600" />
                        <p class="text-sm font-medium text-blue-700">
                            Form dalam mode baca saja. Pertanggungjawaban sudah
                            diproses dan tidak dapat diedit.
                        </p>
                    </div>
                </div>

                <!-- Header Form -->
                <div class="mb-6 border-b pb-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">
                                {{
                                    mode === 'create'
                                        ? 'Buat Pertanggungjawaban'
                                        : mode === 'edit'
                                          ? 'Edit Pertanggungjawaban'
                                          : 'Detail Pertanggungjawaban'
                                }}
                            </h1>
                            <p class="mt-1 text-sm text-gray-500">
                                Formulir pertanggungjawaban penggunaan anggaran
                            </p>
                        </div>
                    </div>

                    <div class="mt-4 flex flex-wrap items-center gap-4 text-sm">
                        <div
                            v-if="
                                mode !== 'create' && formData.accountability_no
                            "
                            class="flex items-center gap-2"
                        >
                            <CalendarDays class="h-4 w-4 text-gray-400" />
                            <span class="font-bold"
                                >No Pertanggungjawaban:</span
                            >
                            <span class="font-medium">{{
                                formData.accountability_no
                            }}</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <Calendar class="h-4 w-4 text-gray-400" />
                            <span class="font-bold">Tanggal:</span>
                            <span class="font-medium"
                                >[ {{ currentDate }} ]</span
                            >
                        </div>

                        <div
                            v-if="mode !== 'create'"
                            class="ml-auto flex items-center gap-2"
                        >
                            <Info class="h-4 w-4 text-blue-500" />
                            <span class="font-bold">Status:</span>
                            <span class="text-sm font-bold text-blue-600">
                                {{ statusDescription }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Form Fields -->
                <form @submit.prevent="submitForm" class="space-y-6">
                    <div class="grid grid-cols-1 gap-6 md:grid-cols-[45%_55%]">
                        <!-- Kolom Kiri -->
                        <div class="space-y-6">
                            <div v-if="mode === 'create'" class="space-y-2">
                                <Label class="text-sm font-medium">
                                    Pilih Pencairan Dana
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Select
                                    v-model="selectedReleaseId"
                                    :disabled="isReadOnly"
                                >
                                    <SelectTrigger class="w-full">
                                        <SelectValue
                                            placeholder="Pilih Pencairan Dana"
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel
                                                >Daftar Pencairan
                                                Dana</SelectLabel
                                            >
                                            <SelectItem
                                                v-for="release in transferredReleases"
                                                :key="release.id"
                                                :value="release.id"
                                            >
                                                {{ release.fund_release_no }} -
                                                Rp
                                                {{
                                                    formatCurrency(
                                                        release.total_amount,
                                                    )
                                                }}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <p class="text-xs text-gray-500">
                                    Pilih pencairan dana yang sudah dibayarkan
                                    untuk pertanggungjawaban
                                </p>
                            </div>

                            <div
                                v-if="selectedRelease"
                                class="space-y-3 rounded-lg border bg-gray-50 p-4"
                            >
                                <h3 class="font-medium text-gray-700">
                                    Informasi Pencairan Dana
                                </h3>
                                <div class="grid grid-cols-2 gap-2 text-sm">
                                    <span class="text-gray-500"
                                        >No. Pencairan:</span
                                    >
                                    <span class="font-medium">{{
                                        selectedRelease.fund_release_no
                                    }}</span>

                                    <span class="text-gray-500"
                                        >Tanggal Pencairan:</span
                                    >
                                    <span class="font-medium">
                                        {{
                                            new Date(
                                                selectedRelease.fund_release_date,
                                            ).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                            })
                                        }}
                                    </span>

                                    <span class="text-gray-500"
                                        >No. Pengajuan:</span
                                    >
                                    <span class="font-medium">{{
                                        selectedRelease.disbursement_header
                                            ?.disbursement_no || '-'
                                    }}</span>

                                    <span class="text-gray-500">Unit:</span>
                                    <span class="font-medium text-red-600">
                                        {{
                                            selectedRelease.disbursement_header
                                                ?.request_header?.unit
                                                ?.unit_name || '-'
                                        }}
                                    </span>

                                    <span class="text-gray-500">Kegiatan:</span>
                                    <span class="font-medium">
                                        {{
                                            selectedRelease.disbursement_header
                                                ?.request_activity
                                                ?.description || '-'
                                        }}
                                    </span>

                                    <span class="text-gray-500"
                                        >Nilai Dicairkan:</span
                                    >
                                    <span class="font-bold text-green-600">
                                        Rp
                                        {{
                                            formatCurrency(
                                                selectedRelease.total_amount,
                                            )
                                        }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Kolom Kanan -->
                        <div class="space-y-6 px-4 md:px-8">
                            <!-- Pilih Detail Item Anggaran -->
                            <div
                                v-if="
                                    selectedRelease &&
                                    fundReleaseItems.length > 0
                                "
                                class="space-y-2"
                            >
                                <Label class="text-sm font-medium">
                                    Pilih Item Anggaran Kegiatan
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Select
                                    v-model="selectedFundReleaseItemId"
                                    :disabled="isReadOnly"
                                >
                                    <SelectTrigger class="w-full">
                                        <SelectValue
                                            placeholder="Pilih detail item anggaran"
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel
                                                >Daftar Item Anggaran
                                                Kegiatan</SelectLabel
                                            >
                                            <SelectItem
                                                v-for="item in fundReleaseItems"
                                                :key="item.id"
                                                :value="item.id"
                                            >
                                                {{
                                                    item.description ||
                                                    `Item #${item.id}`
                                                }}
                                                - Rp
                                                {{
                                                    formatCurrency(
                                                        item.total_amount || 0,
                                                    )
                                                }}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                <!-- <div
                                    v-if="selectedDisbursementDetailId && selectedDisbursementDetail"
                                    class="rounded-md border border-blue-200 bg-blue-50 p-3"
                                >
                                    <div class="flex items-start gap-2">
                                        <CheckCircle2 class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                                        <div class="space-y-1 text-xs text-blue-700">
                                            <p class="font-medium">{{ selectedDisbursementDetail.request_item?.description }}</p>
                                            <p>Total: Rp {{ formatCurrency(selectedDisbursementDetail.total_amount || 0) }}</p>
                                        </div>
                                    </div>
                                </div> -->
                            </div>

                            <div
                                v-else-if="
                                    selectedRelease &&
                                    fundReleaseItems.length === 0
                                "
                                class="rounded-lg border border-dashed border-gray-300 p-6 text-center"
                            >
                                <div class="flex flex-col items-center gap-3">
                                    <div
                                        class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100"
                                    >
                                        <Info class="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <p
                                            class="text-sm font-medium text-gray-600"
                                        >
                                            Tidak ada data item
                                        </p>
                                        <p class="text-xs text-gray-400">
                                            Item kegiatan tidak tersedia untuk
                                            pencairan ini
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <Label class="text-sm font-medium">
                                    Catatan
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    v-model="formData.notes"
                                    placeholder="Isikan catatan pertanggungjawaban..."
                                    class="min-h-[100px] resize-none"
                                    :maxlength="1000"
                                    :disabled="isReadOnly"
                                />
                                <div class="flex justify-end">
                                    <span class="text-xs text-gray-500"
                                        >{{
                                            formData.notes?.length ?? 0
                                        }}/1000</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TABS: Detail Item & Dokumen Pendukung -->
                    <div class="border-t pt-6">
                        <!-- Tabs Navigation -->
                        <div class="mb-4 border-b">
                            <nav class="flex space-x-1" aria-label="Tabs">
                                <!-- Tab Pengeluaran -->
                                <button
                                    type="button"
                                    @click="activeTab = 'expense'"
                                    :class="[
                                        'flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-all',
                                        activeTab === 'expense'
                                            ? '-mb-px border border-b-white bg-white text-red-700 shadow-sm'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800',
                                    ]"
                                >
                                    <Wallet class="h-4 w-4" />
                                    <div class="flex flex-col items-start">
                                        <span class="font-semibold"
                                            >Pengeluaran Dana</span
                                        >
                                        <span
                                            class="text-xs font-normal text-gray-500"
                                            >Belanja & Operasional</span
                                        >
                                    </div>
                                    <span
                                        v-if="accountabilityItems.length > 0"
                                        class="ml-2 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700"
                                    >
                                        {{ accountabilityItems.length }}
                                    </span>
                                </button>

                                <!-- Tab Pengembalian -->
                                <button
                                    type="button"
                                    @click="activeTab = 'return'"
                                    :class="[
                                        'flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-all',
                                        activeTab === 'return'
                                            ? '-mb-px border border-b-white bg-white text-blue-700 shadow-sm'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800',
                                    ]"
                                >
                                    <Banknote class="h-4 w-4" />
                                    <div class="flex flex-col items-start">
                                        <span class="font-semibold"
                                            >Pengembalian Dana</span
                                        >
                                        <span
                                            class="text-xs font-normal text-gray-500"
                                            >Sisa / Tidak Terpakai</span
                                        >
                                    </div>
                                    <span
                                        v-if="accountabilityReturns.length > 0"
                                        class="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700"
                                    >
                                        {{ accountabilityReturns.length }}
                                    </span>
                                </button>

                                <!-- Tab Dokumen Pendukung -->
                                <button
                                    type="button"
                                    @click="activeTab = 'documents'"
                                    :class="[
                                        'flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-all',
                                        activeTab === 'documents'
                                            ? '-mb-px border border-b-white bg-white text-green-700 shadow-sm'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800',
                                    ]"
                                >
                                    <Paperclip class="h-4 w-4" />
                                    <div class="flex flex-col items-start">
                                        <span class="font-semibold"
                                            >Dokumen Pendukung</span
                                        >
                                        <span
                                            class="text-xs font-normal text-gray-500"
                                            >Bukti & Lampiran</span
                                        >
                                    </div>
                                    <span
                                        v-if="formData.files.length > 0"
                                        class="ml-2 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700"
                                    >
                                        {{ formData.files.length }}
                                    </span>
                                </button>
                            </nav>
                        </div>

                        <!-- Tab Content Area -->
                        <div class="rounded-lg border bg-white p-4">
                            <!-- SECTION: PENGELUARAN DANA -->
                            <div v-if="activeTab === 'expense'">
                                <div
                                    class="mb-4 flex items-center justify-between"
                                >
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100"
                                        >
                                            <Wallet
                                                class="h-5 w-5 text-red-600"
                                            />
                                        </div>
                                        <div>
                                            <h4
                                                class="font-semibold text-gray-900"
                                            >
                                                Rincian Pengeluaran Dana
                                            </h4>
                                            <p class="text-xs text-gray-500">
                                                Catat pengeluaran dari dana yang
                                                diterima
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        v-if="canAddItem && !showItemForm"
                                        type="button"
                                        variant="outline"
                                        @click="openAddExpenseForm"
                                        class="gap-2 border-red-600 text-red-700 hover:bg-red-50"
                                    >
                                        <Plus class="h-4 w-4" />
                                        Tambah Pengeluaran
                                    </Button>
                                </div>

                                <!-- Form Input/Tambah Pengeluaran -->
                                <div
                                    v-if="showItemForm && canAddItem"
                                    class="mb-4 rounded-lg border-2 border-red-200 bg-red-50 p-4"
                                >
                                    <div
                                        class="mb-3 flex items-center justify-between"
                                    >
                                        <div class="flex items-center gap-2">
                                            <div
                                                class="flex h-8 w-8 items-center justify-center rounded-full bg-red-200"
                                            >
                                                <Pencil
                                                    class="h-4 w-4 text-red-700"
                                                />
                                            </div>
                                            <h4
                                                class="font-medium text-red-800"
                                            >
                                                {{
                                                    editingItemIndex !== null
                                                        ? 'Edit'
                                                        : 'Tambah'
                                                }}
                                                Pengeluaran
                                            </h4>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            @click="cancelExpenseForm"
                                            class="h-8 w-8 p-0"
                                        >
                                            <X class="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div class="space-y-4">
                                        <div
                                            class="grid grid-cols-1 gap-4 md:grid-cols-3"
                                        >
                                            <div class="space-y-2">
                                                <Label
                                                    class="text-sm font-medium"
                                                >
                                                    Tanggal Pengeluaran
                                                    <span class="text-red-500"
                                                        >*</span
                                                    >
                                                </Label>
                                                <Input
                                                    v-model="
                                                        expenseForm.expense_date
                                                    "
                                                    type="date"
                                                    :max="getTodayDate()"
                                                />
                                            </div>

                                            <div class="space-y-2">
                                                <Label
                                                    class="text-sm font-medium"
                                                    >Nomor
                                                    Resi/Nota/Invoice</Label
                                                >
                                                <Input
                                                    v-model="
                                                        expenseForm.receipt_no
                                                    "
                                                    type="text"
                                                    placeholder="Contoh: INV-2024-001"
                                                    maxlength="50"
                                                />
                                            </div>

                                            <div class="space-y-2">
                                                <Label
                                                    class="text-sm font-medium"
                                                >
                                                    Jumlah Pengeluaran (Rp)
                                                    <span class="text-red-500"
                                                        >*</span
                                                    >
                                                </Label>
                                                <Input
                                                    v-model.number="
                                                        expenseForm.amount
                                                    "
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    step="1000"
                                                    class="font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div class="space-y-2">
                                            <Label class="text-sm font-medium">
                                                Uraian Pengeluaran
                                                <span class="text-red-500"
                                                    >*</span
                                                >
                                            </Label>
                                            <Textarea
                                                v-model="
                                                    expenseForm.description
                                                "
                                                placeholder="Jelaskan detail penggunaan dana..."
                                                class="min-h-[80px] resize-none"
                                                :maxlength="255"
                                            />
                                        </div>

                                        <div class="space-y-2">
                                            <Label class="text-sm font-medium"
                                                >Keterangan Tambahan</Label
                                            >
                                            <Input
                                                v-model="expenseForm.notes"
                                                type="text"
                                                placeholder="Info tambahan (opsional)"
                                                maxlength="255"
                                            />
                                        </div>
                                    </div>

                                    <div class="mt-4 flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            @click="cancelExpenseForm"
                                            >Batal</Button
                                        >
                                        <Button
                                            type="button"
                                            @click="addExpenseItem"
                                            :disabled="!isExpenseFormValid"
                                            class="gap-2 bg-red-600 text-white hover:bg-red-700"
                                        >
                                            <CheckCircle2 class="h-4 w-4" />
                                            {{
                                                editingItemIndex !== null
                                                    ? 'Update'
                                                    : 'Simpan'
                                            }}
                                        </Button>
                                    </div>
                                </div>

                                <!-- Table Pengeluaran -->
                                <div class="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow class="bg-red-50">
                                                <TableHead class="w-12"
                                                    >No</TableHead
                                                >
                                                <TableHead class="w-32"
                                                    >Tanggal</TableHead
                                                >
                                                <TableHead
                                                    >Uraian
                                                    Pengeluaran</TableHead
                                                >
                                                <TableHead class="w-32"
                                                    >Nomor
                                                    Resi/Nota/Invoice</TableHead
                                                >
                                                <TableHead
                                                    class="w-40 text-right"
                                                    >Jumlah</TableHead
                                                >
                                                <TableHead
                                                    v-if="
                                                        isEditMode &&
                                                        !isReadOnly
                                                    "
                                                    class="w-24"
                                                    >Aksi</TableHead
                                                >
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <template
                                                v-if="
                                                    accountabilityItems.length >
                                                    0
                                                "
                                            >
                                                <TableRow
                                                    v-for="(
                                                        item, index
                                                    ) in accountabilityItems"
                                                    :key="
                                                        item.tempId || item.id
                                                    "
                                                    class="hover:bg-red-50/50"
                                                >
                                                    <TableCell
                                                        class="font-medium"
                                                        >{{
                                                            index + 1
                                                        }}</TableCell
                                                    >
                                                    <TableCell>
                                                        {{
                                                            new Date(
                                                                item.expense_date,
                                                            ).toLocaleDateString(
                                                                'id-ID',
                                                                {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                },
                                                            )
                                                        }}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div class="space-y-1">
                                                            <span
                                                                class="text-sm font-medium"
                                                                >{{
                                                                    item.description
                                                                }}</span
                                                            >
                                                            <span
                                                                v-if="
                                                                    item.notes
                                                                "
                                                                class="block text-xs text-gray-500"
                                                                >Catatan:
                                                                {{
                                                                    item.notes
                                                                }}</span
                                                            >
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            v-if="
                                                                item.receipt_no
                                                            "
                                                            class="text-sm"
                                                            >{{
                                                                item.receipt_no
                                                            }}</span
                                                        >
                                                        <span
                                                            v-else
                                                            class="text-xs text-gray-400"
                                                            >-</span
                                                        >
                                                    </TableCell>
                                                    <TableCell
                                                        class="text-right"
                                                    >
                                                        <span
                                                            class="font-semibold text-red-700"
                                                            >Rp
                                                            {{
                                                                formatCurrency(
                                                                    item.amount,
                                                                )
                                                            }}</span
                                                        >
                                                    </TableCell>
                                                    <TableCell
                                                        v-if="
                                                            isEditMode &&
                                                            !isReadOnly
                                                        "
                                                    >
                                                        <div class="flex gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                @click="
                                                                    editExpenseItem(
                                                                        index,
                                                                    )
                                                                "
                                                                class="h-8 w-8 p-0"
                                                            >
                                                                <Pencil
                                                                    class="h-4 w-4"
                                                                />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                @click="
                                                                    removeExpenseItem(
                                                                        index,
                                                                    )
                                                                "
                                                                class="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2
                                                                    class="h-4 w-4"
                                                                />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </template>
                                            <TableRow v-else>
                                                <TableCell
                                                    :colspan="
                                                        isEditMode &&
                                                        !isReadOnly
                                                            ? 5
                                                            : 4
                                                    "
                                                    class="py-8 text-center"
                                                >
                                                    <div
                                                        class="flex flex-col items-center gap-3"
                                                    >
                                                        <div
                                                            class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100"
                                                        >
                                                            <Wallet
                                                                class="h-6 w-6 text-red-600"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p
                                                                class="text-sm font-medium text-gray-600"
                                                            >
                                                                Belum ada
                                                                pengeluaran
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <!-- SECTION: PENGEMBALIAN DANA -->
                            <div v-if="activeTab === 'return'">
                                <div
                                    class="mb-4 flex items-center justify-between"
                                >
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"
                                        >
                                            <Banknote
                                                class="h-5 w-5 text-blue-600"
                                            />
                                        </div>
                                        <div>
                                            <h4
                                                class="font-semibold text-gray-900"
                                            >
                                                Rincian Pengembalian Dana
                                            </h4>
                                            <p class="text-xs text-gray-500">
                                                Catat dana yang dikembalikan
                                                (sisa/tidak terpakai)
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        v-if="canAddItem && !showReturnForm"
                                        type="button"
                                        variant="outline"
                                        @click="openAddReturnForm"
                                        class="gap-2 border-blue-600 text-blue-700 hover:bg-blue-50"
                                    >
                                        <Plus class="h-4 w-4" />
                                        Tambah Pengembalian
                                    </Button>
                                </div>

                                <!-- Form Input Pengembalian -->
                                <div
                                    v-if="showReturnForm && canAddItem"
                                    class="mb-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4"
                                >
                                    <div
                                        class="mb-3 flex items-center justify-between"
                                    >
                                        <div class="flex items-center gap-2">
                                            <div
                                                class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200"
                                            >
                                                <Pencil
                                                    class="h-4 w-4 text-blue-700"
                                                />
                                            </div>
                                            <h4
                                                class="font-medium text-blue-800"
                                            >
                                                {{
                                                    editingReturnIndex !== null
                                                        ? 'Edit'
                                                        : 'Tambah'
                                                }}
                                                Pengembalian
                                            </h4>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            @click="cancelReturnForm"
                                            class="h-8 w-8 p-0"
                                        >
                                            <X class="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div
                                        class="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3"
                                    >
                                        <div class="flex items-start gap-2">
                                            <Info
                                                class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600"
                                            />
                                            <p class="text-xs text-blue-700">
                                                Pengembalian dana adalah sisa
                                                dana yang tidak terpakai dan
                                                dikembalikan ke kas.
                                            </p>
                                        </div>
                                    </div>

                                    <div class="space-y-4">
                                        <div
                                            class="grid grid-cols-1 gap-4 md:grid-cols-2"
                                        >
                                            <div class="space-y-2">
                                                <Label
                                                    class="text-sm font-medium"
                                                >
                                                    Tanggal Pengembalian
                                                    <span class="text-red-500"
                                                        >*</span
                                                    >
                                                </Label>
                                                <Input
                                                    v-model="
                                                        returnForm.return_date
                                                    "
                                                    type="date"
                                                    :max="getTodayDate()"
                                                />
                                            </div>

                                            <div class="space-y-2">
                                                <Label
                                                    class="text-sm font-medium"
                                                >
                                                    Jumlah Dikembalikan (Rp)
                                                    <span class="text-red-500"
                                                        >*</span
                                                    >
                                                </Label>
                                                <Input
                                                    v-model.number="
                                                        returnForm.amount
                                                    "
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    step="1000"
                                                    class="font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div
                                            class="grid grid-cols-1 gap-4 md:grid-cols-2"
                                        >
                                            <div class="space-y-2">
                                                <Label
                                                    class="text-sm font-medium"
                                                    >Nomor Bukti
                                                    Transfer/Setoran</Label
                                                >
                                                <Input
                                                    v-model="
                                                        returnForm.receipt_no
                                                    "
                                                    type="text"
                                                    placeholder="Nomor bukti transfer/setoran"
                                                    maxlength="50"
                                                />
                                            </div>

                                            <div class="space-y-2">
                                                <Label
                                                    class="text-sm font-medium"
                                                    >Sumber Dana</Label
                                                >
                                                <Select
                                                    v-model="
                                                        returnForm.fund_source_id
                                                    "
                                                >
                                                    <SelectTrigger
                                                        class="w-full"
                                                    >
                                                        <SelectValue
                                                            placeholder="Pilih sumber dana"
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            v-for="source in fundSources"
                                                            :key="source.id"
                                                            :value="source.id"
                                                        >
                                                            {{ source.name }}
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div class="space-y-2">
                                            <Label class="text-sm font-medium">
                                                Keterangan Pengembalian
                                                <span class="text-red-500"
                                                    >*</span
                                                >
                                            </Label>
                                            <Textarea
                                                v-model="returnForm.notes"
                                                placeholder="Jelaskan alasan pengembalian dana..."
                                                class="min-h-[80px] resize-none"
                                                :maxlength="255"
                                            />
                                        </div>
                                    </div>

                                    <div class="mt-4 flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            @click="cancelReturnForm"
                                            >Batal</Button
                                        >
                                        <Button
                                            type="button"
                                            @click="addReturnItem"
                                            :disabled="!isReturnFormValid"
                                            class="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                        >
                                            <CheckCircle2 class="h-4 w-4" />
                                            {{
                                                editingReturnIndex !== null
                                                    ? 'Update'
                                                    : 'Simpan'
                                            }}
                                        </Button>
                                    </div>
                                </div>

                                <!-- Table Pengembalian -->
                                <div class="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow class="bg-blue-50">
                                                <TableHead class="w-12"
                                                    >No</TableHead
                                                >
                                                <TableHead class="w-32"
                                                    >Tanggal</TableHead
                                                >
                                                <TableHead
                                                    >Keterangan</TableHead
                                                >
                                                <TableHead class="w-40"
                                                    >Nomor Bukti
                                                    Transfer/Setoran</TableHead
                                                >
                                                <TableHead class="w-40"
                                                    >Sumber Dana</TableHead
                                                >
                                                <TableHead
                                                    class="w-40 text-right"
                                                    >Jumlah</TableHead
                                                >
                                                <TableHead
                                                    v-if="
                                                        isEditMode &&
                                                        !isReadOnly
                                                    "
                                                    class="w-24"
                                                    >Aksi</TableHead
                                                >
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <template
                                                v-if="
                                                    accountabilityReturns.length >
                                                    0
                                                "
                                            >
                                                <TableRow
                                                    v-for="(
                                                        item, index
                                                    ) in accountabilityReturns"
                                                    :key="
                                                        item.tempId || item.id
                                                    "
                                                    class="hover:bg-blue-50/50"
                                                >
                                                    <TableCell
                                                        class="font-medium"
                                                        >{{
                                                            index + 1
                                                        }}</TableCell
                                                    >
                                                    <TableCell>
                                                        {{
                                                            new Date(
                                                                item.return_date,
                                                            ).toLocaleDateString(
                                                                'id-ID',
                                                                {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                },
                                                            )
                                                        }}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span class="text-sm">{{
                                                            item.notes
                                                        }}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            v-if="
                                                                item.receipt_no
                                                            "
                                                            class="text-sm"
                                                            >{{
                                                                item.receipt_no
                                                            }}</span
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
                                                                item.fund_source_id
                                                            "
                                                            class="text-sm"
                                                            >{{
                                                                getFundSourceName(
                                                                    item.fund_source_id,
                                                                )
                                                            }}</span
                                                        >
                                                        <span
                                                            v-else
                                                            class="text-xs text-gray-400"
                                                            >-</span
                                                        >
                                                    </TableCell>
                                                    <TableCell
                                                        class="text-right"
                                                    >
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
                                                    <TableCell
                                                        v-if="
                                                            isEditMode &&
                                                            !isReadOnly
                                                        "
                                                    >
                                                        <div class="flex gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                @click="
                                                                    editReturnItem(
                                                                        index,
                                                                    )
                                                                "
                                                                class="h-8 w-8 p-0"
                                                            >
                                                                <Pencil
                                                                    class="h-4 w-4"
                                                                />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                @click="
                                                                    removeReturnItem(
                                                                        index,
                                                                    )
                                                                "
                                                                class="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2
                                                                    class="h-4 w-4"
                                                                />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </template>
                                            <TableRow v-else>
                                                <TableCell
                                                    :colspan="
                                                        isEditMode &&
                                                        !isReadOnly
                                                            ? 7
                                                            : 6
                                                    "
                                                    class="py-8 text-center"
                                                >
                                                    <div
                                                        class="flex flex-col items-center gap-3"
                                                    >
                                                        <div
                                                            class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100"
                                                        >
                                                            <Banknote
                                                                class="h-6 w-6 text-blue-600"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p
                                                                class="text-sm font-medium text-gray-600"
                                                            >
                                                                Belum ada
                                                                pengembalian
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <!-- SECTION: DOKUMEN PENDUKUNG -->
                            <div v-if="activeTab === 'documents'">
                                <div
                                    class="mb-4 flex items-center justify-between"
                                >
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100"
                                        >
                                            <Paperclip
                                                class="h-5 w-5 text-green-600"
                                            />
                                        </div>
                                        <div>
                                            <h4
                                                class="font-semibold text-gray-900"
                                            >
                                                Dokumen Pendukung
                                            </h4>
                                            <p class="text-xs text-gray-500">
                                                Upload bukti-bukti pendukung
                                                pertanggungjawaban
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        v-if="formData.files.length > 0"
                                        class="flex items-center gap-2 text-sm text-gray-500"
                                    >
                                        <FileText class="h-4 w-4" />
                                        <span
                                            >{{ formData.files.length }} file
                                            ({{
                                                formatTotalFileSize(
                                                    formData.files,
                                                )
                                            }})</span
                                        >
                                    </div>
                                </div>

                                <!-- File Upload Component -->
                                <div
                                    class="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-6"
                                >
                                    <FileUpload
                                        v-model="formData.files"
                                        :disabled="isReadOnly"
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
                                        @file-added="handleFileAdded"
                                        @file-removed="handleFileRemoved"
                                        @file-error="handleFileError"
                                        :view-only="isReadOnly"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Summary -->
                    <div class="border-t pt-6">
                        <div class="flex items-start justify-end">
                            <div
                                class="w-full max-w-96 space-y-3 rounded-lg border bg-gray-50 p-4"
                            >
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600"
                                        >Total Diterima:</span
                                    >
                                    <span class="font-medium text-green-600"
                                        >Rp
                                        {{
                                            formatCurrency(
                                                formData.total_received,
                                            )
                                        }}</span
                                    >
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600"
                                        >Total Pengeluaran:</span
                                    >
                                    <span class="font-medium text-orange-600"
                                        >Rp
                                        {{ formatCurrency(totalSpent) }}</span
                                    >
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600"
                                        >Total Pengembalian:</span
                                    >
                                    <span class="font-medium text-blue-600"
                                        >Rp
                                        {{
                                            formatCurrency(totalReturnedAmount)
                                        }}</span
                                    >
                                </div>
                                <div class="flex justify-between border-t pt-2">
                                    <span class="font-medium text-gray-800"
                                        >Sisa:</span
                                    >
                                    <span
                                        class="text-lg font-bold"
                                        :class="
                                            remainingBalance >= 0
                                                ? 'text-blue-600'
                                                : 'text-red-600'
                                        "
                                    >
                                        Rp
                                        {{ formatCurrency(remainingBalance) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="isBackgroundProcessing"
                        class="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white shadow-lg"
                    >
                        <div
                            class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        ></div>
                        <span class="text-sm font-medium"
                            >Memproses data...</span
                        >
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-3 border-t pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            @click="goBack"
                            class="gap-2 border-gray-300 hover:bg-gray-50"
                        >
                            <ArrowLeft class="h-4 w-4" />Kembali
                        </Button>

                        <div v-if="!isReadOnly" class="flex space-x-2">
                            <Button
                                v-if="mode === 'create'"
                                type="button"
                                variant="outline"
                                @click="resetForm"
                                class="gap-2 border-gray-300 hover:bg-gray-50"
                                :disabled="isSubmitting"
                            >
                                <RotateCcw class="h-4 w-4" />Reset
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                @click="saveAsDraft"
                                class="gap-2"
                                :disabled="isSubmitting"
                            >
                                <Save class="h-4 w-4" />Simpan Draft
                            </Button>
                            <Button
                                type="submit"
                                class="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                :disabled="isSubmitting"
                            >
                                <CheckCircle2 class="h-4 w-4" />
                                {{
                                    isSubmitting
                                        ? 'Menyimpan...'
                                        : 'Ajukan Pertanggungjawaban'
                                }}
                            </Button>
                        </div>
                    </div>
                </form>
            </template>
        </div>
    </AppLayout>
</template>

<style scoped>
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 768px) {
    .grid-cols-2 {
        grid-template-columns: 1fr;
    }
}
</style>
