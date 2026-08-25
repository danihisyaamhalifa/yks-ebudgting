<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/composables/useInitials';
import type { User } from '@/types';
import { computed } from 'vue';

interface Props {
    user: User;
    showEmail?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showEmail: false,
});

const { getInitials } = useInitials();

// Compute whether we should show the avatar image
const showAvatar = computed(
    () => props.user.avatar && props.user.avatar !== '',
);

// Compute role display text
const roleDisplay = computed(() => {
    if (!props.user.roles) return '';

    // Jika roles adalah array, ambil role pertama atau gabungkan
    if (Array.isArray(props.user.roles)) {
        if (props.user.roles.length === 0) return '';
        // Ambil nama role pertama
        return props.user.roles[0].name || props.user.roles[0];
    }

    // Jika roles adalah object/string langsung
    return props.user.roles;
});

const unitDisplay = computed(() => {
    return props.user.unit?.unit_name || props.user.unit?.name || '';
});
</script>

<template>
    <Avatar class="h-8 w-8 overflow-hidden rounded-lg">
        <AvatarImage v-if="showAvatar" :src="user.avatar!" :alt="user.name" />
        <AvatarFallback class="rounded-lg bg-red-500 text-white">
            {{ getInitials(user.name) }}
        </AvatarFallback>
    </Avatar>

    <div class="grid flex-1 text-left text-sm leading-tight">
        <span class="truncate font-medium">{{ user.name }}</span>
        <span v-if="unitDisplay" class="truncate text-xs text-muted-foreground font-bold">
            {{ unitDisplay }}
        </span>
        <span class="truncate text-xs text-muted-foreground">
            {{ roleDisplay }}
        </span>
    </div>
</template>
