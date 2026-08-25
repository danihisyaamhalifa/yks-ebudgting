<script setup lang="ts">
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, usePage } from '@inertiajs/vue3';
import { ChevronUp, User2, LogOut } from 'lucide-vue-next';
import { computed } from 'vue';
import type { BreadcrumbItemType, User } from '@/types';

withDefaults(
    defineProps<{
        breadcrumbs?: BreadcrumbItemType[];
    }>(),
    {
        breadcrumbs: () => [],
    },
);

const page = usePage();
const user = computed(() => page.props.auth.user as User);
</script>

<template>
    <header
        class="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/70 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4"
    >
        <div class="flex flex-1 items-center gap-2">
            <SidebarTrigger class="-ml-1" />
            <template v-if="breadcrumbs && breadcrumbs.length > 0">
                <Breadcrumbs :breadcrumbs="breadcrumbs" />
            </template>
        </div>

        <DropdownMenu>
            <DropdownMenuTrigger as-child>
                <button class="flex items-center gap-2 rounded-md p-1.5 hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Avatar class="h-8 w-8 rounded-lg">
                        <AvatarImage :src="user?.avatar" :alt="user?.name" />
                        <AvatarFallback class="rounded-lg">
                            {{ user?.name?.charAt(0) }}
                        </AvatarFallback>
                    </Avatar>
                    <div class="hidden flex-col text-left text-sm leading-tight md:flex">
                        <span class="font-medium truncate max-w-[120px]">{{ user?.name }}</span>
                        <span class="text-xs text-muted-foreground truncate max-w-[120px]">{{ user?.email }}</span>
                    </div>
                    <ChevronUp class="ml-auto hidden md:block h-4 w-4 text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56" align="end" :side-offset="4">
                <DropdownMenuLabel class="p-0 font-normal">
                    <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar class="h-8 w-8 rounded-lg">
                            <AvatarImage :src="user?.avatar" :alt="user?.name" />
                            <AvatarFallback class="rounded-lg">
                                {{ user?.name?.charAt(0) }}
                            </AvatarFallback>
                        </Avatar>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                            <span class="font-semibold truncate">{{ user?.name }}</span>
                            <span class="text-xs text-muted-foreground truncate">{{ user?.email }}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem as-child>
                    <Link href="/profile">
                        <User2 class="mr-2 h-4 w-4" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem as-child>
                    <Link href="/logout" method="post" as="button">
                        <LogOut class="mr-2 h-4 w-4" />
                        Log out
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </header>
</template>