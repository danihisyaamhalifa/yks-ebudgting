<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Unit } from '@/types/datamaster'

const props = defineProps<{
    modelValue: number | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void
}>()

const options = ref<Unit[]>([])
const loading = ref(false)

const selectedUnit = computed(() => {
    return options.value.find(unit => unit.id === props.modelValue)
})

const loadUnits = async () => {
    loading.value = true;
    try {
        const { data } = await axios.get('/api/v1/select/units');
        options.value = data.data;
    } catch (error) {
        console.error('Failed to load units:', error);
        options.value = [];
    } finally {
        loading.value = false;
    }
};

// Format untuk SelectItem: menampilkan code & name
const formatUnitDisplay = (unit: Unit): string => {
    return `${unit.unit_code} - ${unit.unit_name}`;
};

onMounted(loadUnits)
</script>

<template>
    <Select :model-value="modelValue?.toString() ?? ''" :disabled="loading"
        @update:model-value="value => emit('update:modelValue', value ? Number(value) : null)">
        <SelectTrigger class="w-full">
            <SelectValue :placeholder="loading ? 'Memuat...' : 'Pilih Unit'">
                <!-- Hanya render jika ada selected unit -->
                <template v-if="selectedUnit">
                    {{ selectedUnit.unit_name }}
                </template>
            </SelectValue>
        </SelectTrigger>

        <SelectContent>
            <SelectItem v-for="item in options" :key="item.id" :value="item.id.toString()">
                <div class="flex gap-2">
                    <span class="font-medium text-gray-700">{{ item.unit_code }}</span>
                    <span class="text-gray-500">{{ item.unit_name }}</span>
                </div>
            </SelectItem>
        </SelectContent>
    </Select>
</template>