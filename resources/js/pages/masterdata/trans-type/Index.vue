<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { createActionColumn, createColumn, useDataTable } from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
import { Head } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import { computed, reactive, ref, h } from 'vue';
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
import { BreadcrumbItem } from '@/types';
import { TransactionType } from '@/types/datamaster';
import { BadgeCheckIcon, EditIcon, PlusIcon, TrashIcon, XCircleIcon } from 'lucide-vue-next';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';


const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: 'dashboard',
  },
  {
    title: 'Jenis Transaksi',
    href: ''
  },
];

// jenis transaksi columns
const columns: ColumnDef<TransactionType>[] = [
  createColumn({
    value: 'transaction_code',
    title: 'Kode Transaksi',
    sortable: true,
    searchable: true,
    render: ({ row }: any) => {
      return row.original.transaction_code
    }
  }),
  createColumn({
    value: 'transaction_name',
    title: 'Nama Transaksi',
    sortable: true,
    searchable: true,
    render: ({ row }) => {
      return row.original.transaction_name
    }
  }),
  createColumn({
    value: 'status',
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
          [
            h(BadgeCheckIcon),
            'Aktif'
          ]
        );
      } else {
        return h(
          Badge,
          {
            variant: 'destructive',
          },
          [
            h(XCircleIcon),
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
      onClick: (row: TransactionType) => updateTransactionType(row),
      // permissions: ['edit jenis-transaksi'],
    },
    {
      icon: TrashIcon,
      variant: 'destructive',
      onClick: (row: TransactionType) => deleteTransactionType(row),
      // permissions: ['delete jenis-transaksi'],
    },
  ]),
]

// init dataTable
const dataTable = useDataTable({
  endpoint: '/api/v1/transaction-type',
  columns,
  searchable: true,
  searchPlaceholder: '...',
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
const transactionTypeForm = reactive({
  id: '',
  transaction_code: '',
  transaction_name: '',
  is_active: true
})

const transactionTypeToDelete = ref<TransactionType | null>(null)

// reset form
const resetForm = () => {
  Object.assign(transactionTypeForm, {
    id: '',
    transaction_code: '',
    transaction_name: '',
    is_active: true
  })
}

// init form data
const createTransactionType = () => {
  resetForm()
  showCreateDialog.value = true
}

const updateTransactionType = (transactionType: TransactionType) => {
  Object.assign(transactionTypeForm, {
    id: transactionType.id,
    transaction_code: transactionType.transaction_code,
    transaction_name: transactionType.transaction_name,
  })

  showEditDialog.value = true
}

const deleteTransactionType = (transactionType: TransactionType) => {
  transactionTypeToDelete.value = transactionType
  showDeleteDialog.value = true
}

// validation
const isFormValid = computed(() => {
  return transactionTypeForm.transaction_name.trim() !== ''
})

// handle create jenis transaksi
const handleCreateTransactionType = async () => {
  loading.value = true
  try {
    await axios.post('/api/v1/transaction-type', transactionTypeForm)
    await new Promise(resolve => setTimeout(resolve, 1500))

    showCreateDialog.value = false
    resetForm()
    dataTable.actions.refresh()
  } catch (error) {
    console.error('Error creating jenis transaksi:', error)
  } finally {
    loading.value = false
  }
}

// handle update jenis transaksi
const handleUpdateTransactionType = async () => {
  loading.value = true
  try {
    await axios.put(`/api/v1/transaction-type/${transactionTypeForm.id}`, transactionTypeForm)
    await new Promise(resolve => setTimeout(resolve, 1500))

    showEditDialog.value = false
    resetForm()
    dataTable.actions.refresh()
  } catch (error) {
    console.error('Error updating jenis transaksi:', error)
  } finally {
    loading.value = false
  }
}

// handle delete data
const handleDeleteTransactionType = async () => {
  if (!transactionTypeToDelete.value) return

  loading.value = true
  try {
    await axios.delete(`api/v1/transaction-type/${transactionTypeToDelete.value.id}`)
    await new Promise(resolve => setTimeout(resolve, 1500))

    showDeleteDialog.value = false
    transactionTypeToDelete.value = null
    dataTable.actions.refresh()
  } catch (error) {
    console.error('Error deleting jenis transaksi:', error)
  } finally {
    loading.value = false
  }
}

const handleCancelCreate = () => {
  resetForm()
}

const handleCancelEdit = () => {
  resetForm()
}

</script>

<template>

  <Head title="TransactionType" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Jenis Transaksi</h1>
          <p class="text-muted-foreground">
            Pengaturan data jenis transaksi
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <Button @click="createTransactionType">
            <PlusIcon />
            Tambah
          </Button>
        </div>
      </div>

      <!-- DataTable -->
      <DataTable :columns="dataTable.columns" :data="dataTable.data.value" :loading="dataTable.loading.value"
        :actions="dataTable.actions" searchable search-placeholder="Cari jenis transaksi" show-pagination show-page-info
        empty-message="Data jenis transaksi tidak ditemukan" server-side :total-rows="dataTable.state.value.pagination.total"
        :current-page="dataTable.state.value.pagination.page" :total-pages="dataTable.state.value.pagination.totalPages"
        :current-page-size="dataTable.state.value.pagination.perPage" :exportable="true"
        @search="dataTable.actions.search" @page-change="dataTable.actions.goToPage"
        @page-size-change="dataTable.actions.changePageSize"
        @sort-change="(sortBy, sortOrder) => dataTable.actions.sort(sortBy, sortOrder === 'desc')" />
    </div>

    <!-- Create TransactionType Dialog - Using Compound Components Pattern -->
    <FormDialog v-model:open="showCreateDialog" :loading="loading" size="md">
      <FormDialog.Header title="Tambah Jenis Transaksi" description="Menambahkan informasi jenis transaksi baru." />

      <FormDialog.Content spacing="md">
        <div class="space-y-2">
          <Label for="create-kode">Kode Transaksi</Label>
          <Input id="create-kode" v-model="transactionTypeForm.transaction_code" placeholder="Isikan kode transaksi"
            :disabled="loading" />
        </div>

        <div class="space-y-2">
          <Label for="create-name">Nama Transaksi</Label>
          <Input id="create-name" v-model="transactionTypeForm.transaction_name" placeholder="Isikan nama transaksi"
            :disabled="loading" />
        </div>

      </FormDialog.Content>

      <FormDialog.Footer submit-text="Buat Jenis Transaksi" cancel-text="Batal" :loading="loading" :valid="isFormValid"
        @submit="handleCreateTransactionType" />
    </FormDialog>

    <!-- Edit TransactionType Dialog -->
    <FormDialog v-model:open="showEditDialog" title="Update Jenis Transaksi" description="Memperbaharui informasi jenis transaksi."
      :loading="loading" :valid="isFormValid" submit-text="Update Transaction Type" @submit="handleUpdateTransactionType">
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="edit-kode">Kode Transaksi</Label>
          <Input id="edit-kode" v-model="transactionTypeForm.transaction_code" placeholder="Isikan kode transaksi"
            :disabled="loading" />
        </div>

        <div class="space-y-2">
          <Label for="edit-name">Nama Transaksi</Label>
          <Input id="edit-name" v-model="transactionTypeForm.transaction_name" placeholder="Isikan nama transaksi"
            :disabled="loading" />
        </div>

      </div>
    </FormDialog>

    <!-- Delete TransactionType Dialog -->
    <FormDialog v-model:open="showDeleteDialog" title="Hapus TransactionType"
      description="Proses ini tidak dapat dibatalkan. TransactionType akan dihapus secara permanen.." :loading="loading"
      submit-text="Hapus TransactionType" submit-variant="destructive" cancel-text="Batal" size="sm"
      @submit="handleDeleteTransactionType">
      <div class="p-4 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-800">
          Apakah kamu yakin akan menghapus jenis transaksi:
          <strong>{{ transactionTypeToDelete?.transaction_code }}</strong> ({{ transactionTypeToDelete?.transaction_name }})
        </p>
      </div>
    </FormDialog>
  </AppLayout>
</template>
