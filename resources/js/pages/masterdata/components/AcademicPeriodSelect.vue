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

interface AcademicPeriod {
    id: number
    academic_year: string
    start_date: string
    semester_name?: string
}

const props = defineProps<{
    modelValue: number | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void
}>()

const options = ref<AcademicPeriod[]>([])
const loading = ref(false)

const loadAcademicPeriods = async () => {
    loading.value = true

    try {
        const { data } = await axios.get('/api/v1/select/academic-periods')
        options.value = data.data.sort((a: AcademicPeriod, b: AcademicPeriod) => {
            return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        })
        
    } catch (error) {
        console.error('Gagal memuat periode akademik:', error)
    } finally {
        loading.value = false
    }
}

// Format display: "2023/2024 - Semester Ganjil"
const formatPeriodDisplay = (period: AcademicPeriod): string => {
    return `${period.academic_year} - Semester ${period.semester_name}`
}

onMounted(loadAcademicPeriods)
</script>

<template>
    <Select :model-value="modelValue?.toString() ?? ''" :disabled="loading"
        @update:model-value="value => emit('update:modelValue', value ? Number(value) : null)">
        <SelectTrigger class="w-full">
            <SelectValue :placeholder="loading ? 'Memuat...' : 'Pilih Periode Akademik'" />
        </SelectTrigger>

        <SelectContent>
            <SelectItem v-for="item in options" :key="item.id" :value="item.id.toString()">
                {{ formatPeriodDisplay(item) }}
            </SelectItem>
        </SelectContent>
    </Select>
</template>