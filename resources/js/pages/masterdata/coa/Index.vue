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
import { Coa } from '@/types/datamaster';
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
import ParentCoaSelect from './ParentCoaSelect.vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Kode Akun',
        href: '',
    },
];

// coa columns
const columns: ColumnDef<Coa>[] = [
    createColumn({
        value: 'account_code',
        title: 'Kode',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const level = row.original.level || 1;
            const { account_code } = row.original;

            return h(
                'div',
                {
                    style: {
                        // marginLeft: `${(level - 1) * 24}px`,
                        fontWeight: level === 1 ? 'normal' : 'normal',
                    },
                },
                `${account_code}`,
            );
        },
    }),

    createColumn({
        value: 'account_name',
        title: 'Nama',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const level = row.original.level || 1;
            const { account_name } = row.original;

            return h(
                'div',
                {
                    style: {
                        // marginLeft: `${(level - 1) * 24}px`,
                        fontWeight: level === 1 ? 'nomral' : 'normal',
                    },
                },
                `${account_name}`,
            );
        },
    }),

    createColumn({
        value: 'account_type',
        title: 'Kategori',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.account_type;
        },
    }),

    // createColumn({
    //   value: 'normal_balance',
    //   title: 'Saldo Normal',
    //   sortable: true,
    //   searchable: true,
    //   render: ({ row }) => {
    //     //   const normal_balance = row.original.normal_balance;
    //     //   const badgeColor = normal_balance === 'DEBIT' ? 'bg-blue-500' : 'bg-red-500';

    //     //   return h(Badge,
    //     //     {
    //     //       variant: 'default',
    //     //       class: `${badgeColor} capitalize text-white`
    //     //     },
    //     //     {
    //     //       default: () => normal_balance
    //     //     }
    //     //   );
    //     return row.original.normal_balance
    //   }
    // }),

    createColumn({
        value: 'parent_id',
        title: 'Akun Induk',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const parent = row.original.parent;

            if (!parent) return '-';

            return h('div', { class: 'flex gap-1.5' }, [
                h('span', { class: 'font-medium' }, `${parent.account_code}`),
                h('span', { class: 'font-medium' }, parent.account_name),
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
                // Tampilan untuk status Aktif
                return h(
                    Badge,
                    {
                        variant: 'secondary',
                        class: 'bg-blue-500 text-white',
                    },
                    [h(BadgeCheckIcon), 'Aktif'],
                );
            } else {
                // Tampilan untuk status Non Aktif
                return h(
                    Badge,
                    {
                        variant: 'destructive',
                        class: 'bg-red-500 text-white',
                    },
                    [h(XCircleIcon), 'Non Aktif'],
                );
            }
        },
    }),

    createActionColumn([
        {
            icon: EditIcon,
            variant: 'default',
            onClick: (row: Coa) => updateCoa(row),
            // permissions: ['edit account_code'],
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: Coa) => deleteCoa(row),
            // permissions: ['delete account_code'],
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/coas',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari Kode Akun',
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

const parentAccounts = ref<Coa[]>([]);

// form data
const coaForm = reactive({
    id: '',
    account_code: '',
    account_name: '',
    account_type: '',
    normal_balance: '',
    parent_id: null,
    is_header: false,
});

const coaToDelete = ref<Coa | null>(null);

// reset form
const resetForm = () => {
    Object.assign(coaForm, {
        id: '',
        account_code: '',
        account_name: '',
        account_type: '',
        normal_balance: '',
        parent_id: null,
        is_header: false,
    });
};

const loadParentAccounts = async () => {
    try {
        const response = await axios.get('/api/v1/coas-headers');
        parentAccounts.value = response.data.data;
    } catch (error) {
        console.error('Gagal memuat akun parent:', error);
    }
};

watch(
    () => showCreateDialog.value,
    (isOpen) => {
        if (isOpen) {
            loadParentAccounts();
        }
    },
);

watch(
    () => showEditDialog.value,
    (isOpen) => {
        if (isOpen) {
            loadParentAccounts();
        }
    },
);

// init form data
const createCoa = () => {
    resetForm();
    showCreateDialog.value = true;
};

const updateCoa = (coa: Coa) => {
    Object.assign(coaForm, {
        id: coa.id,
        account_code: coa.account_code,
        account_name: coa.account_name,
        account_type: coa.account_type,
        normal_balance: coa.normal_balance,
        parent_id: coa.parent_id ?? null,
        is_header: coa.is_header,
    });

    showEditDialog.value = true;
};

const deleteCoa = (coa: Coa) => {
    coaToDelete.value = coa;
    showDeleteDialog.value = true;
};

// validation
const isFormValid = computed(() => {
    return coaForm.account_name.trim() !== '';
});

// handle create coa
const handleCreateCoa = async () => {
    loading.value = true;
    try {
        await axios.post('/api/v1/coas', coaForm);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showCreateDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error creating coa:', error);
    } finally {
        loading.value = false;
    }
};

// handle update coa
const handleUpdateCoa = async () => {
    loading.value = true;
    try {
        await axios.put(`/api/v1/coas/${coaForm.id}`, coaForm);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showEditDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error updating coa:', error);
    } finally {
        loading.value = false;
    }
};

// handle delete data
const handleDeleteCoa = async () => {
    if (!coaToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(`api/v1/coas/${coaToDelete.value.id}`);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showDeleteDialog.value = false;
        coaToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error deleting coa:', error);
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

const handleParentChange = (parent:any) => {
    if (parent) {
        coaForm.account_type = parent.account_type;
        coaForm.normal_balance = parent.normal_balance;
    }
};
</script>

<template>
    <Head title="Kode Akun" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Kode Akun</h1>
                    <p class="text-muted-foreground">
                        Pengaturan data kode akun
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button @click="createCoa">
                        <PlusIcon />
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
                search-placeholder="Cari Kode Akun"
                show-pagination
                show-page-info
                empty-message="Data kode akun tidak ditemukan"
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

        <!-- Create Coa Dialog - Using Compound Components Pattern -->
        <FormDialog
            v-model:open="showCreateDialog"
            :loading="loading"
            size="md"
        >
            <FormDialog.Header
                title="Tambah Kode Akun"
                description="Menambahkan informasi kode akun baru."
            />

            <FormDialog.Content spacing="md">
                <div class="space-y-2">
                    <Label for="create-kode">Kode Akun</Label>
                    <Input
                        id="create-kode"
                        v-model="coaForm.account_code"
                        placeholder="Isikan kode akun"
                        :disabled="loading"
                    />
                    <p class="mt-1 text-xs text-gray-500">
                        Ex: 1100, 2100, 3100 dst
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="create-nama">Nama Akun</Label>
                    <Input
                        id="create-nama"
                        v-model="coaForm.account_name"
                        placeholder="Isikan nama akun"
                        :disabled="loading"
                    />
                </div>

                <ParentCoaSelect
                    v-model="coaForm.parent_id"
                    :parent-accounts="parentAccounts"
                    :disabled="loading"
                    @change="handleParentChange"
                />

                <div class="space-y-2">
                    <Label for="create-account_type">Kategori Akun</Label>
                    <Select v-model="coaForm.account_type" :disabled="loading">
                        <SelectTrigger class="w-full">
                            <SelectValue placeholder="Pilih kategori akun" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AKTIVA">AKTIVA</SelectItem>
                            <SelectItem value="KEWAJIBAN">KEWAJIBAN</SelectItem>
                            <SelectItem value="MODAL">MODAL</SelectItem>
                            <SelectItem value="PENDAPATAN"
                                >PENDAPATAN</SelectItem
                            >
                            <SelectItem value="BEBAN">BEBAN</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div class="space-y-2">
                    <Label for="create-saldo-normal">Saldo Normal</Label>
                    <Select
                        v-model="coaForm.normal_balance"
                        :disabled="loading"
                    >
                        <SelectTrigger class="w-full">
                            <SelectValue placeholder="Pilih saldo normal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DEBIT">DEBIT</SelectItem>
                            <SelectItem value="KREDIT">KREDIT</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                        <Switch
                            id="create-is-header"
                            v-model="coaForm.is_header"
                            :disabled="loading"
                        />
                        <Label
                            for="create-is-header"
                            class="cursor-pointer font-medium"
                        >
                            Set Sebagai Akun Induk
                        </Label>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Tambah Kode Akun"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleCreateCoa"
            />
        </FormDialog>

        <!-- Edit Coa Dialog -->
        <FormDialog
            v-model:open="showEditDialog"
            title="Update Kode Akun"
            description="Memperbaharui informasi kode akun."
            :loading="loading"
            :valid="isFormValid"
            submit-text="Update Kode Akun"
            @submit="handleUpdateCoa"
            @cancel="handleCancelEdit"
        >
            <div class="space-y-4">
                <div class="space-y-2">
                    <Label for="edit-kode">Kode Akun</Label>
                    <Input
                        id="edit-kode"
                        v-model="coaForm.account_code"
                        placeholder="Isikan kode akun"
                        :disabled="loading"
                    />
                </div>

                <div class="space-y-2">
                    <Label for="edit-nama">Nama Akun</Label>
                    <Input
                        id="edit-nama"
                        v-model="coaForm.account_name"
                        placeholder="Isikan nama akun"
                        :disabled="loading"
                    />
                </div>

                <ParentCoaSelect
                    v-model="coaForm.parent_id"
                    :parent-accounts="parentAccounts"
                    :disabled="loading"
                    @change="handleParentChange"
                />

                <div class="space-y-2">
                    <Label for="edit-kategori">Tipe Akun</Label>
                    <Select v-model="coaForm.account_type" :disabled="loading">
                        <SelectTrigger class="w-full">
                            <SelectValue placeholder="Pilih kategori akun" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AKTIVA">AKTIVA</SelectItem>
                            <SelectItem value="KEWAJIBAN">KEWAJIBAN</SelectItem>
                            <SelectItem value="MODAL">MODAL</SelectItem>
                            <SelectItem value="PENDAPATAN"
                                >PENDAPATAN</SelectItem
                            >
                            <SelectItem value="BEBAN">BEBAN</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div class="space-y-2">
                    <Label for="edit-saldo-normal">Saldo Normal</Label>
                    <Select
                        v-model="coaForm.normal_balance"
                        :disabled="loading"
                    >
                        <SelectTrigger class="w-full">
                            <SelectValue placeholder="Pilih saldo normal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DEBIT">DEBIT</SelectItem>
                            <SelectItem value="KREDIT">KREDIT</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                        <Switch
                            id="edit-is-header"
                            v-model="coaForm.is_header"
                            :disabled="loading"
                        />
                        <Label
                            for="edit-is-header"
                            class="cursor-pointer font-medium"
                        >
                            Set Sebagai Akun Induk
                        </Label>
                    </div>
                </div>
            </div>
        </FormDialog>

        <!-- Delete Coa Dialog -->
        <FormDialog
            v-model:open="showDeleteDialog"
            title="Hapus Coa"
            description="Proses ini tidak dapat dibatalkan. Kode Akun akan dihapus secara permanen.."
            :loading="loading"
            submit-text="Hapus Kode Akun"
            submit-variant="destructive"
            cancel-text="Batal"
            size="sm"
            @submit="handleDeleteCoa"
        >
            <div class="rounded-md border border-red-200 bg-red-50 p-4">
                <p class="text-sm text-red-800">
                    Apakah kamu yakin akan menghapus kode akun:
                    <strong>{{ coaToDelete?.account_code }}</strong> ({{
                        coaToDelete?.account_name
                    }})
                </p>
            </div>
        </FormDialog>
    </AppLayout>
</template>
