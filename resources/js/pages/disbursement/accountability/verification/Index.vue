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
import { BudgetAccountability } from '@/types/disburse';
import { Head, router } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import {
    ArrowRightLeftIcon,
    BadgeCheckIcon,
    CalendarIcon,
    CheckCircle2Icon,
    ClockIcon,
    EyeIcon,
    FileTextIcon,
    RotateCcwIcon,
} from 'lucide-vue-next';
import { h } from 'vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Verifikasi Pertanggungjawaban',
        href: '',
    },
];

// Status configuration
const statusConfig: Record<string, { bg: string; icon: any; text: string }> = {
    draft: {
        bg: 'bg-gray-100 text-gray-800',
        icon: FileTextIcon,
        text: 'Masih dalam penyusunan',
    },
    submitted: {
        bg: 'bg-blue-100 text-blue-800',
        icon: ArrowRightLeftIcon,
        text: 'Diajukan',
    },
    verified: {
        bg: 'bg-yellow-100 text-yellow-800',
        icon: CheckCircle2Icon,
        text: 'Terverifikasi',
    },
    approved: {
        bg: 'bg-green-100 text-green-800',
        icon: BadgeCheckIcon,
        text: 'Disetujui',
    },
    returned: {
        bg: 'bg-red-100 text-red-800',
        icon: RotateCcwIcon,
        text: 'Dikembalikan',
    },
};

const columns: ColumnDef<BudgetAccountability>[] = [
    createColumn({
        value: 'accountability_no',
        title: 'No. & Tanggal SPJ',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return h('div', { class: 'space-y-1.5 min-w-[200px]' }, [
                // No. Pertanggungjawaban
                h(
                    'div',
                    { class: 'font-semibold text-sm' },
                    row.original.accountability_no,
                ),

                // Tanggal Pertanggungjawaban
                h('div', { class: 'flex items-center gap-1.5 text-xs' }, [
                    h(CalendarIcon, { class: 'w-3 h-3 text-muted-foreground' }),
                    h(
                        'span',
                        { class: 'text-muted-foreground' },
                        new Date(
                            row.original.accountability_date,
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
        value: 'fund_release_no',
        title: 'No. Pencairan',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const fundRelease = row.original.fund_release;
            const fundReleaseNo = fundRelease?.fund_release_no || '-';

            return h('div', { class: 'flex flex-col gap-0.5' }, [
                h(
                    'span',
                    { class: 'font-medium text-sm text-foreground' },
                    fundReleaseNo,
                ),
                fundRelease?.fund_release_date &&
                    h(
                        'div',
                        {
                            class: 'flex items-center gap-1.5 text-xs text-muted-foreground',
                        },
                        [
                            h(ClockIcon, { class: 'w-3 h-3' }),
                            h(
                                'span',
                                {},
                                new Date(
                                    fundRelease.fund_release_date,
                                ).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                }),
                            ),
                        ],
                    ),
            ]);
        },
    }),

    createColumn({
        value: 'disbursement_no',
        title: 'No. Pengajuan',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const disbursementHeader = row.original.disbursement_header;
            const disbursementNo = disbursementHeader?.disbursement_no || '-';

            return h('div', { class: 'flex flex-col gap-0.5' }, [
                h(
                    'span',
                    { class: 'font-medium text-sm text-foreground' },
                    disbursementNo,
                ),
                disbursementHeader?.disbursement_date &&
                    h(
                        'div',
                        {
                            class: 'flex items-center gap-1.5 text-xs text-muted-foreground',
                        },
                        [
                            h(ClockIcon, { class: 'w-3 h-3' }),
                            h(
                                'span',
                                {},
                                new Date(
                                    disbursementHeader.disbursement_date,
                                ).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                }),
                            ),
                        ],
                    ),
            ]);
        },
    }),

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
        value: 'total_received',
        title: 'Total Diterima',
        sortable: true,
        searchable: false,
        render: ({ row }) => {
            const amount = Number(row.original.total_received || 0);

            return h(
                'div',
                { class: 'font-medium text-green-600 dark:text-green-400' },
                new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(amount),
            );
        },
    }),

    createColumn({
        value: 'total_spent',
        title: 'Total Digunakan',
        sortable: true,
        searchable: false,
        render: ({ row }) => {
            const amount = Number(row.original.total_spent || 0);

            return h(
                'div',
                { class: 'font-medium text-orange-600 dark:text-orange-400' },
                new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(amount),
            );
        },
    }),

    createColumn({
        value: 'total_returned',
        title: 'Total Dikembalikan',
        sortable: true,
        searchable: false,
        render: ({ row }) => {
            const amount = Number(row.original.total_returned || 0);

            return h(
                'div',
                { class: 'font-medium text-blue-600 dark:text-blue-400' },
                new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(amount),
            );
        },
    }),

    createColumn({
        value: 'remaining',
        title: 'Sisa',
        sortable: false,
        searchable: false,
        render: ({ row }) => {
            const remaining =
                Number(row.original.total_received || 0) -
                Number(row.original.total_spent || 0) -
                Number(row.original.total_returned || 0);

            return h(
                'div',
                {
                    class: `font-semibold ${
                        remaining === 0
                            ? 'text-green-600 dark:text-green-400'
                            : remaining > 0
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                    }`,
                },
                new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(remaining),
            );
        },
    }),

    createColumn({
        value: 'status',
        title: 'Status',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const status = row.original.status || 'draft';
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
            show: (row: BudgetAccountability) =>
                ['approved', 'rejected', 'returned'].includes(row.status),
            onClick: (row: BudgetAccountability) =>
                verifyBudgetAccountability(row),
        },
        {
            icon: BadgeCheckIcon,
            variant: 'default',
            permissions: ['approve pertanggungjawaban_anggaran'],
            show: (row: BudgetAccountability) =>
                ['submitted', 'verified'].includes(row.status),
            onClick: (row: BudgetAccountability) =>
                verifyBudgetAccountability(row),
        },
    ]),
];

// Init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/budget-accountabilities',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari No. Pertanggungjawaban',
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    refreshable: false,
    initialFilters: {
        status: ['submitted', 'verified', 'approved', 'rejected', 'returned'],
    },
});

// Action handlers
const verifyBudgetAccountability = (accountability: BudgetAccountability) => {
    router.visit(`/verifikasi-pertanggungjawaban/${accountability.id}/verify`);
};

</script>

<template>
    <Head title="Verifikasi Pertanggungjawaban Anggaran" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        Verifikasi Pertanggungjawaban
                    </h1>
                    <p class="text-muted-foreground">
                        Daftar verifikasi & persetujuan pertanggungjawaban anggaran
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
                search-placeholder="Cari No. Pertanggungjawaban, No. Pencairan, No. Pengajuan..."
                show-pagination
                show-page-info
                empty-message="Tidak ada pertanggungjawaban yang memerlukan verifikasi atau persetujuan"
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
