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
import { Switch } from '@/components/ui/switch';
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem } from '@/types';
import { Unit } from '@/types/datamaster';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Unit',
        href: '',
    },
];

// Enum untuk kategori unit
const unitTypes = [
    { value: 'rektorat', label: 'Rektorat' },
    { value: 'unit', label: 'Unit' },
    { value: 'biro', label: 'Biro' },
    { value: 'prodi', label: 'Prodi' },
] as const;

// unit columns (tanpa kolom bank)
const columns: ColumnDef<Unit>[] = [
    createColumn({
        value: 'unit_code',
        title: 'Kode Unit',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            return row.original.unit_code;
        },
    }),
    createColumn({
        value: 'unit_name',
        title: 'Nama Unit',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.unit_name;
        },
    }),

    createColumn({
        value: 'unit_type',
        title: 'Kategori',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const value = row.original.unit_type;
            const matchedUnit = unitTypes.find((type) => type.value === value);
            return matchedUnit ? matchedUnit.label : value;
        },
    }),

    createColumn({
        value: 'status',
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
            onClick: (row: Unit) => updateUnit(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: Unit) => deleteUnit(row),
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/units',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari unit...',
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

// form data dengan field bank
const unitForm = reactive({
    id: '',
    unit_code: '',
    unit_name: '',
    unit_type: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    is_active: true,
});

const unitToDelete = ref<Unit | null>(null);

// Individual field errors
const fieldErrors = reactive({
    unit_name: [] as string[],
    unit_type: [] as string[],
    bank_name: [] as string[],
    bank_account_number: [] as string[],
    bank_account_name: [] as string[],
    is_active: [] as string[],
    general: [] as string[],
});

const showValidationErrors = ref(false);

// Reset validation
const resetValidation = () => {
    fieldErrors.unit_name = [];
    fieldErrors.unit_type = [];
    fieldErrors.bank_name = [];
    fieldErrors.bank_account_number = [];
    fieldErrors.bank_account_name = [];
    fieldErrors.is_active = [];
    fieldErrors.general = [];
    showValidationErrors.value = false;
};

// Validation function
const validateForm = (): boolean => {
    // Reset errors
    resetValidation();

    // Unit Name validation
    if (!unitForm.unit_name || unitForm.unit_name.trim() === '') {
        fieldErrors.unit_name.push('Nama unit wajib diisi');
    } else if (unitForm.unit_name.trim().length < 3) {
        fieldErrors.unit_name.push('Nama unit minimal 3 karakter');
    } else if (unitForm.unit_name.trim().length > 100) {
        fieldErrors.unit_name.push('Nama unit maksimal 100 karakter');
    }

    // Unit Type validation
    if (!unitForm.unit_type || unitForm.unit_type.trim() === '') {
        fieldErrors.unit_type.push('Kategori unit wajib dipilih');
    } else if (!unitTypes.some((type) => type.value === unitForm.unit_type)) {
        fieldErrors.unit_type.push('Kategori unit tidak valid');
    }

    // Bank Account Number validation (jika diisi)
    if (
        unitForm.bank_account_number &&
        unitForm.bank_account_number.trim() !== ''
    ) {
        // Hanya angka
        if (!/^\d+$/.test(unitForm.bank_account_number.trim())) {
            fieldErrors.bank_account_number.push(
                'Nomor rekening hanya boleh berisi angka',
            );
        }
        // Panjang nomor rekening
        if (unitForm.bank_account_number.trim().length < 5) {
            fieldErrors.bank_account_number.push(
                'Nomor rekening minimal 5 digit',
            );
        }
        if (unitForm.bank_account_number.trim().length > 20) {
            fieldErrors.bank_account_number.push(
                'Nomor rekening maksimal 20 digit',
            );
        }

        // Jika nomor rekening diisi, bank name harus diisi
        if (!unitForm.bank_name || unitForm.bank_name.trim() === '') {
            fieldErrors.bank_name.push(
                'Nama bank wajib diisi jika nomor rekening diisi',
            );
        }
    }

    // Bank Name validation (jika diisi)
    if (unitForm.bank_name && unitForm.bank_name.trim() !== '') {
        if (unitForm.bank_name.trim().length < 2) {
            fieldErrors.bank_name.push('Nama bank minimal 2 karakter');
        }

        // Jika bank name diisi, account number harus diisi
        if (
            !unitForm.bank_account_number ||
            unitForm.bank_account_number.trim() === ''
        ) {
            fieldErrors.bank_account_number.push(
                'Nomor rekening wajib diisi jika nama bank diisi',
            );
        }
        // Jika bank name diisi, account name harus diisi
        if (
            !unitForm.bank_account_name ||
            unitForm.bank_account_name.trim() === ''
        ) {
            fieldErrors.bank_account_name.push(
                'Pemilik rekening wajib diisi jika nama bank diisi',
            );
        }
    }

    // Bank Account Name validation (jika diisi)
    if (
        unitForm.bank_account_name &&
        unitForm.bank_account_name.trim() !== ''
    ) {
        if (unitForm.bank_account_name.trim().length < 2) {
            fieldErrors.bank_account_name.push(
                'Nama pemilik rekening minimal 2 karakter',
            );
        }
        if (unitForm.bank_account_name.trim().length > 100) {
            fieldErrors.bank_account_name.push(
                'Nama pemilik rekening maksimal 100 karakter',
            );
        }
    }

    showValidationErrors.value = true;

    const hasErrors =
        fieldErrors.unit_name.length > 0 ||
        fieldErrors.unit_type.length > 0 ||
        fieldErrors.bank_name.length > 0 ||
        fieldErrors.bank_account_number.length > 0 ||
        fieldErrors.bank_account_name.length > 0 ||
        fieldErrors.is_active.length > 0 ||
        fieldErrors.general.length > 0;

    return !hasErrors;
};

// Computed property for form validity
const isFormValid = computed(() => {
    if (!showValidationErrors.value) return true;

    return (
        fieldErrors.unit_name.length === 0 &&
        fieldErrors.unit_type.length === 0 &&
        fieldErrors.bank_name.length === 0 &&
        fieldErrors.bank_account_number.length === 0 &&
        fieldErrors.bank_account_name.length === 0 &&
        fieldErrors.is_active.length === 0 &&
        fieldErrors.general.length === 0
    );
});

// Watch form changes to clear errors
watch(
    () => unitForm.unit_name,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.unit_name = [];
        }
    },
);

watch(
    () => unitForm.unit_type,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.unit_type = [];
        }
    },
);

watch(
    () => unitForm.bank_name,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.bank_name = [];
            fieldErrors.bank_account_number = [];
            fieldErrors.bank_account_name = [];
        }
    },
);

watch(
    () => unitForm.bank_account_number,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.bank_account_number = [];
        }
    },
);

watch(
    () => unitForm.bank_account_name,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.bank_account_name = [];
        }
    },
);

// Handle server errors
const handleServerErrors = (errors: Record<string, string[]>) => {
    resetValidation();

    if (errors.unit_name) {
        fieldErrors.unit_name = Array.isArray(errors.unit_name)
            ? errors.unit_name
            : [errors.unit_name];
    }
    if (errors.unit_type) {
        fieldErrors.unit_type = Array.isArray(errors.unit_type)
            ? errors.unit_type
            : [errors.unit_type];
    }
    if (errors.bank_name) {
        fieldErrors.bank_name = Array.isArray(errors.bank_name)
            ? errors.bank_name
            : [errors.bank_name];
    }
    if (errors.bank_account_number) {
        fieldErrors.bank_account_number = Array.isArray(
            errors.bank_account_number,
        )
            ? errors.bank_account_number
            : [errors.bank_account_number];
    }
    if (errors.bank_account_name) {
        fieldErrors.bank_account_name = Array.isArray(errors.bank_account_name)
            ? errors.bank_account_name
            : [errors.bank_account_name];
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
    Object.assign(unitForm, {
        id: '',
        unit_code: '',
        unit_name: '',
        unit_type: '',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
        is_active: true,
    });
    resetValidation();
};

// init form data
const createUnit = () => {
    resetForm();
    showCreateDialog.value = true;
};

const updateUnit = (unit: Unit) => {
    resetForm();
    Object.assign(unitForm, {
        id: unit.id,
        unit_code: unit.unit_code,
        unit_name: unit.unit_name,
        unit_type: unit.unit_type,
        bank_name: unit.bank_name || '',
        bank_account_number: unit.bank_account_number || '',
        bank_account_name: unit.bank_account_name || '',
        is_active: unit.is_active,
    });

    showEditDialog.value = true;
};

const deleteUnit = (unit: Unit) => {
    unitToDelete.value = unit;
    showDeleteDialog.value = true;
};

// handle create unit
const handleCreateUnit = async () => {
    if (!validateForm()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.post('/api/v1/units', unitForm);

        toast.success('Unit berhasil ditambahkan!', {
            description: `Unit ${unitForm.unit_name} telah dibuat.`,
        });

        showCreateDialog.value = false;
        resetForm();

        await dataTable.actions.refresh();

        const meta = dataTable.actions.getRawMeta();
        if (meta) {
            const lastPage = meta.pagination?.last_page;

            if (lastPage) {
                dataTable.actions.goToPage(lastPage);
            }
        }
    } catch (error) {
        handleApiError(error, 'Gagal menambahkan unit. Silakan coba lagi.');
    } finally {
        loading.value = false;
    }
};

// handle update unit
const handleUpdateUnit = async () => {
    if (!validateForm()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.put(`/api/v1/units/${unitForm.id}`, unitForm);

        toast.success('Unit berhasil diperbarui!', {
            description: `Unit ${unitForm.unit_name} telah diperbarui.`,
        });

        showEditDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(error, 'Gagal memperbarui unit. Silakan coba lagi.');
    } finally {
        loading.value = false;
    }
};

// handle delete data
const handleDeleteUnit = async () => {
    if (!unitToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(`/api/v1/units/${unitToDelete.value.id}`);

        toast.success('Unit berhasil dihapus!', {
            description: `Unit ${unitToDelete.value.unit_name} telah dihapus permanen.`,
        });

        showDeleteDialog.value = false;
        unitToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(error, 'Gagal menghapus unit. Silakan coba lagi.');
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
    <Head title="Unit" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Unit</h1>
                    <p class="text-muted-foreground">
                        Pengaturan data unit kerja/biro/prodi
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button @click="createUnit">
                        <PlusIcon class="mr-2 h-4 w-4" />
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
                search-placeholder="Cari Unit"
                show-pagination
                show-page-info
                empty-message="Data unit tidak ditemukan"
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

        <!-- Create Unit Dialog -->
        <FormDialog
            v-model:open="showCreateDialog"
            :loading="loading"
            size="lg"
        >
            <FormDialog.Header
                title="Tambah Unit"
                description="Menambahkan informasi unit baru."
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
                    <div class="space-y-2">
                        <Label for="create-unit_code"> Kode Unit </Label>
                        <Input
                            id="create-unit_code"
                            v-model="unitForm.unit_code"
                            placeholder="[Generate Otomatis]"
                            :disabled="true"
                            class="disabled:cursor-not-allowed disabled:opacity-75"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="create-unit_name">
                            Nama Unit <span class="text-red-500">*</span>
                        </Label>
                        <Input
                            id="create-unit_name"
                            v-model="unitForm.unit_name"
                            placeholder="Isikan nama unit"
                            :disabled="loading"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.unit_name.length > 0,
                            }"
                        />
                        <p
                            v-for="(error, index) in fieldErrors.unit_name"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label for="create-unit_type">
                        Kategori <span class="text-red-500">*</span>
                    </Label>
                    <Select v-model="unitForm.unit_type">
                        <SelectTrigger
                            id="create-unit_type"
                            :disabled="loading"
                            class="w-full"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.unit_type.length > 0,
                            }"
                        >
                            <SelectValue placeholder="Pilih kategori unit" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem
                                v-for="unit_type in unitTypes"
                                :key="unit_type.value"
                                :value="unit_type.value"
                            >
                                {{ unit_type.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <p
                        v-for="(error, index) in fieldErrors.unit_type"
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
                        </div>
                        <!-- <Switch 
                            id="create-is-active" 
                            v-model="unitForm.is_active"
                            :disabled="loading"
                            :class="{ 'data-[state=checked]:bg-blue-600': unitForm.is_active }"
                        /> -->
                        <Switch
                            id="create-is-active"
                            v-model="unitForm.is_active"
                            :disabled="loading"
                        />
                    </div>
                    <div
                        class="flex items-center gap-2 text-xs"
                        :class="
                            unitForm.is_active
                                ? 'text-primary'
                                : 'text-muted-foreground'
                        "
                    >
                        <component
                            :is="
                                unitForm.is_active
                                    ? BadgeCheckIcon
                                    : XCircleIcon
                            "
                            class="h-4 w-4"
                        />
                        <span>
                            {{
                                unitForm.is_active
                                    ? 'Data unit ini aktif digunakan'
                                    : 'Aktifkan jika data unit ini masih digunakan'
                            }}
                        </span>
                    </div>
                </div>

                <div class="mt-2 border-t pt-4">
                    <h3 class="mb-3 text-sm font-semibold">
                        Informasi Rekening Bank
                    </h3>

                    <div class="mb-4 grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <Label for="create-bank-name">Nama Bank</Label>
                            <Input
                                id="create-bank-name"
                                v-model="unitForm.bank_name"
                                placeholder="Isikan nama bank"
                                :disabled="loading"
                                :class="{
                                    'border-red-500 focus:ring-red-500':
                                        fieldErrors.bank_name.length > 0,
                                }"
                            />
                            <p
                                v-if="fieldErrors.bank_name.length === 0"
                                class="text-xs text-gray-500"
                            >
                                Contoh: Bank Mandiri, BCA, BRI
                            </p>
                            <p
                                v-for="(error, index) in fieldErrors.bank_name"
                                :key="index"
                                class="text-xs text-red-500"
                            >
                                {{ error }}
                            </p>
                        </div>

                        <div class="space-y-2">
                            <Label for="create-account-number"
                                >Nomor Rekening</Label
                            >
                            <Input
                                id="create-account-number"
                                v-model="unitForm.bank_account_number"
                                placeholder="Isikan nomor rekening"
                                :disabled="loading"
                                type="text"
                                :class="{
                                    'border-red-500 focus:ring-red-500':
                                        fieldErrors.bank_account_number.length >
                                        0,
                                }"
                            />
                            <p
                                v-for="(
                                    error, index
                                ) in fieldErrors.bank_account_number"
                                :key="index"
                                class="text-xs text-red-500"
                            >
                                {{ error }}
                            </p>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <Label for="create-account-holder"
                            >Pemilik Rekening</Label
                        >
                        <Input
                            id="create-account-holder"
                            v-model="unitForm.bank_account_name"
                            placeholder="Isikan nama pemilik rekening"
                            :disabled="loading"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.bank_account_name.length > 0,
                            }"
                        />
                        <p
                            v-for="(
                                error, index
                            ) in fieldErrors.bank_account_name"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Buat Unit"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleCreateUnit"
                @cancel="handleCancelCreate"
            />
        </FormDialog>

        <!-- Edit Unit Dialog -->
        <FormDialog v-model:open="showEditDialog" :loading="loading" size="lg">
            <FormDialog.Header
                title="Update Unit"
                description="Memperbaharui informasi unit."
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
                    <div class="space-y-2">
                        <Label for="edit-unit_code"> Kode Unit </Label>
                        <Input
                            id="edit-unit_code"
                            v-model="unitForm.unit_code"
                            placeholder="Isikan kode unit"
                            :disabled="true"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-unit_name">
                            Nama Unit <span class="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-unit_name"
                            v-model="unitForm.unit_name"
                            placeholder="Isikan nama unit"
                            :disabled="loading"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.unit_name.length > 0,
                            }"
                        />
                        <p
                            v-for="(error, index) in fieldErrors.unit_name"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label for="edit-unit_type">
                        Kategori <span class="text-red-500">*</span>
                    </Label>
                    <Select v-model="unitForm.unit_type">
                        <SelectTrigger
                            id="edit-unit_type"
                            :disabled="loading"
                            class="w-full"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.unit_type.length > 0,
                            }"
                        >
                            <SelectValue placeholder="Pilih kategori unit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="unit_type in unitTypes"
                                :key="unit_type.value"
                                :value="unit_type.value"
                            >
                                {{ unit_type.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p
                        v-for="(error, index) in fieldErrors.unit_type"
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
                        </div>
                        <!-- <Switch
                            id="edit-is-active"
                            v-model="unitForm.is_active"
                            :disabled="loading"
                        /> -->

                        <Switch
                            id="edit-is-active"
                            v-model="unitForm.is_active"
                            :disabled="loading"
                        />
                    </div>
                    <div
                        class="flex items-center gap-2 text-xs"
                        :class="
                            unitForm.is_active
                                ? 'text-primary'
                                : 'text-muted-foreground'
                        "
                    >
                        <component
                            :is="
                                unitForm.is_active
                                    ? BadgeCheckIcon
                                    : XCircleIcon
                            "
                            class="h-4 w-4"
                        />
                        <span>
                            {{
                                unitForm.is_active
                                    ? 'Data unit ini aktif digunakan'
                                    : 'Aktifkan jika data unit ini masih digunakan'
                            }}
                        </span>
                    </div>
                </div>

                <div class="mt-2 border-t pt-4">
                    <h3
                        class="mb-3 text-sm font-semibold text-muted-foreground"
                    >
                        Informasi Rekening Bank
                    </h3>

                    <div class="mb-4 grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <Label for="edit-bank-name">Nama Bank</Label>
                            <Input
                                id="edit-bank-name"
                                v-model="unitForm.bank_name"
                                placeholder="Isikan nama bank"
                                :disabled="loading"
                                :class="{
                                    'border-red-500 focus:ring-red-500':
                                        fieldErrors.bank_name.length > 0,
                                }"
                            />
                            <p
                                v-if="fieldErrors.bank_name.length === 0"
                                class="text-xs text-gray-500"
                            >
                                Contoh: Bank Mandiri, BCA, BRI
                            </p>
                            <p
                                v-for="(error, index) in fieldErrors.bank_name"
                                :key="index"
                                class="text-xs text-red-500"
                            >
                                {{ error }}
                            </p>
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-account-number"
                                >Nomor Rekening</Label
                            >
                            <Input
                                id="edit-account-number"
                                v-model="unitForm.bank_account_number"
                                placeholder="Isikan nomor rekening"
                                :disabled="loading"
                                type="text"
                                :class="{
                                    'border-red-500 focus:ring-red-500':
                                        fieldErrors.bank_account_number.length >
                                        0,
                                }"
                            />
                            <p
                                v-for="(
                                    error, index
                                ) in fieldErrors.bank_account_number"
                                :key="index"
                                class="text-xs text-red-500"
                            >
                                {{ error }}
                            </p>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-account-holder"
                            >Pemilik Rekening</Label
                        >
                        <Input
                            id="edit-account-holder"
                            v-model="unitForm.bank_account_name"
                            placeholder="Isikan nama pemilik rekening"
                            :disabled="loading"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.bank_account_name.length > 0,
                            }"
                        />
                        <p
                            v-for="(
                                error, index
                            ) in fieldErrors.bank_account_name"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Update Unit"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleUpdateUnit"
                @cancel="handleCancelEdit"
            />
        </FormDialog>

        <!-- Delete Unit Dialog -->
        <FormDialog
            v-model:open="showDeleteDialog"
            :loading="loading"
            size="sm"
        >
            <FormDialog.Header
                title="Hapus Unit"
                description="Proses ini tidak dapat dibatalkan. Unit akan dihapus secara permanen."
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
                                Apakah kamu yakin akan menghapus unit:
                            </p>
                            <p class="mt-2 text-sm font-semibold text-red-800">
                                {{ unitToDelete?.unit_code }} -
                                {{ unitToDelete?.unit_name }}
                            </p>
                            <p class="mt-2 text-xs text-red-600">
                                Semua data yang terkait dengan unit ini akan
                                ikut terhapus.
                            </p>
                        </div>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Hapus Unit"
                submit-variant="destructive"
                cancel-text="Batal"
                :loading="loading"
                @submit="handleDeleteUnit"
            />
        </FormDialog>
    </AppLayout>
</template>
