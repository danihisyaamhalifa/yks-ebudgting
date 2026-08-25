<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/vue3';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    TrendingUp, Wallet, CircleDollarSign, CheckCircle2, 
    Building2, Bell, FileText, Clock, FileCheck, Send, 
    RotateCcw, Receipt, TrendingDown, Activity 
} from 'lucide-vue-next';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Ambil data dari controller via Inertia props
const { props } = usePage();
const ringkasan = props.ringkasan_anggaran as any;
const pending = props.pending as any;

const formatRupiah = (value: number): string => {
    if (!value && value !== 0) return 'Rp 0';
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
};

// Hitung persentase
const persenRealisasi = ringkasan?.total_disetujui ? Math.round((ringkasan.total_dipakai / ringkasan.total_disetujui) * 100) : 0;
const persenTransfer = ringkasan?.total_disetujui ? Math.round((ringkasan.total_direalisasi / ringkasan.total_disetujui) * 100) : 0;

// Mendapatkan tanggal hari ini untuk header
const today = new Intl.DateTimeFormat('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
}).format(new Date());
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6 md:p-8">
            
            <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 class="text-3xl font-bold tracking-tight text-foreground">Overview Anggaran</h2>
                    <p class="text-muted-foreground mt-1 flex items-center gap-2">
                        <Activity class="h-4 w-4" />
                        Pantau ringkasan realisasi dan tugas harian Anda.
                    </p>
                </div>
                <div class="mt-4 md:mt-0">
                    <Badge variant="outline" class="bg-background px-3 py-1 text-sm font-normal text-muted-foreground shadow-sm">
                        {{ today }}
                    </Badge>
                </div>
            </div>
            
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                
                <Card class="relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle class="text-sm font-medium text-muted-foreground">Pagu Disetujui</CardTitle>
                        <div class="rounded-lg bg-primary/10 p-2.5">
                            <Wallet class="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div class="text-2xl font-bold text-foreground">
                            {{ ringkasan?.total_disetujui ? formatRupiah(ringkasan.total_disetujui) : 'Rp 0' }}
                        </div>
                        <div class="mt-2.5 flex items-center gap-2">
                            <div class="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <TrendingUp class="h-3 w-3" />
                                <span>{{ persenRealisasi }}%</span>
                            </div>
                            <span class="text-xs text-muted-foreground">dari target tahunan</span>
                        </div>
                    </CardContent>
                </Card>

                <Card class="relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle class="text-sm font-medium text-muted-foreground">Pengajuan Pencairan</CardTitle>
                        <div class="rounded-lg bg-blue-500/10 p-2.5">
                            <Send class="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div class="text-2xl font-bold text-foreground">
                            {{ ringkasan?.total_pengajuan_pencairan ? formatRupiah(ringkasan.total_pengajuan_pencairan) : 'Rp 0' }}
                        </div>
                        <div class="mt-2.5 flex items-center gap-2">
                            <div class="flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                <Activity class="h-3 w-3" />
                                <span>{{ persenTransfer }}%</span>
                            </div>
                            <span class="text-xs text-muted-foreground">Yayasan → Bendaharaxx</span>
                        </div>
                    </CardContent>
                </Card>

                <Card class="relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle class="text-sm font-medium text-muted-foreground">Total Realisasi</CardTitle>
                        <div class="rounded-lg bg-emerald-500/10 p-2.5">
                            <CircleDollarSign class="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div class="text-2xl font-bold text-foreground">
                            {{ ringkasan?.total_direalisasi ? formatRupiah(ringkasan.total_direalisasi) : 'Rp 0' }}
                        </div>
                        <div class="mt-2.5 flex items-center gap-2">
                            <div class="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <TrendingUp class="h-3 w-3" />
                                <span>{{ persenRealisasi }}%</span>
                            </div>
                            <span class="text-xs text-muted-foreground">terserap dari pagu</span>
                        </div>
                    </CardContent>
                </Card>

                <Card class="relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle class="text-sm font-medium text-muted-foreground">Sisa Anggaran</CardTitle>
                        <div class="rounded-lg bg-amber-500/10 p-2.5">
                            <RotateCcw class="h-4 w-4 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div class="text-2xl font-bold text-foreground">
                            {{ ringkasan?.sisa_dana ? formatRupiah(ringkasan.sisa_dana) : 'Rp 0' }}
                        </div>
                        <div class="mt-2.5 flex items-center gap-2">
                            <div class="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                <TrendingDown class="h-3 w-3" />
                                <span>{{ 100 - persenRealisasi }}%</span>
                            </div>
                            <span class="text-xs text-muted-foreground">sisa belum terserap</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div class="grid gap-6 md:grid-cols-7">
                
                <Card class="md:col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle class="flex items-center gap-2 text-lg">
                            <Bell class="h-5 w-5 text-primary" />
                            Tugas & Notifikasi
                        </CardTitle>
                        <CardDescription>Daftar aktivitas yang memerlukan tindakan Anda hari ini.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-4">
                            <div v-if="pending?.pengajuan_anggaran > 0" class="group flex cursor-pointer items-center justify-between rounded-xl border bg-card p-4 transition-all hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow">
                                <div class="flex items-center gap-4">
                                    <div class="rounded-full bg-primary/10 p-2.5 text-primary group-hover:bg-primary/20 transition-colors">
                                        <FileCheck class="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p class="font-medium">Perencanaan Anggaran</p>
                                        <p class="text-sm text-muted-foreground">Menunggu persetujuan</p>
                                    </div>
                                </div>
                                <Badge class="bg-primary/10 text-primary hover:bg-primary/20 text-sm px-2.5 py-0.5">
                                    {{ pending.pengajuan_anggaran }}
                                </Badge>
                            </div>

                            <div v-if="pending?.pengajuan_pencairan > 0" class="group flex cursor-pointer items-center justify-between rounded-xl border bg-card p-4 transition-all hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow">
                                <div class="flex items-center gap-4">
                                    <div class="rounded-full bg-blue-500/10 p-2.5 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                        <Receipt class="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p class="font-medium">Pengajuan Pencairan</p>
                                        <p class="text-sm text-muted-foreground">Menunggu verifikasi</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" class="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-sm px-2.5 py-0.5">
                                    {{ pending.pengajuan_pencairan }}
                                </Badge>
                            </div>

                            <div v-if="pending?.pertanggungjawaban > 0" class="group flex cursor-pointer items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-4 transition-all hover:bg-destructive/10 shadow-sm hover:shadow">
                                <div class="flex items-center gap-4">
                                    <div class="rounded-full bg-destructive/10 p-2.5 text-destructive group-hover:bg-destructive/20 transition-colors">
                                        <FileText class="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p class="font-medium text-foreground">SPJ Menunggu</p>
                                        <p class="text-sm text-destructive/80">Perlu verifikasi segera</p>
                                    </div>
                                </div>
                                <Badge variant="destructive" class="shrink-0 gap-1.5 px-2.5 py-1">
                                    <Clock class="h-3.5 w-3.5" />
                                    {{ pending.pertanggungjawaban }} Dokumen
                                </Badge>
                            </div>

                            <div v-if="!pending || Object.values(pending).every(v => v === 0)" class="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                                <div class="rounded-full bg-muted p-3 mb-4">
                                    <CheckCircle2 class="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 class="text-lg font-medium text-foreground">Semua tugas selesai</h3>
                                <p class="text-sm text-muted-foreground mt-1 max-w-sm">Anda telah menyelesaikan semua tugas yang membutuhkan persetujuan. Tidak ada notifikasi yang tertunda.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card class="md:col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle class="flex items-center gap-2 text-lg">
                            <Building2 class="h-5 w-5 text-indigo-500" />
                            Kinerja Keuangan
                        </CardTitle>
                        <CardDescription>Metrik serapan anggaran berjalan.</CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-6">
                        
                        <div class="space-y-2">
                            <div class="flex items-center justify-between text-sm">
                                <span class="font-medium text-foreground">Serapan Realisasi</span>
                                <span class="font-medium text-emerald-500">{{ persenRealisasi }}%</span>
                            </div>
                            <div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                <div class="h-full bg-emerald-500 transition-all duration-500 ease-in-out" :style="{ width: `${persenRealisasi}%` }"></div>
                            </div>
                            <p class="text-xs text-muted-foreground">
                                Rp {{ formatRupiah(ringkasan?.total_direalisasi || 0) }} dari Rp {{ formatRupiah(ringkasan?.total_disetujui || 0) }}
                            </p>
                        </div>

                        <div class="space-y-2">
                            <div class="flex items-center justify-between text-sm">
                                <span class="font-medium text-foreground">Distribusi Dana (Transfer)</span>
                                <span class="font-medium text-blue-500">{{ persenTransfer }}%</span>
                            </div>
                            <div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                <div class="h-full bg-blue-500 transition-all duration-500 ease-in-out" :style="{ width: `${persenTransfer}%` }"></div>
                            </div>
                            <p class="text-xs text-muted-foreground">
                                Rp {{ formatRupiah(ringkasan?.total_ditransfer || 0) }} ditransfer ke unit
                            </p>
                        </div>

                        <hr class="border-border" />

                        <div class="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <p class="text-xs font-medium text-muted-foreground mb-1">Total Diusulkan</p>
                                <p class="text-sm font-semibold text-foreground">{{ ringkasan?.total_diusulkan ? formatRupiah(ringkasan.total_diusulkan) : 'Rp 0' }}</p>
                            </div>
                            <div>
                                <p class="text-xs font-medium text-muted-foreground mb-1">Total Dikembalikan</p>
                                <p class="text-sm font-semibold text-foreground">{{ ringkasan?.total_dikembalikan ? formatRupiah(ringkasan.total_dikembalikan) : 'Rp 0' }}</p>
                            </div>
                        </div>

                    </CardContent>
                </Card>

            </div>
        </div>
    </AppLayout>
</template>