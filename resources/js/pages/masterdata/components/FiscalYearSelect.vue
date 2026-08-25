<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface FiscalYear {
    id: number
    year: string
}

const props = defineProps<{
    modelValue: number | null
    startYear?: number
    endYear?: number
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void
}>()

const options = ref<FiscalYear[]>([])
const loading = ref(false)

const loadFiscalYears = async () => {
    loading.value = true
    try {
        let url = '/api/v1/select/fiscal-years'
        // const params: Record<string, string> = {}

        // if (props.startYear) {
        //   params.start_year = props.startYear.toString()
        // }

        // if (props.endYear) {
        //   params.end_year = props.endYear.toString()
        // }

        // const { data } = await axios.get(url, { params })
        const { data } = await axios.get(url)
        options.value = data.data
    } finally {
        loading.value = false
    }
}

onMounted(loadFiscalYears)
</script>

<template>
    <Select :model-value="modelValue?.toString() ?? ''" :disabled="loading"
        @update:model-value="value => emit('update:modelValue', value ? Number(value) : null)">
        <SelectTrigger class="w-full">
            <SelectValue placeholder="Pilih Tahun Anggaran" />
        </SelectTrigger>

        <SelectContent>
            <SelectItem v-for="item in options" :key="item.id" :value="item.id.toString()">
                {{ item.year }}
            </SelectItem>
        </SelectContent>
    </Select>
</template>