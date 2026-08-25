<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import { useUser } from '@/composables/useUser';
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem } from '@/types';
import { BudgetFundRelease } from '@/types/disburse';
import { Head, router } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import axios from 'axios';
import {
    ClockIcon,
    CreditCardIcon,
    EditIcon,
    FileTextIcon,
    PlusIcon,
    TrashIcon,
} from 'lucide-vue-next';
import { computed, h, ref } from 'vue';
import { toast } from 'vue-sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Realisasi Pencairan',
        href: '',
    },
];

const user = useUser();
const canCreate = computed(
    () => user.hasPermission('create realisasi_pencairan') ?? false,
);

const PAYMENT_TYPES = [
    { value: 'cash', label: 'Tunai' },
    { value: 'transfer', label: 'Transfer' },
] as const;

const loading = ref(false);
const showDeleteDialog = ref(false);
const fundReleaseToDelete = ref<BudgetFundRelease | null>(null);

// BudgetFundRelease columns
const columns: ColumnDef<BudgetFundRelease>[] = [
    createColumn({
        value: 'unit_name',
        title: 'Unit',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const disbursementHeader = row.original.disbursement_header;
            const unitName =
                disbursementHeader?.request_header?.unit?.name ||
                disbursementHeader?.request_header?.unit?.unit_name ||
                '-';

            return h(
                'span',
                {
                    class: 'text-sm text-red-600 dark:text-red-400 font-medium',
                },
                unitName,
            );
        },
    }),

    createColumn({
        value: 'fund_release_no',
        title: 'No. & Tanggal Pencairan',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return h('div', { class: 'space-y-1.5' }, [
                // No. Pencairan
                h(
                    'div',
                    { class: 'font-semibold text-sm' },
                    row.original.fund_release_no,
                ),

                // Tanggal Pencairan
                h('div', { class: 'flex items-center gap-1.5 text-xs' }, [
                    h(ClockIcon, { class: 'w-3 h-3' }),
                    h(
                        'span',
                        {},
                        new Date(
                            row.original.fund_release_date,
                        ).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        }),
                    ),
                ]),
            ]);
        },
    }),

    createColumn({
        value: 'disbursement_no',
        title: 'No. & Tanggal Pengajuan', // Judul kolom disesuaikan agar lebih informatif
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const disbursementHeader = row.original.disbursement_header;
            const disbursementNo = disbursementHeader?.disbursement_no || '-';
            const disbursementDate =
                disbursementHeader?.disbursement_date || '-';

            return h('div', { class: 'flex flex-col gap-0.5' }, [
                h(
                    'span',
                    { class: 'font-medium text-sm text-foreground' },
                    disbursementNo,
                ),

                h('div', { class: 'flex items-center gap-1.5 text-xs' }, [
                    h(ClockIcon, { class: 'w-3 h-3' }),
                    h(
                        'span',
                        {},
                        new Date(disbursementDate).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        }),
                    ),
                ]),
            ]);
        },
    }),

    createColumn({
        value: 'payment_type',
        title: 'Tipe Pembayaran',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const paymentType = row.original.payment_type;
            const matchedType = PAYMENT_TYPES.find(
                (type) => type.value === paymentType,
            );

            return h(
                'div',
                { class: 'font-medium' },
                matchedType ? matchedType.label : '-'
            );
        },
    }),

    createColumn({
        value: 'fund_source_name',
        title: 'Sumber Dana',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const fundSource = row.original.fund_source;
            return h(
                'div',
                { class: 'font-medium' },
                fundSource?.name || '-'
            );
        },
    }),

    createColumn({
        value: 'total_amount',
        title: 'Nilai Pencairan',
        sortable: true,
        searchable: false,
        render: ({ row }) => {
            const amount = Number(row.original.total_amount || 0);

            return h(
                'div',
                { class: 'font-medium' },
                new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(amount),
            );
        },
    }),

    createColumn({
        value: 'status',
        title: 'Status',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const status = (row.original.status ?? 'PENDING').toUpperCase();
            const statusConfig: Record<
                string,
                { bg: string; icon: any; text: string }
            > = {
                DRAFT: {
                    bg: 'bg-gray-100 text-gray-800',
                    icon: FileTextIcon,
                    text: 'Masih dalam penyusunan',
                },
                SUBMITTED: {
                    bg: 'bg-yellow-100 text-yellow-800',
                    icon: ClockIcon,
                    text: 'Menunggu pembayaran',
                },
                TRANSFERRED: {
                    bg: 'bg-green-100 text-green-800',
                    icon: CreditCardIcon,
                    text: 'Sudah dibayarkan',
                },
            };

            const config = statusConfig[status] || {
                bg: 'bg-gray-100',
                icon: FileTextIcon,
                text: status,
            };

            return h(
                Badge,
                {
                    variant: 'secondary',
                    class: `${config.bg} capitalize`,
                },
                [h(config.icon, { class: 'w-3 h-3 mr-1' }), config.text],
            );
        },
    }),

    createActionColumn([
        // {
        //   icon: EyeIcon,
        //   variant: 'outline',
        //   onClick: (row: BudgetFundRelease) => viewFundRelease(row),
        // },
        {
            icon: EditIcon,
            variant: 'default',
            onClick: (row: BudgetFundRelease) => editFundRelease(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            permissions: ['delete pencairan'],
            onClick: (row: BudgetFundRelease) => deleteFundRelease(row),
        },
    ]),
];

// Init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/budget-fund-releases',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari No. Pencairan',
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    refreshable: true,
    initialFilters: {
        status: ['submitted', 'transferred'],
    },
});

// Action handlers
const viewFundRelease = (fundRelease: BudgetFundRelease) => {
    router.visit(`/realisasi-pencairan/${fundRelease.id}/view`);
};

const editFundRelease = (fundRelease: BudgetFundRelease) => {
    router.visit(`/realisasi-pencairan/${fundRelease.id}/edit`);
};

const deleteFundRelease = (fundRelease: BudgetFundRelease) => {
    fundReleaseToDelete.value = fundRelease;
    showDeleteDialog.value = true;
};

const goToCreatePage = () => {
    router.visit('/realisasi-pencairan/input');
};

// Handle delete data
const handleDeleteFundRelease = async () => {
    if (!fundReleaseToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(
            `/api/v1/budget-fund-releases/${fundReleaseToDelete.value.id}`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showDeleteDialog.value = false;
        fundReleaseToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error: any) {
        console.error('Delete failed:', error);
        const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Terjadi kesalahan saat menghapus data';
        toast.error(errorMessage);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Head title="Realisasi Pencairan" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        Realisasi Pencairan
                    </h1>
                    <p class="text-muted-foreground">
                        Daftar realisasi pencairan yang diajukan
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <!-- <Button v-if="canCreate" @click="goToCreatePage">
                        <PlusIcon />
                        Buat Pencairan
                    </Button> -->
                </div>
            </div>

            <!-- DataTable -->
            <DataTable
                :columns="dataTable.columns"
                :data="dataTable.data.value"
                :loading="dataTable.loading.value"
                :actions="dataTable.actions"
                searchable
                search-placeholder="Cari No. Pencairan"
                show-pagination
                show-page-info
                empty-message="Data realisasi pencairan tidak ditemukan"
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
    </AppLayout>

    <!-- Delete Dialog -->
    <FormDialog
        v-model:open="showDeleteDialog"
        title="Hapus Pencairan"
        description="Proses ini tidak dapat dibatalkan. Pencairan akan dihapus secara permanen."
        :loading="loading"
        submit-text="Hapus Pencairan"
        submit-variant="destructive"
        cancel-text="Batal"
        size="sm"
        @submit="handleDeleteFundRelease"
    >
        <div class="rounded-md border border-red-200 bg-red-50 p-4">
            <p class="text-sm text-red-800">
                Apakah Anda yakin akan menghapus pelepasan dana:
                <strong>{{ fundReleaseToDelete?.fund_release_no }}</strong>
            </p>
            <p class="mt-2 text-xs text-red-600">
                *Data yang telah dihapus tidak dapat dikembalikan
            </p>
        </div>
    </FormDialog>
</template>
