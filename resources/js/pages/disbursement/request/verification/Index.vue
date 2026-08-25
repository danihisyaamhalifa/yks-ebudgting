<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { Badge } from '@/components/ui/badge';
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import { useUser } from '@/composables/useUser';
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem } from '@/types';
import { BudgetDisbursementHeader } from '@/types/disburse';
import { Head, router } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import {
    BadgeCheckIcon,
    CalendarIcon,
    CheckCircleIcon,
    CreditCardIcon,
    EyeIcon,
    FileTextIcon,
    XCircleIcon,
} from 'lucide-vue-next';
import { computed, h, ref } from 'vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Verifikasi & Persetujuan Pengajuan',
        href: '',
    },
];

const user = useUser();
const canVerify = computed(
    () => user.hasPermission('verify pengajuan_pencairan') ?? false,
);
const canApprove = computed(
    () => user.hasPermission('approve pengajuan_pencairan') ?? false,
);

const statusConfig: Record<string, { bg: string; icon: any; text: string }> = {
    submitted: {
        bg: 'bg-blue-100 text-blue-800',
        icon: EyeIcon,
        text: 'Menunggu Verifikasi',
    },
    verified: {
        bg: 'bg-yellow-100 text-yellow-800',
        icon: BadgeCheckIcon,
        text: 'Menunggu Persetujuan',
    },
    approved: {
        bg: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon,
        text: 'Disetujui',
    },
    rejected: {
        bg: 'bg-red-100 text-red-800',
        icon: XCircleIcon,
        text: 'Ditolak',
    },
};

const loading = ref(false);
const rejectReason = ref('');

// BudgetDisbursementHeader columns for verification/approval
const columns: ColumnDef<BudgetDisbursementHeader>[] = [
    createColumn({
        value: 'unit',
        title: 'Unit',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return h(
                'div',
                { class: 'font-medium text-sm' },
                row.original.request_header.unit?.unit_name || '-',
            );
        },
    }),

    createColumn({
        value: 'disbursement_no',
        title: 'No. & Tgl Pengajuan',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const dateRaw = row.original.disbursement_date;
            const formattedDate = dateRaw
                ? new Date(dateRaw).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                  })
                : '-';

            return h('div', { class: 'space-y-0.5 min-w-[140px]' }, [
                h(
                    'div',
                    { class: 'font-medium text-sm' },
                    row.original.disbursement_no || '-',
                ),
                dateRaw
                    ? h(
                          'div',
                          {
                              class: 'flex items-center gap-1.5 text-xs font-bold text-muted-foreground',
                          },
                          [
                              h(CalendarIcon, { class: 'w-3.5 h-3.5' }),
                              h('span', {}, formattedDate),
                          ],
                      )
                    : null,
            ]);
        },
    }),

    // Kolom Kegiatan & Deskripsi (digabung)
    createColumn({
        value: 'request_activity',
        title: 'Kegiatan & Deskripsi',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const description =
                row.original.request_activity?.description || '-';
            const notes = row.original.notes || '-';

            return h('div', { class: 'flex flex-col gap-1.5' }, [
                h('div', { class: 'font-medium text-sm' }, description),
                h(
                    'div',
                    { class: 'text-xs font-bold text-muted-foreground' },
                    notes,
                ),
            ]);
        },
    }),

    createColumn({
        value: 'request_header.request_no', // Sesuaikan path value untuk pencarian/sorting data tabel jika didukung
        title: 'No. & Tgl Perencanaan',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const requestNo = row.original.request_header?.request_no || '-';
            const requestDate = row.original.request_header?.request_date;
            const formattedDate = requestDate
                ? new Date(requestDate).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                  })
                : null;

            return h('div', { class: 'space-y-0.5 min-w-[140px]' }, [
                h('div', { class: 'font-medium text-sm' }, requestNo),
                formattedDate
                    ? h(
                          'div',
                          {
                              class: 'flex items-center gap-1.5 text-xs font-bold text-muted-foreground',
                          },
                          [
                              h(CalendarIcon, { class: 'w-3.5 h-3.5' }),
                              h('span', {}, formattedDate),
                          ],
                      )
                    : h(
                          'div',
                          { class: 'text-xs font-bold text-muted-foreground' },
                          '-',
                      ),
            ]);
        },
    }),

    createColumn({
        value: 'total_amount',
        title: 'Total Pengajuan',
        sortable: true,
        searchable: false,
        render: ({ row }) => {
            const amount = Number(row.original.total_amount || 0);
            const itemAcount = row.original.items?.length || 0;

            return h('div', { class: 'space-y-1' }, [
                h(
                    'div',
                    { class: 'font-medium text-sm' },
                    new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                    }).format(amount),
                ),
            ]);
        },
    }),

    // Kolom Status Pengajuan
    createColumn({
        value: 'status',
        title: 'Status',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const status = (row.original.status ?? 'DRAFT').toUpperCase();

            // 2. Konfigurasi warna bg, font, icon, dan teks
            const statusConfig: Record<
                string,
                { bg: string; icon: any; text: string }
            > = {
                DRAFT: {
                    bg: 'bg-slate-100 text-slate-700 border-slate-200',
                    icon: EyeIcon,
                    text: 'Masih dalam penyusunan',
                },
                SUBMITTED: {
                    bg: 'bg-amber-100 text-amber-800 border-amber-200',
                    icon: EyeIcon,
                    text: 'Diajukan, menunggu verifikasi',
                },
                VERIFIED: {
                    bg: 'bg-yellow-100 text-yellow-800',
                    icon: BadgeCheckIcon,
                    text: 'Diverifikasi',
                },
                APPROVED: {
                    bg: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: BadgeCheckIcon,
                    text: 'Telah disetujui',
                },
                RELEASED: {
                    bg: 'bg-green-100 text-green-800 border-green-200',
                    icon: CreditCardIcon,
                    text: 'Dana telah dicairkan',
                },
                RETURNED: {
                    bg: 'bg-orange-100 text-orange-800 border-orange-200',
                    icon: XCircleIcon,
                    text: 'Dikembalikan, perlu revisi',
                },
                REJECTED: {
                    bg: 'bg-red-100 text-red-800 border-red-200',
                    icon: XCircleIcon,
                    text: 'Ditolak',
                },
            };

            // 3. Fallback jika status tidak terdaftar
            const config = statusConfig[status] || {
                bg: 'bg-gray-100 text-gray-700',
                icon: FileTextIcon,
                text: status,
            };

            return h(
                Badge,
                {
                    variant: 'outline',
                    class: `${config.bg} font-medium flex items-center px-2.5 py-1 rounded-md text-xs layout-fix`,
                },
                [h(config.icon, { class: 'w-3 h-3 mr-1.5' }), config.text],
            );
        },
    }),

    createActionColumn([
        {
            icon: EyeIcon,
            variant: 'outline',
            show: (row: BudgetDisbursementHeader) =>
                ['approved', 'rejected', 'returned'].includes(row.status),
            onClick: (row: BudgetDisbursementHeader) =>
                viewBudgetDisbursement(row),
        },

        {
            icon: BadgeCheckIcon,
            variant: 'default',
            permissions: ['approve pengajuan_pencairan'],
            show: (row: BudgetDisbursementHeader) => ['submitted', 'verified'].includes(row.status),
            onClick: (row: BudgetDisbursementHeader) =>
                verifyBudgetDisbursement(row),
        },
    ]),
];

// init dataTable with additional filters
const dataTable = useDataTable({
    endpoint: '/api/v1/budget-disbursements',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari Pengajuan',
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    refreshable: true,
    initialFilters: {
        context: 'approval',
        status: ['submitted', 'verified', 'approved', 'rejected', 'returned'],
    },
});

// Action handlers
const viewBudgetDisbursement = (
    budgetDisbursement: BudgetDisbursementHeader,
) => {
    router.visit(`/verifikasi-pengajuan/${budgetDisbursement.id}/verify`);
};

const verifyBudgetDisbursement = (
    budgetDisbursement: BudgetDisbursementHeader,
) => {
    router.visit(`/verifikasi-pengajuan/${budgetDisbursement.id}/verify`);
};
</script>

<template>
    <Head title="Verifikasi Pengajuan Pencairan" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        Verifikasi Pengajuan Pencairan
                    </h1>
                    <p class="text-muted-foreground">
                        Daftar verifikasi & persetujuan pengajuan pencairan
                    </p>
                </div>
            </div>

            <!-- DataTable -->
            <DataTable
                :columns="dataTable.columns"
                :data="dataTable.data.value"
                :loading="dataTable.loading.value"
                :actions="dataTable.actions"
                searchable
                search-placeholder="Cari Pengajuan Pencairan"
                show-pagination
                show-page-info
                empty-message="Tidak ada pengajuan yang memerlukan verifikasi atau persetujuan"
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
</template>
