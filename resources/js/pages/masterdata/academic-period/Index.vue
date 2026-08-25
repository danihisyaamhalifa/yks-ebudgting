<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { createActionColumn, createColumn, useDataTable } from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
import { Head } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import { computed, h, reactive, ref, watch } from 'vue';
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
import Textarea from '@/components/ui/textarea/Textarea.vue';
import { Switch } from '@/components/ui/switch';
import { BreadcrumbItem } from '@/types';
import { AcademicPeriod } from '@/types/datamaster';
import {
  BadgeCheckIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
  AlertCircleIcon
} from 'lucide-vue-next';
import axios, { AxiosError } from 'axios';
import { Badge } from '@/components/ui/badge';
import { toast } from 'vue-sonner';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: 'dashboard',
  },
  {
    title: 'Periode Akademik',
    href: ''
  },
];

// period columns
const columns: ColumnDef<AcademicPeriod>[] = [
  createColumn({
    value: 'academic_year',
    title: 'Tahun Akademik',
    sortable: true,
    searchable: true,
    render: ({ row }) => {
      return row.original.academic_year
    }
  }),

  createColumn({
    value: 'semester',
    title: 'Semester',
    sortable: true,
    searchable: true,
    render: ({ row }) => {
      return row.original.semester_name
    }
  }),

  createColumn({
    value: 'start_date',
    title: 'Tanggal Mulai',
    sortable: true,
    searchable: true,
    render: ({ row }) => {
      const dateValue = row.original.start_date;
      if (!dateValue) return '-';

      return new Date(dateValue).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }),

  createColumn({
    value: 'end_date',
    title: 'Tanggal Selesai',
    sortable: true,
    searchable: true,
    render: ({ row }) => {
      const dateValue = row.original.end_date;
      if (!dateValue) return '-';

      return new Date(dateValue).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }),

  createColumn({
    value: 'description',
    title: 'Deskripsi',
    sortable: true,
    searchable: true,
    render: ({ row }) => {
      return row.original.description || '-'
    }
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
          [
            h(BadgeCheckIcon, { class: 'w-4 h-4' }),
            'Aktif'
          ]
        );
      } else {
        return h(
          Badge,
          {
            variant: 'destructive',
            class: 'gap-1',
          },
          [
            h(XCircleIcon, { class: 'w-4 h-4' }),
            'Non Aktif'
          ]
        );
      }
    }
  }),

  createActionColumn([
    {
      icon: EditIcon,
      variant: 'default',
      onClick: (row: AcademicPeriod) => updateAcademicPeriod(row),
    },
    {
      icon: TrashIcon,
      variant: 'destructive',
      onClick: (row: AcademicPeriod) => deleteAcademicPeriod(row),
    },
  ]),
]

// init dataTable
const dataTable = useDataTable({
  endpoint: '/api/v1/academic-periods',
  columns,
  searchable: true,
  searchPlaceholder: 'Cari Periode Akademik',
  sortable: true,
  filterable: true,
  exportable: true,
  selectable: true,
  refreshable: true,
})

// management states
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const loading = ref(false)

// form data
const periodForm = reactive({
  id: '',
  academic_year: '',
  semester: '',
  start_date: '',
  end_date: '',
  description: '',
  is_active: true
})

const periodToDelete = ref<AcademicPeriod | null>(null)

// Individual field errors
const fieldErrors = reactive({
  academic_year: [] as string[],
  semester: [] as string[],
  start_date: [] as string[],
  end_date: [] as string[],
  description: [] as string[],
  is_active: [] as string[],
  general: [] as string[]
})

const showValidationErrors = ref(false)

// Reset validation
const resetValidation = () => {
  fieldErrors.academic_year = []
  fieldErrors.semester = []
  fieldErrors.start_date = []
  fieldErrors.end_date = []
  fieldErrors.description = []
  fieldErrors.is_active = []
  fieldErrors.general = []
  showValidationErrors.value = false
}

// Validation function
const validateForm = (): boolean => {
  // Reset errors
  fieldErrors.academic_year = []
  fieldErrors.semester = []
  fieldErrors.start_date = []
  fieldErrors.end_date = []
  fieldErrors.description = []
  fieldErrors.is_active = []
  fieldErrors.general = []

  // Academic Year validation
  if (!periodForm.academic_year || periodForm.academic_year.trim() === '') {
    fieldErrors.academic_year.push('Tahun akademik wajib diisi')
  } else {
    const academicYearPattern = /^\d{4}\/\d{4}$/
    if (!academicYearPattern.test(periodForm.academic_year)) {
      fieldErrors.academic_year.push('Format harus TahunAwal/TahunAkhir (contoh: 2025/2026)')
    } else {
      const [startYear, endYear] = periodForm.academic_year.split('/').map(Number)
      if (endYear !== startYear + 1) {
        fieldErrors.academic_year.push('Tahun akhir harus tahun awal + 1 (contoh: 2025/2026)')
      }
      const currentYear = new Date().getFullYear()
      if (startYear < 2000 || startYear > currentYear + 10) {
        fieldErrors.academic_year.push(`Tahun awal harus antara 2000 sampai ${currentYear + 10}`)
      }
    }
  }

  // Semester validation
  if (!periodForm.semester || periodForm.semester.trim() === '') {
    fieldErrors.semester.push('Semester wajib dipilih')
  } else if (!['ganjil', 'genap'].includes(periodForm.semester)) {
    fieldErrors.semester.push('Semester tidak valid')
  }

  // Start Date validation
  if (!periodForm.start_date || periodForm.start_date.trim() === '') {
    fieldErrors.start_date.push('Tanggal mulai wajib diisi')
  } else {
    const startDate = new Date(periodForm.start_date)
    if (isNaN(startDate.getTime())) {
      fieldErrors.start_date.push('Format tanggal tidak valid')
    }
  }

  // End Date validation
  if (!periodForm.end_date || periodForm.end_date.trim() === '') {
    fieldErrors.end_date.push('Tanggal selesai wajib diisi')
  } else {
    const endDate = new Date(periodForm.end_date)
    if (isNaN(endDate.getTime())) {
      fieldErrors.end_date.push('Format tanggal tidak valid')
    }
  }

  // Date range validation
  if (periodForm.start_date && periodForm.end_date) {
    const startDate = new Date(periodForm.start_date)
    const endDate = new Date(periodForm.end_date)

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      if (endDate <= startDate) {
        fieldErrors.end_date.push('Tanggal selesai harus setelah tanggal mulai')
      }

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 1) {
        fieldErrors.general.push('Rentang tanggal minimal 1 hari')
      }
      
      if (diffDays > 365) {
        fieldErrors.general.push('Rentang tanggal maksimal 1 tahun')
      }
    }
  }

  // Academic year and date consistency validation
  if (periodForm.academic_year && periodForm.start_date && periodForm.end_date) {
    const academicYearPattern = /^\d{4}\/\d{4}$/
    if (academicYearPattern.test(periodForm.academic_year)) {
      const [startYearStr, endYearStr] = periodForm.academic_year.split('/')
      const startYear = parseInt(startYearStr)
      const endYear = parseInt(endYearStr)
      
      const dateStartYear = new Date(periodForm.start_date).getFullYear()
      const dateEndYear = new Date(periodForm.end_date).getFullYear()

      if (!isNaN(startYear) && !isNaN(endYear) && !isNaN(dateStartYear) && !isNaN(dateEndYear)) {
        if (dateStartYear < startYear || dateEndYear > endYear) {
          fieldErrors.general.push(
            `Tanggal harus dalam rentang tahun akademik ${startYear} - ${endYear}`
          )
        }
      }
    }
  }

  showValidationErrors.value = true

  const hasErrors = fieldErrors.academic_year.length > 0 ||
    fieldErrors.semester.length > 0 ||
    fieldErrors.start_date.length > 0 ||
    fieldErrors.end_date.length > 0 ||
    fieldErrors.description.length > 0 ||
    fieldErrors.is_active.length > 0 ||
    fieldErrors.general.length > 0

  return !hasErrors
}

// Real-time validation on field change
watch(() => periodForm.academic_year, () => {
  if (showValidationErrors.value) {
    fieldErrors.academic_year = []
    if (periodForm.academic_year && periodForm.academic_year.trim() !== '') {
      const academicYearPattern = /^\d{4}\/\d{4}$/
      if (!academicYearPattern.test(periodForm.academic_year)) {
        fieldErrors.academic_year.push('Format harus TahunAwal/TahunAkhir (contoh: 2025/2026)')
      }
    }
  }
})

watch(() => periodForm.semester, () => {
  if (showValidationErrors.value) {
    fieldErrors.semester = []
  }
})

watch(() => periodForm.start_date, () => {
  if (showValidationErrors.value) {
    fieldErrors.start_date = []
    fieldErrors.general = []
  }
})

watch(() => periodForm.end_date, () => {
  if (showValidationErrors.value) {
    fieldErrors.end_date = []
    fieldErrors.general = []
  }
})

// Computed property for form validity
const isFormValid = computed(() => {
  if (!showValidationErrors.value) return true

  return fieldErrors.academic_year.length === 0 &&
    fieldErrors.semester.length === 0 &&
    fieldErrors.start_date.length === 0 &&
    fieldErrors.end_date.length === 0 &&
    fieldErrors.description.length === 0 &&
    fieldErrors.is_active.length === 0 &&
    fieldErrors.general.length === 0
})

// reset form
const resetForm = () => {
  Object.assign(periodForm, {
    id: '',
    academic_year: '',
    semester: '',
    start_date: '',
    end_date: '',
    description: '',
    is_active: true
  })
  resetValidation()
}

// Handle API errors
const handleServerErrors = (errors: Record<string, string[]>) => {
  resetValidation()
  
  if (errors.academic_year) {
    fieldErrors.academic_year = Array.isArray(errors.academic_year) ? errors.academic_year : [errors.academic_year]
  }
  if (errors.semester) {
    fieldErrors.semester = Array.isArray(errors.semester) ? errors.semester : [errors.semester]
  }
  if (errors.start_date) {
    fieldErrors.start_date = Array.isArray(errors.start_date) ? errors.start_date : [errors.start_date]
  }
  if (errors.end_date) {
    fieldErrors.end_date = Array.isArray(errors.end_date) ? errors.end_date : [errors.end_date]
  }
  if (errors.description) {
    fieldErrors.description = Array.isArray(errors.description) ? errors.description : [errors.description]
  }
  if (errors.is_active) {
    fieldErrors.is_active = Array.isArray(errors.is_active) ? errors.is_active : [errors.is_active]
  }
  
  showValidationErrors.value = true
}

const handleApiError = (error: unknown, defaultMessage: string) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>;
    const statusCode = axiosError.response?.status;
    const errorMessage = axiosError.response?.data?.message || axiosError.message;

    switch (statusCode) {
      case 422:
        if (axiosError.response?.data?.errors) {
          handleServerErrors(axiosError.response.data.errors)
        }
        toast.error(errorMessage || 'Data tidak valid.')
        break
      case 404:
        toast.error(errorMessage || 'Data tidak ditemukan.')
        break
      case 409:
        toast.error(errorMessage || 'Terjadi konflik data.')
        break
      case 500:
        toast.error('Terjadi kesalahan pada server.')
        break
      default:
        toast.error(defaultMessage)
    }
  } else {
    toast.error(defaultMessage)
  }
}

// init form data
const createAcademicPeriod = () => {
  resetForm()
  showCreateDialog.value = true
}

const updateAcademicPeriod = (period: AcademicPeriod) => {
  resetForm()
  Object.assign(periodForm, {
    id: period.id,
    academic_year: period.academic_year,
    semester: period.semester,
    start_date: period.start_date?.split('T')[0] || '',
    end_date: period.end_date?.split('T')[0] || '',
    description: period.description || '',
    is_active: period.is_active
  })

  showEditDialog.value = true
}

const deleteAcademicPeriod = (period: AcademicPeriod) => {
  periodToDelete.value = period
  showDeleteDialog.value = true
}

// handle create period
const handleCreateAcademicPeriod = async () => {
  if (!validateForm()) {
    toast.warning('Mohon lengkapi semua field yang wajib diisi dengan benar.')
    return
  }

  loading.value = true

  try {
    await axios.post('/api/v1/academic-periods', periodForm)

    toast.success('Periode akademik berhasil ditambahkan!', {
      description: `Periode ${periodForm.academic_year} - ${periodForm.semester} telah dibuat.`
    })

    showCreateDialog.value = false
    resetForm()
    dataTable.actions.refresh()
  } catch (error) {
    handleApiError(error, 'Gagal menambahkan periode akademik. Silakan coba lagi.')
  } finally {
    loading.value = false
  }
}

// handle update period
const handleUpdateAcademicPeriod = async () => {
  if (!validateForm()) {
    toast.warning('Mohon lengkapi semua field yang wajib diisi dengan benar.')
    return
  }

  loading.value = true

  try {
    await axios.put(`/api/v1/academic-periods/${periodForm.id}`, periodForm)

    toast.success('Periode akademik berhasil diperbarui!', {
      description: `Periode ${periodForm.academic_year} - ${periodForm.semester} telah diperbarui.`
    })

    showEditDialog.value = false
    resetForm()
    dataTable.actions.refresh()
  } catch (error) {
    handleApiError(error, 'Gagal memperbarui periode akademik. Silakan coba lagi.')
  } finally {
    loading.value = false
  }
}

// handle delete data
const handleDeleteAcademicPeriod = async () => {
  if (!periodToDelete.value) return

  loading.value = true

  try {
    await axios.delete(`/api/v1/academic-periods/${periodToDelete.value.id}`)

    toast.success('Periode akademik berhasil dihapus!', {
      description: `Periode ${periodToDelete.value.academic_year} - ${periodToDelete.value.semester} telah dihapus permanen.`
    })

    showDeleteDialog.value = false
    periodToDelete.value = null
    dataTable.actions.refresh()
  } catch (error) {
    handleApiError(error, 'Gagal menghapus periode akademik. Silakan coba lagi.')
  } finally {
    loading.value = false
  }
}

const handleCancelCreate = () => {
  resetForm()
  showCreateDialog.value = false
}

const handleCancelEdit = () => {
  resetForm()
  showEditDialog.value = false
}
</script>

<template>
  <Head title="Periode Akademik" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Periode Akademik</h1>
          <p class="text-muted-foreground">
            Pengaturan data periode akademik
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <Button @click="createAcademicPeriod">
            <PlusIcon class="w-4 h-4 mr-2" />
            Tambah Periode
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
        search-placeholder="Cari periode akademik..." 
        show-pagination
        show-page-info 
        empty-message="Belum ada data periode akademik" 
        server-side
        :total-rows="dataTable.state.value.pagination.total" 
        :current-page="dataTable.state.value.pagination.page"
        :total-pages="dataTable.state.value.pagination.totalPages"
        :current-page-size="dataTable.state.value.pagination.perPage" 
        :exportable="true"
        @search="dataTable.actions.search" 
        @page-change="dataTable.actions.goToPage"
        @page-size-change="dataTable.actions.changePageSize"
        @sort-change="(sortBy, sortOrder) => dataTable.actions.sort(sortBy, sortOrder === 'desc')" 
      />
    </div>

    <!-- Create AcademicPeriod Dialog -->
    <FormDialog v-model:open="showCreateDialog" :loading="loading" size="md">
      <FormDialog.Header 
        title="Tambah Periode Akademik" 
        description="Tambahkan periode akademik baru untuk tahun ajaran yang akan datang." 
      />

      <FormDialog.Content spacing="md">
        <!-- General Errors -->
        <div v-if="fieldErrors.general.length > 0" class="bg-amber-50 border border-amber-200 rounded-md p-3">
          <div class="flex items-start gap-2">
            <AlertCircleIcon class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p v-for="(error, index) in fieldErrors.general" :key="index" class="text-sm text-amber-700">
                {{ error }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tahun Akademik -->
        <div class="space-y-2">
          <Label for="create-academic-year">
            Tahun Akademik <span class="text-red-500">*</span>
          </Label>
          <Input 
            id="create-academic-year" 
            v-model="periodForm.academic_year" 
            placeholder="Contoh: 2025/2026"
            :disabled="loading"
            :class="{ 'border-red-500 focus:ring-red-500': fieldErrors.academic_year.length > 0 }"
          />
          <p v-if="fieldErrors.academic_year.length === 0" class="text-xs text-gray-500">
            Format: TahunAwal/TahunAkhir (contoh: 2025/2026)
          </p>
          <p v-for="(error, index) in fieldErrors.academic_year" :key="index" class="text-xs text-red-500">
            {{ error }}
          </p>
        </div>

        <!-- Semester -->
        <div class="space-y-2">
          <Label for="create-semester">
            Semester <span class="text-red-500">*</span>
          </Label>
          <Select v-model="periodForm.semester" :disabled="loading">
            <SelectTrigger 
              id="create-semester"
              :class="{ 'border-red-500 focus:ring-red-500': fieldErrors.semester.length > 0 }"
            >
              <SelectValue placeholder="Pilih semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ganjil">Ganjil</SelectItem>
              <SelectItem value="genap">Genap</SelectItem>
            </SelectContent>
          </Select>
          <p v-for="(error, index) in fieldErrors.semester" :key="index" class="text-xs text-red-500">
            {{ error }}
          </p>
        </div>

        <!-- Start Date -->
        <div class="space-y-2">
          <Label for="create-start-date">
            Tanggal Mulai <span class="text-red-500">*</span>
          </Label>
          <Input 
            id="create-start-date" 
            type="date" 
            v-model="periodForm.start_date" 
            :disabled="loading"
            :class="{ 'border-red-500 focus:ring-red-500': fieldErrors.start_date.length > 0 }"
          />
          <p v-for="(error, index) in fieldErrors.start_date" :key="index" class="text-xs text-red-500">
            {{ error }}
          </p>
        </div>

        <!-- End Date -->
        <div class="space-y-2">
          <Label for="create-end-date">
            Tanggal Selesai <span class="text-red-500">*</span>
          </Label>
          <Input 
            id="create-end-date" 
            type="date" 
            v-model="periodForm.end_date" 
            :disabled="loading"
            :class="{ 'border-red-500 focus:ring-red-500': fieldErrors.end_date.length > 0 }"
          />
          <p v-for="(error, index) in fieldErrors.end_date" :key="index" class="text-xs text-red-500">
            {{ error }}
          </p>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="create-description">Deskripsi</Label>
          <Textarea 
            id="create-description" 
            v-model="periodForm.description" 
            placeholder="Tambahkan deskripsi periode akademik (opsional)..."
            :disabled="loading"
            :class="{ 'border-red-500 focus:ring-red-500': fieldErrors.description.length > 0 }"
          />
          <p v-for="(error, index) in fieldErrors.description" :key="index" class="text-xs text-red-500">
            {{ error }}
          </p>
        </div>

        <!-- Status Aktif Toggle -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div>
              <Label for="create-is-active" class="text-sm font-medium">
                Status Aktif
              </Label>
              <p class="text-xs text-muted-foreground">
                Aktifkan periode ini jika sedang berjalan
              </p>
            </div>
            <Switch 
              id="create-is-active" 
              v-model="periodForm.is_active"
              :disabled="loading"
              :class="{ 'data-[state=checked]:bg-blue-600': periodForm.is_active }"
            />
          </div>
          <div v-if="periodForm.is_active" class="flex items-center gap-2 text-xs text-blue-600">
            <BadgeCheckIcon class="w-4 h-4" />
            <span>Periode ini akan ditandai sebagai aktif</span>
          </div>
          <div v-else class="flex items-center gap-2 text-xs text-muted-foreground">
            <XCircleIcon class="w-4 h-4" />
            <span>Periode ini akan ditandai sebagai non-aktif</span>
          </div>
        </div>
      </FormDialog.Content>

      <FormDialog.Footer 
        submit-text="Simpan Periode Akademik" 
        cancel-text="Batal" 
        :loading="loading"
        :valid="isFormValid" 
        @submit="handleCreateAcademicPeriod"
        @cancel="handleCancelCreate"
      />
    </FormDialog>

    <!-- Edit AcademicPeriod Dialog -->
    <FormDialog v-model:open="showEditDialog" size="md">
      <FormDialog.Header 
        title="Edit Periode Akademik"
        description="Perbarui informasi periode akademik yang sudah ada." 
      />

      <FormDialog.Content spacing="md">
        <!-- General Errors -->
        <div v-if="fieldErrors.general.length > 0" class="bg-amber-50 border border-amber-200 rounded-md p-3">
          <div class="flex items-start gap-2">
            <AlertCircleIcon class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p v-for="(error, index) in fieldErrors.general" :key="index" class="text-sm text-amber-700">
                {{ error }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tahun Akademik -->
        <div class="space-y-2">
          <Label for="edit-academic-year">
            Tahun Akademik <span class="text-red-500">*</span>
          </Label>
          <Input 
            id="edit-academic-year" 
            v-model="periodForm.academic_year" 
            placeholder="Contoh: 2025/2026"
            :disabled="loading"
            :class="{ 'border-red-500 focus:ring-red-500': fieldErrors.academic_year.length > 0 }"
          />
          <p v-if="fieldErrors.academic_year.length === 0" class="text-xs text-gray-500">
            Format: Tahun Awal/Tahun Akhir (contoh: 2025/2026)
          </p>
          <p v-for="(error, index) in fieldErrors.academic_year" :key="index" class="text-xs text-red-500">
            {{ error }}
          </p>
        </div>

        <!-- Semester -->
        <div class="space-y-2">
          <Label for="edit-semester">
            Semester <span class="text-red-500">*</span>
          </Label>
          <Select v-model="periodForm.semester" :disabled="loading">
            <SelectTrigger 
              id="edit-semester"
              :class="{ 'border-red-500 focus:ring-red-500': fieldErrors.semester.length > 0 }"
            >
              <SelectValue placeholder="Pilih semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ganjil">Ganjil</SelectItem>
              <SelectItem value="genap">Genap</SelectItem>
            </SelectContent>
          </Select>
          <p v-for="(error, index) in fieldErrors.semester" :key="index" class="text-xs text-red-500">
            {{ error }}
          </p>
        </div>

        <!-- Start Date -->
        <div class="space-y-2">
          <Label for="edit-start-date">
            Tanggal Mulai <span class="text-red-500">*</span>
          </Label>
          <Input 
            id="edit-start-date" 
            type="date" 
            v-model="periodForm.start_date" 
            :disabled="loading"
            :class="{ 'border-red-500 focus:ring-red-500': fieldErrors.start_date.length > 0 }"
          />
          <p v-for="(error, index) in fieldErrors.start_date" :key="index" class="text-xs text-red-500">
            {{ error }}
          </p>
        </div>

        <!-- End Date -->
        <div class="space-y-2">
          <Label for="edit-end-date">
            Tanggal Selesai <span class="text-red-500">*</span>
          </Label>
          <Input 
            id="edit-end-date" 
            type="date" 
            v-model="periodForm.end_date" 
            :disabled="loading"
            :class="{ 'border-red-500 focus:ring-red-500': fieldErrors.end_date.length > 0 }"
          />
          <p v-for="(error, index) in fieldErrors.end_date" :key="index" class="text-xs text-red-500">
            {{ error }}
          </p>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="edit-description">Deskripsi</Label>
          <Textarea 
            id="edit-description" 
            v-model="periodForm.description" 
            placeholder="Tambahkan deskripsi periode akademik (opsional)..."
            :disabled="loading"
            :class="{ 'border-red-500 focus:ring-red-500': fieldErrors.description.length > 0 }"
          />
          <p v-for="(error, index) in fieldErrors.description" :key="index" class="text-xs text-red-500">
            {{ error }}
          </p>
        </div>

        <!-- Status Aktif Toggle -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div>
              <Label for="edit-is-active" class="text-sm font-medium">
                Status Aktif
              </Label>
              <p class="text-xs text-muted-foreground">
                Aktifkan periode ini jika sedang berjalan
              </p>
            </div>
            <Switch 
              id="edit-is-active" 
              v-model="periodForm.is_active"
              :disabled="loading"
              :class="{ 'data-[state=checked]:bg-blue-600': periodForm.is_active }"
            />
          </div>
          <div v-if="periodForm.is_active" class="flex items-center gap-2 text-xs text-blue-600">
            <BadgeCheckIcon class="w-4 h-4" />
            <span>Periode ini akan ditandai sebagai aktif</span>
          </div>
          <div v-else class="flex items-center gap-2 text-xs text-muted-foreground">
            <XCircleIcon class="w-4 h-4" />
            <span>Periode ini akan ditandai sebagai non-aktif</span>
          </div>
        </div>
      </FormDialog.Content>

      <FormDialog.Footer 
        submit-text="Perbarui Periode Akademik" 
        cancel-text="Batal" 
        :loading="loading"
        :valid="isFormValid" 
        @submit="handleUpdateAcademicPeriod"
        @cancel="handleCancelEdit"
      />
    </FormDialog>

    <!-- Delete AcademicPeriod Dialog -->
    <FormDialog v-model:open="showDeleteDialog" size="sm">
      <FormDialog.Header 
        title="Hapus Periode Akademik"
        description="Tindakan ini tidak dapat dibatalkan. Periode akademik akan dihapus secara permanen." 
      />

      <FormDialog.Content>
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex items-start gap-3">
            <AlertCircleIcon class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm text-red-800 font-medium">
                Konfirmasi Penghapusan
              </p>
              <p class="text-sm text-red-700 mt-1">
                Anda akan menghapus periode akademik:
              </p>
              <p class="text-sm font-semibold text-red-800 mt-2">
                {{ periodToDelete?.academic_year ?? '-' }} - {{ periodToDelete?.semester ?? '-' }}
              </p>
              <p class="text-sm text-red-600 mt-2">
                Semua data yang terkait dengan periode ini akan ikut terhapus.
              </p>
            </div>
          </div>
        </div>
      </FormDialog.Content>

      <FormDialog.Footer 
        submit-text="Hapus Periode Akademik" 
        submit-variant="destructive" 
        cancel-text="Batal" 
        :loading="loading"
        @submit="handleDeleteAcademicPeriod"
      />
    </FormDialog>
  </AppLayout>
</template>