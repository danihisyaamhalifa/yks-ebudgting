<!-- components/sidebar/SidebarNav.vue -->
<script setup lang="ts">
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { urlIsActive } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/vue3';
import { ChevronDown } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
    items: NavItem[];
}>();

const page = usePage();
const { state } = useSidebar();
const openMenus = ref<string[]>([]);

// State untuk floating menu
const hoveredMenu = ref<string | null>(null);
const dropdownPosition = ref({ top: 0, left: 0 });
const dropdownRef = ref<HTMLElement | null>(null);
let hideTimeout: ReturnType<typeof setTimeout> | null = null;

// Get user permissions from page props
const userPermissions = computed(() => {
    return (page.props as any)?.auth?.user?.permissions || [];
});

// Function to check if user has a specific permission
const hasPermission = (permissionName?: string | string[]): boolean => {
    if (!permissionName) return true;

    // Helper untuk mengecek satu nama di dalam array objek
    const checkSingle = (name: string) =>
        userPermissions.value.some((p) => p.name === name);

    // Jika input berupa array (misal: ['view perencanaan_anggaran', 'view pengajuan_pencairan'])
    if (Array.isArray(permissionName)) {
        return permissionName.some((name) => checkSingle(name));
    }

    // Jika input berupa string tunggal (misal: 'create perencanaan_anggaran')
    return checkSingle(permissionName);
};

// Filter items based on permissions
const filteredItems = computed(() => {
    return props.items.filter((item) => {
        // Check if user has permission to see this item
        if (!hasPermission(item.permission)) {
            return false;
        }

        // If item has children, filter them too
            if (item.children) {
                item.children = item.children.filter((child) =>
                    hasPermission(child.permission),
                );
                
                // Hide parent jika semua child tidak memiliki permission
                // dan tidak memiliki href langsung
                if (item.children.length === 0 && !item.href) {
                    return false;
                }
            }

        return true;
    });
});

const isCollapsed = () => state.value === 'collapsed';

// Cek child aktif
const isAnyChildActive = (item: NavItem): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => urlIsActive(child.href, page.url));
};

// Inisialisasi submenu aktif
const initializeOpenMenus = () => {
    filteredItems.value.forEach((item) => {
        if (item.children && isAnyChildActive(item)) {
            openMenus.value.push(item.title);
        }
    });
};

initializeOpenMenus();

// Watch URL
watch(
    () => page.url,
    () => {
        filteredItems.value.forEach((item) => {
            if (item.children && isAnyChildActive(item)) {
                if (!openMenus.value.includes(item.title)) {
                    openMenus.value.push(item.title);
                }
            }
        });
    },
);

const toggleMenu = (title: string) => {
    if (isCollapsed()) return;

    const index = openMenus.value.indexOf(title);
    index > -1 ? openMenus.value.splice(index, 1) : openMenus.value.push(title);
};

const isMenuOpen = (title: string) => {
    return openMenus.value.includes(title);
};

// Floating menu handlers
const onMenuHover = (
    event: MouseEvent,
    title: string,
    hasChildren: boolean,
) => {
    if (!isCollapsed()) return;
    if (!hasChildren) return;

    // Clear hide timeout if exists
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    // Calculate position
    let top = rect.top;
    let left = rect.right + 8;

    // Adjust if dropdown would go off screen
    if (dropdownRef.value) {
        const dropdownHeight = dropdownRef.value.offsetHeight;
        const viewportHeight = window.innerHeight;

        if (top + dropdownHeight > viewportHeight) {
            top = viewportHeight - dropdownHeight - 10;
        }

        if (top < 10) {
            top = 10;
        }
    }

    dropdownPosition.value = {
        top: top,
        left: left,
    };

    hoveredMenu.value = title;
};

const onMenuLeave = (delay: boolean = true) => {
    if (!isCollapsed()) return;

    if (delay) {
        hideTimeout = setTimeout(() => {
            hoveredMenu.value = null;
            hideTimeout = null;
        }, 300);
    } else {
        hoveredMenu.value = null;
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    }
};

const onDropdownEnter = () => {
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }
};

const onDropdownLeave = () => {
    hoveredMenu.value = null;
};

// Update position on scroll/resize
const updateDropdownPosition = () => {
    if (hoveredMenu.value && isCollapsed()) {
        // Find the hovered menu element
        const menuElement = document.querySelector(
            `[data-menu-title="${hoveredMenu.value}"]`,
        );
        if (menuElement) {
            const rect = menuElement.getBoundingClientRect();
            dropdownPosition.value = {
                top: rect.top,
                left: rect.right + 8,
            };
        }
    }
};

// Event listeners for scroll/resize
onMounted(() => {
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
});

onUnmounted(() => {
    window.removeEventListener('scroll', updateDropdownPosition, true);
    window.removeEventListener('resize', updateDropdownPosition);
    if (hideTimeout) {
        clearTimeout(hideTimeout);
    }
});
</script>

<template>
    <SidebarGroup class="px-2 py-0">
        <SidebarMenu>
            <SidebarMenuItem v-for="item in filteredItems" :key="item.title">
                <!-- PARENT WITH CHILD -->
                <div v-if="item.children?.length" class="relative">
                    <SidebarMenuButton
                        :data-menu-title="item.title"
                        @click="toggleMenu(item.title)"
                        @mouseenter="onMenuHover($event, item.title, true)"
                        @mouseleave="onMenuLeave(true)"
                        class="w-full cursor-pointer"
                        :class="{
                            'justify-center': isCollapsed(),
                            'bg-muted':
                                !isCollapsed() &&
                                (isMenuOpen(item.title) ||
                                    isAnyChildActive(item)),
                            'text-primary': isAnyChildActive(item),
                            relative: isCollapsed(),
                        }"
                    >
                        <div
                            class="flex w-full items-center"
                            :class="{
                                'justify-center': isCollapsed(),
                                'justify-between': !isCollapsed(),
                            }"
                        >
                            <div class="flex items-center gap-2">
                                <component
                                    :is="item.icon"
                                    class="h-5 w-5 shrink-0"
                                />
                                <span v-if="!isCollapsed()">
                                    {{ item.title }}
                                </span>
                            </div>

                            <!-- Active indicator untuk collapsed mode -->
                            <div
                                v-if="isCollapsed() && isAnyChildActive(item)"
                                class="absolute right-0 h-1.5 w-1.5 rounded-full bg-primary"
                                :style="{ right: '-4px' }"
                            />

                            <ChevronDown
                                v-if="!isCollapsed()"
                                class="h-4 w-4 transition-transform"
                                :class="{
                                    'rotate-180': isMenuOpen(item.title),
                                }"
                            />
                        </div>
                    </SidebarMenuButton>

                    <!-- CHILDREN - Normal mode -->
                    <div
                        v-if="!isCollapsed()"
                        v-show="isMenuOpen(item.title)"
                        class="mt-1 space-y-1 pl-6"
                    >
                        <SidebarMenuButton
                            v-for="child in item.children"
                            :key="child.title"
                            as-child
                            class="h-8"
                            :is-active="urlIsActive(child.href, page.url)"
                        >
                            <Link :href="child.href">
                                <component :is="child.icon" class="h-5 w-5" />
                                <span class="text-sm">
                                    {{ child.title }}
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </div>
                </div>

                <!-- SINGLE MENU -->
                <div v-else>
                    <SidebarMenuButton
                        as-child
                        :data-menu-title="item.title"
                        @mouseenter="onMenuHover($event, item.title, false)"
                        @mouseleave="onMenuLeave(true)"
                        :class="{
                            'justify-center': isCollapsed(),
                            relative: isCollapsed(),
                        }"
                        :is-active="urlIsActive(item.href, page.url)"
                    >
                        <Link :href="item.href" class="flex items-center gap-2">
                            <component
                                :is="item.icon"
                                class="h-5 w-5 shrink-0"
                            />
                            <span v-if="!isCollapsed()">
                                {{ item.title }}
                            </span>

                            <!-- Active indicator untuk collapsed mode -->
                            <div
                                v-if="
                                    isCollapsed() &&
                                    urlIsActive(item.href, page.url)
                                "
                                class="absolute right-0 h-1.5 w-1.5 rounded-full bg-primary"
                                :style="{ right: '-4px' }"
                            />
                        </Link>
                    </SidebarMenuButton>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>

        <!-- FLOATING DROPDOWN MENU - Teleport to body -->
        <Teleport to="body">
            <div
                v-if="isCollapsed() && hoveredMenu"
                ref="dropdownRef"
                class="fixed z-50 max-w-[280px] min-w-[220px] animate-in rounded-lg border bg-popover shadow-lg duration-200 fade-in-0 zoom-in-95"
                :style="{
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                }"
                @mouseenter="onDropdownEnter"
                @mouseleave="onDropdownLeave"
            >
                <!-- Dropdown content -->
                <div class="py-1">
                    <!-- Find the hovered menu item -->
                    <template v-for="item in filteredItems" :key="item.title">
                        <div v-if="item.title === hoveredMenu">
                            <!-- Header untuk parent menu dengan children -->
                            <div
                                v-if="item.children?.length"
                                class="px-2 py-1.5"
                            >
                                <div
                                    class="mb-1 flex items-center gap-2 border-b pb-2"
                                >
                                    <component
                                        :is="item.icon"
                                        class="h-4 w-4 text-muted-foreground"
                                    />
                                    <span class="text-sm font-semibold">{{
                                        item.title
                                    }}</span>
                                </div>
                                <div class="mt-1 space-y-1">
                                    <SidebarMenuButton
                                        v-for="child in item.children"
                                        :key="child.title"
                                        as-child
                                        class="h-8 w-full justify-start"
                                        :is-active="
                                            urlIsActive(child.href, page.url)
                                        "
                                    >
                                        <Link
                                            :href="child.href"
                                            class="flex items-center gap-2 px-2"
                                            @click="hoveredMenu = null"
                                        >
                                            <component
                                                :is="child.icon"
                                                class="h-4 w-4"
                                            />
                                            <span class="text-sm">{{
                                                child.title
                                            }}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </div>
                            </div>

                            <!-- Untuk single menu, tampilkan tooltip sederhana -->
                            <div v-else class="px-2 py-1.5">
                                <div class="flex items-center gap-2">
                                    <component
                                        :is="item.icon"
                                        class="h-4 w-4 text-muted-foreground"
                                    />
                                    <span class="text-sm">{{
                                        item.title
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Arrow indicator -->
                <div
                    class="absolute h-2 w-2 rotate-45 border-t border-l bg-popover"
                    :style="{
                        left: '-5px',
                        top: '12px',
                    }"
                />
            </div>
        </Teleport>
    </SidebarGroup>
</template>

<style scoped>
/* Animations for floating menu */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.animate-in {
    animation: fadeIn 0.15s ease-out;
}

/* Custom scrollbar untuk dropdown */
.fixed.z-50::-webkit-scrollbar {
    width: 4px;
}

.fixed.z-50::-webkit-scrollbar-track {
    background: hsl(var(--border));
    border-radius: 4px;
}

.fixed.z-50::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground));
    border-radius: 4px;
}
</style>
