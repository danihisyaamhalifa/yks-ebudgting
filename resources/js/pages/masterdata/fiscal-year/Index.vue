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
import Textarea from '@/components/ui/textarea/Textarea.vue';
import { Switch } from '@/components/ui/switch';
import { BreadcrumbItem } from '@/types';
import { FiscalYear } from '@/types/datamaster';
import { BadgeCheckIcon, EditIcon, PlusIcon, TrashIcon, XCircleIcon } from 'lucide-vue-next';
import axios, { AxiosError } from 'axios';
import { Badge } from '@/components/ui/badge';
import { toast } from 'vue-sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Tahun Anggaran',
        href: ''
    },
];

// fiscal year columns
const columns: ColumnDef<FiscalYear>[] = [
    createColumn({
        value: 'year',
        title: 'Tahun Anggaran ',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.year
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
            return row.original.description
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
            onClick: (row: FiscalYear) => updateFiscalYear(row),
            // permissions: ['edit period_accademic'],
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: FiscalYear) => deleteFiscalYear(row),
            // permissions: ['delete period_accademic'],
        },
    ]),
]

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/fiscal-years',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari Tahun Anggaran',
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
const fiscalYearForm = reactive({
    id: '',
    year: '',
    semester: '',
    start_date: '',
    end_date: '',
    description: '',
    is_active: true
})

const periodToDelete = ref<FiscalYear | null>(null)

// Individual field errors
const fieldErrors = reactive({
    year: [] as string[],
    start_date: [] as string[],
    end_date: [] as string[],
    description: [] as string[],
    is_active: [] as string[],
    general: [] as string[]
})

const showValidationErrors = ref(false)

// Reset validation
const resetValidation = () => {
    fieldErrors.year = []
    fieldErrors.start_date = []
    fieldErrors.end_date = []
    fieldErrors.description = []
    fieldErrors.is_active = []
    fieldErrors.general = []
    showValidationErrors.value = false
}

const validateForm = (): boolean => {
    // Reset errors
    fieldErrors.year = []
    fieldErrors.start_date = []
    fieldErrors.end_date = []
    fieldErrors.description = []
    fieldErrors.is_active = []
    fieldErrors.general = []
    
    // Tahun validation
    if (!fiscalYearForm.year || fiscalYearForm.year.trim() === '') {
        fieldErrors.year.push('Tahun anggaran harus diisi')
    } else {
        if (fiscalYearForm.year.length !== 4) {
            fieldErrors.year.push('Tahun harus terdiri dari 4 digit')
        }
        if (isNaN(Number(fiscalYearForm.year))) {
            fieldErrors.year.push('Tahun hanya boleh berisi angka')
        }

        const yearNum = parseInt(fiscalYearForm.year)
        const currentYear = new Date().getFullYear()
        if (yearNum < 2000 || yearNum > currentYear + 10) {
            fieldErrors.year.push(`Tahun harus antara 2000 sampai ${currentYear + 10}`)
        }
    }
    
    // Tanggal Mulai validation
    if (!fiscalYearForm.start_date || fiscalYearForm.start_date.trim() === '') {
        fieldErrors.start_date.push('Tanggal mulai harus diisi')
    } else {
        const startDate = new Date(fiscalYearForm.start_date)
        if (isNaN(startDate.getTime())) {
            fieldErrors.start_date.push('Format tanggal mulai tidak valid')
        }
    }
    
    // Tanggal Selesai validation
    if (!fiscalYearForm.end_date || fiscalYearForm.end_date.trim() === '') {
        fieldErrors.end_date.push('Tanggal selesai harus diisi')
    } else {
        const endDate = new Date(fiscalYearForm.end_date)
        if (isNaN(endDate.getTime())) {
            fieldErrors.end_date.push('Format tanggal selesai tidak valid')
        }
    }
    
    // Date range validation
    if (fiscalYearForm.start_date && fiscalYearForm.end_date) {
        const startDate = new Date(fiscalYearForm.start_date)
        const endDate = new Date(fiscalYearForm.end_date)
        
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            if (endDate <= startDate) {
                fieldErrors.end_date.push('Tanggal selesai harus setelah tanggal mulai')
            }
            
            // Check if date range is at least 1 day
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            if (diffDays < 1) {
                fieldErrors.general.push('Rentang tanggal minimal 1 hari')
            }
            
            // Check if date range is reasonable (max 1 years)
            if (diffDays > 365) {
                fieldErrors.general.push('Rentang tanggal maksimal 1 tahun')
            }
        }
    }
    
    // Tahun dan tanggal harus konsisten
    if (fiscalYearForm.year && fiscalYearForm.start_date && fiscalYearForm.end_date) {
        const formYear = parseInt(fiscalYearForm.year)
        const startYear = new Date(fiscalYearForm.start_date).getFullYear()
        const endYear = new Date(fiscalYearForm.end_date).getFullYear()
        
        if (!isNaN(formYear) && !isNaN(startYear) && !isNaN(endYear)) {
            if (formYear !== startYear && formYear !== endYear) {
                fieldErrors.general.push(`Tahun ${fiscalYearForm.year} harus sesuai dengan rentang tanggal (${startYear} - ${endYear})`)
            }
        }
    }
    
    showValidationErrors.value = true
    
    const hasErrors = fieldErrors.year.length > 0 || 
                     fieldErrors.start_date.length > 0 || 
                     fieldErrors.end_date.length > 0 || 
                     fieldErrors.description.length > 0 ||
                     fieldErrors.is_active.length > 0 ||
                     fieldErrors.general.length > 0
    
    return !hasErrors
}

// Computed property for form validity
const isFormValid = computed(() => {
    if (!showValidationErrors.value) return true
    
    return fieldErrors.year.length === 0 && 
           fieldErrors.start_date.length === 0 && 
           fieldErrors.end_date.length === 0 && 
           fieldErrors.description.length === 0 &&
           fieldErrors.is_active.length === 0 &&
           fieldErrors.general.length === 0
})

// Watch form changes to clear errors
watch(
    () => fiscalYearForm.year,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.year = []
            if (fiscalYearForm.year && fiscalYearForm.year.trim() !== '') {
                if (fiscalYearForm.year.length !== 4) {
                    fieldErrors.year.push('Tahun harus terdiri dari 4 digit')
                } else if (isNaN(Number(fiscalYearForm.year))) {
                    fieldErrors.year.push('Tahun hanya boleh berisi angka')
                }
            }
        }
    }
)

watch(
    () => fiscalYearForm.start_date,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.start_date = []
            fieldErrors.general = []
        }
    }
)

watch(
    () => fiscalYearForm.end_date,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.end_date = []
            fieldErrors.general = []
        }
    }
)

// reset form
const resetForm = () => {
    Object.assign(fiscalYearForm, {
        id: '',
        year: '',
        semester: '',
        start_date: '',
        end_date: '',
        description: '',
        is_active: true
    })
    resetValidation()
}

// init form data
const createFiscalYear = () => {
    resetForm()
    showCreateDialog.value = true
}

const updateFiscalYear = (period: FiscalYear) => {
    resetForm()
    Object.assign(fiscalYearForm, {
        id: period.id,
        year: period.year,
        start_date: period.start_date?.split('T')[0] || new Date().toISOString().substring(0, 10),
        end_date: period.end_date?.split('T')[0] || new Date().toISOString().substring(0, 10),
        description: period.description,
        is_active: period.is_active
    })

    showEditDialog.value = true
}

const deleteFiscalYear = (period: FiscalYear) => {
    periodToDelete.value = period
    showDeleteDialog.value = true
}

// Handle server errors
const handleServerErrors = (errors: any) => {
    resetValidation()
    
    if (errors.year) {
        fieldErrors.year = Array.isArray(errors.year) ? errors.year : [errors.year]
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

// handle create period
const handleCreateFiscalYear = async () => {
    if (!validateForm()) {
        toast.warning('Mohon lengkapi semua field yang wajib diisi dengan benar.')
        return
    }
    
    loading.value = true
    try {
        await axios.post('/api/v1/fiscal-years', fiscalYearForm)
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success('Tahun anggaran berhasil ditambahkan!', {
        description: `Periode ${fiscalYearForm.year} telah dibuat.`
        })

        showCreateDialog.value = false
        resetForm()
        dataTable.actions.refresh()
    } catch (error) {
        handleApiError(error, 'Gagal menambahkan tahun anggaran. Silakan coba lagi.')
    } finally {
        loading.value = false
    }
}

// handle update period
const handleUpdateFiscalYear = async () => {
    if (!validateForm()) {
        return
    }
    
    loading.value = true
    try {
        await axios.put(`/api/v1/fiscal-years/${fiscalYearForm.id}`, fiscalYearForm)
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success('Tahun anggaran berhasil diperbarui!', {
        description: `Periode ${fiscalYearForm.year} telah diperbarui.`
        })

        showEditDialog.value = false
        resetForm()
        dataTable.actions.refresh()
    } catch (error) {
        handleApiError(error, 'Gagal memperbarui tahun anggaran. Silakan coba lagi.')
    } finally {
        loading.value = false
    }
}

// handle delete data
const handleDeleteFiscalYear = async () => {
    if (!periodToDelete.value) return

    loading.value = true
    try {
        await axios.delete(`api/v1/fiscal-years/${periodToDelete.value.id}`)
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success('Tahun anggaran berhasil dihapus!', {
            description: `Tahun anggaran ${periodToDelete.value.year} telah dihapus permanen.`
        })

        showDeleteDialog.value = false
        periodToDelete.value = null
        dataTable.actions.refresh()
    } catch (error) {
        handleApiError(error, 'Gagal menghapus tahun anggaran. Silakan coba lagi.')
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

    <Head title="Tahun Anggaran" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Tahun Anggaran</h1>
                    <p class="text-muted-foreground">
                        Pengaturan data tahun anggaran
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button @click="createFiscalYear">
                        <PlusIcon class="w-4 h-4 mr-2" />
                        Tambah
                    </Button>
                </div>
            </div>

            <!-- DataTable -->
            <DataTable :columns="dataTable.columns" :data="dataTable.data.value" :loading="dataTable.loading.value"
                :actions="dataTable.actions" searchable search-placeholder="Cari Tahun Anggaran" show-pagination
                show-page-info empty-message="Data tahun anggaran tidak ditemukan" server-side
                :total-rows="dataTable.state.value.pagination.total"
                :current-page="dataTable.state.value.pagination.page"
                :total-pages="dataTable.state.value.pagination.totalPages"
                :current-page-size="dataTable.state.value.pagination.perPage" :exportable="true"
                @search="dataTable.actions.search" @page-change="dataTable.actions.goToPage"
                @page-size-change="dataTable.actions.changePageSize"
                @sort-change="(sortBy, sortOrder) => dataTable.actions.sort(sortBy, sortOrder === 'desc')" />
        </div>

        <!-- Create FiscalYear Dialog -->
        <FormDialog v-model:open="showCreateDialog" :loading="loading" size="md">
            <FormDialog.Header title="Tambah Tahun Anggaran" description="Menambahkan informasi tahun anggaran baru." />
            
            <FormDialog.Content spacing="md">
                <!-- General Errors -->
                <div v-if="fieldErrors.general.length > 0" class="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <ul class="list-disc list-inside text-sm text-amber-700">
                        <li v-for="(error, index) in fieldErrors.general" :key="index">{{ error }}</li>
                    </ul>
                </div>

                <!-- Tahun -->
                <div class="space-y-2">
                    <Label for="create-year" class="flex items-center gap-1">
                        Tahun
                        <span class="text-red-500">*</span>
                    </Label>
                    <Input id="create-year" v-model="fiscalYearForm.year" 
                           placeholder="Isikan tahun angaran" 
                           :disabled="loading"
                           :class="{'border-red-500 focus:ring-red-500': fieldErrors.year.length > 0}"
                           maxlength="4" 
                           @input="fiscalYearForm.year = fiscalYearForm.year.replace(/\D/g, '')" />
                    <p v-if="fieldErrors.year.length === 0" class="text-xs text-muted-foreground">Masukkan tahun anggaran dalam format 4 digit</p>
                    <p v-for="(error, index) in fieldErrors.year" :key="index" class="text-xs text-red-500">{{ error }}</p>
                </div>

                <!-- Start Date -->
                <div class="space-y-2">
                    <Label for="create-start-date" class="flex items-center gap-1">
                        Tanggal Mulai
                        <span class="text-red-500">*</span>
                    </Label>
                    <Input id="create-start-date" type="date" v-model="fiscalYearForm.start_date" 
                           :disabled="loading"
                           :class="{'border-red-500 focus:ring-red-500': fieldErrors.start_date.length > 0}" />
                    <p v-for="(error, index) in fieldErrors.start_date" :key="index" class="text-xs text-red-500">{{ error }}</p>
                </div>

                <!-- End Date -->
                <div class="space-y-2">
                    <Label for="create-end-date" class="flex items-center gap-1">
                        Tanggal Selesai
                        <span class="text-red-500">*</span>
                    </Label>
                    <Input id="create-end-date" type="date" v-model="fiscalYearForm.end_date" 
                           :disabled="loading"
                           :class="{'border-red-500 focus:ring-red-500': fieldErrors.end_date.length > 0}" />
                    <p v-for="(error, index) in fieldErrors.end_date" :key="index" class="text-xs text-red-500">{{ error }}</p>
                </div>

                <!-- Description -->
                <div class="space-y-2">
                    <Label for="create-description">Deskripsi</Label>
                    <Textarea id="create-description" v-model="fiscalYearForm.description"
                             placeholder="Tambahkan deskripsi (opsional)" 
                             :disabled="loading" />
                    <p v-for="(error, index) in fieldErrors.description" :key="index" class="text-xs text-red-500">{{ error }}</p>
                </div>

                <!-- Status Aktif Toggle -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <div>
                            <Label for="create-is-active" class="text-sm font-medium">
                                Status Aktif
                            </Label>
                            <p class="text-xs text-muted-foreground">
                                Aktifkan tahun anggaran ini jika sedang berjalan
                            </p>
                        </div>
                        <Switch 
                            id="create-is-active" 
                            v-model="fiscalYearForm.is_active"
                            :disabled="loading"
                            :class="{ 'data-[state=checked]:bg-blue-600': fiscalYearForm.is_active }"
                        />
                    </div>
                    <div v-if="fiscalYearForm.is_active" class="flex items-center gap-2 text-xs text-blue-600">
                        <BadgeCheckIcon class="w-4 h-4" />
                        <span>Tahun anggaran ini akan ditandai sebagai aktif</span>
                    </div>
                    <div v-else class="flex items-center gap-2 text-xs text-muted-foreground">
                        <XCircleIcon class="w-4 h-4" />
                        <span>Tahun anggaran ini akan ditandai sebagai non-aktif</span>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer submit-text="Tambah Tahun Anggaran" cancel-text="Batal" 
                              :loading="loading"
                              :valid="isFormValid" 
                              @submit="handleCreateFiscalYear"
                              @cancel="handleCancelCreate" />
        </FormDialog>

        <!-- Edit FiscalYear Dialog -->
        <FormDialog v-model:open="showEditDialog" :loading="loading" size="md">
            <FormDialog.Header title="Update Tahun Anggaran" 
                              description="Memperbaharui informasi tahun anggaran." />
            
            <FormDialog.Content spacing="md">
                <!-- General Errors -->
                <div v-if="fieldErrors.general.length > 0" class="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <ul class="list-disc list-inside text-sm text-amber-700">
                        <li v-for="(error, index) in fieldErrors.general" :key="index">{{ error }}</li>
                    </ul>
                </div>

                <!-- Tahun -->
                <div class="space-y-2">
                    <Label for="edit-year" class="flex items-center gap-1">
                        Tahun Anggaran
                        <span class="text-red-500">*</span>
                    </Label>
                    <Input id="edit-year" v-model="fiscalYearForm.year" 
                           placeholder="Isikan tahun, contoh: 2024" 
                           :disabled="loading"
                           :class="{'border-red-500 focus:ring-red-500': fieldErrors.year.length > 0}"
                           maxlength="4" 
                           @input="fiscalYearForm.year = fiscalYearForm.year.replace(/\D/g, '')" />
                    <p v-if="fieldErrors.year.length === 0" class="text-xs text-muted-foreground">Masukkan tahun anggaran dalam format 4 digit</p>
                    <p v-for="(error, index) in fieldErrors.year" :key="index" class="text-xs text-red-500">{{ error }}</p>
                </div>

                <!-- Start Date -->
                <div class="space-y-2">
                    <Label for="edit-start-date" class="flex items-center gap-1">
                        Tanggal Mulai
                        <span class="text-red-500">*</span>
                    </Label>
                    <Input id="edit-start-date" type="date" v-model="fiscalYearForm.start_date" 
                           :disabled="loading"
                           :class="{'border-red-500 focus:ring-red-500': fieldErrors.start_date.length > 0}" />
                    <p v-for="(error, index) in fieldErrors.start_date" :key="index" class="text-xs text-red-500">{{ error }}</p>
                </div>

                <!-- End Date -->
                <div class="space-y-2">
                    <Label for="edit-end-date" class="flex items-center gap-1">
                        Tanggal Selesai
                        <span class="text-red-500">*</span>
                    </Label>
                    <Input id="edit-end-date" type="date" v-model="fiscalYearForm.end_date" 
                           :disabled="loading"
                           :class="{'border-red-500 focus:ring-red-500': fieldErrors.end_date.length > 0}" />
                    <p v-for="(error, index) in fieldErrors.end_date" :key="index" class="text-xs text-red-500">{{ error }}</p>
                </div>

                <!-- Description -->
                <div class="space-y-2">
                    <Label for="edit-description">Deskripsi</Label>
                    <Textarea id="edit-description" v-model="fiscalYearForm.description" 
                             placeholder="Tambahkan deskripsi (opsional)"
                             :disabled="loading" />
                    <p v-for="(error, index) in fieldErrors.description" :key="index" class="text-xs text-red-500">{{ error }}</p>
                </div>

                <!-- Status Aktif Toggle -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <div>
                            <Label for="edit-is-active" class="text-sm font-medium">
                                Status Aktif
                            </Label>
                            <p class="text-xs text-muted-foreground">
                                Aktifkan tahun anggaran ini jika sedang berjalan
                            </p>
                        </div>
                        <Switch 
                            id="edit-is-active" 
                            v-model="fiscalYearForm.is_active"
                            :disabled="loading"
                            :class="{ 'data-[state=checked]:bg-blue-600': fiscalYearForm.is_active }"
                        />
                    </div>
                    <div v-if="fiscalYearForm.is_active" class="flex items-center gap-2 text-xs text-blue-600">
                        <BadgeCheckIcon class="w-4 h-4" />
                        <span>Tahun anggaran ini akan ditandai sebagai aktif</span>
                    </div>
                    <div v-else class="flex items-center gap-2 text-xs text-muted-foreground">
                        <XCircleIcon class="w-4 h-4" />
                        <span>Tahun anggaran ini akan ditandai sebagai non-aktif</span>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer submit-text="Update Tahun Anggaran" cancel-text="Batal"
                              :loading="loading"
                              :valid="isFormValid"
                              @submit="handleUpdateFiscalYear"
                              @cancel="handleCancelEdit" />
        </FormDialog>

        <!-- Delete FiscalYear Dialog -->
        <FormDialog v-model:open="showDeleteDialog" :loading="loading" size="sm">
            <FormDialog.Header 
                title="Hapus Tahun Anggaran"
                description="Proses ini tidak dapat dibatalkan. Tahun Anggaran akan dihapus secara permanen." 
            />
            
            <FormDialog.Content>
                <div class="bg-red-50 border border-red-200 rounded-md p-4">
                    <p class="text-sm text-red-800">
                        Apakah kamu yakin akan menghapus tahun anggaran:
                        <strong>{{ periodToDelete?.year ?? '-' }}</strong>
                    </p>
                    <p class="text-xs text-red-600 mt-2">
                        Semua data yang terkait dengan tahun anggaran ini akan ikut terhapus.
                    </p>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer 
                submit-text="Hapus Tahun Anggaran" 
                submit-variant="destructive" 
                cancel-text="Batal"
                :loading="loading"
                @submit="handleDeleteFiscalYear" 
            />
        </FormDialog>
    </AppLayout>
</template>