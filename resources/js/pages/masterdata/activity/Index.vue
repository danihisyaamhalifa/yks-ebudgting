<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Textarea from '@/components/ui/textarea/Textarea.vue';
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem } from '@/types';
import { Activity } from '@/types/datamaster';
import { Head } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import axios, { AxiosError } from 'axios';
import {
    AlertCircleIcon,
    BadgeCheckIcon,
    EditIcon,
    PlusIcon,
    TrashIcon,
    Users,
    XCircleIcon,
} from 'lucide-vue-next';
import { computed, h, reactive, ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import MultiSelectUnits from '../components/MultiSelectUnits.vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Kegiatan',
        href: '',
    },
];

// activity columns
const columns: ColumnDef<Activity>[] = [
    createColumn({
        value: 'activity_code',
        title: 'Kode Kegiatan',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            return row.original.activity_code;
        },
    }),
    createColumn({
        value: 'activity_name',
        title: 'Nama Kegiatan',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.activity_name;
        },
    }),

    createColumn({
        value: 'unit_ids',
        title: 'Akses Unit',
        sortable: false,
        searchable: false,
        render: ({ row }) => {
            const unitIds = row.original.unit_ids;

            if (!unitIds || unitIds.length === 0) {
                return h(
                    Badge,
                    {
                        variant: 'secondary',
                        class: 'bg-green-100 text-green-700 border-green-200',
                    },
                    'Semua Unit',
                );
            }

            return h('div', { class: 'flex items-center gap-1' }, [
                h(Users, { class: 'h-3 w-3 text-slate-400' }),
                h(
                    'span',
                    { class: 'text-sm text-slate-600' },
                    `${unitIds.length} unit`,
                ),
            ]);
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
            onClick: (row: Activity) => updateKegiatan(row),
            // permissions: ['edit master_data'],
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: Activity) => deleteKegiatan(row),
            // permissions: ['delete master_data'],
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/activities',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari kegiatan...',
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
const activityForm = reactive({
    id: '',
    activity_code: '',
    activity_name: '',
    description: '',
    is_active: true,
    unit_ids: null as number[] | null,
});

const activityToDelete = ref<Activity | null>(null);

// Individual field errors
const fieldErrors = reactive({
    activity_name: [] as string[],
    description: [] as string[],
    unit_ids: [] as string[],
    is_active: [] as string[],
    general: [] as string[],
});

const showValidationErrors = ref(false);

// Reset validation
const resetValidation = () => {
    fieldErrors.activity_name = [];
    fieldErrors.description = [];
    fieldErrors.unit_ids = [];
    fieldErrors.is_active = [];
    fieldErrors.general = [];
    showValidationErrors.value = false;
};

// Validation function
const validateForm = (): boolean => {
    // Reset errors
    resetValidation();

    // Activity Name validation
    if (!activityForm.activity_name || activityForm.activity_name.trim() === '') {
        fieldErrors.activity_name.push('Nama kegiatan wajib diisi');
    } else {
        if (activityForm.activity_name.trim().length < 3) {
            fieldErrors.activity_name.push('Nama kegiatan minimal 3 karakter');
        }
        if (activityForm.activity_name.trim().length > 200) {
            fieldErrors.activity_name.push('Nama kegiatan maksimal 200 karakter');
        }
    }

    // Description validation (optional, but validate if filled)
    if (activityForm.description && activityForm.description.trim() !== '') {
        if (activityForm.description.trim().length > 500) {
            fieldErrors.description.push('Deskripsi maksimal 500 karakter');
        }
    }

    showValidationErrors.value = true;

    const hasErrors =
        fieldErrors.activity_name.length > 0 ||
        fieldErrors.description.length > 0 ||
        fieldErrors.unit_ids.length > 0 ||
        fieldErrors.is_active.length > 0 ||
        fieldErrors.general.length > 0;

    return !hasErrors;
};

// Computed property for form validity
const isFormValid = computed(() => {
    if (!showValidationErrors.value) return true;

    return (
        fieldErrors.activity_name.length === 0 &&
        fieldErrors.description.length === 0 &&
        fieldErrors.unit_ids.length === 0 &&
        fieldErrors.is_active.length === 0 &&
        fieldErrors.general.length === 0
    );
});

watch(
    () => activityForm.activity_name,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.activity_name = [];
        }
    }
);

watch(
    () => activityForm.description,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.description = [];
        }
    }
);

// Handle server errors
const handleServerErrors = (errors: Record<string, string[]>) => {
    resetValidation();

    if (errors.activity_name) {
        fieldErrors.activity_name = Array.isArray(errors.activity_name)
            ? errors.activity_name
            : [errors.activity_name];
    }
    if (errors.description) {
        fieldErrors.description = Array.isArray(errors.description)
            ? errors.description
            : [errors.description];
    }
    if (errors.unit_ids) {
        fieldErrors.unit_ids = Array.isArray(errors.unit_ids)
            ? errors.unit_ids
            : [errors.unit_ids];
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
    Object.assign(activityForm, {
        id: '',
        activity_code: '',
        activity_name: '',
        description: '',
        is_active: true,
        unit_ids: null,
    });
    resetValidation();
};

// init form data
const createKegiatan = async () => {
    resetForm();
    showCreateDialog.value = true;
};

const updateKegiatan = async (activity: Activity) => {
    resetForm();
    Object.assign(activityForm, {
        id: activity.id,
        activity_code: activity.activity_code,
        activity_name: activity.activity_name,
        description: activity.description || '',
        is_active: activity.is_active ?? true,
        unit_ids: activity.unit_ids,
    });

    showEditDialog.value = true;
};

const deleteKegiatan = (activity: Activity) => {
    activityToDelete.value = activity;
    showDeleteDialog.value = true;
};

// handle create activity
const handleCreateKegiatan = async () => {
    if (!validateForm()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.post('/api/v1/activities', activityForm);

        toast.success('Kegiatan berhasil ditambahkan!', {
            description: `Kegiatan ${activityForm.activity_name} telah dibuat.`,
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
        handleApiError(error, 'Gagal menambahkan kegiatan. Silakan coba lagi.');
    } finally {
        loading.value = false;
    }
};

// handle update activity
const handleUpdateKegiatan = async () => {
    if (!validateForm()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.put(
            `/api/v1/activities/${activityForm.id}`,
            activityForm,
        );

        toast.success('Kegiatan berhasil diperbarui!', {
            description: `Kegiatan ${activityForm.activity_name} telah diperbarui.`,
        });

        showEditDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(
            error,
            'Gagal memperbarui kegiatan. Silakan coba lagi.',
        );
    } finally {
        loading.value = false;
    }
};

// handle delete data
const handleDeleteKegiatan = async () => {
    if (!activityToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(
            `/api/v1/activities/${activityToDelete.value.id}`,
        );

        toast.success('Kegiatan berhasil dihapus!', {
            description: `Kegiatan ${activityToDelete.value.activity_name} telah dihapus permanen.`,
        });

        showDeleteDialog.value = false;
        activityToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(error, 'Gagal menghapus kegiatan. Silakan coba lagi.');
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
    <Head title="Kegiatan" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Kegiatan</h1>
                    <p class="text-muted-foreground">
                        Pengaturan data kegiatan
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button @click="createKegiatan">
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
                search-placeholder="Cari Kegiatan"
                show-pagination
                show-page-info
                empty-message="Data kegiatan tidak ditemukan"
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

        <!-- Create Kegiatan Dialog -->
        <FormDialog
            v-model:open="showCreateDialog"
            :loading="loading"
            size="md"
        >
            <FormDialog.Header
                title="Tambah Kegiatan"
                description="Menambahkan informasi kegiatan baru."
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
                    <Label for="create-code">
                        Kode Kegiatan
                    </Label>
                    <Input
                        id="create-code"
                        v-model="activityForm.activity_code"
                        placeholder="[Generate Otomatis]"
                        :disabled="true"
                        class="disabled:cursor-not-allowed disabled:opacity-75"
                    />
                </div>

                <div class="space-y-2">
                    <Label for="create-name">
                        Nama Kegiatan <span class="text-red-500">*</span>
                    </Label>
                    <Input
                        id="create-name"
                        v-model="activityForm.activity_name"
                        placeholder="Isikan Nama Kegiatan"
                        :disabled="loading"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.activity_name.length > 0,
                        }"
                    />
                    <p
                        v-for="(error, index) in fieldErrors.activity_name"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="create-description">Deskripsi</Label>
                    <Textarea
                        id="create-description"
                        v-model="activityForm.description"
                        placeholder="Tambahkan deskripsi kegiatan (opsional)"
                        class="min-h-[80px] resize-none"
                        :maxlength="500"
                        :disabled="loading"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.description.length > 0,
                        }"
                    />
                    <div class="flex justify-between">
                        <p
                            v-for="(error, index) in fieldErrors.description"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                        <p class="text-xs text-gray-400">
                            {{ activityForm.description?.length || 0 }}/500
                        </p>
                    </div>
                </div>

                <div class="space-y-2">
                    <MultiSelectUnits
                        id="create-unit-ids"
                        v-model="activityForm.unit_ids"
                        :disabled="loading"
                    />
                    <p
                        v-for="(error, index) in fieldErrors.unit_ids"
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
                        <Switch
                            id="create-is-active"
                            v-model="activityForm.is_active"
                            :disabled="loading"
                        />
                    </div>
                    <div
                        class="flex items-center gap-2 text-xs"
                        :class="
                            activityForm.is_active
                                ? 'text-primary'
                                : 'text-muted-foreground'
                        "
                    >
                        <component
                            :is="
                                activityForm.is_active
                                    ? BadgeCheckIcon
                                    : XCircleIcon
                            "
                            class="h-4 w-4"
                        />
                        <span>
                            {{
                                activityForm.is_active
                                    ? 'Data kegiatan ini aktif digunakan'
                                    : 'Aktifkan jika data kegiatan ini masih digunakan'
                            }}
                        </span>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Buat Kegiatan"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleCreateKegiatan"
                @cancel="handleCancelCreate"
            />
        </FormDialog>

        <!-- Edit Kegiatan Dialog -->
        <FormDialog
            v-model:open="showEditDialog"
            :loading="loading"
            size="md"
        >
            <FormDialog.Header
                title="Update Kegiatan"
                description="Memperbaharui informasi kegiatan."
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
                    <Label for="edit-code">
                        Kode Kegiatan
                    </Label>
                    <Input
                        id="edit-code"
                        v-model="activityForm.activity_code"
                        placeholder="Isikan kode kegiatan"
                        :disabled="true"
                    />
                </div>

                <div class="space-y-2">
                    <Label for="edit-name">
                        Nama Kegiatan <span class="text-red-500">*</span>
                    </Label>
                    <Input
                        id="edit-name"
                        v-model="activityForm.activity_name"
                        placeholder="Isikan nama kegiatan"
                        :disabled="loading"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.activity_name.length > 0,
                        }"
                    />
                    <p
                        v-for="(error, index) in fieldErrors.activity_name"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="edit-description">Deskripsi</Label>
                    <Textarea
                        id="edit-description"
                        v-model="activityForm.description"
                        placeholder="Tambahkan deskripsi kegiatan (opsional)"
                        class="min-h-[80px] resize-none"
                        :maxlength="500"
                        :disabled="loading"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.description.length > 0,
                        }"
                    />
                    <div class="flex justify-between">
                        <p
                            v-for="(error, index) in fieldErrors.description"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                        <p class="text-xs text-gray-400">
                            {{ activityForm.description?.length || 0 }}/500
                        </p>
                    </div>
                </div>

                <div class="space-y-2">
                    <!-- Unit Access -->
                    <MultiSelectUnits
                        id="edit-unit-ids"
                        v-model="activityForm.unit_ids"
                        :disabled="loading"
                    />
                    <p
                        v-for="(error, index) in fieldErrors.unit_ids"
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
                        <Switch
                            id="edit-is-active"
                            v-model="activityForm.is_active"
                            :disabled="loading"
                        />
                    </div>
                    <div
                        class="flex items-center gap-2 text-xs"
                        :class="
                            activityForm.is_active
                                ? 'text-primary'
                                : 'text-muted-foreground'
                        "
                    >
                        <component
                            :is="
                                activityForm.is_active
                                    ? BadgeCheckIcon
                                    : XCircleIcon
                            "
                            class="h-4 w-4"
                        />
                        <span>
                            {{
                                activityForm.is_active
                                    ? 'Data kegiatan ini aktif digunakan'
                                    : 'Aktifkan jika data kegiatan ini masih digunakan'
                            }}
                        </span>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Update Kegiatan"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleUpdateKegiatan"
                @cancel="handleCancelEdit"
            />
        </FormDialog>

        <!-- Delete Kegiatan Dialog -->
        <FormDialog v-model:open="showDeleteDialog" :loading="loading" size="sm">
            <FormDialog.Header
                title="Hapus Kegiatan"
                description="Proses ini tidak dapat dibatalkan. Kegiatan akan dihapus secara permanen."
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
                                Apakah kamu yakin akan menghapus kegiatan:
                            </p>
                            <p
                                class="text-sm font-semibold text-red-800 mt-2"
                            >
                                {{ activityToDelete?.activity_code }} -
                                {{ activityToDelete?.activity_name }}
                            </p>
                            <p class="text-xs text-red-600 mt-2">
                                Semua data yang terkait dengan kegiatan ini akan
                                ikut terhapus.
                            </p>
                        </div>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Hapus Kegiatan"
                submit-variant="destructive"
                cancel-text="Batal"
                :loading="loading"
                @submit="handleDeleteKegiatan"
            />
        </FormDialog>
    </AppLayout>
</template>