<script setup lang="ts" generic="TData">
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { DataTableActions } from '@/composables/useDataTable';
import type { ColumnDef } from '@tanstack/vue-table';
import {
    FlexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useVueTable,
} from '@tanstack/vue-table';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Search,
} from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';

export interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    loading?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    pageSizes?: number[];
    showPagination?: boolean;
    showPageInfo?: boolean;
    emptyMessage?: string;
    className?: string;
    serverSide?: boolean;
    totalRows?: number;
    currentPage?: number;
    totalPages?: number;
    currentPageSize?: number;
    showRowNumbers?: boolean;
    exportable?: boolean;
    actions?: DataTableActions;
}

const props = withDefaults(defineProps<DataTableProps<TData>>(), {
    loading: false,
    searchable: true,
    searchPlaceholder: 'Search...',
    pageSizes: () => [10, 20, 50, 100, -1],
    showPagination: true,
    showPageInfo: true,
    emptyMessage: 'No results found.',
    className: '',
    serverSide: true,
    totalRows: 0,
    currentPage: 1,
    totalPages: 1,
    currentPageSize: 10,
    showRowNumbers: true,
    exportable: false,
    actions: undefined,
});

const emit = defineEmits<{
    search: [value: string];
    pageChange: [page: number];
    pageSizeChange: [pageSize: number];
    sortChange: [sortBy: string, sortOrder: 'asc' | 'desc'];
}>();

// Local state
const globalFilter = ref('');
const sorting = ref<any[]>([]);
const columnFilters = ref<any[]>([]);
const pagination = ref({
    pageIndex: 0,
    pageSize: props.pageSizes[0],
});
const showAllPages = ref(false);

// Debounce timeout
let searchTimeout: number | null = null;

// Debounced search function
const debouncedSearch = (value: string, delay: number = 300) => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(() => {
        emit('search', value);
    }, delay);
};

// Row numbering column
const rowNumberColumn = computed((): ColumnDef<TData> | null => {
    if (!props.showRowNumbers) return null;

    return {
        id: '__rowNumber',
        header: '#',
        size: 60,
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
        cell: ({ row }) => {
            if (props.serverSide) {
                // For server-side pagination, calculate based on current page and row index
                return startRow.value + row.index;
            } else {
                // For client-side, use the actual row index in the filtered/sorted data
                return row.index + 1;
            }
        },
    };
});

// All columns including row numbers
const allColumns = computed(() => {
    const columns = [...props.columns];
    if (props.showRowNumbers && rowNumberColumn.value) {
        columns.unshift(rowNumberColumn.value);
    }
    return columns;
});

// Table instance
const table = useVueTable({
    get data() {
        return props.data;
    },
    get columns() {
        return allColumns.value;
    },
    getCoreRowModel: getCoreRowModel(),
    ...(props.serverSide
        ? {}
        : {
              getPaginationRowModel: getPaginationRowModel(),
              getSortedRowModel: getSortedRowModel(),
              getFilteredRowModel: getFilteredRowModel(),
          }),
    manualPagination: props.serverSide,
    manualSorting: props.serverSide,
    manualFiltering: props.serverSide,
    onSortingChange: (updaterOrValue) => {
        sorting.value =
            typeof updaterOrValue === 'function'
                ? updaterOrValue(sorting.value)
                : updaterOrValue;
    },
    onColumnFiltersChange: (updaterOrValue) => {
        columnFilters.value =
            typeof updaterOrValue === 'function'
                ? updaterOrValue(columnFilters.value)
                : updaterOrValue;
    },
    onPaginationChange: (updaterOrValue) => {
        pagination.value =
            typeof updaterOrValue === 'function'
                ? updaterOrValue(pagination.value)
                : updaterOrValue;
    },
    onGlobalFilterChange: (updaterOrValue) => {
        globalFilter.value =
            typeof updaterOrValue === 'function'
                ? updaterOrValue(globalFilter.value)
                : updaterOrValue;
    },
    state: {
        get sorting() {
            return sorting.value;
        },
        get columnFilters() {
            return columnFilters.value;
        },
        get globalFilter() {
            return globalFilter.value;
        },
        get pagination() {
            return pagination.value;
        },
    },
    ...(props.serverSide
        ? {
              pageCount: props.totalPages,
              rowCount: props.totalRows,
          }
        : {}),
});

// Computed properties
const currentPage = computed(() =>
    props.serverSide
        ? props.currentPage
        : table.getState().pagination.pageIndex + 1,
);
const totalPages = computed(() =>
    props.serverSide ? props.totalPages : table.getPageCount(),
);
const pageSize = computed(() => {
    return props.serverSide
        ? props.currentPageSize
        : table.getState().pagination.pageSize;
});
const totalRows = computed(() =>
    props.serverSide
        ? props.totalRows
        : table.getFilteredRowModel().rows.length,
);
const startRow = computed(() => (currentPage.value - 1) * pageSize.value + 1);
const endRow = computed(() =>
    Math.min(currentPage.value * pageSize.value, totalRows.value),
);

// Generate visible page numbers for pagination
const visiblePages = computed(() => {
    const current = currentPage.value;
    const total = totalPages.value;
    const pages: number[] = [];

    if (total <= 7 || showAllPages.value) {
        // Show all pages if total is 7 or less, or if user clicked ellipsis
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        // Pattern: 1 ... (current-1) current (current+1) ... last
        pages.push(1);

        if (current > 3) {
            pages.push(-1); // ellipsis before current range
        }

        // Show current page and neighbors (current-1, current, current+1)
        // But adjust for beginning and end
        if (current <= 3) {
            // At beginning, show more pages
            for (let i = 2; i <= Math.min(4, total - 1); i++) {
                pages.push(i);
            }
        } else if (current >= total - 1) {
            // At actual end (last page), show first page + ellipsis + last 4 pages
            const start = Math.max(2, total - 3);
            for (let i = start; i <= total; i++) {
                pages.push(i);
            }
            // Don't add last page again since it's already in the loop
        } else {
            // In middle, show current-1, current, current+1
            if (current > 1) {
                pages.push(current - 1);
            }
            pages.push(current);
            if (current < total) {
                pages.push(current + 1);
            }
        }

        if (current < total - 2) {
            pages.push(-1);
        }

        if (total > 1 && !(current >= total - 1)) {
            pages.push(total);
        }
    }

    return pages;
});

// Watchers for emitting events
watch(globalFilter, (newValue: string) => {
    debouncedSearch(newValue);
});

watch(
    () => table.getState().pagination.pageIndex,
    (newPage: number) => {
        emit('pageChange', newPage + 1);
    },
);

watch(
    () => table.getState().pagination.pageSize,
    (newPageSize: number) => {
        emit('pageSizeChange', newPageSize);
    },
);

watch(
    sorting,
    (newSorting: any) => {
        if (newSorting.length > 0) {
            const sort = newSorting[0];
            emit('sortChange', sort.id, sort.desc ? 'desc' : 'asc');
        }
    },
    { deep: true },
);

// Reset showAllPages when total pages changes to maintain consistent UI
watch(totalPages, () => {
    if (totalPages.value <= 7) {
        showAllPages.value = false;
    }
});

// Methods
const setPageSize = (size: number) => {
    if (props.serverSide) {
        emit('pageSizeChange', size);
    } else {
        table.setPageSize(size);
    }
};

const goToPage = (page: number) => {
    if (props.serverSide) {
        emit('pageChange', page);
    } else {
        table.setPageIndex(page - 1);
    }
};

const goToFirstPage = () => {
    if (props.serverSide) {
        emit('pageChange', 1);
    } else {
        table.setPageIndex(0);
    }
};

const goToLastPage = () => {
    if (props.serverSide) {
        emit('pageChange', totalPages.value);
    } else {
        table.setPageIndex(table.getPageCount() - 1);
    }
};

const goToPreviousPage = () => {
    if (props.serverSide) {
        const prevPage = Math.max(1, currentPage.value - 1);
        emit('pageChange', prevPage);
    } else {
        table.previousPage();
    }
};

const goToNextPage = () => {
    if (props.serverSide) {
        const nextPage = Math.min(totalPages.value, currentPage.value + 1);
        emit('pageChange', nextPage);
    } else {
        table.nextPage();
    }
};

const toggleShowAllPages = () => {
    showAllPages.value = !showAllPages.value;
};

const handlePageClick = (page: number) => {
    if (page === -1) {
        // Ellipsis clicked - toggle show all pages
        toggleShowAllPages();
    } else {
        // Regular page number clicked
        goToPage(page);
        // Reset to condensed view after clicking a page number
        if (showAllPages.value && totalPages.value > 7) {
            showAllPages.value = false;
        }
    }
};

// Handle export functionality
const handleExport = (
    format: 'csv' | 'excel' | 'pdf',
    scope: 'current' | 'all',
) => {
    if (props.actions?.exportData) {
        props.actions.exportData(format, scope);
    }
};

// Expose methods for parent components
defineExpose({
    table,
    setPageSize,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToPreviousPage,
    goToNextPage,
    resetSorting: () => table.resetSorting(),
    resetColumnFilters: () => table.resetColumnFilters(),
    resetGlobalFilter: () => table.resetGlobalFilter(),
});
</script>

<template>
    <div :class="['space-y-4', className]">
        <!-- Search and Controls -->
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
                <div v-if="searchable" class="relative">
                    <Search
                        class="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                        autocorrect="off"
                        autocomplete="none"
                        aria-autocomplete="none"
                        v-model="globalFilter"
                        :placeholder="searchPlaceholder"
                        class="max-w-sm pl-8"
                    />
                </div>
            </div>

            <div class="flex items-center space-x-2">
                <span class="text-sm text-muted-foreground"
                    >Rows per page:</span
                >
                <Select
                    :model-value="pageSize.toString()"
                    @update:model-value="setPageSize(Number($event))"
                >
                    <SelectTrigger class="w-[70px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="size in pageSizes"
                            :key="size"
                            :value="size.toString()"
                        >
                            {{ size === -1 ? 'Show All' : size }}
                        </SelectItem>
                    </SelectContent>
                </Select>

                <!-- Export Dropdown -->
                <DropdownMenu v-if="exportable">
                    <DropdownMenuTrigger as-child>
                        <Button variant="outline" class="ml-2">
                            <Download class="h-4 w-4" />
                            <ChevronDown class="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            @click="handleExport('csv', 'current')"
                        >
                            CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            @click="handleExport('excel', 'current')"
                        >
                            Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            @click="handleExport('pdf', 'current')"
                        >
                            PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="handleExport('csv', 'all')">
                            CSV (All)
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="handleExport('excel', 'all')">
                            Excel (All)
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="handleExport('pdf', 'all')">
                            PDF (All)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        <!-- Table -->
        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow
                        v-for="headerGroup in table.getHeaderGroups()"
                        :key="headerGroup.id"
                    >
                        <TableHead
                            v-for="header in headerGroup.headers"
                            :key="header.id"
                        >
                            <div
                                v-if="!header.isPlaceholder"
                                :class="[
                                    'flex items-center space-x-2',
                                    header.column.getCanSort()
                                        ? 'cursor-pointer select-none'
                                        : '',
                                    // 👇 TAMBAHKAN BARIS INI UNTUK ALIGNMENT HEADER
                                    header.column.columnDef.meta?.align ===
                                    'center'
                                        ? 'justify-center'
                                        : header.column.columnDef.meta
                                                ?.align === 'right'
                                          ? 'justify-end'
                                          : 'justify-start',
                                ]"
                                @click="
                                    header.column.getToggleSortingHandler()?.(
                                        $event,
                                    )
                                "
                            >
                                <FlexRender
                                    :render="header.column.columnDef.header"
                                    :props="header.getContext()"
                                />
                                <span
                                    v-if="header.column.getCanSort()"
                                    class="ml-2"
                                >
                                    <span
                                        v-if="
                                            header.column.getIsSorted() ===
                                            'asc'
                                        "
                                        >↑</span
                                    >
                                    <span
                                        v-else-if="
                                            header.column.getIsSorted() ===
                                            'desc'
                                        "
                                        >↓</span
                                    >
                                    <!-- <span v-else>↕</span> -->
                                </span>
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template
                        v-if="table.getRowModel().rows?.length && !loading"
                    >
                        <TableRow
                            v-for="row in table.getRowModel().rows"
                            :key="row.id"
                            :data-state="
                                row.getIsSelected() ? 'selected' : undefined
                            "
                        >
                            <TableCell
                                v-for="cell in row.getVisibleCells()"
                                :key="cell.id"
                                :class="[
                                    // 👇 TAMBAHKAN BARIS INI UNTUK ALIGNMENT CELL
                                    cell.column.columnDef.meta?.align ===
                                    'center'
                                        ? 'text-center'
                                        : cell.column.columnDef.meta?.align ===
                                            'right'
                                          ? 'text-right'
                                          : 'text-left',
                                ]"
                            >
                                <FlexRender
                                    :render="cell.column.columnDef.cell"
                                    :props="cell.getContext()"
                                />
                            </TableCell>
                        </TableRow>
                    </template>
                    <template v-else>
                        <TableRow>
                            <TableCell
                                :colspan="allColumns.length"
                                class="h-24 text-center"
                            >
                                <div
                                    v-if="loading"
                                    class="flex items-center justify-center"
                                >
                                    <div
                                        class="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"
                                    ></div>
                                    <span class="ml-2">Loading...</span>
                                </div>
                                <div v-else>{{ emptyMessage }}</div>
                            </TableCell>
                        </TableRow>
                    </template>
                </TableBody>
            </Table>
        </div>

        <!-- Pagination -->
        <div v-if="showPagination" class="flex items-center justify-between">
            <div v-if="showPageInfo" class="text-sm text-muted-foreground">
                Showing {{ startRow }} to {{ endRow }} of
                {{ totalRows }} results
            </div>

            <div class="flex items-center space-x-1">
                <Button
                    variant="outline"
                    size="sm"
                    :disabled="currentPage <= 1"
                    @click="goToPreviousPage"
                    class="cursor-pointer"
                >
                    <ChevronLeft class="h-4 w-4" />
                    <!-- <span class="ml-1">Previous</span> -->
                </Button>

                <template v-for="(page, index) in visiblePages" :key="index">
                    <Button
                        v-if="page === -1"
                        variant="ghost"
                        size="sm"
                        @click="handlePageClick(page)"
                        class="cursor-pointer hover:bg-muted"
                        title="Click to show all pages"
                    >
                        ...
                    </Button>
                    <Button
                        v-else
                        :variant="page === currentPage ? 'default' : 'outline'"
                        size="sm"
                        @click="handlePageClick(page)"
                        :class="
                            page === currentPage
                                ? 'bg-primary text-primary-foreground'
                                : ''
                        "
                        class="cursor-pointer"
                    >
                        {{ page }}
                    </Button>
                </template>

                <Button
                    variant="outline"
                    size="sm"
                    :disabled="currentPage >= totalPages"
                    @click="goToNextPage"
                    class="cursor-pointer"
                >
                    <!-- <span class="mr-1">Next</span> -->
                    <ChevronRight class="h-4 w-4" />
                </Button>
            </div>
        </div>
    </div>
</template>
