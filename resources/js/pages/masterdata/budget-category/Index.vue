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
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem } from '@/types';
import { BudgetCategory } from '@/types/datamaster';
import { Head } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import axios from 'axios';
import {
    AlertCircleIcon,
    BadgeCheckIcon,
    EditIcon,
    PlusIcon,
    TrashIcon,
    Users,
    XCircleIcon,
} from 'lucide-vue-next';
import { computed, h, ref, watch } from 'vue';
import MultiSelectUnits from '../components/MultiSelectUnits.vue';

// Enum definitions
const BudgetTypeEnum = {
    BUDGETER: 'budgeter',
    NON_BUDGETER: 'non_budgeter',
} as const;

const BudgetSubTypeEnum = {
    RUTIN: 'rutin',
    NON_RUTIN: 'non_rutin',
    KONDISIONAL: 'kondisional',
} as const;

// Budget type options
const budgetTypeOptions = [
    { value: BudgetTypeEnum.BUDGETER, label: 'Budgeter' },
    { value: BudgetTypeEnum.NON_BUDGETER, label: 'Non Budgeter' },
];

// Budget sub type options
const budgetSubTypeOptions = [
    { value: BudgetSubTypeEnum.RUTIN, label: 'Rutin' },
    { value: BudgetSubTypeEnum.NON_RUTIN, label: 'Non Rutin' },
    { value: BudgetSubTypeEnum.KONDISIONAL, label: 'Kondisional' },
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Kategori Anggaran',
        href: '',
    },
];

// budget category columns
const columns: ColumnDef<BudgetCategory>[] = [
    createColumn({
        value: 'code',
        title: 'Kode',
        sortable: true,
        searchable: true,
        render: ({ row }) =>
            h(
                'span',
                { class: 'font-mono text-sm font-medium text-slate-900' },
                row.original.code,
            ),
    }),

    createColumn({
        value: 'name',
        title: 'Nama Kategori',
        sortable: true,
        searchable: true,
        render: ({ row }) =>
            h('span', { class: 'text-slate-900' }, row.original.name),
    }),

    createColumn({
        value: 'budget_type',
        title: 'Tipe Anggaran',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const budgetType = row.original.budget_type;
            const subType = row.original.sub_budget_type;

            // Determine actual budget type value
            const actualBudgetType =
                typeof budgetType === 'string' ? budgetType : budgetType?.name;

            // Budget type display
            let budgetTypeDisplay;
            if (!actualBudgetType) {
                budgetTypeDisplay = h(
                    'span',
                    { class: 'text-slate-400 italic' },
                    '-',
                );
            } else {
                const label =
                    actualBudgetType === BudgetTypeEnum.BUDGETER
                        ? 'Budgeter'
                        : 'Non Budgeter';
                const badgeClass =
                    actualBudgetType === BudgetTypeEnum.BUDGETER
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-purple-100 text-purple-700 border-purple-200';

                budgetTypeDisplay = h(
                    Badge,
                    {
                        variant: 'secondary',
                        class: badgeClass,
                    },
                    label,
                );
            }

            // Sub type display (only for non_budgeter)
            let subTypeDisplay = null;
            if (actualBudgetType === BudgetTypeEnum.NON_BUDGETER) {
                if (!subType) {
                    subTypeDisplay = h(
                        'span',
                        { class: 'text-red-400 italic text-xs' },
                        'Sub tipe belum diisi',
                    );
                } else {
                    const subTypeLabels = {
                        [BudgetSubTypeEnum.RUTIN]: 'Rutin',
                        [BudgetSubTypeEnum.NON_RUTIN]: 'Non Rutin',
                        [BudgetSubTypeEnum.KONDISIONAL]: 'Kondisional',
                    };

                    const label =
                        subTypeLabels[subType as keyof typeof subTypeLabels] ||
                        subType;

                    const badgeClasses = {
                        [BudgetSubTypeEnum.RUTIN]:
                            'bg-green-100 text-green-700 border-green-200',
                        [BudgetSubTypeEnum.NON_RUTIN]:
                            'bg-orange-100 text-orange-700 border-orange-200',
                        [BudgetSubTypeEnum.KONDISIONAL]:
                            'bg-yellow-100 text-yellow-700 border-yellow-200',
                    };

                    const badgeClass =
                        badgeClasses[subType as keyof typeof badgeClasses] ||
                        'bg-slate-100 text-slate-700 border-slate-200';

                    subTypeDisplay = h(
                        Badge,
                        {
                            variant: 'secondary',
                            class: badgeClass,
                            size: 'sm',
                        },
                        label,
                    );
                }
            }

            // Return combined display
            return h(
                'div',
                { class: 'flex flex-col gap-1' },
                [budgetTypeDisplay, subTypeDisplay].filter(Boolean),
            );
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
                        class: 'bg-blue-500 text-white',
                    },
                    [h(BadgeCheckIcon, { class: 'h-3 w-3 mr-1' }), 'Aktif'],
                );
            } else {
                return h(
                    Badge,
                    {
                        variant: 'destructive',
                    },
                    [h(XCircleIcon, { class: 'h-3 w-3 mr-1' }), 'Non Aktif'],
                );
            }
        },
    }),
    createActionColumn([
        {
            icon: EditIcon,
            variant: 'default',
            onClick: (row: BudgetCategory) => updateBudgetCategory(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: BudgetCategory) => deleteBudgetCategory(row),
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/budget-categories',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari kategori anggaran...',
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    refreshable: true,
    initialFilters: {
        level: 'root',
    },
});

// management states
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const loading = ref(false);

// form data
const budgetCategoryForm = ref<BudgetCategory>({
    id: null,
    code: '',
    name: '',
    parent_id: null,
    budget_type: null,
    sub_budget_type: null,
    is_active: true,
    unit_ids: null,
});

const categoryToDelete = ref<BudgetCategory | null>(null);

// Computed property to check if budget type is non_budgeter
const isNonBudgeter = computed(() => {
    return budgetCategoryForm.value.budget_type === BudgetTypeEnum.NON_BUDGETER;
});

// Computed property to check if sub type is required
const isSubTypeRequired = computed(() => {
    return isNonBudgeter.value;
});

// Reset sub type when budget type changes to budgeter
watch(
    () => budgetCategoryForm.value.budget_type,
    (newType) => {
        if (newType === BudgetTypeEnum.BUDGETER) {
            budgetCategoryForm.value.sub_budget_type = null;
        }
    },
);

// reset form
const resetForm = () => {
    budgetCategoryForm.value = {
        id: null,
        code: '',
        name: '',
        parent_id: null,
        budget_type: null,
        sub_budget_type: null,
        is_active: true,
        unit_ids: null,
    };
};

// init form data
const createBudgetCategory = () => {
    resetForm();
    showCreateDialog.value = true;
};

const updateBudgetCategory = (category: BudgetCategory) => {
    budgetCategoryForm.value = {
        ...category,
        unit_ids: category.unit_ids || null,
        budget_type: category.budget_type || null,
        sub_budget_type: category.sub_budget_type || null,
    };
    showEditDialog.value = true;
};

const deleteBudgetCategory = (category: BudgetCategory) => {
    categoryToDelete.value = category;
    showDeleteDialog.value = true;
};

// validation
const isFormValid = computed(() => {
    const basicValid =
        budgetCategoryForm.value.name.trim() !== '' &&
        budgetCategoryForm.value.budget_type !== null;

    // If non_budgeter, sub type is required
    if (isNonBudgeter.value) {
        return basicValid && budgetCategoryForm.value.sub_budget_type !== null;
    }

    return basicValid;
});

// handle create
const handleCreateBudgetCategory = async () => {
    loading.value = true;
    try {
        const formData = {
            ...budgetCategoryForm.value,
            unit_ids: budgetCategoryForm.value.unit_ids || [],
        };

        await axios.post('/api/v1/budget-categories', formData);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showCreateDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error creating budget category:', error);
    } finally {
        loading.value = false;
    }
};

// handle update
const handleUpdateBudgetCategory = async () => {
    loading.value = true;
    try {
        const formData = {
            ...budgetCategoryForm.value,
            unit_ids: budgetCategoryForm.value.unit_ids || [],
        };

        await axios.put(
            `/api/v1/budget-categories/${budgetCategoryForm.value.id}`,
            formData,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showEditDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error updating budget category:', error);
    } finally {
        loading.value = false;
    }
};

// handle delete
const handleDeleteBudgetCategory = async () => {
    if (!categoryToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(
            `/api/v1/budget-categories/${categoryToDelete.value.id}`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showDeleteDialog.value = false;
        categoryToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error deleting budget category:', error);
    } finally {
        loading.value = false;
    }
};

const handleCancelCreate = () => {
    resetForm();
};

const handleCancelEdit = () => {
    resetForm();
};
</script>

<template>
    <Head title="Kategori Anggaran" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        Kategori Anggaran
                    </h1>
                    <p class="text-muted-foreground">
                        Pengaturan Kategori Anggaran
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button @click="createBudgetCategory">
                        <PlusIcon class="mr-2 h-4 w-4" />
                        Tambah Kategori
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
                search-placeholder="Cari Kategori Anggaran"
                show-pagination
                show-page-info
                empty-message="Data kategori anggaran tidak ditemukan"
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

        <!-- Create Budget Category Dialog -->
        <FormDialog
            v-model:open="showCreateDialog"
            :loading="loading"
            size="sm"
        >
            <FormDialog.Header
                title="Tambah Kategori Anggaran"
                description="Menambahkan informasi kategori anggaran baru."
            />

            <FormDialog.Content spacing="md">
                <div class="space-y-4">
                    <!-- Nama Kategori -->
                    <div class="space-y-2">
                        <Label for="create-name">Nama Kategori</Label>
                        <Input
                            id="create-name"
                            v-model="budgetCategoryForm.name"
                            placeholder="Isikan Nama Kategori"
                            :disabled="loading"
                        />
                    </div>

                    <!-- Tipe Anggaran -->
                    <div class="space-y-2">
                        <Label for="create-budget-type">Tipe Anggaran</Label>
                        <Select
                            v-model="budgetCategoryForm.budget_type"
                            :disabled="loading"
                        >
                            <SelectTrigger id="create-budget-type">
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

                    <!-- Sub Tipe Anggaran - Only for Non Budgeter -->
                    <div v-if="isNonBudgeter" class="space-y-2">
                        <Label for="create-budget-sub-type">
                            Sub Tipe Anggaran
                            <span class="text-red-500">*</span>
                        </Label>
                        <Select
                            v-model="budgetCategoryForm.sub_budget_type"
                            :disabled="loading"
                        >
                            <SelectTrigger id="create-budget-sub-type">
                                <SelectValue
                                    placeholder="Pilih Sub Tipe Anggaran"
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    v-for="option in budgetSubTypeOptions"
                                    :key="option.value"
                                    :value="option.value"
                                >
                                    {{ option.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <div class="flex items-start gap-2">
                            <AlertCircleIcon
                                class="mt-0.5 h-4 w-4 flex-shrink-0"
                            />
                            <p class="text-xs text-gray-500">
                                Pilih sub tipe anggaran untuk tipe anggaran Non
                                Budgeter
                            </p>
                        </div>
                    </div>

                    <!-- Unit Access -->
                    <MultiSelectUnits
                        id="create-unit-ids"
                        v-model="budgetCategoryForm.unit_ids"
                        :disabled="loading"
                    />
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Buat Kategori"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleCreateBudgetCategory"
            />
        </FormDialog>

        <!-- Edit Budget Category Dialog -->
        <FormDialog v-model:open="showEditDialog" :loading="loading" size="sm">
            <FormDialog.Header
                title="Update Kategori Anggaran"
                description="Memperbaharui informasi kategori anggaran."
            />

            <FormDialog.Content spacing="md">
                <div class="space-y-4">
                    <!-- Nama Kategori -->
                    <div class="space-y-2">
                        <Label for="edit-name">Nama Kategori</Label>
                        <Input
                            id="edit-name"
                            v-model="budgetCategoryForm.name"
                            placeholder="Isikan Nama Kategori"
                            :disabled="loading"
                        />
                    </div>

                    <!-- Tipe Anggaran -->
                    <div class="space-y-2">
                        <Label for="edit-budget-type">Tipe Anggaran</Label>
                        <Select
                            v-model="budgetCategoryForm.budget_type"
                            :disabled="loading"
                        >
                            <SelectTrigger id="edit-budget-type">
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

                    <!-- Sub Tipe Anggaran - Only for Non Budgeter -->
                    <div v-if="isNonBudgeter" class="space-y-2">
                        <Label for="edit-budget-sub-type">
                            Sub Tipe Anggaran
                            <span class="text-red-500">*</span>
                        </Label>
                        <Select
                            v-model="budgetCategoryForm.sub_budget_type"
                            :disabled="loading"
                        >
                            <SelectTrigger id="edit-budget-sub-type">
                                <SelectValue
                                    placeholder="Pilih Sub Tipe Anggaran"
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    v-for="option in budgetSubTypeOptions"
                                    :key="option.value"
                                    :value="option.value"
                                >
                                    {{ option.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <div class="flex items-start gap-2">
                            <AlertCircleIcon
                                class="mt-0.5 h-4 w-4 flex-shrink-0"
                            />
                            <p class="text-xs text-gray-500">
                                Pilih sub tipe anggaran untuk tipe anggaran Non
                                Budgeter
                            </p>
                        </div>
                    </div>

                    <!-- Unit Access -->
                    <MultiSelectUnits
                        id="edit-unit-ids"
                        v-model="budgetCategoryForm.unit_ids"
                        :disabled="loading"
                    />
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Update Kategori"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleUpdateBudgetCategory"
            />
        </FormDialog>

        <!-- Delete Budget Category Dialog -->
        <FormDialog v-model:open="showDeleteDialog" size="sm">
            <FormDialog.Header
                title="Hapus Kategori Anggaran"
                description="Proses ini tidak dapat dibatalkan. Kategori akan dihapus secara permanen."
            />

            <FormDialog.Content>
                <div class="rounded-md border border-red-200 bg-red-50 p-4">
                    <p class="text-sm text-red-800">
                        Apakah kamu yakin akan menghapus kategori anggaran:
                    </p>
                    <p class="mt-2 text-sm font-semibold text-red-900">
                        {{ categoryToDelete?.code }} -
                        {{ categoryToDelete?.name }}
                    </p>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Hapus Kategori"
                submit-variant="destructive"
                cancel-text="Batal"
                :loading="loading"
                @submit="handleDeleteBudgetCategory"
            />
        </FormDialog>
    </AppLayout>
</template>
