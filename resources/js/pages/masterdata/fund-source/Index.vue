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
import { Textarea } from '@/components/ui/textarea';
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import axios from 'axios';
import {
    BadgeCheckIcon,
    EditIcon,
    PlusIcon,
    TrashIcon,
    XCircleIcon,
} from 'lucide-vue-next';
import { computed, h, reactive, ref, watch } from 'vue';

interface FundSource {
    id: string;
    code: string;
    name: string;
    fund_source_type: string;
    fund_source_owner: string;
    cash_bank_id: string | null;
    description: string | null;
    is_active: boolean;
    type?: {
        id: string;
        name: string;
        value: string;
    };
    cash_bank?: {
        id: string;
        code: string;
        name: string;
    };
}

interface CashBank {
    id: string;
    code: string;
    name: string;
}

const fundSourceOwnerOptions = [
    { value: 'yayasan', label: 'Yayasan' },
    { value: 'institut', label: 'Institut' },
] as const;

const fundSourceTypeOptions = [
    { value: 'cash', label: 'Kas' },
    { value: 'bank', label: 'Bank' },
    { value: 'other', label: 'Lainnya' },
] as const;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Sumber Dana',
        href: '',
    },
];

// fund source columns
const columns: ColumnDef<FundSource>[] = [
    createColumn({
        value: 'code',
        title: 'Kode',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            return row.original.code;
        },
    }),

    createColumn({
        value: 'name',
        title: 'Nama Sumber Dana',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.name;
        },
    }),

    createColumn({
        value: 'fund_source_owner',
        title: 'Pemilik',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const categoryValue = row.original.fund_source_owner;
            const option = fundSourceOwnerOptions.find(opt => opt.value === categoryValue);
            const label = option?.label || categoryValue || '-';
            
            let badgeClass = 'bg-slate-500 text-white';
            if (categoryValue === 'yayasan') {
                badgeClass = 'bg-purple-500 text-white';
            } else if (categoryValue === 'institut') {
                badgeClass = 'bg-indigo-500 text-white';
            }

            return h(
                Badge,
                {
                    variant: 'secondary',
                    class: `${badgeClass} font-medium px-2 py-0.5 rounded text-xs`,
                },
                label,
            );
        },
    }),

    createColumn({
    value: 'fund_source_type',
    title: 'Tipe',
    sortable: true,
    searchable: true,
    render: ({ row }) => {
        const typeValue = row.original.fund_source_type;
        const option = fundSourceTypeOptions.find(opt => opt.value === typeValue);
        const label = option?.label || 'Lainnya';
        
        let badgeClass = 'bg-slate-500 text-white'; // Default untuk other

        if (typeValue === 'cash') {
            badgeClass = 'bg-emerald-500 text-white'; // Hijau cerah
        } else if (typeValue === 'bank') {
            badgeClass = 'bg-blue-500 text-white'; // Biru cerah
        } else if (typeValue === 'other') {
            badgeClass = 'bg-amber-500 text-white'; // Orange cerah
        }

        return h(
            Badge,
            {
                variant: 'secondary',
                class: `${badgeClass} font-medium px-2 py-0.5 rounded text-xs`,
            },
            label,
        );
    },
}),

    createColumn({
        value: 'cash_bank_id',
        title: 'Kas/Bank',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const cashBank = row.original.cash_bank;
            if (!cashBank) return '-';
            return `${cashBank.code} - ${cashBank.name}`;
        },
    }),

    createColumn({
        value: 'description',
        title: 'Deskripsi',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const desc = row.original.description;
            if (!desc) return '-';
            return desc.length > 30 ? desc.substring(0, 30) + '...' : desc;
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
                        class: 'bg-blue-500 text-white',
                    },
                    () => [
                        h(BadgeCheckIcon, { class: 'mr-1 h-3 w-3' }),
                        'Aktif',
                    ],
                );
            } else {
                return h(
                    Badge,
                    {
                        variant: 'destructive',
                    },
                    () => [
                        h(XCircleIcon, { class: 'mr-1 h-3 w-3' }),
                        'Non Aktif',
                    ],
                );
            }
        },
    }),

    createActionColumn([
        {
            icon: EditIcon,
            variant: 'default',
            onClick: (row: FundSource) => updateFundSource(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: FundSource) => deleteFundSource(row),
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/fund-sources',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari sumber dana...',
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
const cashBankOptions = ref<CashBank[]>([]);

// form data
const fundSourceForm = reactive({
    id: '',
    code: '',
    name: '',
    fund_source_owner: null as string | null,
    fund_source_type: null as string | null,
    cash_bank_id: null as string | null,
    description: '',
    is_active: true,
});

const fundSourceToDelete = ref<FundSource | null>(null);

// reset form
const resetForm = () => {
    Object.assign(fundSourceForm, {
        id: '',
        code: '',
        name: '',
        fund_source_owner: null,
        fund_source_type: null,
        cash_bank_id: null,
        description: '',
        is_active: true,
    });
};

// Cache untuk master data
const masterDataCache = new Map();

// Fungsi untuk load data dengan cache
const loadCachedData = async (key: string, fetcher: () => Promise<any>) => {
    if (masterDataCache.has(key)) {
        return masterDataCache.get(key);
    }

    const data = await fetcher();
    masterDataCache.set(key, data);
    return data;
};

// fetch reference data
const fetchReferenceData = async () => {
    try {
        await Promise.all([loadCashBankOptions()]);
    } catch (error) {
        console.error('Error fetching reference data:', error);
    }
};

const loadCashBankOptions = async () => {
    try {
        const result = await loadCachedData('cash-banks', async () => {
            const { data } = await axios.get('/api/v1/select/cash-banks');
            console.log(data);
            return data;
        });
        cashBankOptions.value = result.data;
    } catch (error) {
        console.error('Failed to load cash-banks:', error);
        cashBankOptions.value = [];
    }
};

// init form data
const createFundSource = async () => {
    resetForm();
    await fetchReferenceData();
    showCreateDialog.value = true;
};

const updateFundSource = async (fundSource: FundSource) => {
    Object.assign(fundSourceForm, {
        id: fundSource.id,
        code: fundSource.code,
        name: fundSource.name,
        fund_source_owner: fundSource.fund_source_owner,
        fund_source_type: fundSource.fund_source_type,
        cash_bank_id: fundSource.cash_bank_id,
        description: fundSource.description || '',
        is_active: fundSource.is_active,
    });

    await fetchReferenceData();
    showEditDialog.value = true;
};

const deleteFundSource = (fundSource: FundSource) => {
    fundSourceToDelete.value = fundSource;
    showDeleteDialog.value = true;
};

// validation
const isFormValid = computed(() => {
    return (
        fundSourceForm.code.trim() !== '' &&
        fundSourceForm.name.trim() !== '' &&
        fundSourceForm.fund_source_owner !== null &&
        fundSourceForm.fund_source_type !== null
    );
});

// handle create fund source
const handleCreateFundSource = async () => {
    loading.value = true;
    try {
        const payload = {
            ...fundSourceForm,
            description: fundSourceForm.description || null,
        };

        await axios.post('/api/v1/fund-sources', payload);

        showCreateDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error creating fund source:', error);
    } finally {
        loading.value = false;
    }
};

// handle update fund source
const handleUpdateFundSource = async () => {
    loading.value = true;
    try {
        const payload = {
            ...fundSourceForm,
            description: fundSourceForm.description || null,
        };

        await axios.put(`/api/v1/fund-sources/${fundSourceForm.id}`, payload);

        showEditDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error updating fund source:', error);
    } finally {
        loading.value = false;
    }
};

// handle delete data
const handleDeleteFundSource = async () => {
    if (!fundSourceToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(
            `/api/v1/fund-sources/${fundSourceToDelete.value.id}`,
        );

        showDeleteDialog.value = false;
        fundSourceToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error deleting fund source:', error);
    } finally {
        loading.value = false;
    }
};

// watch untuk perubahan cash bank options
watch(
    () => fundSourceForm.fund_source_type,
    async (newType) => {
        if (newType) {
            try {
                const response = await axios.get(
                    `/api/v1/select/cash-banks?type=${newType}`,
                );
                cashBankOptions.value = response.data.data;
            } catch (error) {
                console.error('Error fetching filtered cash banks:', error);
            }
        }
    },
);
</script>

<template>
    <Head title="Sumber Dana" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        Sumber Dana
                    </h1>
                    <p class="text-muted-foreground">
                        Pengaturan data sumber dana yayasan
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button @click="createFundSource">
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
                search-placeholder="Cari Sumber Dana..."
                show-pagination
                show-page-info
                empty-message="Data sumber dana tidak ditemukan"
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

        <!-- Create Fund Source Dialog -->
        <FormDialog
            v-model:open="showCreateDialog"
            :loading="loading"
            size="xl"
        >
            <FormDialog.Header
                title="Tambah Sumber Dana"
                description="Menambahkan informasi sumber dana baru untuk yayasan pendidikan."
            />

            <FormDialog.Content spacing="xl">
                <div class="space-y-6">
                    <div
                        class="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2"
                    >
                        <div class="space-y-2">
                            <Label
                                for="create-code"
                                class="text-sm font-medium"
                            >
                                Kode
                                <span class="text-red-500">*</span>
                            </Label>
                            <Input
                                id="create-code"
                                v-model="fundSourceForm.code"
                                placeholder="Ex: SD-001"
                                :disabled="loading"
                                class="w-full"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label
                                for="create-name"
                                class="text-sm font-medium"
                            >
                                Nama Sumber Dana
                                <span class="text-red-500">*</span>
                            </Label>
                            <Input
                                id="create-name"
                                v-model="fundSourceForm.name"
                                placeholder="Ex: Kas"
                                :disabled="loading"
                                class="w-full"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label
                                for="create-category"
                                class="text-sm font-medium"
                            >
                                Pemilik
                                <span class="text-red-500">*</span>
                            </Label>
                            <Select v-model="fundSourceForm.fund_source_owner">
                                <SelectTrigger
                                    id="create-category"
                                    :disabled="loading"
                                    class="w-full"
                                >
                                    <SelectValue
                                        placeholder="Pilih kategori sumber dana"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="option in fundSourceOwnerOptions"
                                        :key="option.value"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div class="space-y-2">
                            <Label
                                for="create-type"
                                class="text-sm font-medium"
                            >
                                Tipe
                                <span class="text-red-500">*</span>
                            </Label>
                            <Select v-model="fundSourceForm.fund_source_type">
                                <SelectTrigger
                                    id="create-type"
                                    :disabled="loading"
                                    class="w-full"
                                >
                                    <SelectValue
                                        placeholder="Pilih tipe sumber dana"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="option in fundSourceTypeOptions"
                                        :key="option.value"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div
                            v-if="fundSourceForm.fund_source_type !== 'other'"
                            class="space-y-2"
                        >
                            <Label
                                for="create-cash_bank"
                                class="text-sm font-medium"
                            >
                                Kas/Bank Terkait
                            </Label>
                            <Select v-model="fundSourceForm.cash_bank_id">
                                <SelectTrigger
                                    id="create-cash_bank"
                                    :disabled="loading"
                                    class="w-full"
                                >
                                    <SelectValue
                                        placeholder="Pilih kas/bank (opsional)"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="cashBank in cashBankOptions"
                                        :key="cashBank.id"
                                        :value="cashBank.id"
                                    >
                                        {{ cashBank.code }} —
                                        {{ cashBank.name }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div class="space-y-2 md:col-span-2">
                            <Label
                                for="create-description"
                                class="text-sm font-medium"
                            >
                                Deskripsi
                            </Label>
                            <Textarea
                                id="create-description"
                                v-model="fundSourceForm.description"
                                placeholder="Deskripsi atau catatan tambahan (opsional)"
                                :disabled="loading"
                                class="w-full"
                                rows="3"
                            />
                        </div>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Simpan Sumber Dana"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleCreateFundSource"
            />
        </FormDialog>

        <!-- Edit Fund Source Dialog -->
        <FormDialog v-model:open="showEditDialog" :loading="loading" size="xl">
            <FormDialog.Header
                title="Update Sumber Dana"
                description="Memperbaharui informasi sumber dana untuk yayasan pendidikan."
            />

            <FormDialog.Content spacing="xl">
                <div class="space-y-6">
                    <div
                        class="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2"
                    >
                        <div class="space-y-2">
                            <Label for="edit-code" class="text-sm font-medium">
                                Kode
                                <span class="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-code"
                                v-model="fundSourceForm.code"
                                placeholder="Ex: SD-001"
                                :disabled="loading"
                                class="w-full"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-name" class="text-sm font-medium">
                                Nama Sumber Dana
                                <span class="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-name"
                                v-model="fundSourceForm.name"
                                placeholder="Ex: Dana BOS"
                                :disabled="loading"
                                class="w-full"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-category" class="text-sm font-medium">
                                Pemilik
                                <span class="text-red-500">*</span>
                            </Label>
                            <Select v-model="fundSourceForm.fund_source_owner">
                                <SelectTrigger
                                    id="edit-category"
                                    :disabled="loading"
                                    class="w-full"
                                >
                                    <SelectValue
                                        placeholder="Pilih kategori sumber dana"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="option in fundSourceOwnerOptions"
                                        :key="option.value"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-type" class="text-sm font-medium">
                                Tipe
                                <span class="text-red-500">*</span>
                            </Label>
                            <Select v-model="fundSourceForm.fund_source_type">
                                <SelectTrigger
                                    id="edit-type"
                                    :disabled="loading"
                                    class="w-full"
                                >
                                    <SelectValue
                                        placeholder="Pilih tipe sumber dana"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="option in fundSourceTypeOptions"
                                        :key="option.value"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div
                            v-if="fundSourceForm.fund_source_type !== 'other'"
                            class="space-y-2"
                        >
                            <Label
                                for="edit-cash_bank"
                                class="text-sm font-medium"
                            >
                                Kas/Bank Terkait
                            </Label>
                            <Select v-model="fundSourceForm.cash_bank_id">
                                <SelectTrigger
                                    id="edit-cash_bank"
                                    :disabled="loading"
                                    class="w-full"
                                >
                                    <SelectValue
                                        placeholder="Pilih kas/bank (opsional)"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="cashBank in cashBankOptions"
                                        :key="cashBank.id"
                                        :value="cashBank.id"
                                    >
                                        {{ cashBank.code }} —
                                        {{ cashBank.name }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div class="space-y-2 md:col-span-2">
                            <Label
                                for="edit-description"
                                class="text-sm font-medium"
                            >
                                Deskripsi
                            </Label>
                            <Textarea
                                id="edit-description"
                                v-model="fundSourceForm.description"
                                placeholder="Deskripsi atau catatan tambahan (opsional)"
                                :disabled="loading"
                                class="w-full"
                                rows="3"
                            />
                        </div>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Simpan Perubahan"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleUpdateFundSource"
            />
        </FormDialog>

        <!-- Delete Fund Source Dialog -->
        <FormDialog
            v-model:open="showDeleteDialog"
            title="Hapus Sumber Dana"
            description="Proses ini tidak dapat dibatalkan. Data akan dihapus secara permanen."
            :loading="loading"
            submit-text="Hapus Sumber Dana"
            submit-variant="destructive"
            cancel-text="Batal"
            size="sm"
            @submit="handleDeleteFundSource"
        >
            <div class="rounded-md border border-red-200 bg-red-50 p-4">
                <p class="text-sm text-red-800">
                    Apakah kamu yakin akan menghapus sumber dana:
                    <strong>{{ fundSourceToDelete?.code }}</strong> -
                    {{ fundSourceToDelete?.name }}
                    <span v-if="fundSourceToDelete?.type">
                        ({{ fundSourceToDelete?.type?.name }})
                    </span>
                    ?
                </p>
            </div>
        </FormDialog>
    </AppLayout>
</template>