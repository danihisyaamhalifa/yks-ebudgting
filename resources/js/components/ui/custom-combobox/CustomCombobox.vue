<template>
    <div class="relative w-full">
        <!-- Trigger Button -->
        <Button
            ref="triggerRef"
            variant="outline"
            class="w-full justify-between"
            :disabled="disabled"
            @click="toggleDropdown"
        >
            <span class="truncate">
                {{ displayValue || placeholder }}
            </span>
            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        <!-- Dropdown -->
        <div
            v-if="isOpen"
            ref="dropdownRef"
            class="absolute z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none"
            :style="dropdownStyle"
        >
            <!-- Search Input -->
            <div class="relative border-b p-2">
                <Search class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    ref="searchInputRef"
                    v-model="searchQuery"
                    class="w-full bg-transparent pl-10 pr-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    :placeholder="searchPlaceholder"
                    :disabled="disabled"
                    @keydown="handleKeydown"
                />
            </div>

            <!-- Options List -->
            <div class="max-h-60 overflow-auto p-1">
                <div
                    v-if="filteredOptions.length === 0"
                    class="py-6 text-center text-sm text-muted-foreground"
                >
                    {{ emptyMessage }}
                </div>
                <div
                    v-for="(option, index) in filteredOptions"
                    :key="option.value"
                    class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    :class="{
                        'bg-accent text-accent-foreground': index === highlightedIndex,
                        'bg-primary text-primary-foreground': isSelected(option.value)
                    }"
                    @click="selectOption(option)"
                    @mouseenter="highlightedIndex = index"
                >
                    <span class="flex-1">{{ option.label }}</span>
                    <Check
                        v-if="isSelected(option.value)"
                        class="ml-2 h-4 w-4"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Search } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

export interface ComboboxOption {
    value: string | number;
    label: string;
}

interface Props {
    modelValue?: string | number | Array<string | number> | null;
    options: ComboboxOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    refreshData?: () => Promise<void>;
    multiple?: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: string | number | Array<string | number> | null): void;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Select an option...',
    searchPlaceholder: 'Search...',
    emptyMessage: 'No options found.',
    disabled: false,
    refreshData:async()=>{},
    multiple: false
});

const emit = defineEmits<Emits>();

const isOpen = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(-1);
const triggerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const searchInputRef = ref<HTMLInputElement>();
const isMultiple = computed(() => !!props.multiple);
const isSelected = (value: string | number) => {
    if (isMultiple.value) {
        return Array.isArray(props.modelValue) ? props.modelValue.includes(value) : false;
    }
    return props.modelValue === value;
};

const displayValue = computed(() => {
    if (isMultiple.value) {
        const labels = props.options
            .filter(option => isSelected(option.value))
            .map(option => option.label);
        return labels.join(', ');
    }
    const selectedOption = props.options.find(option => option.value === props.modelValue);
    return selectedOption?.label || '';
});

const filteredOptions = computed(() => {
    if (!searchQuery.value) return props.options;

    return props.options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const dropdownStyle = computed(() => {
    // Position dropdown to avoid modal overflow issues
    return {
        minWidth: '100%',
        maxWidth: '100%',
    };
});

const toggleDropdown = () => {
    if (props.disabled) return;
    props.refreshData()
    isOpen.value = !isOpen.value;

    if (isOpen.value) {
        nextTick(() => {
            searchInputRef.value?.focus();
            // Reset highlighted index when opening
            highlightedIndex.value = -1;
            // Find and highlight current selection
            if (!isMultiple.value) {
                const currentIndex = filteredOptions.value.findIndex(
                    option => option.value === props.modelValue
                );
                if (currentIndex >= 0) {
                    highlightedIndex.value = currentIndex;
                }
            }
        });
    }
};

const selectOption = (option: ComboboxOption) => {
    if (isMultiple.value) {
        const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
        const idx = current.findIndex(v => v === option.value);
        if (idx >= 0) {
            current.splice(idx, 1);
        } else {
            current.push(option.value);
        }
        emit('update:modelValue', current);
        // keep dropdown open for multi select
        highlightedIndex.value = -1;
    } else {
        emit('update:modelValue', option.value);
        isOpen.value = false;
        searchQuery.value = '';
        highlightedIndex.value = -1;
    }
};

const handleKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            if (highlightedIndex.value < filteredOptions.value.length - 1) {
                highlightedIndex.value++;
            }
            break;
        case 'ArrowUp':
            event.preventDefault();
            if (highlightedIndex.value > 0) {
                highlightedIndex.value--;
            }
            break;
        case 'Enter':
            event.preventDefault();
            if (highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
                selectOption(filteredOptions.value[highlightedIndex.value]);
            }
            break;
        case 'Escape':
            event.preventDefault();
            isOpen.value = false;
            searchQuery.value = '';
            highlightedIndex.value = -1;
            break;
    }
};

const handleClickOutside = (event: Event) => {
    // Get the actual DOM element from the component ref
    const triggerElement = (triggerRef.value as any)?.$el || triggerRef.value;
    const dropdownElement = dropdownRef.value;

    if (
        triggerElement &&
        dropdownElement &&
        triggerElement.contains &&
        dropdownElement.contains &&
        !triggerElement.contains(event.target as Node) &&
        !dropdownElement.contains(event.target as Node)
    ) {
        isOpen.value = false;
        searchQuery.value = '';
        highlightedIndex.value = -1;
    }
};

// Reset search when options change
watch(() => props.options, () => {
    searchQuery.value = '';
    highlightedIndex.value = -1;
});

// Reset search when dropdown closes
watch(isOpen, (newValue) => {
    if (!newValue) {
        searchQuery.value = '';
        highlightedIndex.value = -1;
    }
});

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>
