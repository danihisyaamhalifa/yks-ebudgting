<script setup lang="ts">
import AppLayout from '@/layouts/app/AppSidebarLayout.vue';
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
import type { BreadcrumbItemType } from '@/types';
import { ref, onMounted, onUnmounted } from 'vue';
import { ArrowDown } from 'lucide-vue-next';

interface Props {
    breadcrumbs?: BreadcrumbItemType[];
}

withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
});

const showScrollButton = ref(false);

const checkScrollPosition = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Show button only when not at the bottom and scrolled more than 200px
    const isAtBottom = scrollTop + windowHeight >= documentHeight - 50;
    showScrollButton.value = scrollTop > 200 && !isAtBottom;
};

const scrollToBottom = () => {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
    });
};

onMounted(() => {
    window.addEventListener('scroll', checkScrollPosition);
});

onUnmounted(() => {
    window.removeEventListener('scroll', checkScrollPosition);
});
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

    <!-- Go to Bottom Button -->
    <button
        v-if="showScrollButton"
        @click="scrollToBottom"
        class="fixed bottom-6 right-6 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-50"
        aria-label="Go to bottom"
    >
        <ArrowDown class="w-5 h-5" />
    </button>
</template>