<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem } from '@/types';
import { ActivityItem } from '@/types/datamaster';
import { Head } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import axios, { AxiosError } from 'axios';
import {
    AlertCircleIcon,
    BadgeCheckIcon,
    EditIcon,
    PlusIcon,
    TrashIcon,
    XCircleIcon,
} from 'lucide-vue-next';
import { computed, h, reactive, ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import ParameterSelect from '../components/ParameterSelect.vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Item Anggaran',
        href: '',
    },
];

interface COA {
    id: string;
    account_code: string;
    account_name: string;
}

// activity item columns
const columns: ColumnDef<ActivityItem>[] = [
    createColumn({
        value: 'item_code',
        title: 'Kode Item',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            return row.original.item_code;
        },
    }),
    createColumn({
        value: 'item_name',
        title: 'Nama Item',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.item_name;
        },
    }),
    createColumn({
        value: 'trans_type_id',
        title: 'Jns. Transaksi',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const transType = row.original.trans_type;
            return transType ? transType.name : '-';
        },
    }),
    createColumn({
        value: 'unit_measure_id',
        title: 'Satuan',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const unitMeasure = row.original.unit_measure;
            return unitMeasure ? unitMeasure.name : '-';
        },
    }),
    createColumn({
        value: 'estimation_price',
        title: 'Harga Estimasi',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const price = row.original.estimation_price;
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(price || 0);
        },
    }),
    createColumn({
        value: 'is_active',
        title: 'Status',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const isActive = !!row.original.is_active;

            if (isActive) {
                return h(
                    Badge,
                    {
                        variant: 'secondary',
                        class: 'bg-blue-500 text-white gap-1',
                    },
                    [h(BadgeCheckIcon, { class: 'w-4 h-4' }), 'Aktif'],
                );
            } else {
                return h(
                    Badge,
                    {
                        variant: 'destructive',
                        class: 'gap-1',
                    },
                    [h(XCircleIcon, { class: 'w-4 h-4' }), 'Non Aktif'],
                );
            }
        },
    }),

    createActionColumn([
        {
            icon: EditIcon,
            variant: 'default',
            onClick: (row: ActivityItem) => updateItem(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: ActivityItem) => deleteItem(row),
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/activity-items',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari item anggaran...',
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
const loading = ref(false);

// form data
const itemForm = reactive({
    id: '',
    item_code: '',
    item_name: '',
    trans_type_id: null as number | null,
    unit_measure_id: null as number | null,
    estimation_price: 0,
    is_active: true,
});

const itemToDelete = ref<ActivityItem | null>(null);

// Individual field errors
const fieldErrors = reactive({
    item_name: [] as string[],
    trans_type_id: [] as string[],
    unit_measure_id: [] as string[],
    estimation_price: [] as string[],
    is_active: [] as string[],
    general: [] as string[],
});

const showValidationErrors = ref(false);

// Reset validation
const resetValidation = () => {
    fieldErrors.item_name = [];
    fieldErrors.trans_type_id = [];
    fieldErrors.unit_measure_id = [];
    fieldErrors.estimation_price = [];
    fieldErrors.is_active = [];
    fieldErrors.general = [];
    showValidationErrors.value = false;
};

// Validation function
const validateForm = (): boolean => {
    // Reset errors
    resetValidation();

    // Item Name validation
    if (!itemForm.item_name || itemForm.item_name.trim() === '') {
        fieldErrors.item_name.push('Nama item wajib diisi');
    } else {
        if (itemForm.item_name.trim().length < 3) {
            fieldErrors.item_name.push('Nama item minimal 3 karakter');
        }
        if (itemForm.item_name.trim().length > 200) {
            fieldErrors.item_name.push('Nama item maksimal 200 karakter');
        }
    }

    // Transaction Type validation
    if (!itemForm.trans_type_id) {
        fieldErrors.trans_type_id.push('Jenis transaksi wajib dipilih');
    }

    // Unit Measure validation
    if (!itemForm.unit_measure_id) {
        fieldErrors.unit_measure_id.push('Satuan wajib dipilih');
    }

    // Estimation Price validation
    if (itemForm.estimation_price !== null && itemForm.estimation_price !== undefined) {
        const priceStr = itemForm.estimation_price.toString();
        if (priceStr && priceStr.trim() !== '') {
            const price = parseFloat(priceStr);
            if (isNaN(price) || price < 0) {
                fieldErrors.estimation_price.push('Harga estimasi tidak valid');
            }
            if (price > 999999999999999) {
                fieldErrors.estimation_price.push('Harga estimasi terlalu besar');
            }
        }
    }

    showValidationErrors.value = true;

    const hasErrors =
        fieldErrors.item_name.length > 0 ||
        fieldErrors.trans_type_id.length > 0 ||
        fieldErrors.unit_measure_id.length > 0 ||
        fieldErrors.estimation_price.length > 0 ||
        fieldErrors.is_active.length > 0 ||
        fieldErrors.general.length > 0;

    return !hasErrors;
};

// Computed property for form validity
const isFormValid = computed(() => {
    if (!showValidationErrors.value) return true;

    return (
        fieldErrors.item_name.length === 0 &&
        fieldErrors.trans_type_id.length === 0 &&
        fieldErrors.unit_measure_id.length === 0 &&
        fieldErrors.estimation_price.length === 0 &&
        fieldErrors.is_active.length === 0 &&
        fieldErrors.general.length === 0
    );
});

// Watch form changes to clear errors
watch(
    () => itemForm.item_name,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.item_name = [];
        }
    }
);

watch(
    () => itemForm.trans_type_id,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.trans_type_id = [];
        }
    }
);

watch(
    () => itemForm.unit_measure_id,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.unit_measure_id = [];
        }
    }
);

watch(
    () => itemForm.estimation_price,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.estimation_price = [];
        }
    }
);

// Handle server errors
const handleServerErrors = (errors: Record<string, string[]>) => {
    resetValidation();

    if (errors.item_name) {
        fieldErrors.item_name = Array.isArray(errors.item_name)
            ? errors.item_name
            : [errors.item_name];
    }
    if (errors.trans_type_id) {
        fieldErrors.trans_type_id = Array.isArray(errors.trans_type_id)
            ? errors.trans_type_id
            : [errors.trans_type_id];
    }
    if (errors.unit_measure_id) {
        fieldErrors.unit_measure_id = Array.isArray(errors.unit_measure_id)
            ? errors.unit_measure_id
            : [errors.unit_measure_id];
    }
    if (errors.estimation_price) {
        fieldErrors.estimation_price = Array.isArray(errors.estimation_price)
            ? errors.estimation_price
            : [errors.estimation_price];
    }
    if (errors.is_active) {
        fieldErrors.is_active = Array.isArray(errors.is_active)
            ? errors.is_active
            : [errors.is_active];
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
    Object.assign(itemForm, {
        id: '',
        item_code: '',
        item_name: '',
        trans_type_id: null as number | null,
        unit_measure_id: null as number | null,
        estimation_price: 0,
        is_active: true,
    });
    resetValidation();
};

// init form data
const createItem = async () => {
    resetForm();
    showCreateDialog.value = true;
};

const updateItem = async (item: ActivityItem) => {
    resetForm();
    Object.assign(itemForm, {
        id: item.id,
        item_code: item.item_code,
        item_name: item.item_name,
        trans_type_id: item.trans_type_id,
        unit_measure_id: item.unit_measure_id,
        estimation_price: item.estimation_price,
        is_active: item.is_active ?? true,
    });
    showEditDialog.value = true;
};

const deleteItem = (item: ActivityItem) => {
    itemToDelete.value = item;
    showDeleteDialog.value = true;
};

// handle create item
const handleCreateItem = async () => {
    if (!validateForm()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.post('/api/v1/activity-items', itemForm);

        toast.success('Item anggaran berhasil ditambahkan!', {
            description: `Item ${itemForm.item_name} telah dibuat.`,
        });

        showCreateDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(
            error,
            'Gagal menambahkan item anggaran. Silakan coba lagi.',
        );
    } finally {
        loading.value = false;
    }
};

// handle update item
const handleUpdateItem = async () => {
    if (!validateForm()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.put(
            `/api/v1/activity-items/${itemForm.id}`,
            itemForm,
        );

        toast.success('Item anggaran berhasil diperbarui!', {
            description: `Item ${itemForm.item_name} telah diperbarui.`,
        });

        showEditDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(
            error,
            'Gagal memperbarui item anggaran. Silakan coba lagi.',
        );
    } finally {
        loading.value = false;
    }
};

// handle delete data
const handleDeleteItem = async () => {
    if (!itemToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(
            `/api/v1/activity-items/${itemToDelete.value.id}`,
        );

        toast.success('Item anggaran berhasil dihapus!', {
            description: `Item ${itemToDelete.value.item_name} telah dihapus permanen.`,
        });

        showDeleteDialog.value = false;
        itemToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(
            error,
            'Gagal menghapus item anggaran. Silakan coba lagi.',
        );
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
</script>

<template>
    <Head title="Item Anggaran" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        Item Anggaran
                    </h1>
                    <p class="text-muted-foreground">
                        Pengaturan data item anggaran
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button @click="createItem">
                        <PlusIcon class="w-4 h-4 mr-2" />
                        Tambah
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
                search-placeholder="Cari Item Anggaran"
                show-pagination
                show-page-info
                empty-message="Data item anggaran tidak ditemukan"
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

        <!-- Create Item Dialog -->
        <FormDialog
            v-model:open="showCreateDialog"
            :loading="loading"
            size="md"
        >
            <FormDialog.Header
                title="Tambah Item Anggaran"
                description="Menambahkan informasi item anggaran baru."
            />

            <FormDialog.Content spacing="md">
                <!-- General Errors -->
                <div
                    v-if="fieldErrors.general.length > 0"
                    class="bg-amber-50 border border-amber-200 rounded-md p-3"
                >
                    <div class="flex items-start gap-2">
                        <AlertCircleIcon
                            class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
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

                <div class="space-y-2">
                    <Label for="create-code">Kode Item</Label>
                    <Input
                        id="create-code"
                        v-model="itemForm.item_code"
                        placeholder="Auto Generate"
                        :disabled="true"
                        class="bg-gray-50"
                    />
                    <p class="text-xs text-gray-500">
                        Kode item akan dibuat otomatis oleh sistem
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="create-name">
                        Nama Item <span class="text-red-500">*</span>
                    </Label>
                    <Input
                        id="create-name"
                        v-model="itemForm.item_name"
                        placeholder="Isikan Nama Item"
                        :disabled="loading"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.item_name.length > 0,
                        }"
                    />
                    <p
                        v-for="(error, index) in fieldErrors.item_name"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="create-trans-type">
                        Jenis Transaksi <span class="text-red-500">*</span>
                    </Label>
                    <ParameterSelect
                        id="create-trans-type"
                        group-code="TRANS_ITEM_TYPE"
                        v-model="itemForm.trans_type_id"
                        :disabled="loading"
                        placeholder="Pilih Jenis Transaksi"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.trans_type_id.length > 0,
                        }"
                    />
                    <p
                        v-for="(error, index) in fieldErrors.trans_type_id"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="create-unit">
                        Satuan <span class="text-red-500">*</span>
                    </Label>
                    <ParameterSelect
                        id="create-unit"
                        group-code="ACTIVITY_UNIT"
                        v-model="itemForm.unit_measure_id"
                        :disabled="loading"
                        placeholder="Pilih Satuan"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.unit_measure_id.length > 0,
                        }"
                    />
                    <p
                        v-for="(error, index) in fieldErrors.unit_measure_id"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="create-price">Harga Estimasi</Label>
                    <div class="relative">
                        <span
                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500"
                        >
                            Rp
                        </span>

                        <Input
                            id="create-price"
                            v-model="itemForm.estimation_price"
                            type="text"
                            @input="
                                itemForm.estimation_price =
                                    $event.target.value
                                        .replace(/[^0-9.]/g, '')
                                        .slice(0, 15)
                            "
                            class="w-full pl-9 text-sm"
                            :disabled="loading"
                            placeholder="0"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.estimation_price.length > 0,
                            }"
                        />
                    </div>
                    <p
                        v-for="(error, index) in fieldErrors.estimation_price"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <!-- Status Aktif Toggle -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <div>
                            <Label
                                for="create-is-active"
                                class="text-sm font-medium"
                            >
                                Status Aktif
                            </Label>
                            <p class="text-xs text-muted-foreground">
                                Aktifkan item ini jika tersedia untuk digunakan
                            </p>
                        </div>
                        <Switch
                            id="create-is-active"
                            v-model="itemForm.is_active"
                            :disabled="loading"
                            :class="{
                                'data-[state=checked]:bg-blue-600':
                                    itemForm.is_active,
                            }"
                        />
                    </div>
                    <div
                        v-if="itemForm.is_active"
                        class="flex items-center gap-2 text-xs text-blue-600"
                    >
                        <BadgeCheckIcon class="w-4 h-4" />
                        <span>Item ini akan ditandai sebagai aktif</span>
                    </div>
                    <div
                        v-else
                        class="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                        <XCircleIcon class="w-4 h-4" />
                        <span>Item ini akan ditandai sebagai non-aktif</span>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Buat Item"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleCreateItem"
                @cancel="handleCancelCreate"
            />
        </FormDialog>

        <!-- Edit Item Dialog -->
        <FormDialog
            v-model:open="showEditDialog"
            :loading="loading"
            size="md"
        >
            <FormDialog.Header
                title="Update Item Anggaran"
                description="Memperbaharui informasi item anggaran."
            />

            <FormDialog.Content spacing="md">
                <!-- General Errors -->
                <div
                    v-if="fieldErrors.general.length > 0"
                    class="bg-amber-50 border border-amber-200 rounded-md p-3"
                >
                    <div class="flex items-start gap-2">
                        <AlertCircleIcon
                            class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
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

                <div class="space-y-2">
                    <Label for="edit-code">Kode Item</Label>
                    <Input
                        id="edit-code"
                        v-model="itemForm.item_code"
                        placeholder="Isikan kode item"
                        :disabled="true"
                        class="bg-gray-50"
                    />
                </div>

                <div class="space-y-2">
                    <Label for="edit-name">
                        Nama Item <span class="text-red-500">*</span>
                    </Label>
                    <Input
                        id="edit-name"
                        v-model="itemForm.item_name"
                        placeholder="Isikan Nama Item"
                        :disabled="loading"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.item_name.length > 0,
                        }"
                    />
                    <p
                        v-for="(error, index) in fieldErrors.item_name"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="edit-trans-type">
                        Jenis Transaksi <span class="text-red-500">*</span>
                    </Label>
                    <ParameterSelect
                        id="edit-trans-type"
                        group-code="TRANS_ITEM_TYPE"
                        v-model="itemForm.trans_type_id"
                        :disabled="loading"
                        placeholder="Pilih Jenis Transaksi"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.trans_type_id.length > 0,
                        }"
                    />
                    <p
                        v-for="(error, index) in fieldErrors.trans_type_id"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="edit-unit">
                        Satuan <span class="text-red-500">*</span>
                    </Label>
                    <ParameterSelect
                        id="edit-unit"
                        group-code="ACTIVITY_UNIT"
                        v-model="itemForm.unit_measure_id"
                        :disabled="loading"
                        placeholder="Pilih Satuan"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.unit_measure_id.length > 0,
                        }"
                    />
                    <p
                        v-for="(error, index) in fieldErrors.unit_measure_id"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="edit-price">Harga Estimasi</Label>
                    <div class="relative">
                        <span
                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500"
                        >
                            Rp
                        </span>

                        <Input
                            id="edit-price"
                            v-model="itemForm.estimation_price"
                            type="text"
                            @input="
                                itemForm.estimation_price =
                                    $event.target.value
                                        .replace(/[^0-9.]/g, '')
                                        .slice(0, 15)
                            "
                            class="w-full pl-9 text-sm"
                            :disabled="loading"
                            placeholder="0"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.estimation_price.length > 0,
                            }"
                        />
                    </div>
                    <p
                        v-for="(error, index) in fieldErrors.estimation_price"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <!-- Status Aktif Toggle -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <div>
                            <Label
                                for="edit-is-active"
                                class="text-sm font-medium"
                            >
                                Status Aktif
                            </Label>
                            <p class="text-xs text-muted-foreground">
                                Aktifkan item ini jika tersedia untuk digunakan
                            </p>
                        </div>
                        <Switch
                            id="edit-is-active"
                            v-model="itemForm.is_active"
                            :disabled="loading"
                            :class="{
                                'data-[state=checked]:bg-blue-600':
                                    itemForm.is_active,
                            }"
                        />
                    </div>
                    <div
                        v-if="itemForm.is_active"
                        class="flex items-center gap-2 text-xs text-blue-600"
                    >
                        <BadgeCheckIcon class="w-4 h-4" />
                        <span>Item ini akan ditandai sebagai aktif</span>
                    </div>
                    <div
                        v-else
                        class="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                        <XCircleIcon class="w-4 h-4" />
                        <span>Item ini akan ditandai sebagai non-aktif</span>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Update Item"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleUpdateItem"
                @cancel="handleCancelEdit"
            />
        </FormDialog>

        <!-- Delete Item Dialog -->
        <FormDialog
            v-model:open="showDeleteDialog"
            :loading="loading"
            size="sm"
        >
            <FormDialog.Header
                title="Hapus Item Anggaran"
                description="Proses ini tidak dapat dibatalkan. Item anggaran akan dihapus secara permanen."
            />

            <FormDialog.Content>
                <div
                    class="rounded-md border border-red-200 bg-red-50 p-4"
                >
                    <div class="flex items-start gap-3">
                        <AlertCircleIcon
                            class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                        />
                        <div>
                            <p class="text-sm font-medium text-red-800">
                                Konfirmasi Penghapusan
                            </p>
                            <p class="text-sm text-red-700 mt-1">
                                Apakah Anda yakin akan menghapus item:
                            </p>
                            <p
                                class="text-sm font-semibold text-red-800 mt-2"
                            >
                                {{ itemToDelete?.item_code }} -
                                {{ itemToDelete?.item_name }}
                            </p>
                            <p class="text-xs text-red-600 mt-2">
                                Semua data yang terkait dengan item ini akan
                                ikut terhapus.
                            </p>
                        </div>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Hapus Item"
                submit-variant="destructive"
                cancel-text="Batal"
                :loading="loading"
                @submit="handleDeleteItem"
            />
        </FormDialog>
    </AppLayout>
</template>