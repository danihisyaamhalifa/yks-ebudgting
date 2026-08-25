<script setup lang="ts">
import AppLayout from '@/layouts/app/AppSidebarLayout.vue';
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
import type { BreadcrumbItemType } from '@/types';
import { MessageCircle } from 'lucide-vue-next'; // Import icon WhatsApp dari lucide

interface Props {
    breadcrumbs?: BreadcrumbItemType[];
    whatsappNumber?: string;
    whatsappMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
    whatsappNumber: '6281234567890', // Ganti dengan nomor WhatsApp Anda
    whatsappMessage: 'Halo, saya butuh bantuan dari website ini',
});

// Fungsi untuk membuka WhatsApp
const openWhatsApp = () => {
    const cleanNumber = props.whatsappNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(props.whatsappMessage);
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, '_blank');
};
</script>

<template>
    <Toaster :position="'top-right'" :expand="true" :rich-colors="true" :close-button="true" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="p-4 h-[-webkit-fill-available]">
            <slot />
        </div>
        <small class="m-4 text-right text-gray-500 text-xs">
                All rights reserved,
                Copyright © {{ new Date().getFullYear() }}
                {{ $page.props.name }} v.{{ $page.props.version }}
            </small>
    </AppLayout>

    <!-- Tombol WhatsApp Floating -->
    <div 
        class="fixed bottom-6 right-6 z-50 group cursor-pointer"
        @click="openWhatsApp"
    >
        <!-- Tooltip -->
        <div class="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            Hubungi kami via WhatsApp
            <div class="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
        </div>

        <!-- Tombol WhatsApp -->
        <button 
            class="relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
            aria-label="Chat via WhatsApp"
        >
            <!-- Icon WhatsApp dari lucide-vue-next -->
            <MessageCircle class="w-6 h-6" />
        </button>

        <!-- Badge notifikasi -->
        <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
    </div>
</template>

<style scoped>
@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.7;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>