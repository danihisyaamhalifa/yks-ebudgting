<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { Badge } from '@/components/ui/badge';
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
import Textarea from '@/components/ui/textarea/Textarea.vue';
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import axios, { AxiosError } from 'axios';
import {
    AlertCircleIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    BanIcon,
    CheckCircleIcon,
    ClockIcon,
    EditIcon,
    EyeIcon,
    FilterIcon,
    MinusIcon,
    PlusIcon,
    TrashIcon,
    XIcon,
} from 'lucide-vue-next';
import { computed, h, onMounted, reactive, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

// Types
interface FundSource {
    id: number;
    code: string;
    name: string;
}

interface CashMutation {
    id: number;
    mutation_no: string;
    mutation_date: string;
    fund_source_id: number;
    type: string;
    amount: number;
    description: string;
    source_type: string | null;
    source_id: number | null;
    balance: number;
    notes: string;
    fund_source?: FundSource;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Mutasi Kas',
        href: '',
    },
];

// Enum untuk mutation type
const mutationTypes = [
    { value: 'in', label: 'Kas Masuk' },
    { value: 'out', label: 'Kas Keluar' },
    { value: 'adjustment', label: 'Penyesuaian' },
] as const;

const getMutationTypeBadge = (type: string) => {
    switch (type) {
        case 'in':
            return {
                class: 'bg-green-100 text-green-700 border-green-200',
                icon: ArrowUpIcon,
                iconClass: 'text-green-600',
            };
        case 'out':
            return {
                class: 'bg-red-100 text-red-700 border-red-200',
                icon: ArrowDownIcon,
                iconClass: 'text-red-600',
            };
        case 'adjustment':
            return {
                class: 'bg-purple-100 text-purple-700 border-purple-200',
                icon: MinusIcon,
                iconClass: 'text-purple-600',
            };
        default:
            return {
                class: 'bg-gray-100 text-gray-700 border-gray-200',
                icon: MinusIcon,
                iconClass: 'text-gray-600',
            };
    }
};

// Amount color helper
const getAmountColor = (type: string) => {
    switch (type) {
        case 'in':
            return 'text-green-600';
        case 'out':
            return 'text-red-600';
        default:
            return 'text-gray-900';
    }
};

// Cash mutation columns
const columns: ColumnDef<CashMutation>[] = [
    createColumn({
        value: 'mutation_no',
        title: 'No. Mutasi',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            return row.original.mutation_no;
        },
    }),
    createColumn({
        value: 'mutation_date',
        title: 'Tanggal',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const dateValue = row.original.mutation_date;
            if (!dateValue) return '-';

            return new Date(dateValue).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        },
    }),
    createColumn({
        value: 'type',
        title: 'Tipe Mutasi',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const type = row.original.type;
            const matchedType = mutationTypes.find((t) => t.value === type);
            const badgeStyle = getMutationTypeBadge(type);

            return h(
                Badge,
                {
                    variant: 'secondary',
                    class: badgeStyle.class,
                },
                [
                    h(badgeStyle.icon, {
                        class: `w-3.5 h-3.5 mr-1 ${badgeStyle.iconClass}`,
                    }),
                    matchedType ? matchedType.label : type,
                ],
            );
        },
    }),
    createColumn({
        value: 'fund_source_id',
        title: 'Sumber Dana',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.fund_source?.name || '-';
        },
    }),
    createColumn({
        value: 'amount',
        title: 'Jumlah',
        sortable: true,
        searchable: true,
        align: 'right',
        render: ({ row }) => {
            const type = row.original.type;
            const amountColor = getAmountColor(type);
            const prefix = type === 'in' ? '+' : type === 'out' ? '-' : '';

            return h(
                'span',
                { class: `font-medium ${amountColor}` },
                `${prefix}${new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(row.original.amount || 0)}`,
            );
        },
    }),
    createColumn({
        value: 'balance',
        title: 'Saldo',
        sortable: true,
        searchable: false,
        align: 'right',
        render: ({ row }) => {
            return h(
                'span',
                { class: 'font-medium text-blue-600' },
                new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(row.original.balance || 0),
            );
        },
    }),
    createColumn({
        value: 'description',
        title: 'Deskripsi',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.description || '-';
        },
    }),
    createColumn({
        value: 'notes',
        title: 'Catatan',
        sortable: false,
        searchable: true,
        render: ({ row }) => {
            return row.original.notes || '-';
        },
    }),

    createActionColumn([
        {
            icon: EyeIcon,
            variant: 'outline',
            onClick: (row: CashMutation) => viewCashMutation(row),
        },
        {
            icon: EditIcon,
            variant: 'default',
            show: (row: CashMutation) =>
                row.source_type == null,
            onClick: (row: CashMutation) => updateCashMutation(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            show: (row: CashMutation) =>
                row.source_type == null,
            onClick: (row: CashMutation) => deleteCashMutation(row),
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/cash-mutations',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari mutasi kas...',
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    refreshable: true,
});

// management states
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const showViewDialog = ref(false);
const loading = ref(false);

// Fund sources data
const fundSources = ref<FundSource[]>([]);
const loadingFundSources = ref(false);

// Filter states
const filterFundSourceId = ref<number | null>(null);
const filterType = ref<string | null>(null);
const filterDateFrom = ref<string>('');
const filterDateTo = ref<string>('');
const showFilters = ref(false);

// form data
const cashMutationForm = reactive({
    id: '',
    mutation_no: '',
    mutation_date: new Date().toISOString().split('T')[0],
    fund_source_id: null as number | null,
    type: '' as string,
    amount: 0,
    description: '',
    notes: '',
});

const cashMutationToDelete = ref<CashMutation | null>(null);

// Individual field errors
const fieldErrors = reactive({
    mutation_date: [] as string[],
    type: [] as string[],
    fund_source_id: [] as string[],
    amount: [] as string[],
    description: [] as string[],
    notes: [] as string[],
    general: [] as string[],
});

const showValidationErrors = ref(false);

// Fetch fund sources
const fetchFundSources = async () => {
    loadingFundSources.value = true;
    try {
        const { data } = await axios.get('/api/v1/select/fund-sources');
        fundSources.value = data.data || [];
    } catch (error) {
        console.error('Error fetching fund sources:', error);
        toast.error('Gagal memuat data sumber dana');
    } finally {
        loadingFundSources.value = false;
    }
};

// Apply filters
const applyFilters = () => {
    const params: Record<string, any> = {};

    if (filterFundSourceId.value) {
        params.fund_source_id = filterFundSourceId.value;
    }
    else {
       params.fund_source_id = null;
    }

    if (filterType.value) {
        params.type = filterType.value;
    }
    else {
        params.type = null;
    }


    if (filterDateFrom.value) {
        params.mutation_date = filterDateFrom.value;
    }
    else {
        params.mutation_date = null;
    }

    if (filterDateTo.value) {
        params.mutation_date = filterDateTo.value;
    }
    else {
        params.mutation_date = null;
    }


    dataTable.actions.filter(params);
};

// Reset filters
const resetFilters = () => {
    filterFundSourceId.value = null;
    filterType.value = null;
    filterDateFrom.value = '';
    filterDateTo.value = '';

    applyFilters();
    showFilters.value = false;
};

// Clear single filter
const clearFilterFundSource = () => {
    filterFundSourceId.value = null;
    applyFilters();
};

const clearFilterType = () => {
    filterType.value = null;
    applyFilters();
};

const clearFilterDates = () => {
    filterDateFrom.value = '';
    filterDateTo.value = '';
    applyFilters();
};

// Check if any filter is active
const hasActiveFilters = computed(() => {
    return (
        filterFundSourceId.value ||
        filterType.value ||
        filterDateFrom.value ||
        filterDateTo.value
    );
});

// Reset validation
const resetValidation = () => {
    fieldErrors.mutation_date = [];
    fieldErrors.type = [];
    fieldErrors.fund_source_id = [];
    fieldErrors.amount = [];
    fieldErrors.description = [];
    fieldErrors.notes = [];
    fieldErrors.general = [];
    showValidationErrors.value = false;
};

// Validation function
const validateForm = (): boolean => {
    // Reset errors
    resetValidation();

    // Mutation Date validation
    if (
        !cashMutationForm.mutation_date ||
        cashMutationForm.mutation_date.trim() === ''
    ) {
        fieldErrors.mutation_date.push('Tanggal mutasi wajib diisi');
    } else {
        const mutationDate = new Date(cashMutationForm.mutation_date);
        if (isNaN(mutationDate.getTime())) {
            fieldErrors.mutation_date.push('Format tanggal tidak valid');
        }
    }

    // Mutation Type validation
    if (!cashMutationForm.type || cashMutationForm.type.trim() === '') {
        fieldErrors.type.push('Tipe mutasi wajib dipilih');
    } else if (!mutationTypes.some((t) => t.value === cashMutationForm.type)) {
        fieldErrors.type.push('Tipe mutasi tidak valid');
    }

    // Fund Source validation
    if (!cashMutationForm.fund_source_id) {
        fieldErrors.fund_source_id.push('Sumber dana wajib dipilih');
    }

    // Amount validation
    if (!cashMutationForm.amount || cashMutationForm.amount <= 0) {
        fieldErrors.amount.push(
            'Jumlah mutasi wajib diisi dan harus lebih dari 0',
        );
    } else if (cashMutationForm.amount > 999999999999) {
        fieldErrors.amount.push('Jumlah mutasi terlalu besar');
    }

    // Description validation (optional, but validate if filled)
    if (
        cashMutationForm.description &&
        cashMutationForm.description.trim() !== ''
    ) {
        if (cashMutationForm.description.trim().length > 255) {
            fieldErrors.description.push('Deskripsi maksimal 255 karakter');
        }
    }

    // Notes validation (optional, but validate if filled)
    if (cashMutationForm.notes && cashMutationForm.notes.trim() !== '') {
        if (cashMutationForm.notes.trim().length > 500) {
            fieldErrors.notes.push('Catatan maksimal 500 karakter');
        }
    }

    showValidationErrors.value = true;

    const hasErrors =
        fieldErrors.mutation_date.length > 0 ||
        fieldErrors.type.length > 0 ||
        fieldErrors.fund_source_id.length > 0 ||
        fieldErrors.amount.length > 0 ||
        fieldErrors.description.length > 0 ||
        fieldErrors.notes.length > 0 ||
        fieldErrors.general.length > 0;

    return !hasErrors;
};

// Computed property for form validity
const isFormValid = computed(() => {
    if (!showValidationErrors.value) return true;

    return (
        fieldErrors.mutation_date.length === 0 &&
        fieldErrors.type.length === 0 &&
        fieldErrors.fund_source_id.length === 0 &&
        fieldErrors.amount.length === 0 &&
        fieldErrors.description.length === 0 &&
        fieldErrors.notes.length === 0 &&
        fieldErrors.general.length === 0
    );
});

// Watch form changes to clear errors
watch(
    () => cashMutationForm.mutation_date,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.mutation_date = [];
        }
    },
);

watch(
    () => cashMutationForm.type,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.type = [];
        }
    },
);

watch(
    () => cashMutationForm.fund_source_id,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.fund_source_id = [];
        }
    },
);

watch(
    () => cashMutationForm.amount,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.amount = [];
        }
    },
);

watch(
    () => cashMutationForm.description,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.description = [];
        }
    },
);

watch(
    () => cashMutationForm.notes,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.notes = [];
        }
    },
);

// Handle server errors
const handleServerErrors = (errors: Record<string, string[]>) => {
    resetValidation();

    if (errors.mutation_date) {
        fieldErrors.mutation_date = Array.isArray(errors.mutation_date)
            ? errors.mutation_date
            : [errors.mutation_date];
    }
    if (errors.type) {
        fieldErrors.type = Array.isArray(errors.type)
            ? errors.type
            : [errors.type];
    }
    if (errors.fund_source_id) {
        fieldErrors.fund_source_id = Array.isArray(errors.fund_source_id)
            ? errors.fund_source_id
            : [errors.fund_source_id];
    }
    if (errors.amount) {
        fieldErrors.amount = Array.isArray(errors.amount)
            ? errors.amount
            : [errors.amount];
    }
    if (errors.description) {
        fieldErrors.description = Array.isArray(errors.description)
            ? errors.description
            : [errors.description];
    }
    if (errors.notes) {
        fieldErrors.notes = Array.isArray(errors.notes)
            ? errors.notes
            : [errors.notes];
    }

    showValidationErrors.value = true;
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
                if (axiosError.response?.data?.errors) {
                    handleServerErrors(axiosError.response.data.errors);
                }
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

// reset form
const resetForm = () => {
    Object.assign(cashMutationForm, {
        id: '',
        mutation_no: '',
        mutation_date: new Date().toISOString().split('T')[0],
        fund_source_id: null as number | null,
        type: '' as string,
        amount: 0,
        description: '',
        notes: '',
    });
    resetValidation();
};

// init form data
const createCashMutation = async () => {
    resetForm();
    showCreateDialog.value = true;
};

const viewCashMutation = (cashMutation: CashMutation) => {
    resetForm();
    Object.assign(cashMutationForm, {
        id: cashMutation.id,
        mutation_no: cashMutation.mutation_no,
        mutation_date:
            cashMutation.mutation_date?.split('T')[0] ||
            new Date().toISOString().split('T')[0],
        fund_source_id: cashMutation.fund_source_id,
        type: cashMutation.type,
        amount: cashMutation.amount,
        description: cashMutation.description || '',
        notes: cashMutation.notes || '',
    });
    showViewDialog.value = true;
};

const updateCashMutation = async (cashMutation: CashMutation) => {
    resetForm();
    Object.assign(cashMutationForm, {
        id: cashMutation.id,
        mutation_no: cashMutation.mutation_no,
        mutation_date:
            cashMutation.mutation_date?.split('T')[0] ||
            new Date().toISOString().split('T')[0],
        fund_source_id: cashMutation.fund_source_id,
        type: cashMutation.type,
        amount: cashMutation.amount,
        description: cashMutation.description || '',
        notes: cashMutation.notes || '',
    });
    showEditDialog.value = true;
};

const deleteCashMutation = (cashMutation: CashMutation) => {
    cashMutationToDelete.value = cashMutation;
    showDeleteDialog.value = true;
};

// handle create cash mutation
const handleCreateCashMutation = async () => {
    if (!validateForm()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.post('/api/v1/cash-mutations', cashMutationForm);

        toast.success('Mutasi kas berhasil ditambahkan!', {
            description: `Mutasi ${cashMutationForm.mutation_no || 'baru'} telah dibuat.`,
        });

        showCreateDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(
            error,
            'Gagal menambahkan mutasi kas. Silakan coba lagi.',
        );
    } finally {
        loading.value = false;
    }
};

// handle update cash mutation
const handleUpdateCashMutation = async () => {
    if (!validateForm()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.put(
            `/api/v1/cash-mutations/${cashMutationForm.id}`,
            cashMutationForm,
        );

        toast.success('Mutasi kas berhasil diperbarui!', {
            description: `Mutasi ${cashMutationForm.mutation_no} telah diperbarui.`,
        });

        showEditDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(
            error,
            'Gagal memperbarui mutasi kas. Silakan coba lagi.',
        );
    } finally {
        loading.value = false;
    }
};

// handle delete data
const handleDeleteCashMutation = async () => {
    if (!cashMutationToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(
            `/api/v1/cash-mutations/${cashMutationToDelete.value.id}`,
        );

        toast.success('Mutasi kas berhasil dihapus!', {
            description: `Mutasi ${cashMutationToDelete.value.mutation_no} telah dihapus permanen.`,
        });

        showDeleteDialog.value = false;
        cashMutationToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(error, 'Gagal menghapus mutasi kas. Silakan coba lagi.');
    } finally {
        loading.value = false;
    }
};

const handleCancelCreate = () => {
    resetForm();
    showCreateDialog.value = false;
};

const handleCancelEdit = () => {
    resetForm();
    showEditDialog.value = false;
};

// Load fund sources on mount
onMounted(() => {
    fetchFundSources();
});
</script>

<template>
    <Head title="Mutasi Kas" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        Mutasi Kas
                    </h1>
                    <p class="text-muted-foreground">
                        Pengelolaan data mutasi kas masuk dan keluar
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        @click="showFilters = !showFilters"
                        :class="{ 'ring-2 ring-primary': hasActiveFilters }"
                    >
                        <FilterIcon class="mr-2 h-4 w-4" />
                        Filter
                        <span
                            v-if="hasActiveFilters"
                            class="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
                        >
                            !
                        </span>
                    </Button>
                    <Button @click="createCashMutation">
                        <PlusIcon class="mr-2 h-4 w-4" />
                        Mutasi Kas
                    </Button>
                </div>
            </div>

            <!-- Filter Panel -->
            <div
                v-if="showFilters"
                class="space-y-4 rounded-lg border bg-white p-4"
            >
                <div class="flex items-center justify-between">
                    <h3 class="text-sm font-semibold">Filter Data</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        @click="showFilters = false"
                    >
                        <XIcon class="h-4 w-4" />
                    </Button>
                </div>

                <div
                    class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
                >
                    <!-- Filter by Fund Source -->
                    <div class="space-y-2">
                        <Label for="filter-fund-source">Sumber Dana</Label>
                        <Select
                            v-model="filterFundSourceId"
                            @update:model-value="applyFilters"
                        >
                            <SelectTrigger
                                id="filter-fund-source"
                                class="w-full"
                            >
                                <SelectValue placeholder="Semua Sumber Dana" />
                            </SelectTrigger>
                            <SelectContent
                                class="max-h-[200px] overflow-y-auto"
                            >
                                <SelectItem :value="null">
                                    Semua Sumber Dana
                                </SelectItem>
                                <SelectItem
                                    v-for="fundSource in fundSources"
                                    :key="fundSource.id"
                                    :value="fundSource.id"
                                >
                                    {{ fundSource.code }} -
                                    {{ fundSource.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <!-- Filter by Type -->
                    <div class="space-y-2">
                        <Label for="filter-type">Tipe Mutasi</Label>
                        <Select
                            v-model="filterType"
                            @update:model-value="applyFilters"
                        >
                            <SelectTrigger id="filter-type" class="w-full">
                                <SelectValue placeholder="Semua Tipe" />
                            </SelectTrigger>
                            <SelectContent
                                class="max-h-[200px] overflow-y-auto"
                            >
                                <SelectItem :value=null>
                                    Semua Tipe
                                </SelectItem>
                                <SelectItem
                                    v-for="type in mutationTypes"
                                    :key="type.value"
                                    :value="type.value"
                                >
                                    {{ type.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <!-- Filter by Date From -->
                    <div class="space-y-2">
                        <Label for="filter-date-from">Tanggal Dari</Label>
                        <Input
                            id="filter-date-from"
                            type="date"
                            v-model="filterDateFrom"
                            @change="applyFilters"
                        />
                    </div>

                    <!-- Filter by Date To -->
                    <div class="space-y-2">
                        <Label for="filter-date-to">Tanggal Sampai</Label>
                        <Input
                            id="filter-date-to"
                            type="date"
                            v-model="filterDateTo"
                            @change="applyFilters"
                        />
                    </div>
                </div>

                <!-- Active Filters Display -->
                <div
                    v-if="hasActiveFilters"
                    class="flex flex-wrap items-center gap-2"
                >
                    <span class="text-xs text-gray-500">Filter aktif:</span>

                    <!-- Fund Source Filter Badge -->
                    <Badge
                        v-if="filterFundSourceId"
                        variant="secondary"
                        class="gap-1 border-blue-200 bg-blue-50 text-blue-700"
                    >
                        {{
                            fundSources.find((f) => f.id === filterFundSourceId)
                                ?.name || 'Sumber Dana'
                        }}
                        <button
                            @click="clearFilterFundSource"
                            class="ml-1 hover:text-blue-900"
                        >
                            <XIcon class="h-3 w-3" />
                        </button>
                    </Badge>

                    <!-- Type Filter Badge -->
                    <Badge
                        v-if="filterType"
                        variant="secondary"
                        class="gap-1 border-blue-200 bg-blue-50 text-blue-700"
                    >
                        {{
                            mutationTypes.find((t) => t.value === filterType)
                                ?.label || filterType
                        }}
                        <button
                            @click="clearFilterType"
                            class="ml-1 hover:text-blue-900"
                        >
                            <XIcon class="h-3 w-3" />
                        </button>
                    </Badge>

                    <!-- Date Filter Badge -->
                    <Badge
                        v-if="filterDateFrom || filterDateTo"
                        variant="secondary"
                        class="gap-1 border-blue-200 bg-blue-50 text-blue-700"
                    >
                        {{ filterDateFrom || '...' }} -
                        {{ filterDateTo || '...' }}
                        <button
                            @click="clearFilterDates"
                            class="ml-1 hover:text-blue-900"
                        >
                            <XIcon class="h-3 w-3" />
                        </button>
                    </Badge>

                    <!-- Reset All Filters -->
                    <Button
                        variant="ghost"
                        size="sm"
                        @click="resetFilters"
                        class="h-7 text-xs"
                    >
                        Reset Semua
                    </Button>
                </div>
            </div>

            <!-- DataTable -->
            <DataTable
                :columns="dataTable.columns"
                :data="dataTable.data.value"
                :loading="dataTable.loading.value"
                :actions="dataTable.actions"
                searchable
                search-placeholder="Cari Mutasi Kas"
                show-pagination
                show-page-info
                empty-message="Data mutasi kas tidak ditemukan"
                server-side
                :total-rows="dataTable.state.value.pagination.total"
                :current-page="dataTable.state.value.pagination.page"
                :total-pages="dataTable.state.value.pagination.totalPages"
                :current-page-size="dataTable.state.value.pagination.perPage"
                :exportable="true"
                @search="dataTable.actions.search"
                @page-change="dataTable.actions.goToPage"
                @page-size-change="dataTable.actions.changePageSize"
                @sort-change="
                    (sortBy, sortOrder) =>
                        dataTable.actions.sort(sortBy, sortOrder === 'desc')
                "
            />
        </div>

        <!-- View Cash Mutation Dialog -->
        <FormDialog v-model:open="showViewDialog" :loading="loading" size="lg">
            <FormDialog.Header
                title="Detail Mutasi Kas"
                description="Melihat data mutasi kas."
            />

            <FormDialog.Content spacing="md">
                <div class="grid grid-cols-2 gap-4">
                    <!-- Mutation Date -->
                    <div class="space-y-2">
                        <Label for="view-mutation-date">
                            Tanggal Mutasi
                        </Label>
                        <Input
                            id="view-mutation-date"
                            type="date"
                            v-model="cashMutationForm.mutation_date"
                            :disabled="true"
                        />
                    </div>

                    <!-- Description -->
                    <div class="space-y-2">
                        <Label for="view-description">Deskripsi</Label>
                        <Input
                            id="view-description"
                            v-model="cashMutationForm.description"
                            placeholder="Isikan deskripsi mutasi"
                            :disabled="true"
                        />
                    </div>
                </div>

                <!-- Mutation Type -->
                <div class="space-y-2">
                    <Label for="view-mutation-type">
                        Tipe Mutasi <span class="text-red-500">*</span>
                    </Label>
                    <Select v-model="cashMutationForm.type" :disabled="true">
                        <SelectTrigger
                            id="view-mutation-type"
                            class="w-full"
                        >
                            <SelectValue placeholder="Pilih tipe mutasi" />
                        </SelectTrigger>
                        <SelectContent class="max-h-[200px] overflow-y-auto">
                            <SelectItem
                                v-for="type in mutationTypes"
                                :key="type.value"
                                :value="type.value"
                            >
                                {{ type.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <!-- Fund Source -->
                <div class="space-y-2">
                    <Label for="view-fund-source">
                        Sumber Dana <span class="text-red-500">*</span>
                    </Label>
                    <Select
                        v-model="cashMutationForm.fund_source_id"
                        :disabled="true"
                    >
                        <SelectTrigger
                            id="view-fund-source"
                            class="w-full"
                        >
                            <SelectValue placeholder="Pilih sumber dana" />
                        </SelectTrigger>
                        <SelectContent class="max-h-[200px] overflow-y-auto">
                            <SelectItem
                                v-for="fundSource in fundSources"
                                :key="fundSource.id"
                                :value="fundSource.id"
                            >
                                {{ fundSource.code }} - {{ fundSource.name }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <!-- Amount -->
                <div class="space-y-2">
                    <Label for="view-amount">
                        Jumlah <span class="text-red-500">*</span>
                    </Label>
                    <div class="relative">
                        <span
                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-700"
                        >
                            Rp
                        </span>
                        <Input
                            id="view-amount"
                            v-model="cashMutationForm.amount"
                            type="text"
                            @input="
                                cashMutationForm.amount =
                                    Number(
                                        $event.target.value.replace(
                                            /[^0-9.]/g,
                                            '',
                                        ),
                                    ) || 0
                            "
                            class="w-full pl-10 text-sm"
                            :disabled="true"
                            placeholder="0"
                        />
                    </div>
                </div>

                <!-- Notes -->
                <div class="space-y-2">
                    <Label for="view-notes">Catatan</Label>
                    <Textarea
                        id="view-notes"
                        v-model="cashMutationForm.notes"
                        placeholder="Tambahkan catatan mutasi (opsional)"
                        class="min-h-[80px] w-full resize-none"
                        :maxlength="500"
                        :disabled="true"
                    />
                </div>
            </FormDialog.Content>

        </FormDialog>

        <!-- Create Cash Mutation Dialog -->
        <FormDialog
            v-model:open="showCreateDialog"
            :loading="loading"
            size="lg"
        >
            <FormDialog.Header
                title="Tambah Mutasi Kas"
                description="Menambahkan data mutasi kas baru."
            />

            <FormDialog.Content spacing="md">
                <!-- General Errors -->
                <div
                    v-if="fieldErrors.general.length > 0"
                    class="rounded-md border border-amber-200 bg-amber-50 p-3"
                >
                    <div class="flex items-start gap-2">
                        <AlertCircleIcon
                            class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
                        />
                        <div>
                            <p
                                v-for="(error, index) in fieldErrors.general"
                                :key="index"
                                class="text-sm text-amber-700"
                            >
                                {{ error }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Mutation Date -->
                    <div class="space-y-2">
                        <Label for="create-mutation-date">
                            Tanggal Mutasi <span class="text-red-500">*</span>
                        </Label>
                        <Input
                            id="create-mutation-date"
                            type="date"
                            v-model="cashMutationForm.mutation_date"
                            :disabled="loading"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.mutation_date.length > 0,
                            }"
                        />
                        <p
                            v-for="(error, index) in fieldErrors.mutation_date"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>

                    <!-- Description -->
                    <div class="space-y-2">
                        <Label for="create-description">Deskripsi</Label>
                        <Input
                            id="create-description"
                            v-model="cashMutationForm.description"
                            placeholder="Isikan deskripsi mutasi"
                            :disabled="loading"
                            :maxlength="255"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.description.length > 0,
                            }"
                        />
                        <p
                            v-for="(error, index) in fieldErrors.description"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                        <p class="text-xs text-gray-400">
                            {{ cashMutationForm.description?.length || 0 }}/255
                        </p>
                    </div>
                </div>

                <!-- Mutation Type -->
                <div class="space-y-2">
                    <Label for="create-mutation-type">
                        Tipe Mutasi <span class="text-red-500">*</span>
                    </Label>
                    <Select v-model="cashMutationForm.type" :disabled="loading">
                        <SelectTrigger
                            id="create-mutation-type"
                            class="w-full"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.type.length > 0,
                            }"
                        >
                            <SelectValue placeholder="Pilih tipe mutasi" />
                        </SelectTrigger>
                        <SelectContent class="max-h-[200px] overflow-y-auto">
                            <SelectItem
                                v-for="type in mutationTypes"
                                :key="type.value"
                                :value="type.value"
                            >
                                {{ type.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p
                        v-for="(error, index) in fieldErrors.type"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <!-- Fund Source -->
                <div class="space-y-2">
                    <Label for="create-fund-source">
                        Sumber Dana <span class="text-red-500">*</span>
                    </Label>
                    <Select
                        v-model="cashMutationForm.fund_source_id"
                        :disabled="loading"
                    >
                        <SelectTrigger
                            id="create-fund-source"
                            class="w-full"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.fund_source_id.length > 0,
                            }"
                        >
                            <SelectValue placeholder="Pilih sumber dana" />
                        </SelectTrigger>
                        <SelectContent class="max-h-[200px] overflow-y-auto">
                            <SelectItem
                                v-for="fundSource in fundSources"
                                :key="fundSource.id"
                                :value="fundSource.id"
                            >
                                {{ fundSource.code }} - {{ fundSource.name }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p
                        v-for="(error, index) in fieldErrors.fund_source_id"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <!-- Amount -->
                <div class="space-y-2">
                    <Label for="create-amount">
                        Jumlah <span class="text-red-500">*</span>
                    </Label>
                    <div class="relative">
                        <span
                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-700"
                        >
                            Rp
                        </span>
                        <Input
                            id="create-amount"
                            v-model="cashMutationForm.amount"
                            type="text"
                            @input="
                                cashMutationForm.amount =
                                    Number(
                                        $event.target.value.replace(
                                            /[^0-9.]/g,
                                            '',
                                        ),
                                    ) || 0
                            "
                            class="w-full pl-10 text-sm"
                            :disabled="loading"
                            placeholder="0"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.amount.length > 0,
                            }"
                        />
                    </div>
                    <p
                        v-for="(error, index) in fieldErrors.amount"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <!-- Notes -->
                <div class="space-y-2">
                    <Label for="create-notes">Catatan</Label>
                    <Textarea
                        id="create-notes"
                        v-model="cashMutationForm.notes"
                        placeholder="Tambahkan catatan mutasi (opsional)"
                        class="min-h-[80px] w-full resize-none"
                        :maxlength="500"
                        :disabled="loading"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.notes.length > 0,
                        }"
                    />
                    <div class="flex justify-between">
                        <p
                            v-for="(error, index) in fieldErrors.notes"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                        <p class="text-xs text-gray-400">
                            {{ cashMutationForm.notes?.length || 0 }}/500
                        </p>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Buat Mutasi Kas"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleCreateCashMutation"
                @cancel="handleCancelCreate"
            />
        </FormDialog>

        <!-- Edit Cash Mutation Dialog -->
        <FormDialog v-model:open="showEditDialog" :loading="loading" size="lg">
            <FormDialog.Header
                title="Update Mutasi Kas"
                description="Memperbaharui data mutasi kas."
            />

            <FormDialog.Content spacing="md">
                <!-- General Errors -->
                <div
                    v-if="fieldErrors.general.length > 0"
                    class="rounded-md border border-amber-200 bg-amber-50 p-3"
                >
                    <div class="flex items-start gap-2">
                        <AlertCircleIcon
                            class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
                        />
                        <div>
                            <p
                                v-for="(error, index) in fieldErrors.general"
                                :key="index"
                                class="text-sm text-amber-700"
                            >
                                {{ error }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Mutation Date -->
                    <div class="space-y-2">
                        <Label for="edit-mutation-date">
                            Tanggal Mutasi <span class="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-mutation-date"
                            type="date"
                            v-model="cashMutationForm.mutation_date"
                            :disabled="loading"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.mutation_date.length > 0,
                            }"
                        />
                        <p
                            v-for="(error, index) in fieldErrors.mutation_date"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>

                    <!-- Description -->
                    <div class="space-y-2">
                        <Label for="edit-description">Deskripsi</Label>
                        <Input
                            id="edit-description"
                            v-model="cashMutationForm.description"
                            placeholder="Isikan deskripsi mutasi"
                            :disabled="loading"
                            :maxlength="255"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.description.length > 0,
                            }"
                        />
                        <p
                            v-for="(error, index) in fieldErrors.description"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                        <p class="text-xs text-gray-400">
                            {{ cashMutationForm.description?.length || 0 }}/255
                        </p>
                    </div>
                </div>

                <!-- Mutation Type -->
                <div class="space-y-2">
                    <Label for="edit-mutation-type">
                        Tipe Mutasi <span class="text-red-500">*</span>
                    </Label>
                    <Select v-model="cashMutationForm.type" :disabled="loading">
                        <SelectTrigger
                            id="edit-mutation-type"
                            class="w-full"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.type.length > 0,
                            }"
                        >
                            <SelectValue placeholder="Pilih tipe mutasi" />
                        </SelectTrigger>
                        <SelectContent class="max-h-[200px] overflow-y-auto">
                            <SelectItem
                                v-for="type in mutationTypes"
                                :key="type.value"
                                :value="type.value"
                            >
                                {{ type.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p
                        v-for="(error, index) in fieldErrors.type"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <!-- Fund Source -->
                <div class="space-y-2">
                    <Label for="edit-fund-source">
                        Sumber Dana <span class="text-red-500">*</span>
                    </Label>
                    <Select
                        v-model="cashMutationForm.fund_source_id"
                        :disabled="loading"
                    >
                        <SelectTrigger
                            id="edit-fund-source"
                            class="w-full"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.fund_source_id.length > 0,
                            }"
                        >
                            <SelectValue placeholder="Pilih sumber dana" />
                        </SelectTrigger>
                        <SelectContent class="max-h-[200px] overflow-y-auto">
                            <SelectItem
                                v-for="fundSource in fundSources"
                                :key="fundSource.id"
                                :value="fundSource.id"
                            >
                                {{ fundSource.code }} - {{ fundSource.name }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p
                        v-for="(error, index) in fieldErrors.fund_source_id"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <!-- Amount -->
                <div class="space-y-2">
                    <Label for="edit-amount">
                        Jumlah <span class="text-red-500">*</span>
                    </Label>
                    <div class="relative">
                        <span
                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-700"
                        >
                            Rp
                        </span>
                        <Input
                            id="edit-amount"
                            v-model="cashMutationForm.amount"
                            type="text"
                            @input="
                                cashMutationForm.amount =
                                    Number(
                                        $event.target.value.replace(
                                            /[^0-9.]/g,
                                            '',
                                        ),
                                    ) || 0
                            "
                            class="w-full pl-10 text-sm"
                            :disabled="loading"
                            placeholder="0"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.amount.length > 0,
                            }"
                        />
                    </div>
                    <p
                        v-for="(error, index) in fieldErrors.amount"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <!-- Notes -->
                <div class="space-y-2">
                    <Label for="edit-notes">Catatan</Label>
                    <Textarea
                        id="edit-notes"
                        v-model="cashMutationForm.notes"
                        placeholder="Tambahkan catatan mutasi (opsional)"
                        class="min-h-[80px] w-full resize-none"
                        :maxlength="500"
                        :disabled="loading"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.notes.length > 0,
                        }"
                    />
                    <div class="flex justify-between">
                        <p
                            v-for="(error, index) in fieldErrors.notes"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                        <p class="text-xs text-gray-400">
                            {{ cashMutationForm.notes?.length || 0 }}/500
                        </p>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Update Mutasi Kas"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleUpdateCashMutation"
                @cancel="handleCancelEdit"
            />
        </FormDialog>

        <!-- Delete Cash Mutation Dialog -->
        <FormDialog
            v-model:open="showDeleteDialog"
            :loading="loading"
            size="sm"
        >
            <FormDialog.Header
                title="Hapus Mutasi Kas"
                description="Proses ini tidak dapat dibatalkan. Mutasi kas akan dihapus secara permanen."
            />

            <FormDialog.Content>
                <div class="rounded-md border border-red-200 bg-red-50 p-4">
                    <div class="flex items-start gap-3">
                        <AlertCircleIcon
                            class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
                        />
                        <div>
                            <p class="text-sm font-medium text-red-800">
                                Konfirmasi Penghapusan
                            </p>
                            <p class="mt-1 text-sm text-red-700">
                                Apakah Anda yakin akan menghapus mutasi kas:
                            </p>
                            <p class="mt-2 text-sm font-semibold text-red-800">
                                {{ cashMutationToDelete?.mutation_no }} -
                                {{
                                    new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0,
                                    }).format(cashMutationToDelete?.amount || 0)
                                }}
                            </p>
                            <p class="mt-2 text-xs text-red-600">
                                Semua data yang terkait dengan mutasi ini akan
                                ikut terhapus.
                            </p>
                        </div>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Hapus Mutasi Kas"
                submit-variant="destructive"
                cancel-text="Batal"
                :loading="loading"
                @submit="handleDeleteCashMutation"
            />
        </FormDialog>
    </AppLayout>
</template>
