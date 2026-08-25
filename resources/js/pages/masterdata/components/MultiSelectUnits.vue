<template>
    <div class="space-y-2">
        <Label :for="id">Akses Unit</Label>

        <!-- Selected units display -->
        <div
            v-if="modelValue && modelValue.length > 0"
            class="mb-2 flex flex-wrap gap-1"
        >
            <Badge
                v-for="unitId in modelValue"
                :key="unitId"
                variant="secondary"
                class="flex items-center gap-1 pr-1"
            >
                {{ getUnitName(unitId) }}
                <button
                    type="button"
                    @click.stop="removeUnit(unitId)"
                    class="inline-flex items-center justify-center rounded-full p-0.5 transition-colors hover:bg-red-200"
                >
                    <X class="h-3 w-3" />
                </button>
            </Badge>
        </div>

        <!-- Dropdown Select with action buttons -->
        <div class="flex gap-1">
            <div class="flex-1">
                <Select
                    :model-value="null"
                    @update:model-value="addUnit"
                    :disabled="disabled"
                >
                    <SelectTrigger :id="id" class="w-full">
                        <SelectValue placeholder="Pilih Unit" />
                    </SelectTrigger>
                    <SelectContent>
                        <!-- Search input wrapper dengan stop propagation -->
                        <div 
                            class="p-2"
                            @click.stop
                            @pointerdown.stop
                            @keydown.stop
                        >
                            <Input
                                v-model="searchQuery"
                                placeholder="Cari unit..."
                                class="mb-2"
                            />
                        </div>
                        <SelectGroup>
                            <SelectLabel>Daftar Unit</SelectLabel>
                            <div class="max-h-48 overflow-y-auto">
                                <SelectItem
                                    v-for="unit in filteredUnits"
                                    :key="unit.id"
                                    :value="unit.id"
                                    :disabled="modelValue?.includes(unit.id)"
                                >
                                    <div
                                        class="flex w-full items-center justify-between"
                                    >
                                        <span>{{ unit.unit_name }}</span>
                                        <Check
                                            v-if="modelValue?.includes(unit.id)"
                                            class="ml-2 h-4 w-4 text-green-500"
                                        />
                                    </div>
                                </SelectItem>
                            </div>
                        </SelectGroup>
                        <div
                            v-if="filteredUnits.length === 0"
                            class="p-4 text-center text-sm text-gray-500"
                        >
                            Unit tidak ditemukan
                        </div>
                    </SelectContent>
                </Select>
            </div>

            <!-- Action buttons -->
            <Button
                type="button"
                variant="outline"
                size="icon"
                @click="selectAllUnits"
                :disabled="disabled"
                title="Pilih Semua"
                class="border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50"
            >
                <ListPlus class="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="outline"
                size="icon"
                @click="clearAllUnits"
                :disabled="disabled || !modelValue?.length"
                title="Hapus Semua"
                class="border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50"
            >
                <Trash2 class="h-4 w-4" />
            </Button>
        </div>

        <!-- Helper text -->
        <p class="text-xs text-gray-500">
            Pilih unit yang dapat melihat data ini. Kosongkan untuk semua
            unit.
        </p>
    </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import axios from 'axios';
import { Check, ListPlus, Trash2, X } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';

interface Unit {
    id: number;
    unit_name: string;
    unit_code?: string;
}

const props = defineProps<{
    id?: string;
    modelValue: number[] | null;
    disabled?: boolean;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: number[] | null];
}>();

const units = ref<Unit[]>([]);
const searchQuery = ref('');

// Load units from API
const loadUnits = async () => {
    try {
        const { data } = await axios.get<{ data: Unit[] } | Unit[]>(
            '/api/v1/select/units',
        );
        units.value = Array.isArray(data) ? data : (data.data ?? []);
    } catch (error) {
        console.error('Failed to load units:', error);
        units.value = [];
    }
};

// Filter units based on search
const filteredUnits = computed(() => {
    if (!searchQuery.value) return units.value;
    const keyword = searchQuery.value.toLowerCase();
    return units.value.filter(
        (unit) =>
            unit.unit_name.toLowerCase().includes(keyword) ||
            (unit.unit_code && unit.unit_code.toLowerCase().includes(keyword)),
    );
});

// Get unit name by ID
const getUnitName = (unitId: number): string => {
    const unit = units.value.find((u) => u.id === unitId);
    return unit?.unit_name || `Unit #${unitId}`;
};

// Add unit to selection
const addUnit = (unitId: number | null) => {
    if (!unitId) return;

    const currentValue = props.modelValue || [];
    if (!currentValue.includes(unitId)) {
        emit('update:modelValue', [...currentValue, unitId]);
    }
    searchQuery.value = '';
};

// Remove unit from selection
const removeUnit = (unitId: number) => {
    const currentValue = props.modelValue || [];
    emit(
        'update:modelValue',
        currentValue.filter((id) => id !== unitId),
    );
};

// Select all units
const selectAllUnits = () => {
    emit(
        'update:modelValue',
        units.value.map((u) => u.id),
    );
};

// Clear all units
const clearAllUnits = () => {
    emit('update:modelValue', null);
};

// Initialize
onMounted(() => {
    loadUnits();
});
</script>