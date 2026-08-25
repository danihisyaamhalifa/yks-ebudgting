import { ref, computed, readonly, h, type Ref, onMounted } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { LucideIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useUser } from '@/composables/useUser'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import axios from 'axios'

// 👇 TAMBAHKAN INI - Extend ColumnMeta
declare module '@tanstack/vue-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right'
    exceptRoles?: string[]
    isActionColumn?: boolean
    [key: string]: any
  }
}

export interface DataTableConfig {
  endpoint: string
  columns: ColumnDef<any, any>[]
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  pageSizeOptions?: number[]
  sortable?: boolean
  filterable?: boolean
  exportable?: boolean
  selectable?: boolean
  refreshable?: boolean
  searchDebounce?: number
  initialFilters?: Record<string, any> 
}

export interface DataTableState {
  data: any[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
    from: number
    to: number
  }
  search: string
  sorting: Array<{
    id: string
    desc: boolean
  }>
  filters: Record<string, any>
  selectedRows: any[]
  rawMeta: Record<string, any> | null
}
const cache: Record<string, Ref<DataTableState>> = {}
export interface DataTableActions {
  refresh: () => Promise<void>
  search: (query: string) => void
  sort: (columnId: string, desc?: boolean) => void
  filter: (filters: Record<string, any>) => void
  goToPage: (page: number) => void
  changePageSize: (size: number) => void
  selectRow: (row: any) => void
  selectAllRows: () => void
  clearSelection: () => void
  exportData: (format?: 'csv' | 'excel' | 'pdf', scope?: 'current' | 'all') => void
  reset: () => void
  getRawMeta: () => Record<string, any> | null
}

export function useDataTable(config: DataTableConfig) {
  const { hasAnyRole } = useUser()
  const filteredColumns = config.columns.filter(column => {
    const exceptRoles = (column.meta as any)?.exceptRoles
    if (exceptRoles && Array.isArray(exceptRoles) && exceptRoles.length > 0) {
      return !hasAnyRole(exceptRoles)
    }
    return true
  })

  // Update config with filtered columns
  const filteredConfig = { ...config, columns: filteredColumns }
const cacheKey = `${config.endpoint}_${JSON.stringify(config.initialFilters || {})}`

if (!cache[cacheKey]) {
    cache[cacheKey] = ref({
        data: [],
        loading: false,
        error: null,
        pagination: {
            page: 1,
            perPage: config.pageSize || 10,
            total: 0,
            totalPages: 0,
            from: 0,
            to: 0,
        },
        rawMeta: null,
        search: '',
        sorting: [],
        filters: { ...config.initialFilters }, // initial value
        selectedRows: [],
    })
}

const state = cache[cacheKey]

// Optional: tetap sync jika initialFilters berubah runtime
onMounted(() => {
    if (!state.value.data.length) {
        fetchData()
    }
})

  // Debounced search
  let searchTimeout: number | null = null
  const debouncedSearch = (query: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(() => {
      state.value.search = query
      state.value.pagination.page = 1 // Reset to first page on search
      fetchData()
    }, config.searchDebounce || 300)
  }

  // Computed properties
  const hasData = computed(() => state.value.data.length > 0)
  const hasSelection = computed(() => state.value.selectedRows.length > 0)
  const isAllSelected = computed(() =>
    state.value.data.length > 0 &&
    state.value.selectedRows.length === state.value.data.length
  )
  const selectedCount = computed(() => state.value.selectedRows.length)

  // Build query parameters
  const buildQueryParams = () => {
    const params: Record<string, any> = {
      page: state.value.pagination.page,
      per_page: state.value.pagination.perPage,
    }

    if (state.value.search && config.searchable) {
      params.search = state.value.search
    }

    if (state.value.sorting.length > 0 && config.sortable) {
      const firstSort = state.value.sorting[0] // Take the first sort only
      params.sort_by = firstSort.id
      params.sort_order = firstSort.desc ? 'desc' : 'asc'
    }

    if (Object.keys(state.value.filters).length > 0 && config.filterable) {
      Object.entries(state.value.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params[`filter[${key}]`] = value
        }
      })
    }

    return params
  }
  // Fetch data from API
  const fetchData = async () => {
    try {
      state.value.loading = true
      state.value.error = null

      const params = buildQueryParams()
      const response = await axios.get(config.endpoint, { params })
      const apiResponse = response.data

      const result = response.data

      state.value.data = result.data || []
      state.value.pagination = {
        page: result.meta.pagination?.current_page || 1,
        perPage: result.meta.pagination?.per_page || config.pageSize || 10,
        total: result.meta.pagination?.total || 0,
        totalPages: result.meta.pagination?.last_page || 1,
        from: result.meta.pagination?.from || 0,
        to: result.meta.pagination?.to || 0,
      }

      // Clear selection when data changes
      state.value.selectedRows = []

      state.value.rawMeta = apiResponse.meta

    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'An error occurred'
      console.error('DataTable fetch error:', error)
    } finally {
      state.value.loading = false
    }
  }

  // Helper functions for client-side export
  const flattenRow = (row: any) => {
    const newRow: any = { ...row };
    filteredColumns.forEach((col:any) => {
      if (col.accessorKey && col.accessorKey.includes('.')) {
        const keys = col.accessorKey.split('.');
        let value = row;
        for (const key of keys) {
          if (value && typeof value === 'object' && key in value) {
            value = value[key];
          } else {
            value = undefined;
            break;
          }
        }
        if (value !== undefined) {
          newRow[col.accessorKey.replace('.', '_')] = value;
        }
      }
    });
    return newRow;
  };

  const getValueFromFlattenedRow = (row: any, accessorKey: string) => {
    if (accessorKey.includes('.')) {
      const flattenedKey = accessorKey.replace('.', '_');
      if (row.hasOwnProperty(flattenedKey)) {
        return row[flattenedKey];
      }
      // Fallback to original nested access if flattened key not found (should not happen if flattenRow works correctly)
      const keys = accessorKey.split('.');
      let value = row;
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return undefined;
        }
      }
      return value;
    }
    return row[accessorKey];
  };
  const generatePDF = (data: any[], filename: string) => {
    const doc = new jsPDF()

    const relevantColumns = filteredColumns
      .filter((col: any) => col.accessorKey && col.id !== 'actions' && col.id !== 'select')
      .filter((col: any) => {
        if (data.length === 0) return true; // If no data, include all columns
        const value = getValueFromFlattenedRow(data[0], col.accessorKey);
        // Exclude columns if the value for the first row is an object or an array
        return !(typeof value === 'object' && value !== null);
      });

    // Extract column headers from config
    const headers = relevantColumns.map((col: any) => col.header || col.id)

    // Extract data rows
    const rows = data.map(row =>
      relevantColumns.map((col: any) => {
          const value = getValueFromFlattenedRow(row, col.accessorKey)
          if (value === null || value === undefined) return ''
          return String(value)
        })
    )

    // Generate PDF table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 20 },
    })

    // Add title
    doc.setFontSize(16)
    doc.text('Data Export', 14, 15)

    // Save the PDF
    doc.save(`${filename}.pdf`)
  }

  const generateExcel = (data: any[], filename: string) => {
    const relevantColumns = filteredColumns
      .filter((col: any) => col.accessorKey && col.id !== 'actions' && col.id !== 'select')
      .filter((col: any) => {
        if (data.length === 0) return true; // If no data, include all columns
        const value = getValueFromFlattenedRow(data[0], col.accessorKey);
        // Exclude columns if the value for the first row is an object or an array
        return !(typeof value === 'object' && value !== null);
      });

    // Extract column headers from config
    const headers = relevantColumns.map((col: any) => col.header || col.id)

    // Prepare data for Excel
    const excelData = data.map(row => {
      const excelRow: any = {}
      relevantColumns.forEach((col: any) => {
          const header = col.header || col.id
          const value = getValueFromFlattenedRow(row, col.accessorKey)
          if (value === null || value === undefined) {
            excelRow[header] = ''
          } else {
            excelRow[header] = value
          }
        })
      return excelRow
    })

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Auto-size columns
    const colWidths = headers.map((header: any) => ({
      wch: Math.max(header.length, 15) // Minimum width of 15 characters
    }))
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data Export')

    // Save the Excel file
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  // Actions
  const actions: DataTableActions = {
    refresh: async () => {
      await fetchData()
    },

    search: (query: string) => {
      debouncedSearch(query)
    },

    sort: (columnId: string, desc: boolean = false) => {
      const existingSort = state.value.sorting.find(s => s.id === columnId)


      if (existingSort) {
        if (existingSort.desc === desc) {
          // Remove sort if clicking the same direction
          state.value.sorting = state.value.sorting.filter(s => s.id !== columnId)
        } else {
          // Toggle direction
          existingSort.desc = desc
        }
      } else {
        // Add new sort (replace existing for single column sort)
        state.value.sorting = [{ id: columnId, desc }]
      }

      state.value.pagination.page = 1 // Reset to first page
      fetchData()
    },

    filter: (filters: Record<string, any>) => {
      state.value.filters = { ...state.value.filters, ...filters }
      state.value.pagination.page = 1 // Reset to first page
      fetchData()
    },

    goToPage: (page: number) => {
      if (page >= 1 && page <= state.value.pagination.totalPages) {
        state.value.pagination.page = page
        fetchData()
      }
    },

    changePageSize: (size: number) => {
      state.value.pagination.perPage = size
      state.value.pagination.page = 1 // Reset to first page
      fetchData()
    },

    selectRow: (row: any) => {
      const index = state.value.selectedRows.findIndex(r => r.id === row.id)
      if (index > -1) {
        state.value.selectedRows.splice(index, 1)
      } else {
        state.value.selectedRows.push(row)
      }
    },

    selectAllRows: () => {
      if (isAllSelected.value) {
        state.value.selectedRows = []
      } else {
        state.value.selectedRows = [...state.value.data]
      }
    },

    clearSelection: () => {
      state.value.selectedRows = []
    },

    exportData: async (format: 'csv' | 'excel' | 'pdf' = 'csv', scope: 'current' | 'all' = 'current') => {
      // Helper function to convert JSON to CSV
      const jsonToCsv = (jsonData: any[]) => {
        if (jsonData.length === 0) {
          return '';
        }

        // Flatten the data to handle nested objects dynamically using flattenRow
        const flattenedData = jsonData.map(item => flattenRow(item));

        // Dynamically determine headers from the flattened data
        const allKeys = new Set<string>();
        flattenedData.forEach(row => {
          Object.keys(row).forEach(key => {
            // Exclude complex objects and specific internal keys
            if (typeof row[key] !== 'object' || row[key] === null || key.endsWith('_id')) { // Include _id fields
              if (key !== 'actions' && key !== 'select') { // Exclude actions and select columns
                allKeys.add(key);
              }
            }
          });
        });

        // Prioritize order: explicit column headers first, then other keys alphabetically
        const explicitHeaders = filteredColumns
          .filter((col: any) => col.accessorKey && col.id !== 'actions' && col.id !== 'select')
          .map((col: any) => col.accessorKey.includes('.') ? col.accessorKey.replace('.', '_') : col.accessorKey);

        const otherHeaders = Array.from(allKeys)
          .filter(key => !explicitHeaders.includes(key))
          .sort();

        const headers = [...explicitHeaders, ...otherHeaders];

        const csvRows = [];

        // Add header row
        csvRows.push(headers.join(','));

        // Add data rows
        for (const row of flattenedData) { // Use flattenedData here
          const values = headers.map(header => {
            const value = getValueFromFlattenedRow(row, header); // Use header directly
            // Handle null/undefined values and escape commas/quotes
            if (value === null || value === undefined) {
              return '';
            }
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          });
          csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
      };

      // For CSV, use server-side export
      if (format === 'csv') {
        try {
          const params = buildQueryParams();
          params.export = 'csv';

          if (scope === 'all') {
            delete params.page;
            params.per_page = -1;
          }

          // Use axios to get the CSV data as json
          const response = await axios.get(config.endpoint, {
            params,
            responseType: 'json' // Change responseType to json to easily access data property
          });
          
          // Convert JSON data to CSV string
          const csvString = jsonToCsv(response.data.data);

          // Create download link
          const blob = new Blob([csvString], { type: 'text/csv' }); // Use the CSV string
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'export.csv';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Failed to export CSV:', error);
        }
        return;
      }

      // For PDF and Excel, use client-side generation
      let dataToExport = state.value.data

      // If scope is 'all', fetch all data without affecting table state
      if (scope === 'all') {
        try {
          const params = buildQueryParams()
          delete params.page
          params.per_page = -1

          // Fetch data without affecting the table's loading state
          const response = await axios.get(config.endpoint, { params })
          const result = response.data
          dataToExport = result.data || []
        } catch (error) {
          console.error('Failed to fetch all data for export:', error)
          return
        }
      }

      // Flatten the data for PDF and Excel export
      dataToExport = dataToExport.map(item => flattenRow(item));

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `export_${timestamp}`

      if (format === 'pdf') {
        generatePDF(dataToExport, filename)
      } else if (format === 'excel') {
        generateExcel(dataToExport, filename)
      }
    },

    reset: () => {
      state.value.search = ''
      state.value.sorting = []
      state.value.filters = {}
      state.value.pagination.page = 1
      state.value.selectedRows = []
      fetchData()
    },

    getRawMeta: () => {
      return state.value.rawMeta
    }
  }

  // STATE BARU: Getter untuk rawMeta
  const getRawMeta = () => {
    return state.value.rawMeta
  }

  // Initialize data on mount
  onMounted(() => {
    if (!state.value.data.length) {
      fetchData()
    }
  })

  // Return reactive state and actions
  return {
    state: readonly(state),
    actions,
    columns: filteredColumns,

    // Computed properties
    hasData,
    hasSelection,
    isAllSelected,
    selectedCount,

    // Direct access to commonly used state
    data: computed(() => state.value.data),
    loading: computed(() => state.value.loading),
    error: computed(() => state.value.error),
    pagination: computed(() => state.value.pagination),
    search: computed(() => state.value.search),
    sorting: computed(() => state.value.sorting),
    filters: computed(() => state.value.filters),
    selectedRows: computed(() => state.value.selectedRows),
  }
}

// Helper function to create column definitions
export function createColumn<T = any>(options: {
  value: string
  title: string
  sortable?: boolean
  filterable?: boolean
  searchable?: boolean
  cell?: (info: any) => any
  render?: (info: any) => any
  meta?: Record<string, any>
  except_roles?: string[]
  align?: 'left' | 'center' | 'right'  // 👈 TAMBAHKAN INI
}): ColumnDef<T, any> {
  return {
    id: options.value,
    accessorKey: options.value,
    header: options.title,
    enableSorting: options.sortable ?? true,
    enableColumnFilter: options.filterable ?? false,
    enableGlobalFilter: options.searchable ?? true,
    cell: options.render || options.cell,
    meta: {
      ...options.meta,
      exceptRoles: options.except_roles,
      align: options.align || 'left',  // 👈 TAMBAHKAN INI
    },
  }
}

// Helper function to create action column
export function createActionColumn<T = any>(
  actions: Array<{
    label?: string
    icon?: LucideIcon
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    onClick: (row: T) => void
    show?: (row: T) => boolean
    permissions?: string[]
  }>
): ColumnDef<T, any> {
  return {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    cell: ({ row }) => {
      const { hasAnyPermission } = useUser()

      const visibleActions = actions.filter(action => {
        // Check row-specific visibility
        if (action.show && !action.show(row.original)) {
          return false
        }

        // Check permissions
        if (action.permissions && action.permissions.length > 0) {
          return hasAnyPermission(action.permissions)
        }

        return true
      })

      return h('div', { class: 'flex items-center space-x-2' },
        visibleActions.map((action, index) => {
          const buttonContent: any[] = []

          if (action.icon) {
            buttonContent.push(h(action.icon, { class: 'h-4 w-4' }))
          }

          if (action.label) {
            buttonContent.push(action.label)
          }

          return h(Button, {
            class: 'cursor-pointer',
            key: index,
            variant: action.variant || 'outline',
            size: 'sm',
            onClick: () => action.onClick(row.original),
          }, { default: () => buttonContent })
        })
      )
    },
    meta: {
      isActionColumn: true,
    },
  }
}
