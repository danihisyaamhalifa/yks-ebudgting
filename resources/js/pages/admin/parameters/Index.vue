<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    BadgeCheckIcon,
    EditIcon,
    FilterIcon,
    ListIcon,
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
        title: 'Parameter',
        href: '',
    },
];

// Type definitions
interface Parameter {
    id: string;
    group_code: string;
    group_name: string;
    description: string;
    is_active: boolean;
    parameter_values?: ParameterValue[];
}

interface ParameterValue {
    id: string;
    parameter_id: string;
    code: string;
    name: string;
    description: string;
    group_code: string;
    sort_order: number;
    is_active: boolean;
}

// Parameter columns
const parameterColumns: ColumnDef<Parameter>[] = [
    createColumn({
        value: 'group_code',
        title: 'Kode Grup',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => row.original.group_code,
    }),
    createColumn({
        value: 'group_name',
        title: 'Nama Grup',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => row.original.group_name,
    }),
    createColumn({
        value: 'description',
        title: 'Deskripsi',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => row.original.description || '-',
    }),
    createColumn({
        value: 'status',
        title: 'Status',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            const isActive = !!row.original.is_active;
            return h(
                Badge,
                {
                    variant: isActive ? 'secondary' : 'destructive',
                    class: isActive ? 'bg-blue-500 text-white gap-1' : 'gap-1',
                },
                isActive
                    ? [h(BadgeCheckIcon, { class: 'w-4 h-4' }), 'Aktif']
                    : [h(XCircleIcon, { class: 'w-4 h-4' }), 'Non Aktif'],
            );
        },
    }),
    createActionColumn([
        {
            icon: ListIcon,
            variant: 'outline',
            onClick: (row: Parameter) => openParameterValues(row),
        },
        {
            icon: EditIcon,
            variant: 'default',
            onClick: (row: Parameter) => updateParameter(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: Parameter) => deleteParameter(row),
        },
    ]),
];

// Parameter Value columns
const parameterValueColumns: ColumnDef<ParameterValue>[] = [
    createColumn({
        value: 'code',
        title: 'Kode',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => row.original.code,
    }),
    createColumn({
        value: 'name',
        title: 'Nama',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => row.original.name,
    }),
    createColumn({
        value: 'description',
        title: 'Deskripsi',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => row.original.description || '-',
    }),
    createColumn({
        value: 'sort_order',
        title: 'Urutan',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => row.original.sort_order || 0,
    }),
    createColumn({
        value: 'status',
        title: 'Status',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            const isActive = !!row.original.is_active;
            return h(
                Badge,
                {
                    variant: isActive ? 'secondary' : 'destructive',
                    class: isActive ? 'bg-blue-500 text-white gap-1' : 'gap-1',
                },
                isActive
                    ? [h(BadgeCheckIcon, { class: 'w-4 h-4' }), 'Aktif']
                    : [h(XCircleIcon, { class: 'w-4 h-4' }), 'Non Aktif'],
            );
        },
    }),
    createActionColumn([
        {
            icon: EditIcon,
            variant: 'default',
            onClick: (row: ParameterValue) => updateParameterValue(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: ParameterValue) => deleteParameterValue(row),
        },
    ]),
];

// Init DataTables
const parameterDataTable = useDataTable({
    endpoint: '/api/v1/parameters',
    columns: parameterColumns,
    searchable: true,
    searchPlaceholder: 'Cari parameter...',
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    refreshable: true,
});

const parameterValueDataTable = useDataTable({
    endpoint: '/api/v1/parameter-values',
    columns: parameterValueColumns,
    searchable: true,
    searchPlaceholder: 'Cari nilai parameter...',
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    refreshable: true,
});

// State management
const showCreateParameterDialog = ref(false);
const showEditParameterDialog = ref(false);
const showDeleteParameterDialog = ref(false);

const showCreateValueDialog = ref(false);
const showEditValueDialog = ref(false);
const showDeleteValueDialog = ref(false);

const loading = ref(false);
const selectedParameter = ref<Parameter | null>(null);
const parameterToDelete = ref<Parameter | null>(null);
const valueToDelete = ref<ParameterValue | null>(null);
const activeTab = ref('parameters');
const isFilterActive = ref(false);

const isValuesTabActive = computed(() => activeTab.value === 'values');

// Parameter form
const parameterForm = reactive({
    id: '',
    group_code: '',
    group_name: '',
    description: '',
    is_active: true,
});

// Parameter Value form
const valueForm = reactive({
    id: '',
    parameter_id: '',
    code: '',
    name: '',
    description: '',
    group_code: '',
    sort_order: 0,
    is_active: true,
});

// Field errors
const parameterErrors = reactive({
    group_code: [] as string[],
    group_name: [] as string[],
    description: [] as string[],
    is_active: [] as string[],
    general: [] as string[],
});

const valueErrors = reactive({
    code: [] as string[],
    name: [] as string[],
    description: [] as string[],
    sort_order: [] as string[],
    is_active: [] as string[],
    general: [] as string[],
});

const showParameterValidation = ref(false);
const showValueValidation = ref(false);

// Reset validations
const resetParameterValidation = () => {
    Object.keys(parameterErrors).forEach((key) => {
        parameterErrors[key as keyof typeof parameterErrors] = [];
    });
    showParameterValidation.value = false;
};

const resetValueValidation = () => {
    Object.keys(valueErrors).forEach((key) => {
        valueErrors[key as keyof typeof valueErrors] = [];
    });
    showValueValidation.value = false;
};

// Validate Parameter
const validateParameter = (): boolean => {
    resetParameterValidation();

    if (!parameterForm.group_code || parameterForm.group_code.trim() === '') {
        parameterErrors.group_code.push('Kode grup wajib diisi');
    } else if (parameterForm.group_code.trim().length < 2) {
        parameterErrors.group_code.push('Kode grup minimal 2 karakter');
    } else if (parameterForm.group_code.trim().length > 50) {
        parameterErrors.group_code.push('Kode grup maksimal 50 karakter');
    }

    if (!parameterForm.group_name || parameterForm.group_name.trim() === '') {
        parameterErrors.group_name.push('Nama grup wajib diisi');
    } else if (parameterForm.group_name.trim().length < 3) {
        parameterErrors.group_name.push('Nama grup minimal 3 karakter');
    } else if (parameterForm.group_name.trim().length > 100) {
        parameterErrors.group_name.push('Nama grup maksimal 100 karakter');
    }

    showParameterValidation.value = true;

    const hasErrors = Object.values(parameterErrors).some(
        (arr) => arr.length > 0,
    );
    return !hasErrors;
};

// Validate Parameter Value
const validateValue = (): boolean => {
    resetValueValidation();

    if (!valueForm.code || valueForm.code.trim() === '') {
        valueErrors.code.push('Kode nilai wajib diisi');
    } else if (valueForm.code.trim().length < 2) {
        valueErrors.code.push('Kode nilai minimal 2 karakter');
    } else if (valueForm.code.trim().length > 50) {
        valueErrors.code.push('Kode nilai maksimal 50 karakter');
    }

    if (!valueForm.name || valueForm.name.trim() === '') {
        valueErrors.name.push('Nama nilai wajib diisi');
    } else if (valueForm.name.trim().length < 3) {
        valueErrors.name.push('Nama nilai minimal 3 karakter');
    } else if (valueForm.name.trim().length > 100) {
        valueErrors.name.push('Nama nilai maksimal 100 karakter');
    }

    if (valueForm.sort_order < 0) {
        valueErrors.sort_order.push('Urutan tidak boleh negatif');
    }

    showValueValidation.value = true;

    const hasErrors = Object.values(valueErrors).some((arr) => arr.length > 0);
    return !hasErrors;
};

// Computed for form validity
const isParameterFormValid = computed(() => {
    if (!showParameterValidation.value) return true;
    return Object.values(parameterErrors).every((arr) => arr.length === 0);
});

const isValueFormValid = computed(() => {
    if (!showValueValidation.value) return true;
    return Object.values(valueErrors).every((arr) => arr.length === 0);
});

// Reset forms
const resetParameterForm = () => {
    Object.assign(parameterForm, {
        id: '',
        group_code: '',
        group_name: '',
        description: '',
        is_active: true,
    });
    resetParameterValidation();
};

const resetValueForm = () => {
    Object.assign(valueForm, {
        id: '',
        parameter_id: '',
        code: '',
        name: '',
        description: '',
        group_code: '',
        sort_order: 0,
        is_active: true,
    });
    resetValueValidation();
};

// CRUD for Parameter
const createParameter = () => {
    resetParameterForm();
    showCreateParameterDialog.value = true;
};

const updateParameter = (param: Parameter) => {
    resetParameterForm();
    Object.assign(parameterForm, {
        id: param.id,
        group_code: param.group_code,
        group_name: param.group_name,
        description: param.description || '',
        is_active: param.is_active,
    });
    showEditParameterDialog.value = true;
};

const deleteParameter = (param: Parameter) => {
    parameterToDelete.value = param;
    showDeleteParameterDialog.value = true;
};

const handleCreateParameter = async () => {
    if (!validateParameter()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.post('/api/v1/parameters', parameterForm);
        toast.success('Parameter berhasil ditambahkan!');
        showCreateParameterDialog.value = false;
        resetParameterForm();
        parameterDataTable.actions.refresh();
    } catch (error) {
        handleApiError(error, 'Gagal menambahkan parameter.');
    } finally {
        loading.value = false;
    }
};

const handleUpdateParameter = async () => {
    if (!validateParameter()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.put(
            `/api/v1/parameters/${parameterForm.id}`,
            parameterForm,
        );
        toast.success('Parameter berhasil diperbarui!');
        showEditParameterDialog.value = false;
        resetParameterForm();
        parameterDataTable.actions.refresh();
    } catch (error) {
        handleApiError(error, 'Gagal memperbarui parameter.');
    } finally {
        loading.value = false;
    }
};

const handleDeleteParameter = async () => {
    if (!parameterToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(`/api/v1/parameters/${parameterToDelete.value.id}`);
        toast.success('Parameter berhasil dihapus!');
        showDeleteParameterDialog.value = false;
        parameterToDelete.value = null;
        parameterDataTable.actions.refresh();
    } catch (error) {
        handleApiError(error, 'Gagal menghapus parameter.');
    } finally {
        loading.value = false;
    }
};

const openParameterValues = (param: Parameter) => {
    selectedParameter.value = param;
    valueForm.parameter_id = param.id;
    valueForm.group_code = param.group_code;
    activeTab.value = 'values';
    isFilterActive.value = true;

    refreshParameterValues();
};

const refreshParameterValues = () => {
    if (selectedParameter.value) {
        parameterValueDataTable.actions.filter({
            parameter_id: selectedParameter.value.id,
        });
    }
};

const clearParameterFilter = () => {
    isFilterActive.value = false;
    selectedParameter.value = null;
    activeTab.value = 'parameters';
};

const createParameterValue = () => {
    if (!selectedParameter.value) {
        toast.warning('Silakan pilih parameter terlebih dahulu.');
        return;
    }
    resetValueForm();
    valueForm.parameter_id = selectedParameter.value.id;
    valueForm.group_code = selectedParameter.value.group_code;
    showCreateValueDialog.value = true;
};

const updateParameterValue = (value: ParameterValue) => {
    resetValueForm();
    Object.assign(valueForm, {
        id: value.id,
        parameter_id: value.parameter_id,
        code: value.code,
        name: value.name,
        description: value.description || '',
        group_code: value.group_code,
        sort_order: value.sort_order || 0,
        is_active: value.is_active,
    });
    showEditValueDialog.value = true;
};

const deleteParameterValue = (value: ParameterValue) => {
    valueToDelete.value = value;
    showDeleteValueDialog.value = true;
};

const handleCreateValue = async () => {
    if (!validateValue()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.post('/api/v1/parameter-values', valueForm);
        toast.success('Nilai parameter berhasil ditambahkan!');
        showCreateValueDialog.value = false;
        resetValueForm();
        refreshParameterValues();
    } catch (error) {
        handleApiError(error, 'Gagal menambahkan nilai parameter.');
    } finally {
        loading.value = false;
    }
};

const handleUpdateValue = async () => {
    if (!validateValue()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.put(`/api/v1/parameter-values/${valueForm.id}`, valueForm);
        toast.success('Nilai parameter berhasil diperbarui!');
        showEditValueDialog.value = false;
        resetValueForm();
        refreshParameterValues();
    } catch (error) {
        handleApiError(error, 'Gagal memperbarui nilai parameter.');
    } finally {
        loading.value = false;
    }
};

const handleDeleteValue = async () => {
    if (!valueToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(
            `/api/v1/parameter-values/${valueToDelete.value.id}`,
        );
        toast.success('Nilai parameter berhasil dihapus!');
        showDeleteValueDialog.value = false;
        valueToDelete.value = null;
        refreshParameterValues();
    } catch (error) {
        handleApiError(error, 'Gagal menghapus nilai parameter.');
    } finally {
        loading.value = false;
    }
};

// Handle API errors
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
                    const errors = axiosError.response.data.errors;
                    // Handle errors for both forms
                    if (activeTab.value === 'parameters') {
                        Object.keys(errors).forEach((key) => {
                            if (key in parameterErrors) {
                                parameterErrors[
                                    key as keyof typeof parameterErrors
                                ] = errors[key];
                            }
                        });
                    } else {
                        Object.keys(errors).forEach((key) => {
                            if (key in valueErrors) {
                                valueErrors[key as keyof typeof valueErrors] =
                                    errors[key];
                            }
                        });
                    }
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

// Watch for form changes to clear errors
watch(
    () => parameterForm.group_code,
    () => {
        if (showParameterValidation.value) parameterErrors.group_code = [];
    },
);
watch(
    () => parameterForm.group_name,
    () => {
        if (showParameterValidation.value) parameterErrors.group_name = [];
    },
);
watch(
    () => valueForm.code,
    () => {
        if (showValueValidation.value) valueErrors.code = [];
    },
);
watch(
    () => valueForm.name,
    () => {
        if (showValueValidation.value) valueErrors.name = [];
    },
);
watch(
    () => valueForm.sort_order,
    () => {
        if (showValueValidation.value) valueErrors.sort_order = [];
    },
);

// Watch active tab to maintain state
// watch(activeTab, (newTab) => {
//     if (newTab === 'values' && selectedParameter.value) {
//         refreshParameterValues();
//     }
// });

watch(activeTab, (newTab, oldTab) => {
    // Jika pindah dari values ke parameters
    if (oldTab === 'values' && newTab === 'parameters') {
        // Clear filter
        parameterValueDataTable.actions.filter({});
        isFilterActive.value = false;
        selectedParameter.value = null;
        resetValueForm();
    }

    // Jika pindah ke values dan ada selected parameter
    if (newTab === 'values' && selectedParameter.value) {
        refreshParameterValues();
        isFilterActive.value = true;
    }
});
</script>

<template>
    <Head title="Parameter" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Parameter</h1>
                    <p class="text-muted-foreground">
                        Pengaturan data parameter dan nilai-nilainya
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button v-if="!isValuesTabActive" @click="createParameter">
                        <PlusIcon class="mr-2 h-4 w-4" />
                        Tambah Parameter
                    </Button>
                </div>
            </div>

            <!-- Tabs -->
            <Tabs v-model="activeTab" class="w-full">
                <TabsList>
                    <TabsTrigger value="parameters">Parameter</TabsTrigger>
                    <TabsTrigger value="values" :disabled="!selectedParameter">
                        Nilai Parameter
                        <span
                            v-if="selectedParameter"
                            class="ml-2 text-xs text-muted-foreground"
                        >
                            ({{ selectedParameter.group_code }})
                        </span>
                        <Badge
                            v-if="isFilterActive"
                            variant="secondary"
                            class="ml-2 text-xs"
                        >
                            <FilterIcon class="mr-1 h-3 w-3" />
                            Filter Aktif
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <!-- Parameter Tab -->
                <TabsContent value="parameters" class="mt-4">
                    <DataTable
                        :columns="parameterDataTable.columns"
                        :data="parameterDataTable.data.value"
                        :loading="parameterDataTable.loading.value"
                        :actions="parameterDataTable.actions"
                        searchable
                        search-placeholder="Cari parameter..."
                        show-pagination
                        show-page-info
                        empty-message="Data parameter tidak ditemukan"
                        server-side
                        :total-rows="
                            parameterDataTable.state.value.pagination.total
                        "
                        :current-page="
                            parameterDataTable.state.value.pagination.page
                        "
                        :total-pages="
                            parameterDataTable.state.value.pagination.totalPages
                        "
                        :current-page-size="
                            parameterDataTable.state.value.pagination.perPage
                        "
                        :exportable="true"
                        @search="parameterDataTable.actions.search"
                        @page-change="parameterDataTable.actions.goToPage"
                        @page-size-change="
                            parameterDataTable.actions.changePageSize
                        "
                        @sort-change="
                            (sortBy, sortOrder) =>
                                parameterDataTable.actions.sort(
                                    sortBy,
                                    sortOrder === 'desc',
                                )
                        "
                    />
                </TabsContent>

                <!-- Parameter Values Tab -->
                <TabsContent value="values" class="mt-4">
                    <div v-if="selectedParameter" class="mb-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold">
                                    Nilai Parameter:
                                    {{ selectedParameter.group_name }}
                                </h3>
                                <p class="text-sm text-muted-foreground">
                                    Kode: {{ selectedParameter.group_code }}
                                </p>
                                <div class="mt-2 flex items-center gap-2">
                                    <Badge variant="outline" class="text-xs">
                                        Filter: parameter_id =
                                        {{ selectedParameter.id }}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="h-6 px-2 text-xs"
                                        @click="clearParameterFilter"
                                    >
                                        <XCircleIcon class="mr-1 h-3 w-3" />
                                        Clear Filter
                                    </Button>
                                </div>
                            </div>
                            <!-- Tombol Tambah Nilai Parameter -->
                            <Button @click="createParameterValue">
                                <PlusIcon class="mr-2 h-4 w-4" />
                                Tambah Nilai
                            </Button>
                        </div>
                    </div>

                    <DataTable
                        :columns="parameterValueDataTable.columns"
                        :data="parameterValueDataTable.data.value"
                        :loading="parameterValueDataTable.loading.value"
                        :actions="parameterValueDataTable.actions"
                        searchable
                        search-placeholder="Cari nilai parameter..."
                        show-pagination
                        show-page-info
                        empty-message="Data nilai parameter tidak ditemukan"
                        server-side
                        :total-rows="
                            parameterValueDataTable.state.value.pagination.total
                        "
                        :current-page="
                            parameterValueDataTable.state.value.pagination.page
                        "
                        :total-pages="
                            parameterValueDataTable.state.value.pagination
                                .totalPages
                        "
                        :current-page-size="
                            parameterValueDataTable.state.value.pagination
                                .perPage
                        "
                        :exportable="true"
                        @search="parameterValueDataTable.actions.search"
                        @page-change="parameterValueDataTable.actions.goToPage"
                        @page-size-change="
                            parameterValueDataTable.actions.changePageSize
                        "
                        @sort-change="
                            (sortBy, sortOrder) =>
                                parameterValueDataTable.actions.sort(
                                    sortBy,
                                    sortOrder === 'desc',
                                )
                        "
                    />
                </TabsContent>
            </Tabs>

            <!-- Create Parameter Dialog -->
            <FormDialog
                v-model:open="showCreateParameterDialog"
                :loading="loading"
                size="lg"
            >
                <FormDialog.Header
                    title="Tambah Parameter"
                    description="Menambahkan grup parameter baru."
                />

                <FormDialog.Content spacing="md">
                    <div
                        v-if="parameterErrors.general.length > 0"
                        class="rounded-md border border-amber-200 bg-amber-50 p-3"
                    >
                        <div class="flex items-start gap-2">
                            <AlertCircleIcon
                                class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
                            />
                            <div>
                                <p
                                    v-for="(
                                        error, index
                                    ) in parameterErrors.general"
                                    :key="index"
                                    class="text-sm text-amber-700"
                                >
                                    {{ error }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <Label for="create-group_code">
                                    Kode Grup
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="create-group_code"
                                    v-model="parameterForm.group_code"
                                    placeholder="Isikan kode grup"
                                    :disabled="loading"
                                    :class="{
                                        'border-red-500 focus:ring-red-500':
                                            parameterErrors.group_code.length >
                                            0,
                                    }"
                                />
                                <p
                                    v-for="(
                                        error, index
                                    ) in parameterErrors.group_code"
                                    :key="index"
                                    class="text-xs text-red-500"
                                >
                                    {{ error }}
                                </p>
                            </div>

                            <div class="space-y-2">
                                <Label for="create-group_name">
                                    Nama Grup
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="create-group_name"
                                    v-model="parameterForm.group_name"
                                    placeholder="Isikan nama grup"
                                    :disabled="loading"
                                    :class="{
                                        'border-red-500 focus:ring-red-500':
                                            parameterErrors.group_name.length >
                                            0,
                                    }"
                                />
                                <p
                                    v-for="(
                                        error, index
                                    ) in parameterErrors.group_name"
                                    :key="index"
                                    class="text-xs text-red-500"
                                >
                                    {{ error }}
                                </p>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <Label for="create-description">Deskripsi</Label>
                            <Input
                                id="create-description"
                                v-model="parameterForm.description"
                                placeholder="Isikan deskripsi (opsional)"
                                :disabled="loading"
                            />
                        </div>

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
                                        Aktifkan parameter ini
                                    </p>
                                </div>
                                <Switch
                                    id="create-is-active"
                                    v-model="parameterForm.is_active"
                                    :disabled="loading"
                                />
                            </div>
                            <div
                                v-if="parameterForm.is_active"
                                class="flex items-center gap-2 text-xs text-blue-600"
                            >
                                <BadgeCheckIcon class="h-4 w-4" />
                                <span
                                    >Parameter ini akan ditandai sebagai
                                    aktif</span
                                >
                            </div>
                            <div
                                v-else
                                class="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                                <XCircleIcon class="h-4 w-4" />
                                <span
                                    >Parameter ini akan ditandai sebagai
                                    non-aktif</span
                                >
                            </div>
                        </div>
                    </div>
                </FormDialog.Content>

                <FormDialog.Footer
                    submit-text="Buat Parameter"
                    cancel-text="Batal"
                    :loading="loading"
                    :valid="isParameterFormValid"
                    @submit="handleCreateParameter"
                    @cancel="
                        () => {
                            showCreateParameterDialog = false;
                            resetParameterForm();
                        }
                    "
                />
            </FormDialog>

            <!-- Edit Parameter Dialog -->
            <FormDialog
                v-model:open="showEditParameterDialog"
                :loading="loading"
                size="lg"
            >
                <FormDialog.Header
                    title="Edit Parameter"
                    description="Memperbaharui data parameter."
                />

                <FormDialog.Content spacing="md">
                    <div
                        v-if="parameterErrors.general.length > 0"
                        class="rounded-md border border-amber-200 bg-amber-50 p-3"
                    >
                        <div class="flex items-start gap-2">
                            <AlertCircleIcon
                                class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
                            />
                            <div>
                                <p
                                    v-for="(
                                        error, index
                                    ) in parameterErrors.general"
                                    :key="index"
                                    class="text-sm text-amber-700"
                                >
                                    {{ error }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <Label for="edit-group_code">
                                    Kode Grup
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-group_code"
                                    v-model="parameterForm.group_code"
                                    placeholder="Isikan kode grup"
                                    :disabled="loading"
                                    :class="{
                                        'border-red-500 focus:ring-red-500':
                                            parameterErrors.group_code.length >
                                            0,
                                    }"
                                />
                                <p
                                    v-for="(
                                        error, index
                                    ) in parameterErrors.group_code"
                                    :key="index"
                                    class="text-xs text-red-500"
                                >
                                    {{ error }}
                                </p>
                            </div>

                            <div class="space-y-2">
                                <Label for="edit-group_name">
                                    Nama Grup
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-group_name"
                                    v-model="parameterForm.group_name"
                                    placeholder="Isikan nama grup"
                                    :disabled="loading"
                                    :class="{
                                        'border-red-500 focus:ring-red-500':
                                            parameterErrors.group_name.length >
                                            0,
                                    }"
                                />
                                <p
                                    v-for="(
                                        error, index
                                    ) in parameterErrors.group_name"
                                    :key="index"
                                    class="text-xs text-red-500"
                                >
                                    {{ error }}
                                </p>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-description">Deskripsi</Label>
                            <Input
                                id="edit-description"
                                v-model="parameterForm.description"
                                placeholder="Isikan deskripsi (opsional)"
                                :disabled="loading"
                            />
                        </div>

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
                                        Aktifkan parameter ini
                                    </p>
                                </div>
                                <Switch
                                    id="edit-is-active"
                                    v-model="parameterForm.is_active"
                                    :disabled="loading"
                                />
                            </div>
                            <div
                                v-if="parameterForm.is_active"
                                class="flex items-center gap-2 text-xs text-blue-600"
                            >
                                <BadgeCheckIcon class="h-4 w-4" />
                                <span
                                    >Parameter ini akan ditandai sebagai
                                    aktif</span
                                >
                            </div>
                            <div
                                v-else
                                class="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                                <XCircleIcon class="h-4 w-4" />
                                <span
                                    >Parameter ini akan ditandai sebagai
                                    non-aktif</span
                                >
                            </div>
                        </div>
                    </div>
                </FormDialog.Content>

                <FormDialog.Footer
                    submit-text="Update Parameter"
                    cancel-text="Batal"
                    :loading="loading"
                    :valid="isParameterFormValid"
                    @submit="handleUpdateParameter"
                    @cancel="
                        () => {
                            showEditParameterDialog = false;
                            resetParameterForm();
                        }
                    "
                />
            </FormDialog>

            <!-- Delete Parameter Dialog -->
            <FormDialog
                v-model:open="showDeleteParameterDialog"
                :loading="loading"
                size="sm"
            >
                <FormDialog.Header
                    title="Hapus Parameter"
                    description="Proses ini tidak dapat dibatalkan."
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
                                    Apakah kamu yakin akan menghapus parameter:
                                </p>
                                <p
                                    class="mt-2 text-sm font-semibold text-red-800"
                                >
                                    {{ parameterToDelete?.group_code }} -
                                    {{ parameterToDelete?.group_name }}
                                </p>
                                <p class="mt-2 text-xs text-red-600">
                                    Semua nilai parameter yang terkait akan ikut
                                    terhapus.
                                </p>
                            </div>
                        </div>
                    </div>
                </FormDialog.Content>

                <FormDialog.Footer
                    submit-text="Hapus Parameter"
                    submit-variant="destructive"
                    cancel-text="Batal"
                    :loading="loading"
                    @submit="handleDeleteParameter"
                />
            </FormDialog>

            <!-- Create Value Dialog -->
            <FormDialog
                v-model:open="showCreateValueDialog"
                :loading="loading"
                size="lg"
            >
                <FormDialog.Header
                    title="Tambah Nilai Parameter"
                    description="Menambahkan nilai baru untuk parameter."
                />

                <FormDialog.Content spacing="md">
                    <div
                        v-if="valueErrors.general.length > 0"
                        class="rounded-md border border-amber-200 bg-amber-50 p-3"
                    >
                        <div class="flex items-start gap-2">
                            <AlertCircleIcon
                                class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
                            />
                            <div>
                                <p
                                    v-for="(
                                        error, index
                                    ) in valueErrors.general"
                                    :key="index"
                                    class="text-sm text-amber-700"
                                >
                                    {{ error }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <Label for="create-value-code">
                                    Kode Nilai
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="create-value-code"
                                    v-model="valueForm.code"
                                    placeholder="Isikan kode nilai"
                                    :disabled="loading"
                                    :class="{
                                        'border-red-500 focus:ring-red-500':
                                            valueErrors.code.length > 0,
                                    }"
                                />
                                <p
                                    v-for="(error, index) in valueErrors.code"
                                    :key="index"
                                    class="text-xs text-red-500"
                                >
                                    {{ error }}
                                </p>
                            </div>

                            <div class="space-y-2">
                                <Label for="create-value-name">
                                    Nama Nilai
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="create-value-name"
                                    v-model="valueForm.name"
                                    placeholder="Isikan nama nilai"
                                    :disabled="loading"
                                    :class="{
                                        'border-red-500 focus:ring-red-500':
                                            valueErrors.name.length > 0,
                                    }"
                                />
                                <p
                                    v-for="(error, index) in valueErrors.name"
                                    :key="index"
                                    class="text-xs text-red-500"
                                >
                                    {{ error }}
                                </p>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <Label for="create-value-description"
                                >Deskripsi</Label
                            >
                            <Input
                                id="create-value-description"
                                v-model="valueForm.description"
                                placeholder="Isikan deskripsi (opsional)"
                                :disabled="loading"
                            />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <Label for="create-value-sort-order"
                                    >Urutan</Label
                                >
                                <Input
                                    id="create-value-sort-order"
                                    v-model.number="valueForm.sort_order"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    :disabled="loading"
                                    :class="{
                                        'border-red-500 focus:ring-red-500':
                                            valueErrors.sort_order.length > 0,
                                    }"
                                />
                                <p
                                    v-for="(
                                        error, index
                                    ) in valueErrors.sort_order"
                                    :key="index"
                                    class="text-xs text-red-500"
                                >
                                    {{ error }}
                                </p>
                            </div>

                            <div class="space-y-2">
                                <Label>Grup Parameter</Label>
                                <Input
                                    id="create-value-group_code"
                                    v-model="valueForm.group_code"
                                    class="bg-muted"
                                />
                                <p class="text-xs text-muted-foreground">
                                    Grup dari parameter yang dipilih
                                </p>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <div>
                                    <Label
                                        for="create-value-is-active"
                                        class="text-sm font-medium"
                                    >
                                        Status Aktif
                                    </Label>
                                    <p class="text-xs text-muted-foreground">
                                        Aktifkan nilai ini
                                    </p>
                                </div>
                                <Switch
                                    id="create-value-is-active"
                                    v-model="valueForm.is_active"
                                    :disabled="loading"
                                />
                            </div>
                            <div
                                v-if="valueForm.is_active"
                                class="flex items-center gap-2 text-xs text-blue-600"
                            >
                                <BadgeCheckIcon class="h-4 w-4" />
                                <span
                                    >Nilai ini akan ditandai sebagai aktif</span
                                >
                            </div>
                            <div
                                v-else
                                class="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                                <XCircleIcon class="h-4 w-4" />
                                <span
                                    >Nilai ini akan ditandai sebagai
                                    non-aktif</span
                                >
                            </div>
                        </div>
                    </div>
                </FormDialog.Content>

                <FormDialog.Footer
                    submit-text="Buat Nilai"
                    cancel-text="Batal"
                    :loading="loading"
                    :valid="isValueFormValid"
                    @submit="handleCreateValue"
                    @cancel="
                        () => {
                            showCreateValueDialog = false;
                            resetValueForm();
                        }
                    "
                />
            </FormDialog>

            <!-- Edit Value Dialog -->
            <FormDialog
                v-model:open="showEditValueDialog"
                :loading="loading"
                size="lg"
            >
                <FormDialog.Header
                    title="Edit Nilai Parameter"
                    description="Memperbaharui data nilai parameter."
                />

                <FormDialog.Content spacing="md">
                    <div
                        v-if="valueErrors.general.length > 0"
                        class="rounded-md border border-amber-200 bg-amber-50 p-3"
                    >
                        <div class="flex items-start gap-2">
                            <AlertCircleIcon
                                class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
                            />
                            <div>
                                <p
                                    v-for="(
                                        error, index
                                    ) in valueErrors.general"
                                    :key="index"
                                    class="text-sm text-amber-700"
                                >
                                    {{ error }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <Label for="edit-value-code">
                                    Kode Nilai
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-value-code"
                                    v-model="valueForm.code"
                                    placeholder="Isikan kode nilai"
                                    :disabled="loading"
                                    :class="{
                                        'border-red-500 focus:ring-red-500':
                                            valueErrors.code.length > 0,
                                    }"
                                />
                                <p
                                    v-for="(error, index) in valueErrors.code"
                                    :key="index"
                                    class="text-xs text-red-500"
                                >
                                    {{ error }}
                                </p>
                            </div>

                            <div class="space-y-2">
                                <Label for="edit-value-name">
                                    Nama Nilai
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-value-name"
                                    v-model="valueForm.name"
                                    placeholder="Isikan nama nilai"
                                    :disabled="loading"
                                    :class="{
                                        'border-red-500 focus:ring-red-500':
                                            valueErrors.name.length > 0,
                                    }"
                                />
                                <p
                                    v-for="(error, index) in valueErrors.name"
                                    :key="index"
                                    class="text-xs text-red-500"
                                >
                                    {{ error }}
                                </p>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-value-description"
                                >Deskripsi</Label
                            >
                            <Input
                                id="edit-value-description"
                                v-model="valueForm.description"
                                placeholder="Isikan deskripsi (opsional)"
                                :disabled="loading"
                            />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <Label for="edit-value-sort-order"
                                    >Urutan</Label
                                >
                                <Input
                                    id="edit-value-sort-order"
                                    v-model.number="valueForm.sort_order"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    :disabled="loading"
                                    :class="{
                                        'border-red-500 focus:ring-red-500':
                                            valueErrors.sort_order.length > 0,
                                    }"
                                />
                                <p
                                    v-for="(
                                        error, index
                                    ) in valueErrors.sort_order"
                                    :key="index"
                                    class="text-xs text-red-500"
                                >
                                    {{ error }}
                                </p>
                            </div>

                            <div class="space-y-2">
                                <Label>Grup Parameter</Label>
                                <Input
                                    id="edit-value-group_code"
                                    v-model="valueForm.group_code"
                                    class="bg-muted"
                                />
                                <p class="text-xs text-muted-foreground">
                                    Grup dari parameter yang dipilih
                                </p>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <div>
                                    <Label
                                        for="edit-value-is-active"
                                        class="text-sm font-medium"
                                    >
                                        Status Aktif
                                    </Label>
                                    <p class="text-xs text-muted-foreground">
                                        Aktifkan nilai ini
                                    </p>
                                </div>
                                <Switch
                                    id="edit-value-is-active"
                                    v-model="valueForm.is_active"
                                    :disabled="loading"
                                />
                            </div>
                            <div
                                v-if="valueForm.is_active"
                                class="flex items-center gap-2 text-xs text-blue-600"
                            >
                                <BadgeCheckIcon class="h-4 w-4" />
                                <span
                                    >Nilai ini akan ditandai sebagai aktif</span
                                >
                            </div>
                            <div
                                v-else
                                class="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                                <XCircleIcon class="h-4 w-4" />
                                <span
                                    >Nilai ini akan ditandai sebagai
                                    non-aktif</span
                                >
                            </div>
                        </div>
                    </div>
                </FormDialog.Content>

                <FormDialog.Footer
                    submit-text="Update Nilai"
                    cancel-text="Batal"
                    :loading="loading"
                    :valid="isValueFormValid"
                    @submit="handleUpdateValue"
                    @cancel="
                        () => {
                            showEditValueDialog = false;
                            resetValueForm();
                        }
                    "
                />
            </FormDialog>

            <!-- Delete Value Dialog -->
            <FormDialog
                v-model:open="showDeleteValueDialog"
                :loading="loading"
                size="sm"
            >
                <FormDialog.Header
                    title="Hapus Nilai Parameter"
                    description="Proses ini tidak dapat dibatalkan."
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
                                    Apakah kamu yakin akan menghapus nilai:
                                </p>
                                <p
                                    class="mt-2 text-sm font-semibold text-red-800"
                                >
                                    {{ valueToDelete?.code }} -
                                    {{ valueToDelete?.name }}
                                </p>
                            </div>
                        </div>
                    </div>
                </FormDialog.Content>

                <FormDialog.Footer
                    submit-text="Hapus Nilai"
                    submit-variant="destructive"
                    cancel-text="Batal"
                    :loading="loading"
                    @submit="handleDeleteValue"
                />
            </FormDialog>
        </div>
    </AppLayout>
</template>
