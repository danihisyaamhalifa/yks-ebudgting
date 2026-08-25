<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { Badge } from '@/components/ui/badge';
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem } from '@/types';
import { BudgetRequestHeader } from '@/types/budget';
import { Head, router } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import {
    BadgeCheckIcon,
    CalendarIcon,
    ClockIcon,
    EyeIcon,
    FileTextIcon,
    XCircleIcon
} from 'lucide-vue-next';
import { h } from 'vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Verifikasi &  Persetujuan Perencanaan',
        href: '',
    },
];

const columns: ColumnDef<BudgetRequestHeader>[] = [
    createColumn({
        value: 'request_no',
        title: 'No. Perencanaan & Tgl',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return h('div', { class: 'space-y-1' }, [
                h(
                    'div',
                    { class: 'font-medium text-sm' },
                    row.original.request_no,
                ),
                h('div', { class: 'flex items-center gap-1.5 text-xs' }, [
                    h(CalendarIcon, { class: 'w-3 h-3' }),
                    h('span', {class: 'text-xs font-bold text-muted-foreground'}, 
                        new Date(row.original.request_date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        })
                    ),
                ]),
            ]);
        },
    }),

    createColumn({
        value: 'unit',
        title: 'Unit',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return h(
                'div',
                { class: 'font-medium text-sm' },
                row.original.unit?.unit_name || '-',
            );
        },
    }),

    createColumn({
        value: 'budget_category',
        title: 'Kategori Anggaran',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return h('div', { class: 'space-y-0.5' }, [
                h(
                    'div',
                    { class: 'text-xs font-bold' },
                    `Tipe: ${
                        row.original.budget_type
                            ? row.original.budget_type
                                  .replace('_', ' ')
                                  .replace(/\b\w/g, (c) => c.toUpperCase())
                            : '-'
                    }`,
                ),
                h(
                    'div',
                    { class: 'text-xs font-bold text-muted-foreground' },
                    `Kat: ${row.original.budget_category?.name || '-'}`,
                ),
                h(
                    'div',
                    { class: 'text-xs font-bold text-muted-foreground' },
                    `Sub: ${row.original.sub_budget_category?.name || '-'}`,
                ),
            ]);
        },
    }),

    createColumn({
        value: 'total_amount',
        title: 'Total Anggaran',
        sortable: true,
        searchable: false,
        render: ({ row }) => {
            const amount = Number(row.original.total_amount || 0);
            const activityCount = row.original.request_activities?.length || 0;

            return h('div', { class: 'space-y-1' }, [
                h(
                    'div',
                    { class: 'font-medium' },
                    new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                    }).format(amount)
                ),
                h(
                    'div',
                    { class: 'text-xs font-bold text-muted-foreground' },
                    `${activityCount} kegiatan`
                ),
            ]);
        },
    }),

    createColumn({
        value: 'status',
        title: 'Status Proses',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const status = row.original.status;
            const statusApproval = row.original.approval_status_label;
            const statusConfig: Record<
                string,
                { bg: string; icon: any; text: string }
            > = {
                draft: {
                    bg: 'bg-gray-100 text-gray-800',
                    icon: FileTextIcon,
                    text: 'Masih dalam penyusunan',
                },
                submitted: {
                    bg: 'bg-blue-100 text-blue-800',
                    icon: ClockIcon,
                    text: statusApproval,
                },
                verified: {
                    bg: 'bg-yellow-100 text-yellow-800',
                    icon: BadgeCheckIcon,
                    text: 'Diverifikasi',
                },
                approved: {
                    bg: 'bg-green-100 text-green-800',
                    icon: BadgeCheckIcon,
                    text: 'Telah disetujui',
                },
                rejected: {
                    bg: 'bg-red-100 text-red-800',
                    icon: XCircleIcon,
                    text: 'Ditolak',
                },
                returned: {
                    bg: 'bg-gray-100 text-gray-800',
                    icon: XCircleIcon,
                    text: 'Dikembalikan, perlu revisi',
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
        {
            icon: EyeIcon,
            variant: 'outline',
            show: (row: BudgetRequestHeader) =>
                ['approved', 'rejected', 'returned'].includes(row.status),
            onClick: (row: BudgetRequestHeader) =>
                viewBudgetRequest(row),
        },
        {
            icon: BadgeCheckIcon,
            variant: 'default',
            show: (row: BudgetRequestHeader) => row.status === 'submitted',
            permissions: ['approve perencanaan_anggaran'],
            onClick: (row: BudgetRequestHeader) => verifyBudgetRequest(row),
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/budget-requests',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari No. Perencanaan...',
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    refreshable: true,
    initialFilters: {
        context: 'approval',
        status: ['submitted', 'approved', 'returned', 'rejected'],
    },
});

// Action handlers
const viewBudgetRequest = (budgetRequest: BudgetRequestHeader) => {
    router.visit(`/verifikasi-anggaran/${budgetRequest.id}/verify`);
};

const verifyBudgetRequest = (budgetRequest: BudgetRequestHeader) => {
    router.visit(`/verifikasi-anggaran/${budgetRequest.id}/verify`);
};
</script>

<template>
    <Head title="Verifikasi Perencanaan" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        Verifikasi & Persetujuan Perencanaan
                    </h1>
                    <p class="text-muted-foreground">
                        Daftar verifikasi & persetujuan perencanaan anggaran
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
                search-placeholder="Cari No. Perencanaan"
                show-pagination
                show-page-info
                empty-message="Data perencanaan anggaran tidak ditemukan"
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