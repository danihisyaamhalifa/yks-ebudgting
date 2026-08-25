<script setup lang="ts">
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/vue3';
import {
    Activity,
    ArrowLeftRight,
    Banknote,
    BarChart3,
    BriefcaseBusiness,
    Building2,
    CalendarRange,
    ClipboardList,
    ClipboardPen,
    Database,
    FileBarChart,
    FileCheck2,
    FileSignature,
    FileSpreadsheet,
    FolderGit2,
    FolderTree,
    GraduationCap,
    HandCoins,
    Landmark,
    LayoutDashboard,
    Package,
    ReceiptText,
    Settings,
    ShieldCheck,
    Store,
    Users
} from 'lucide-vue-next';
import AppLogo from './AppLogo.vue';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
        permission: 'view dashboard',
    },

    {
        title: 'Perencanaan Anggaran',
        icon: ClipboardPen,
        href: '#',
        children: [
            {
                title: 'Daftar Perencanaan',
                href: '/perencanaan-anggaran',
                permission: 'view perencanaan_anggaran',
                icon: ClipboardList,
            },
            {
                title: 'Verifikasi & Persetujuan',
                href: '/verifikasi-anggaran',
                permission: 'view perencanaan_anggaran',
                icon: FileCheck2,
            },
        ],
    },

    {
        title: 'Pengajuan Pencairan',
        icon: FileSpreadsheet,
        href: '#',
        children: [
            {
                title: 'Daftar Pengajuan',
                href: '/pengajuan-pencairan',
                permission: 'view pengajuan_pencairan',
                icon: ClipboardList,
            },
            {
                title: 'Verifikasi & Persetujuan',
                href: '/verifikasi-pengajuan',
                permission: 'view pengajuan_pencairan',
                icon: FileCheck2,
            },
        ],
    },

    {
        title: 'Pencairan',
        icon: HandCoins,
        href: '#',
        children: [
            {
                title: 'Disposisi Pencairan',
                href: '/disposisi-pencairan',
                icon: FileSignature,
            },
            {
                title: 'Realisasi Pencairan',
                href: '/realisasi-pencairan',
                icon: Banknote,
            },
        ],
    },

    {
        title: 'Pertanggungjawaban',
        icon: ReceiptText,
        href: '#',
        children: [
            {
                title: 'Daftar Pertanggungjawaban',
                href: '/pertanggungjawaban',
                icon: ClipboardList,
            },
            {
                title: 'Verifikasi & Persetujuan',
                href: '/verifikasi-pertanggungjawaban',
                icon: FileCheck2,
            },
        ],
    },

    {
        title: 'Transaksi',
        icon: ArrowLeftRight,
        href: '#',
        children: [
            {
                title: 'Transfer Dana',
                href: '/transfer-dana',
                icon: Landmark,
            },
            {
                title: 'Mutasi Kas',
                href: '/mutasi-kas',
                icon: Activity,
            }
        ],
    },

    {
        title: 'Laporan',
        icon: BarChart3,
        href: '#',
        children: [
            {
                title: 'Monitoring Anggaran',
                href: '/monitoring-anggaran',
                icon: FileBarChart,
            },
        ],
    },

    {
        title: 'Master Data',
        icon: Database,
        href: '#',
        children: [
            {
                title: 'Unit',
                href: '/unit',
                icon: Building2,
                permission: 'view master_data',
            },
            {
                title: 'Tahun Anggaran',
                href: '/tahun-anggaran',
                icon: CalendarRange,
                permission: 'view master_data',
            },
            {
                title: 'Periode Akademik',
                href: '/periode-akademik',
                icon: GraduationCap,
                permission: 'view master_data',
            },
            {
                title: 'Kategori Anggaran',
                href: '/kategori-anggaran',
                icon: FolderTree,
                permission: 'view master_data',
            },
            {
                title: 'Sub Kategori Anggaran',
                href: '/sub-kategori-anggaran',
                icon: FolderGit2,
                permission: 'view master_data',
            },
            {
                title: 'Kegiatan',
                href: '/kegiatan',
                icon: BriefcaseBusiness,
                permission: 'view master_data',
            },
            {
                title: 'Item Anggaran',
                href: '/item-anggaran',
                icon: Package,
                permission: 'view master_data',
            },
            {
                title: 'Kas Bank',
                href: '/kas-bank',
                icon: Landmark,
                permission: 'view master_data',
            },
            {
                title: 'Sumber Dana',
                href: '/sumber-dana',
                icon: HandCoins,
                permission: 'view master_data',
            },
            {
                title: 'Pegawai',
                href: '/pegawai',
                icon: Users,
                permission: 'view master_data',
            },
            {
                title: 'Vendor',
                href: '/vendor',
                icon: Store,
                permission: 'view master_data',
            },
        ],
    },

    {
        title: 'Pengaturan',
        icon: Settings,
        href: '#',
        children: [
            {
                title: 'User',
                href: '/user',
                icon: Users,
                permission: 'view pengaturan',
            },
            {
                title: 'Role & Hak Akses',
                href: '/role',
                icon: ShieldCheck,
                permission: 'view pengaturan',
            },
            {
                title: 'Parameter',
                href: '/parameter',
                icon: ShieldCheck,
                permission: 'view pengaturan',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [];
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <!-- HEADER -->
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link
                            :href="dashboard()"
                            class="flex items-center gap-2"
                        >
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <!-- CONTENT -->
        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

        <!-- FOOTER -->
        <SidebarFooter>
            <NavFooter :items="footerNavItems" />
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
