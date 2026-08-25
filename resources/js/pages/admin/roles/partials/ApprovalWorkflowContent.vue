<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createActionColumn, createColumn } from '@/composables/useDataTable';
import type { ColumnDef } from '@tanstack/vue-table';
import axios from 'axios';
import { EditIcon, PlusIcon, XIcon } from 'lucide-vue-next';
import { h, onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';

interface ApprovalLevel {
    id?: string;
    approval_level: number;
    role_id: number | null;
    role_name?: string;
}

interface ModuleWithLevels {
    module_name: string;
    module_label: string;
    levels: ApprovalLevel[];
}

interface Role {
    id: number;
    name: string;
}

const moduleOptions = [
    { value: 'perencanaan_anggaran', label: 'Perencanaan Anggaran' },
    { value: 'pengajuan_pencairan', label: 'Pengajuan Pencairan' },
    { value: 'realisasi_pencairan', label: 'Realisasi Pencairan' },
];

// Roles data
const roleOptions = ref<Role[]>([]);
const isLoadingRole = ref(false);

// State data
const selectedModule = ref('');
const moduleLevels = ref<ApprovalLevel[]>([]);

// Data untuk ditampilkan di tabel
const modulesData = ref<ModuleWithLevels[]>([]);
const loadingModules = ref(false);

// Load roles from API
const loadRoleOptions = async () => {
    isLoadingRole.value = true;
    try {
        const response = await axios.get('/api/v1/roles');
        roleOptions.value = response.data.data || [];
    } catch (error) {
        console.error('Error load roles:', error);
        toast.error('Gagal memuat semua role');
    } finally {
        isLoadingRole.value = false;
    }
};

// Load all module level
const loadAllModuleLevels = async () => {
    loadingModules.value = true;

    try {
        modulesData.value = moduleOptions.map((module) => ({
            module_name: module.value,
            module_label: module.label,
            levels: [],
        }));

        const response = await axios.get('/api/v1/approval-workflows/');
        const existingLevels = response.data.data || [];

        modulesData.value.forEach((module) => {
            const moduleLevels = existingLevels.filter(
                (level: any) => level.module_name === module.module_name,
            );
            module.levels = moduleLevels
                .map((level: any) => ({
                    id: level.id,
                    approval_level: level.approval_level,
                    role_id: level.role.id,
                    role_name: level.role.name,
                }))
                .sort((a: any, b: any) => a.approval_level - b.approval_level);
        });
    } catch (error: any) {
        console.error('Error load modules levels:', error);
        toast.error('Gagal memuat data level persetujuan. Silakan coba lagi.', {
            id: 'load-levels',
        });
    } finally {
        loadingModules.value = false;
    }
};

const columns: ColumnDef<ModuleWithLevels>[] = [
    createColumn({
        value: 'module_label',
        title: 'Modul',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h('span', { class: 'font-medium' }, row.original.module_label),
            ]);
        },
    }),
    createColumn({
        value: 'levels',
        title: 'Level Persetujuan',
        sortable: false,
        render: ({ row }: any) => {
            const levels = row.original.levels || [];
            if (levels.length === 0) {
                return h(
                    'div',
                    { class: 'text-muted-foreground text-sm' },
                    'Belum diatur',
                );
            }
            return h('div', { class: 'flex flex-col gap-2' }, [
                levels.map((level: any) =>
                    h('div', { class: 'flex items-center gap-2 flex-wrap' }, [
                        h(
                            'span',
                            {
                                class: 'inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary',
                            },
                            `Level ${level.approval_level}`,
                        ),
                        h(
                            'span',
                            { class: 'text-sm text-muted-foreground' },
                            '→',
                        ),
                        h(
                            'span',
                            { class: 'text-sm font-medium' },
                            level.role_name || `Role ID: ${level.role_id}`,
                        ),
                    ]),
                ),
            ]);
        },
    }),
    createActionColumn([
        {
            icon: EditIcon,
            variant: 'default',
            onClick: (row: ModuleWithLevels) => editModuleLevels(row),
        },
    ]),
];

// Edit module levels
const editModuleLevels = async (module: ModuleWithLevels) => {
    selectedModule.value = module.module_name;

    try {
        moduleLevels.value = module.levels.map((level) => ({
            id: level.id,
            approval_level: level.approval_level,
            role_id: level.role_id,
            role_name: level.role_name,
        }));

        moduleLevels.value.sort((a, b) => a.approval_level - b.approval_level);

        if (moduleLevels.value.length === 0) {
            moduleLevels.value.push({
                approval_level: 1,
                role_id: null,
            });
        }

        showLevelsDialog.value = true;
    } catch (error) {
        console.error('Error preparing module levels:', error);
        toast.error('Gagal memuat level persetujuan');
    }
};

// Add new approval level
const addApprovalLevel = () => {
    const nextLevel = moduleLevels.value.length + 1;
    moduleLevels.value.push({
        approval_level: nextLevel,
        role_id: null,
    });
};

// Remove approval level
const removeApprovalLevel = (index: number) => {
    if (moduleLevels.value.length === 1) {
        toast.error('Minimal harus ada 1 level persetujuan');
        return;
    }

    moduleLevels.value.splice(index, 1);
    moduleLevels.value.forEach((level, idx) => {
        level.approval_level = idx + 1;
    });
};

// Update role for a specific level
const updateRoleForLevel = (index: number, roleId: number) => {
    const selectedRole = roleOptions.value.find((r) => r.id === roleId);
    moduleLevels.value[index].role_id = roleId;
    toast.success(
        `Role untuk Level ${moduleLevels.value[index].approval_level} telah diubah menjadi ${selectedRole?.name || 'Role'}`,
    );
};

// Save all levels for the module
const saveApprovalWorkflow = async () => {
    const invalidLevels = moduleLevels.value.filter((level) => !level.role_id);
    if (invalidLevels.length > 0) {
        toast.error(
            `Level ${invalidLevels.map((l) => l.approval_level).join(', ')} belum memiliki role`,
        );
        return;
    }

    loadingModules.value = true;
    toast.loading('Menyimpan konfigurasi level persetujuan...', {
        id: 'save-levels',
    });

    try {
        const payload = moduleLevels.value.map((level) => ({
            module_name: selectedModule.value,
            approval_level: level.approval_level,
            role_id: level.role_id,
        }));

        await axios.post('/api/v1/approval-workflows', {
            workflows: payload,
        });

        showLevelsDialog.value = false;
        await loadAllModuleLevels();
        toast.success(
            `Konfigurasi level persetujuan untuk ${getModuleLabel(selectedModule.value)} berhasil disimpan`,
            {
                id: 'save-levels',
                duration: 3000,
            },
        );
    } catch (error: any) {
        console.error('Error saving module levels:', error);

        if (error.response?.status === 422) {
            const errors = error.response.data.errors;
            if (errors) {
                Object.values(errors).forEach((err: any) => {
                    toast.error(Array.isArray(err) ? err[0] : err);
                });
            } else {
                toast.error(
                    error.response?.data?.message || 'Data tidak valid',
                );
            }
        } else if (error.response?.data?.message) {
            toast.error(error.response.data.message, { id: 'save-levels' });
        } else {
            toast.error(
                'Gagal menyimpan level persetujuan. Silakan coba lagi.',
                { id: 'save-levels' },
            );
        }
    } finally {
        loadingModules.value = false;
    }
};

// Helper functions
const getModuleLabel = (moduleValue: string) => {
    return (
        moduleOptions.find((m) => m.value === moduleValue)?.label || moduleValue
    );
};

const refreshData = async () => {
    await loadAllModuleLevels();
};

const searchModules = (term: string) => {
    if (!term || term.trim() === '') {
        loadAllModuleLevels();
        return;
    }

    const searchTerm = term.toLowerCase();
    const filteredModules = moduleOptions.filter(
        (module) =>
            module.label.toLowerCase().includes(searchTerm) ||
            module.value.toLowerCase().includes(searchTerm),
    );

    modulesData.value = filteredModules.map((module) => {
        const originalModule = modulesData.value.find(
            (m) => m.module_name === module.value,
        );
        return {
            module_name: module.value,
            module_label: module.label,
            levels: originalModule?.levels || [],
        };
    });

    toast.info(
        `Menampilkan ${filteredModules.length} dari ${moduleOptions.length} modul`,
        { duration: 2000 },
    );
};

// Load data on mount
onMounted(() => {
    loadRoleOptions();
    loadAllModuleLevels();
});

defineExpose({
    refreshData,
    searchModules,
});

const showLevelsDialog = ref(false);
</script>

<template>
    <!-- <div class="flex h-full flex-1 flex-col gap-4 overflow-x-auto">
        <DataTable
            :columns="columns"
            :data="modulesData"
            :loading="loadingModules"
            :actions="{
                refresh: refreshData,
                search: searchModules,
            }"
            searchable
            search-placeholder="Cari modul..."
            show-pagination
            show-page-info
            empty-message="Tidak ada data modul yang ditemukan"
            :server-side="false"
            :exportable="true"
        />
    </div> -->

    <div class="flex h-full flex-1 flex-col gap-4 overflow-x-auto">
        <DataTable
            :columns="columns"
            :data="modulesData"
            :loading="loadingModules"
            searchable
            search-placeholder="Cari modul..."
            show-pagination
            show-page-info
            empty-message="Tidak ada data modul yang ditemukan"
            :server-side="false"
            :exportable="true"
        />
    </div>

    <FormDialog
        v-model:open="showLevelsDialog"
        :loading="loadingModules"
        size="lg"
    >
        <FormDialog.Header
            :title="`Update Alur Persetujuan - ${getModuleLabel(selectedModule)}`"
            description=""
        />

        <FormDialog.Content spacing="md">
            <div class="space-y-4">
                <div class="flex justify-end">
                    <Button
                        type="button"
                        size="sm"
                        @click="addApprovalLevel"
                        :disabled="loadingModules"
                        variant="outline"
                    >
                        <PlusIcon class="mr-2 h-4 w-4" />
                        Tambah Level
                    </Button>
                </div>

                <div class="space-y-3">
                    <div
                        v-for="(level, index) in moduleLevels"
                        :key="index"
                        class="flex items-center gap-3 rounded-lg border bg-white p-4"
                    >
                        <div class="w-28 flex-shrink-0">
                            <span class="font-semibold text-primary">
                                Level {{ level.approval_level }}
                            </span>
                        </div>

                        <div class="min-w-0 flex-1">
                            <Select
                                :model-value="level.role_id"
                                @update:model-value="
                                    (val) => updateRoleForLevel(index, val)
                                "
                                :disabled="loadingModules || isLoadingRole"
                            >
                                <SelectTrigger class="w-full">
                                    <SelectValue
                                        :placeholder="
                                            isLoadingRole
                                                ? 'Memuat role...'
                                                : 'Pilih role yang bertanggung jawab'
                                        "
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="role in roleOptions"
                                        :key="role.id"
                                        :value="role.id"
                                    >
                                        {{ role.name }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div class="flex-shrink-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                @click="removeApprovalLevel(index)"
                                :disabled="
                                    loadingModules || moduleLevels.length === 1
                                "
                                class="h-8 w-8 hover:bg-red-50"
                            >
                                <XIcon class="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div
                    v-if="moduleLevels.length === 0"
                    class="rounded-lg border py-8 text-center text-muted-foreground"
                >
                    Belum ada level persetujuan. Klik "Tambah Level" untuk
                    menambahkan.
                </div>

                <div
                    class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3"
                >
                    <p class="text-sm text-blue-800">
                        <strong>Informasi:</strong> Level persetujuan akan
                        diproses secara berurutan dari Level 1 (terendah) hingga
                        level tertinggi. Setiap level harus memiliki role yang
                        berbeda sesuai dengan hierarki persetujuan.
                    </p>
                </div>
            </div>
        </FormDialog.Content>

        <FormDialog.Footer
            submit-text="Simpan Alur Persetujuan"
            cancel-text="Batal"
            :loading="loadingModules"
            :valid="
                moduleLevels.length > 0 &&
                moduleLevels.every((l) => l.role_id !== null)
            "
            @submit="saveApprovalWorkflow"
        />
    </FormDialog>
</template>