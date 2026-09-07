<template>
    <div class="border-t-2 border-blue-200 p-4 dark:border-blue-800">
        <!-- Panel Header -->
        <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <Calculator class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h5 class="font-semibold text-foreground">
                    Pengali Volume: {{ itemDescription }}
                </h5>
            </div>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                @click="$emit('close')"
                class="text-muted-foreground hover:text-foreground"
            >
                <ChevronUp class="h-4 w-4" />
            </Button>
        </div>

        <!-- Formula Preview -->
        <div
            class="mb-3 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950/20 dark:text-blue-300"
        >
            {{ formulaPreview }}
        </div>

        <!-- Daftar Pengali -->
        <div class="space-y-2">
            <div
                v-for="(m, index) in localMultipliers"
                :key="index"
                class="flex items-start gap-2"
            >
                <div class="w-40">
                    <Label class="mb-1 block text-xs text-muted-foreground"
                        >Nilai</Label
                    >
                    <Input
                        v-model="m.value"
                        type="number"
                        min="0"
                        step="any"
                        :disabled="isReadOnly"
                        @input="emitChange"
                    />
                </div>
                <div class="flex-1">
                    <Label class="mb-1 block text-xs text-muted-foreground"
                        >Satuan / Label</Label
                    >
                    <Input
                        v-model="m.label"
                        placeholder="mis. Hari, Mahasiswa"
                        :disabled="isReadOnly"
                        @input="emitChange"
                    />
                </div>
                <Button
                    v-if="!isReadOnly && localMultipliers.length > 1"
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click="removeMultiplier(index)"
                    class="mt-5 h-9 w-9 p-0 text-destructive hover:bg-destructive/10"
                >
                    <X class="h-4 w-4" />
                </Button>
            </div>

            <Button
                v-if="!isReadOnly"
                type="button"
                variant="outline"
                size="sm"
                @click="addMultiplier"
                class="gap-1"
            >
                <Plus class="h-3 w-3" /> Tambah Pengali
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BudgetRequestItemMultiplier } from '@/types/budget';
import { Calculator, ChevronUp, Plus, X } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';

interface Props {
    itemDescription: string;
    multipliers: BudgetRequestItemMultiplier[];
    isReadOnly: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'update:multipliers', multipliers: BudgetRequestItemMultiplier[]): void;
}>();

const localMultipliers = ref<BudgetRequestItemMultiplier[]>([]);

watch(
    () => props.multipliers,
    (val) => {
        localMultipliers.value = (val || []).map((m) => ({ ...m }));
    },
    { immediate: true },
);

const emitChange = () => {
    emit(
        'update:multipliers',
        localMultipliers.value.map((m) => ({ ...m })),
    );
};

const addMultiplier = () => {
    localMultipliers.value.push({
        sequence: localMultipliers.value.length + 1,
        label: 'Satuan',
        value: 1,
    });
    emitChange();
};

const removeMultiplier = (index: number) => {
    localMultipliers.value.splice(index, 1);
    emitChange();
};

const formulaPreview = computed(() => {
    const parts = localMultipliers.value
        .filter((m) => (Number(m.value) || 0) > 0)
        .map(
            (m) =>
                `${Number(m.value).toLocaleString('id-ID')}${m.label ? ' ' + m.label : ''}`,
        );
    return parts.length ? `= ${parts.join(' × ')}` : 'Belum ada pengali';
});
</script>
