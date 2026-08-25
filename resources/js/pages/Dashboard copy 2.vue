<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <!-- Dashboard content will be added here -->
            <div class="flex items-center justify-center min-h-[60vh] border-2 border-dashed border-gray-300 rounded-xl">
                <div class="text-center">
                    <h2 class="text-xl font-semibold text-gray-400">Dashboard</h2>
                    <p class="mt-2 text-sm text-gray-400">Konten dashboard akan ditambahkan di sini</p>
                </div>
            </div>
        </div>
    </AppLayout>
</template>