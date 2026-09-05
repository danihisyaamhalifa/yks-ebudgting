<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
    EditIcon,
    PlusIcon,
    TrashIcon,
    XIcon,
} from 'lucide-vue-next';
import { computed, h, onMounted, reactive, ref } from 'vue';
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

interface HeaderOption {
    id: number;
    name: string;
    description?: string | null;
}

interface WorkflowModule {
    id: string;
    module_name: string;
    steps: Array<{
        id: string;
        approval_level: number;
        role_id: number;
        role?: { id: number; name: string } | null;
    }>;
}

const moduleOptions = [
    { value: 'perencanaan_anggaran', label: 'Perencanaan Anggaran' },
    { value: 'pengajuan_pencairan', label: 'Pengajuan Pencairan' },
    { value: 'realisasi_pencairan', label: 'Realisasi Pencairan' },
    { value: 'pertanggungjawaban_anggaran', label: 'Pertanggungjawaban Anggaran' },
];

// Roles data
const roleOptions = ref<Role[]>([]);
const isLoadingRole = ref(false);

// Header selection + management
const headerOptions = ref<HeaderOption[]>([]);
const isLoadingHeader = ref(false);
const selectedHeader = ref<number | null>(null);

// Header create/edit state
const headerForm = reactive({ id: null as number | null, name: '', description: '' });
const showCreateHeaderDialog = ref(false);
const showEditHeaderDialog = ref(false);
const showDeleteHeaderDialog = ref(false);
const headerSaving = ref(false);

// Module workflow (per selected header)
const selectedModule = ref('');
const moduleLevels = ref<ApprovalLevel[]>([]);
const workflowModules = ref<WorkflowModule[]>([]);
const loadingModules = ref(false);
const showLevelsDialog = ref(false);

const selectedHeaderLabel = computed(() => {
    const h = headerOptions.value.find((it) => it.id === selectedHeader.value);
    return h ? h.name : '';
});

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

// Load approval workflow headers
const loadHeaders = async (keepSelection = false) => {
    isLoadingHeader.value = true;
    try {
        const response = await axios.get('/api/v1/approval-workflow-headers');
        headerOptions.value = (response.data?.data || []).map((h: any) => ({
            id: h.id,
            name: h.name,
            description: h.description,
        }));

        if (!keepSelection && headerOptions.value.length > 0) {
            selectedHeader.value = headerOptions.value[0].id;
            await loadHeaderWorkflows();
        } else if (selectedHeader.value) {
            const stillExists = headerOptions.value.some(
                (h) => h.id === selectedHeader.value,
            );
            if (!stillExists) {
                selectedHeader.value =
                    headerOptions.value.length > 0
                        ? headerOptions.value[0].id
                        : null;
            }
            await loadHeaderWorkflows();
        }
    } catch (error) {
        console.error('Error load headers:', error);
        toast.error('Gagal memuat daftar approval workflow');
    } finally {
        isLoadingHeader.value = false;
    }
};

const onHeaderChange = () => {
    loadHeaderWorkflows();
};

// Load module workflows for the selected header
const loadHeaderWorkflows = async () => {
    if (!selectedHeader.value) {
        workflowModules.value = [];
        return;
    }

    loadingModules.value = true;
    try {
        const response = await axios.get('/api/v1/approval-workflows/', {
            params: { header_id: selectedHeader.value },
        });
        workflowModules.value = response.data?.data?.workflows || [];
    } catch (error: any) {
        console.error('Error load workflows:', error);
        toast.error('Gagal memuat data alur persetujuan. Silakan coba lagi.', {
            id: 'load-levels',
        });
    } finally {
        loadingModules.value = false;
    }
};

const getLevelsFor = (moduleValue: string): ApprovalLevel[] => {
    const wf = workflowModules.value.find((w) => w.module_name === moduleValue);
    return (wf?.steps || [])
        .map((s) => ({
            id: s.id,
            approval_level: s.approval_level,
            role_id: s.role_id,
            role_name: s.role?.name,
        }))
        .sort((a, b) => a.approval_level - b.approval_level);
};

const modulesData = computed<ModuleWithLevels[]>(() =>
    moduleOptions.map((module) => ({
        module_name: module.value,
        module_label: module.label,
        levels: getLevelsFor(module.value),
    })),
);

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

// --- Header CRUD helpers ------------------------------------------------
const resetHeaderForm = () => {
    headerForm.id = null;
    headerForm.name = '';
    headerForm.description = '';
};

const openCreateHeader = () => {
    resetHeaderForm();
    showCreateHeaderDialog.value = true;
};

const openEditHeader = () => {
    if (!selectedHeader.value) return;
    const h = headerOptions.value.find((it) => it.id === selectedHeader.value);
    if (!h) return;
    headerForm.id = h.id;
    headerForm.name = h.name;
    headerForm.description = h.description || '';
    showEditHeaderDialog.value = true;
};

const submitCreateHeader = async () => {
    if (!headerForm.name || !headerForm.name.trim()) {
        toast.error('Nama approval workflow wajib diisi');
        return;
    }

    headerSaving.value = true;
    try {
        const response = await axios.post('/api/v1/approval-workflow-headers', {
            name: headerForm.name.trim(),
            description: headerForm.description.trim() || null,
        });
        const created = response.data?.data;
        showCreateHeaderDialog.value = false;
        await loadHeaders();
        if (created?.id) {
            selectedHeader.value = created.id;
            await loadHeaderWorkflows();
        }
        toast.success('Approval workflow berhasil ditambahkan');
    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Gagal menambahkan approval workflow');
    } finally {
        headerSaving.value = false;
    }
};

const submitEditHeader = async () => {
    if (!headerForm.id) return;
    if (!headerForm.name || !headerForm.name.trim()) {
        toast.error('Nama approval workflow wajib diisi');
        return;
    }

    headerSaving.value = true;
    try {
        await axios.put(
            `/api/v1/approval-workflow-headers/${headerForm.id}`,
            {
                name: headerForm.name.trim(),
                description: headerForm.description.trim() || null,
            },
        );
        showEditHeaderDialog.value = false;
        await loadHeaders(true);
        toast.success('Approval workflow berhasil diperbarui');
    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Gagal memperbarui approval workflow');
    } finally {
        headerSaving.value = false;
    }
};

const confirmDeleteHeader = () => {
    if (!selectedHeader.value) return;
    showDeleteHeaderDialog.value = true;
};

const submitDeleteHeader = async () => {
    if (!selectedHeader.value) return;

    headerSaving.value = true;
    try {
        await axios.delete(
            `/api/v1/approval-workflow-headers/${selectedHeader.value}`,
        );
        showDeleteHeaderDialog.value = false;
        selectedHeader.value = null;
        await loadHeaders();
        toast.success('Approval workflow berhasil dihapus');
    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Gagal menghapus approval workflow');
    } finally {
        headerSaving.value = false;
    }
};

// --- Module level config ------------------------------------------------
const editModuleLevels = (module: ModuleWithLevels) => {
    if (!selectedHeader.value) return;
    selectedModule.value = module.module_name;

    moduleLevels.value = module.levels.map((level) => ({
        id: level.id,
        approval_level: level.approval_level,
        role_id: level.role_id,
        role_name: level.role_name,
    }));

    moduleLevels.value.sort((a, b) => a.approval_level - b.approval_level);

    if (moduleLevels.value.length === 0) {
        moduleLevels.value.push({ approval_level: 1, role_id: null });
    }

    showLevelsDialog.value = true;
};

const addApprovalLevel = () => {
    const nextLevel = moduleLevels.value.length + 1;
    moduleLevels.value.push({ approval_level: nextLevel, role_id: null });
};

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

const updateRoleForLevel = (index: number, roleId: number) => {
    const selectedRole = roleOptions.value.find((r) => r.id === roleId);
    moduleLevels.value[index].role_id = roleId;
    toast.success(
        `Role untuk Level ${moduleLevels.value[index].approval_level} telah diubah menjadi ${selectedRole?.name || 'Role'}`,
    );
};

const saveModuleWorkflow = async () => {
    if (!selectedHeader.value) return;

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
        await axios.post('/api/v1/approval-workflows', {
            header_id: selectedHeader.value,
            workflows: [
                {
                    module_name: selectedModule.value,
                    steps: moduleLevels.value.map((level) => ({
                        approval_level: level.approval_level,
                        role_id: level.role_id,
                    })),
                },
            ],
        });

        showLevelsDialog.value = false;
        await loadHeaderWorkflows();
        toast.success(
            `Konfigurasi ${getModuleLabel(selectedModule.value)} untuk "${selectedHeaderLabel.value}" berhasil disimpan`,
            { id: 'save-levels', duration: 3000 },
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
                toast.error(error.response?.data?.message || 'Data tidak valid');
            }
        } else if (error.response?.data?.message) {
            toast.error(error.response.data.message, { id: 'save-levels' });
        } else {
            toast.error('Gagal menyimpan level persetujuan. Silakan coba lagi.', {
                id: 'save-levels',
            });
        }
    } finally {
        loadingModules.value = false;
    }
};

const getModuleLabel = (moduleValue: string) => {
    return (
        moduleOptions.find((m) => m.value === moduleValue)?.label || moduleValue
    );
};

const refreshData = async () => {
    await loadHeaders();
};

const searchModules = () => {
    // search handled client-side by DataTable
};

// Load data on mount
onMounted(() => {
    loadRoleOptions();
    loadHeaders();
});

defineExpose({ refreshData, searchModules });
</script>

<template>
    <div class="flex h-full flex-1 flex-col gap-4 overflow-x-auto">
        <!-- Header Selector + Actions -->
        <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-3">
                <label class="text-sm font-medium">Alur Persetujuan</label>
                <Select
                    :model-value="selectedHeader"
                    @update:model-value="(val) => { selectedHeader = val; onHeaderChange(); }"
                    :disabled="isLoadingHeader"
                >
                    <SelectTrigger class="w-72">
                        <SelectValue
                            :placeholder="isLoadingHeader ? 'Memuat...' : 'Pilih approval workflow'"
                        />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="h in headerOptions"
                            :key="h.id"
                            :value="h.id"
                        >
                            {{ h.name }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="flex items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="default"
                    @click="openCreateHeader"
                >
                    <PlusIcon class="mr-1.5 h-4 w-4" />
                    Tambah
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    @click="openEditHeader"
                    :disabled="!selectedHeader"
                >
                    <EditIcon class="mr-1.5 h-4 w-4" />
                    Edit
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    @click="confirmDeleteHeader"
                    :disabled="!selectedHeader"
                >
                    <TrashIcon class="mr-1.5 h-4 w-4" />
                    Hapus
                </Button>
            </div>
        </div>

        <DataTable
            :columns="columns"
            :data="modulesData"
            :loading="loadingModules || !selectedHeader"
            searchable
            search-placeholder="Cari modul..."
            show-pagination
            show-page-info
            empty-message="Tidak ada data modul yang ditemukan"
            :server-side="false"
            :exportable="true"
        />
    </div>

    <!-- Create Header -->
    <FormDialog
        v-model:open="showCreateHeaderDialog"
        :loading="headerSaving"
        size="md"
    >
        <FormDialog.Header
            title="Tambah Alur Persetujuan"
            description="Buat approval workflow baru yang nantinya dapat dipilih oleh unit."
        />
        <FormDialog.Content spacing="md">
            <div class="space-y-4">
                <div class="space-y-2">
                    <Label for="hdr-create-name">Nama</Label>
                    <Input
                        id="hdr-create-name"
                        v-model="headerForm.name"
                        placeholder="cth: Alur Prodi, Alur Biro Keuangan"
                        :disabled="headerSaving"
                    />
                </div>
                <div class="space-y-2">
                    <Label for="hdr-create-desc">Deskripsi</Label>
                    <Textarea
                        id="hdr-create-desc"
                        v-model="headerForm.description"
                        placeholder="Deskripsi singkat (opsional)"
                        :disabled="headerSaving"
                    />
                </div>
            </div>
        </FormDialog.Content>
        <FormDialog.Footer
            submit-text="Simpan"
            cancel-text="Batal"
            :loading="headerSaving"
            :valid="headerForm.name.trim().length > 0"
            @submit="submitCreateHeader"
        />
    </FormDialog>

    <!-- Edit Header -->
    <FormDialog
        v-model:open="showEditHeaderDialog"
        :loading="headerSaving"
        size="md"
    >
        <FormDialog.Header
            title="Edit Alur Persetujuan"
            description="Perbarui nama / deskripsi approval workflow."
        />
        <FormDialog.Content spacing="md">
            <div class="space-y-4">
                <div class="space-y-2">
                    <Label for="hdr-edit-name">Nama</Label>
                    <Input
                        id="hdr-edit-name"
                        v-model="headerForm.name"
                        :disabled="headerSaving"
                    />
                </div>
                <div class="space-y-2">
                    <Label for="hdr-edit-desc">Deskripsi</Label>
                    <Textarea
                        id="hdr-edit-desc"
                        v-model="headerForm.description"
                        :disabled="headerSaving"
                    />
                </div>
            </div>
        </FormDialog.Content>
        <FormDialog.Footer
            submit-text="Perbarui"
            cancel-text="Batal"
            :loading="headerSaving"
            :valid="headerForm.name.trim().length > 0"
            @submit="submitEditHeader"
        />
    </FormDialog>

    <!-- Delete Header -->
    <FormDialog
        v-model:open="showDeleteHeaderDialog"
        :loading="headerSaving"
        size="sm"
    >
        <FormDialog.Header
            title="Hapus Alur Persetujuan"
            :description="`Hapus approval workflow ${selectedHeaderLabel || ''}? Aksi tidak dapat dibatalkan.`"
        />
        <FormDialog.Footer
            submit-text="Hapus"
            cancel-text="Batal"
            submit-variant="destructive"
            :loading="headerSaving"
            @submit="submitDeleteHeader"
        />
    </FormDialog>

    <!-- Module Levels -->
    <FormDialog
        v-model:open="showLevelsDialog"
        :loading="loadingModules"
        size="lg"
    >
        <FormDialog.Header
            :title="`Update Alur Persetujuan - ${getModuleLabel(selectedModule)}`"
            :description="`Alur Persetujuan: ${selectedHeaderLabel}`"
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
                                @update:model-value="(val) => updateRoleForLevel(index, val)"
                                :disabled="loadingModules || isLoadingRole"
                            >
                                <SelectTrigger class="w-full">
                                    <SelectValue
                                        :placeholder="isLoadingRole ? 'Memuat role...' : 'Pilih role yang bertanggung jawab'"
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
                                :disabled="loadingModules || moduleLevels.length === 1"
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

                <div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p class="text-sm text-blue-800">
                        <strong>Informasi:</strong> Level persetujuan diproses
                        berurutan dari Level 1 hingga level tertinggi. Setiap
                        level harus memiliki role berbeda sesuai hierarki.
                        Konfigurasi berlaku pada approval workflow
                        <strong>{{ selectedHeaderLabel }}</strong> yang dipakai
                        oleh unit yang memilihnya.
                    </p>
                </div>
            </div>
        </FormDialog.Content>

        <FormDialog.Footer
            submit-text="Simpan Alur Persetujuan"
            cancel-text="Batal"
            :loading="loadingModules"
            :valid="moduleLevels.length > 0 && moduleLevels.every((l) => l.role_id !== null)"
            @submit="saveModuleWorkflow"
        />
    </FormDialog>
</template>
