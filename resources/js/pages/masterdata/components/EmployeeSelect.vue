<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Employee } from '@/types/datamaster';

// =============================================================================
// PROPS & EMITS
// =============================================================================

const props = withDefaults(
    defineProps<{
        modelValue: number | null;
        placeholder?: string;
        disabled?: boolean;
        error?: boolean;
        id?: string;
        searchable?: boolean;
    }>(),
    {
        placeholder: 'Pilih Pegawai',
        disabled: false,
        error: false,
        searchable: false,
    },
);

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void;
}>();

// =============================================================================
// STATE
// =============================================================================

const employees = ref<Employee[]>([]);
const isLoading = ref(false);
const hasError = ref(false);
const searchQuery = ref('');

// =============================================================================
// COMPUTED
// =============================================================================

const selectedEmployee = computed<Employee | undefined>(() =>
    employees.value.find((employee) => employee.id === props.modelValue),
);

const filteredEmployees = computed<Employee[]>(() => {
    if (!searchQuery.value) return employees.value;

    const query = searchQuery.value.toLowerCase();
    return employees.value.filter(
        (employee) =>
            employee.nik?.toLowerCase().includes(query) ||
            employee.employee_name?.toLowerCase().includes(query),
    );
});

const placeholderText = computed<string>(() => {
    if (isLoading.value) return 'Memuat...';
    if (hasError.value) return 'Gagal memuat data';
    if (!employees.value.length) return 'Tidak ada pegawai tersedia';
    return props.placeholder;
});

const isDisabled = computed<boolean>(
    () => props.disabled || isLoading.value || hasError.value,
);

// =============================================================================
// METHODS
// =============================================================================

const fetchEmployees = async (): Promise<void> => {
    if (isLoading.value) return;

    isLoading.value = true;
    hasError.value = false;

    try {
        const { data } = await axios.get<{ data: Employee[] } | Employee[]>(
            '/api/v1/select/employees',
        );
        employees.value = Array.isArray(data) ? data : (data.data ?? []);
    } catch (error) {
        console.error('Failed to load employees:', error);
        employees.value = [];
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

const handleValueChange = (value: string): void => {
    emit('update:modelValue', value ? Number(value) : null);
};

const debouncedSearch = useDebounceFn((value: string) => {
    searchQuery.value = value;
}, 300);

// Add this method to prevent event propagation
const handleSearchInput = (event: Event): void => {
    event.stopPropagation();
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    debouncedSearch(target.value);
};

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(() => fetchEmployees());

defineExpose({
    refresh: fetchEmployees,
    reset: () => emit('update:modelValue', null),
});
</script>

<template>
    <Select
        :model-value="modelValue?.toString() ?? ''"
        :disabled="isDisabled"
        @update:model-value="handleValueChange"
    >
        <SelectTrigger
            :id="id"
            :class="{ 'border-red-500': error || hasError }"
            class="w-full"
        >
            <SelectValue :placeholder="placeholderText">
                <template v-if="selectedEmployee">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium">
                            {{ selectedEmployee.employee_name }}
                        </span>
                        <span class="text-xs text-muted-foreground">
                            ({{ selectedEmployee.nik }})
                        </span>
                    </div>
                </template>
            </SelectValue>
        </SelectTrigger>

        <SelectContent>
            <!-- Search input for searchable mode -->
            <div
                v-if="searchable"
                class="border-b px-2 py-2"
                @keydown.stop
                @keyup.stop
                @keypress.stop
                @input.stop
                @change.stop
                @focus.stop
                @blur.stop
                @click.stop
            >
                <input
                    type="text"
                    placeholder="Cari karyawan..."
                    class="w-full rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    @input="handleSearchInput"
                    @keydown.stop
                    @keyup.stop
                    @keypress.stop
                    @click.stop
                />
            </div>

            <!-- Empty state untuk Employee -->
            <div
                v-if="!filteredEmployees.length && !isLoading"
                class="px-2 py-8 text-center text-sm text-muted-foreground"
            >
                <div>
                    {{
                        searchQuery
                            ? `Tidak ada karyawan "${searchQuery}"`
                            : employees.length
                              ? 'Tidak ada karyawan yang sesuai'
                              : 'Tidak ada data karyawan'
                    }}
                </div>
            </div>

            <!-- Employee options -->
            <SelectItem
                v-for="employee in filteredEmployees"
                :key="employee.id"
                :value="employee.id.toString()"
            >
                <div class="flex w-full items-center justify-between">
                    <span class="text-sm">
                        {{ employee.employee_name }}
                    </span>
                    <span class="ml-2 text-xs text-muted-foreground">
                        {{ employee.nik }}
                    </span>
                </div>
            </SelectItem>
        </SelectContent>
    </Select>
</template>