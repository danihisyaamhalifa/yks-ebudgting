<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import PlaceholderPattern from '../components/PlaceholderPattern.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Wallet, ArrowUpRight, CircleDollarSign, CheckCircle2, PiggyBank, AlertCircle, Building2, Bell, FileText, Clock, ArrowRight, FileCheck } from 'lucide-vue-next';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Data Pagu Anggaran
const totalPagu = 'Rp 10.000.000.000';
const persentaseAlokasi = 100;

// Data Realisasi
const totalRealisasi = 'Rp 4.500.000.000';
const persentaseRealisasi = 45;

// Data Sisa Anggaran
const sisaAnggaran = 'Rp 5.500.000.000';
const persentaseTersedia = 55;

// Data per Fakultas dengan warna random
const fakultas = [
    { nama: 'Fasilkom', persentase: 60, warna: '#3B82F6' },    // blue-500
    { nama: 'Fekon', persentase: 40, warna: '#10B981' },        // emerald-500
    { nama: 'Fteknik', persentase: 85, warna: '#F59E0B' },      // amber-500
    { nama: 'Fhukum', persentase: 30, warna: '#EF4444' },       // red-500
];
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <!-- Row 1: Cards -->
            <div class="grid auto-rows-min gap-4 md:grid-cols-3">
                
                <!-- Card 1: Total Pagu Anggaran 2026 -->
                <Card class="relative overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-100 to-white shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
                    <CardHeader class="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                        <CardTitle class="text-xs font-medium text-gray-600">
                            Total Pagu Anggaran 2026
                        </CardTitle>
                        <div class="rounded-md bg-blue-50 p-1.5">
                            <Wallet class="h-3.5 w-3.5 text-blue-500" />
                        </div>
                    </CardHeader>

                    <CardContent class="p-3 pt-0">
                        <div class="space-y-0.5">
                            <p class="text-[10px] text-gray-400">Tahun Anggaran Berjalan</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-lg font-bold text-gray-800">{{ totalPagu }}</span>
                                <ArrowUpRight class="h-3 w-3 text-blue-400" />
                            </div>
                        </div>

                        <div class="mt-2 space-y-1.5">
                            <div class="flex items-center justify-between text-[10px]">
                                <span class="flex items-center gap-1 text-gray-500">
                                    <TrendingUp class="h-2.5 w-2.5" />
                                    Alokasi Anggaran
                                </span>
                                <span class="font-semibold text-blue-600">{{ persentaseAlokasi }}%</span>
                            </div>
                            <Progress
                                :model-value="persentaseAlokasi"
                                class="h-1.5 bg-gray-200 [&>div]:bg-blue-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                <!-- Card 2: Total Realisasi -->
                <Card class="relative overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
                    <CardHeader class="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                        <CardTitle class="text-xs font-medium text-gray-600">
                            Total Realisasi
                        </CardTitle>
                        <div class="rounded-md bg-emerald-50 p-1.5">
                            <CircleDollarSign class="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                    </CardHeader>

                    <CardContent class="p-3 pt-0">
                        <div class="space-y-0.5">
                            <p class="text-[10px] text-gray-400">Realisasi Anggaran</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-lg font-bold text-gray-800">{{ totalRealisasi }}</span>
                                <CheckCircle2 class="h-3 w-3 text-emerald-400" />
                            </div>
                        </div>

                        <div class="mt-2 space-y-1.5">
                            <div class="flex items-center justify-between text-[10px]">
                                <span class="flex items-center gap-1 text-gray-500">
                                    <TrendingUp class="h-2.5 w-2.5" />
                                    Persentase Realisasi
                                </span>
                                <span class="font-semibold text-emerald-600">{{ persentaseRealisasi }}%</span>
                            </div>
                            <Progress
                                :model-value="persentaseRealisasi"
                                class="h-1.5 bg-gray-200 [&>div]:bg-emerald-500"
                            />
                        </div>

                        <div class="mt-2">
                            <span class="text-[10px] text-gray-400">
                                {{ persentaseRealisasi }}% dari Pagu
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <!-- Card 3: Sisa Anggaran -->
                <Card class="relative overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
                    <CardHeader class="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                        <CardTitle class="text-xs font-medium text-gray-600">
                            Sisa Anggaran
                        </CardTitle>
                        <div class="rounded-md bg-amber-50 p-1.5">
                            <PiggyBank class="h-3.5 w-3.5 text-amber-500" />
                        </div>
                    </CardHeader>

                    <CardContent class="p-3 pt-0">
                        <div class="space-y-0.5">
                            <p class="text-[10px] text-gray-400">Belum Terserap</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-lg font-bold text-gray-800">{{ sisaAnggaran }}</span>
                                <AlertCircle class="h-3 w-3 text-amber-400" />
                            </div>
                        </div>

                        <div class="mt-2 space-y-1.5">
                            <div class="flex items-center justify-between text-[10px]">
                                <span class="flex items-center gap-1 text-gray-500">
                                    <TrendingUp class="h-2.5 w-2.5" />
                                    Persentase Tersedia
                                </span>
                                <span class="font-semibold text-amber-600">{{ persentaseTersedia }}%</span>
                            </div>
                            <Progress
                                :model-value="persentaseTersedia"
                                class="h-1.5 bg-gray-200 [&>div]:bg-amber-500"
                            />
                        </div>

                        <div class="mt-2">
                            <span class="text-[10px] text-gray-400">
                                {{ persentaseTersedia }}% Tersedia
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <!-- Row 2: Realisasi per Fakultas & Tugas Notifikasi -->
            <div class="grid gap-4 md:grid-cols-2">
                
                <!-- Card 4: Realisasi vs Pagu per Fakultas -->
                <Card class="border border-gray-200 shadow-sm">
                    <CardHeader class="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                        <CardTitle class="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Building2 class="h-4 w-4 text-indigo-500" />
                            Realisasi vs Pagu per Fakultas
                        </CardTitle>
                    </CardHeader>

                    <CardContent class="p-4 pt-2">
                        <div class="space-y-3">
                            <div v-for="(item, index) in fakultas" :key="index" class="space-y-1">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-medium text-gray-700">{{ item.nama }}</span>
                                    <span class="text-xs font-semibold" :style="{ color: item.warna }">{{ item.persentase }}% terpakai</span>
                                </div>
                                <Progress
                                    :model-value="item.persentase"
                                    class="h-2 bg-gray-200"
                                    :style="{ '--progress-color': item.warna }"
                                    :class="`[&>div]:bg-[var(--progress-color)]`"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- Card 5: Tugas & Notifikasi -->
                <Card class="border border-gray-200 shadow-sm">
                    <CardHeader class="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                        <CardTitle class="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Bell class="h-4 w-4 text-purple-500" />
                            Tugas & Notifikasi
                        </CardTitle>
                    </CardHeader>

                    <CardContent class="p-4 pt-2">
                        <div class="space-y-4">
                            <!-- Notifikasi 1: Pengajuan Menunggu Persetujuan -->
                            <div class="rounded-lg border border-blue-200 bg-blue-50/30 p-3 hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                <div class="flex items-start gap-3">
                                    <div class="mt-0.5 rounded-full bg-blue-100 p-1.5 group-hover:bg-blue-200 transition-colors">
                                        <FileCheck class="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center justify-between gap-2">
                                            <h4 class="text-xs font-semibold text-gray-700 truncate">
                                                5 Pengajuan Menunggu Persetujuan
                                            </h4>
                                            <Badge variant="secondary" class="text-[10px] px-1.5 py-0 bg-blue-200 text-blue-700 border-0 shrink-0">
                                                5
                                            </Badge>
                                        </div>
                                        <p class="mt-1 text-[11px] text-blue-600 line-clamp-2">
                                            Segera tinjau modul Workflow Persetujuan.
                                        </p>
                                        <div class="mt-2 flex items-center gap-1 text-[10px] text-blue-400 group-hover:text-blue-600 transition-colors">
                                            <span>Tinjau sekarang</span>
                                            <ArrowRight class="h-3 w-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Notifikasi 2: Kegiatan Belum Upload LPJ -->
                            <div class="rounded-lg border border-red-200 bg-red-50/30 p-3 hover:bg-red-50/50 transition-colors cursor-pointer group">
                                <div class="flex items-start gap-3">
                                    <div class="mt-0.5 rounded-full bg-red-100 p-1.5 group-hover:bg-red-200 transition-colors">
                                        <FileText class="h-4 w-4 text-red-500" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center justify-between gap-2">
                                            <h4 class="text-xs font-semibold text-gray-700 truncate">
                                                3 Kegiatan Belum Upload LPJ
                                            </h4>
                                            <Badge variant="secondary" class="text-[10px] px-1.5 py-0 bg-red-200 text-red-700 border-0 shrink-0">
                                                <Clock class="h-2.5 w-2.5 mr-0.5" />
                                                Mendesak
                                            </Badge>
                                        </div>
                                        <p class="mt-1 text-[11px] text-red-600 line-clamp-2">
                                            Batas waktu pelaporan hampir habis (Maks 10 Hari).
                                        </p>
                                        <div class="mt-2 flex items-center gap-1 text-[10px] text-red-400 group-hover:text-red-600 transition-colors">
                                            <span>Upload sekarang</span>
                                            <ArrowRight class="h-3 w-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </AppLayout>
</template>