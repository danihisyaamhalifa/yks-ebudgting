<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="rounded-lg border bg-background p-6 shadow-sm">
            <!-- Loading Indicator -->
            <div
                v-if="isLoading"
                class="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white shadow-lg"
            >
                <div
                    class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                ></div>
                <span class="text-sm font-medium">Mengambil data...</span>
            </div>

            <!-- Alert read-only -->
            <div
                v-if="!isLoading && isReadOnly"
                class="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
            >
                <div class="flex items-center gap-2">
                    <AlertCircle
                        class="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                    />
                    <p
                        class="text-sm font-medium text-yellow-700 dark:text-yellow-200"
                    >
                        Form dalam mode baca saja dan tidak dapat diedit.
                    </p>
                </div>
            </div>

            <!-- Header Form -->
            <div class="mb-6 border-b pb-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-foreground">
                            {{
                                mode === 'create'
                                    ? 'Perencanaan Anggaran Baru'
                                    : 'Detail Perencanaan Anggaran'
                            }}
                        </h1>
                        <p class="mt-1 text-sm text-muted-foreground">
                            Formulir perencanaan anggaran
                        </p>
                    </div>
                </div>
                <div class="mt-4 flex flex-wrap gap-4 text-sm">
                    <div
                        v-if="mode !== 'create' && formData.request_no"
                        class="flex items-center gap-2"
                    >
                        <CalendarDays class="h-4 w-4 text-muted-foreground" />
                        <span class="font-bold text-foreground"
                            >No Perencanaan:</span
                        >
                        <span class="font-medium text-foreground">{{
                            formData.request_no
                        }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <Calendar class="h-4 w-4 text-muted-foreground" />
                        <span class="font-bold text-foreground">Tanggal:</span>
                        <span class="font-medium text-foreground"
                            >[ {{ currentDate }} ]</span
                        >
                    </div>
                    <div
                        v-if="mode !== 'create' && formData.request_no"
                        class="ml-auto flex items-center gap-2"
                    >
                        <Info
                            class="h-4 w-4 text-blue-500 dark:text-blue-400"
                        />
                        <span class="font-bold text-foreground">Status:</span>
                        <span class="text-sm font-bold text-foreground">{{
                            statusDescription
                        }}</span>
                    </div>
                </div>
            </div>

            <!-- Form -->
            <form @submit.prevent="submitForm" class="space-y-6">
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div class="space-y-6">
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground"
                                >Unit <span class="text-red-500">*</span></Label
                            >
                            <UnitSelect
                                v-model="formData.unit_id"
                                :disabled="isReadOnly || isLoading"
                                :searchable="true"
                            />
                        </div>
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground"
                                >Tahun Anggaran
                                <span class="text-red-500">*</span></Label
                            >
                            <FiscalYearSelect
                                v-model="formData.fiscal_year_id"
                                :disabled="isReadOnly || isLoading"
                            />
                        </div>
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground"
                                >Periode Akademik
                                <span class="text-red-500">*</span></Label
                            >
                            <AcademicPeriodSelect
                                v-model="formData.academic_period_id"
                                :disabled="isReadOnly || isLoading"
                            />
                        </div>
                    </div>
                    <div class="space-y-6">
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground"
                                >Tipe Anggaran
                                <span class="text-red-500">*</span></Label
                            >
                            <Select
                                v-model="formData.budget_type"
                                :disabled="isReadOnly || isLoading"
                            >
                                <SelectTrigger class="w-full"
                                    ><SelectValue
                                        placeholder="Pilih Tipe Anggaran"
                                /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="o in budgetTypeOptions"
                                        :key="o.value"
                                        :value="o.value"
                                        >{{ o.label }}</SelectItem
                                    >
                                </SelectContent>
                            </Select>
                        </div>
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground"
                                >Kategori Anggaran
                                <span class="text-red-500">*</span></Label
                            >
                            <BudgetCategorySelect
                                v-if="formData.budget_type && formData.unit_id"
                                v-model="formData.budget_category_id"
                                level="root"
                                :budget-type="formData.budget_type"
                                :with-budget-type="true"
                                :unit-id="formData.unit_id"
                                :searchable="true"
                                :disabled="isReadOnly || isLoading"
                            />
                        </div>
                        <div class="space-y-2">
                            <Label class="text-sm font-medium text-foreground"
                                >Sub Kategori Anggaran</Label
                            >
                            <BudgetCategorySelect
                                v-if="
                                    formData.budget_type &&
                                    formData.unit_id &&
                                    formData.budget_category_id
                                "
                                v-model="formData.sub_budget_category_id"
                                level="child"
                                :parent-id="formData.budget_category_id"
                                :withParent="true"
                                :unit-id="formData.unit_id"
                                :searchable="true"
                                :disabled="isReadOnly || isLoading"
                            />
                        </div>
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <Label
                                    class="text-sm font-medium text-foreground"
                                    >Deskripsi
                                    <span class="text-red-500">*</span></Label
                                >
                                <span class="text-xs text-muted-foreground"
                                    >{{
                                        formData.description?.length ?? 0
                                    }}/500</span
                                >
                            </div>
                            <Textarea
                                v-model="formData.description"
                                placeholder="Isikan deskripsi..."
                                class="min-h-[80px] resize-none"
                                :maxlength="500"
                                :disabled="isReadOnly || isLoading"
                            />
                        </div>
                    </div>
                </div>

                <!-- Activities Section -->
                <div class="border-t pt-6">
                    <div class="mb-4 flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-semibold text-foreground">
                                Rincian Kegiatan
                            </h3>
                            <p class="text-sm text-muted-foreground">
                                Rincian kegiatan yang akan dianggarkan
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <Button
                                v-if="
                                    !isReadOnly &&
                                    !isLoading &&
                                    formData.unit_id
                                "
                                type="button"
                                variant="outline"
                                size="sm"
                                @click="openUploadDialog"
                                class="gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-950/20"
                            >
                                <Upload class="h-4 w-4" /> Upload Excel
                            </Button>
                            <Button
                                v-if="
                                    !isReadOnly &&
                                    !isLoading &&
                                    formData.unit_id
                                "
                                type="button"
                                variant="outline"
                                size="sm"
                                @click="downloadActivityTemplate"
                                class="gap-2"
                            >
                                <Download class="h-4 w-4" /> Template
                            </Button>
                            <Button
                                v-if="
                                    !isReadOnly &&
                                    !isLoading &&
                                    formData.unit_id
                                "
                                type="button"
                                variant="outline"
                                size="sm"
                                @click="addNewActivity"
                                class="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            >
                                <Plus class="h-4 w-4" /> Tambah Kegiatan
                            </Button>
                        </div>
                    </div>

                    <!-- Upload Dialog -->
                    <Dialog
                        :open="showUploadDialog"
                        @update:open="showUploadDialog = $event"
                    >
                        <DialogContent class="max-w-lg">
                            <DialogHeader>
                                <DialogTitle class="flex items-center gap-2">
                                    <FileSpreadsheet
                                        class="h-5 w-5 text-green-600"
                                    />
                                    Upload Kegiatan & Item Anggaran
                                </DialogTitle>
                                <DialogDescription>
                                    Upload file Excel. Kode kegiatan dan item
                                    akan dicocokkan dengan master data.
                                </DialogDescription>
                            </DialogHeader>
                            <div class="space-y-4">
                                <!-- Dropzone -->
                                <div
                                    ref="uploadDropzoneRef"
                                    class="relative rounded-lg border-2 border-dashed p-6 transition-colors"
                                    :class="
                                        isUploadDragOver
                                            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
                                            : activityUploadFile
                                              ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-950/20'
                                              : 'border-muted-foreground/25 hover:border-green-400 hover:bg-accent/50'
                                    "
                                    @dragover.prevent="isUploadDragOver = true"
                                    @dragleave.prevent="
                                        isUploadDragOver = false
                                    "
                                    @drop.prevent="handleUploadDrop"
                                >
                                    <input
                                        ref="fileInputRef"
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        class="absolute inset-0 cursor-pointer opacity-0"
                                        @change="handleActivityFileSelect"
                                    />
                                    <div
                                        v-if="activityUploadFile"
                                        class="flex items-center justify-between"
                                    >
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30"
                                            >
                                                <FileSpreadsheet
                                                    class="h-5 w-5 text-green-600"
                                                />
                                            </div>
                                            <div>
                                                <p class="text-sm font-medium">
                                                    {{
                                                        activityUploadFile.name
                                                    }}
                                                </p>
                                                <p
                                                    class="text-xs text-muted-foreground"
                                                >
                                                    {{
                                                        formatFileSize(
                                                            activityUploadFile.size,
                                                        )
                                                    }}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            @click="clearActivityUploadFile"
                                            class="text-muted-foreground hover:text-destructive"
                                            ><X class="h-4 w-4"
                                        /></Button>
                                    </div>
                                    <div
                                        v-else
                                        class="flex flex-col items-center gap-2 text-center"
                                    >
                                        <div
                                            class="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
                                        >
                                            <Upload
                                                class="h-6 w-6 text-muted-foreground"
                                            />
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium">
                                                Drag & drop file Excel
                                            </p>
                                            <p
                                                class="text-xs text-muted-foreground"
                                            >
                                                atau klik untuk memilih
                                            </p>
                                            <p
                                                class="mt-1 text-xs text-muted-foreground"
                                            >
                                                Format: .xlsx, .xls, .csv (Max
                                                5MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Preview -->
                                <div
                                    v-if="
                                        activityPreviewData &&
                                        activityPreviewData.activities.length >
                                            0
                                    "
                                    class="space-y-3"
                                >
                                    <!-- Summary Cards -->
                                    <div class="grid grid-cols-4 gap-2">
                                        <div
                                            class="rounded-lg border bg-blue-50 p-2 text-center dark:bg-blue-950/20"
                                        >
                                            <p
                                                class="text-xs text-blue-600 dark:text-blue-400"
                                            >
                                                Kegiatan
                                            </p>
                                            <p
                                                class="text-lg font-bold text-blue-700 dark:text-blue-300"
                                            >
                                                {{
                                                    activityPreviewData.summary
                                                        .total_activities
                                                }}
                                            </p>
                                        </div>
                                        <div
                                            class="rounded-lg border bg-green-50 p-2 text-center dark:bg-green-950/20"
                                        >
                                            <p
                                                class="text-xs text-green-600 dark:text-green-400"
                                            >
                                                Item
                                            </p>
                                            <p
                                                class="text-lg font-bold text-green-700 dark:text-green-300"
                                            >
                                                {{
                                                    activityPreviewData.summary
                                                        .total_items
                                                }}
                                            </p>
                                        </div>
                                        <div
                                            class="rounded-lg border bg-purple-50 p-2 text-center dark:bg-purple-950/20"
                                        >
                                            <p
                                                class="text-xs text-purple-600 dark:text-purple-400"
                                            >
                                                Total
                                            </p>
                                            <p
                                                class="text-xs font-bold text-purple-700 dark:text-purple-300"
                                            >
                                                Rp
                                                {{
                                                    formatCurrency(
                                                        activityPreviewData
                                                            .summary
                                                            .grand_total,
                                                    )
                                                }}
                                            </p>
                                        </div>
                                        <div
                                            class="rounded-lg border p-2 text-center"
                                            :class="
                                                activityPreviewData.errors
                                                    .length > 0 ||
                                                (activityPreviewData.invalidActivities &&
                                                    activityPreviewData
                                                        .invalidActivities
                                                        .length > 0)
                                                    ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                                                    : 'bg-gray-50 dark:bg-gray-950/20'
                                            "
                                        >
                                            <p
                                                class="text-xs"
                                                :class="
                                                    activityPreviewData.errors
                                                        .length > 0 ||
                                                    (activityPreviewData.invalidActivities &&
                                                        activityPreviewData
                                                            .invalidActivities
                                                            .length > 0)
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                "
                                            >
                                                Tidak Valid
                                            </p>
                                            <p
                                                class="text-lg font-bold"
                                                :class="
                                                    activityPreviewData.errors
                                                        .length > 0 ||
                                                    (activityPreviewData.invalidActivities &&
                                                        activityPreviewData
                                                            .invalidActivities
                                                            .length > 0)
                                                        ? 'text-red-700 dark:text-red-300'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                "
                                            >
                                                {{
                                                    (activityPreviewData.errors
                                                        ?.length || 0) +
                                                    (activityPreviewData
                                                        .invalidActivities
                                                        ?.length || 0)
                                                }}
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Auto-Match Summary -->
                                    <div
                                        v-if="
                                            activityPreviewData.autoMatchSummary &&
                                            (activityPreviewData
                                                .autoMatchSummary.activities >
                                                0 ||
                                                activityPreviewData
                                                    .autoMatchSummary.items > 0)
                                        "
                                        class="rounded-md border bg-blue-50 p-2 dark:bg-blue-950/20"
                                    >
                                        <div
                                            class="flex items-center gap-2 text-xs"
                                        >
                                            <Info
                                                class="h-3 w-3 text-blue-600 dark:text-blue-400"
                                            /><span
                                                class="text-blue-700 dark:text-blue-300"
                                                >Auto-match:
                                                <span class="font-medium"
                                                    >{{
                                                        activityPreviewData
                                                            .autoMatchSummary
                                                            .activities
                                                    }}
                                                    kegiatan</span
                                                >
                                                &
                                                <span class="font-medium"
                                                    >{{
                                                        activityPreviewData
                                                            .autoMatchSummary
                                                            .items
                                                    }}
                                                    item</span
                                                ></span
                                            >
                                        </div>
                                    </div>

                                    <!-- Data Valid -->
                                    <div
                                        v-if="
                                            activityPreviewData.validActivities &&
                                            activityPreviewData.validActivities
                                                .length > 0
                                        "
                                        class="rounded-md border border-green-200 bg-green-50/50 p-3 dark:border-green-800 dark:bg-green-950/10"
                                    >
                                        <div
                                            class="mb-2 flex items-center justify-between"
                                        >
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <CheckCircle
                                                    class="h-4 w-4 text-green-600 dark:text-green-400"
                                                />
                                                <p
                                                    class="text-xs font-medium text-green-700 dark:text-green-400"
                                                >
                                                    Data Valid ({{
                                                        activityPreviewData
                                                            .validActivities
                                                            .length
                                                    }}
                                                    kegiatan)
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            class="max-h-32 space-y-1 overflow-y-auto"
                                        >
                                            <div
                                                v-for="(
                                                    a, i
                                                ) in activityPreviewData.validActivities"
                                                :key="'v' + i"
                                                class="flex items-center justify-between rounded bg-background px-2 py-1 text-xs"
                                            >
                                                <div
                                                    class="flex min-w-0 items-center gap-2"
                                                >
                                                    <span
                                                        class="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700"
                                                        >{{ i + 1 }}</span
                                                    >
                                                    <span class="truncate">{{
                                                        a.description ||
                                                        'Tanpa Deskripsi'
                                                    }}</span>
                                                    <span
                                                        v-if="a.activity_code"
                                                        class="text-muted-foreground"
                                                        >({{
                                                            a.activity_code
                                                        }})</span
                                                    >
                                                </div>
                                                <div
                                                    class="ml-2 flex flex-shrink-0 items-center gap-2"
                                                >
                                                    <span
                                                        class="text-muted-foreground"
                                                        >{{
                                                            a.items.length
                                                        }}
                                                        item</span
                                                    ><span class="font-medium"
                                                        >Rp
                                                        {{
                                                            formatCurrency(
                                                                a.total_amount,
                                                            )
                                                        }}</span
                                                    >
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Data Tidak Valid -->
                                    <div
                                        v-if="
                                            activityPreviewData.invalidActivities &&
                                            activityPreviewData
                                                .invalidActivities.length > 0
                                        "
                                        class="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20"
                                    >
                                        <div
                                            class="mb-2 flex items-center justify-between"
                                        >
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <AlertTriangle
                                                    class="h-4 w-4 text-amber-600 dark:text-amber-400"
                                                />
                                                <p
                                                    class="text-xs font-medium text-amber-700 dark:text-amber-400"
                                                >
                                                    Data Tidak Valid ({{
                                                        activityPreviewData
                                                            .invalidActivities
                                                            .length
                                                    }}
                                                    kegiatan) - tidak akan
                                                    diimport
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            class="max-h-48 space-y-2 overflow-y-auto"
                                        >
                                            <div
                                                v-for="(
                                                    a, i
                                                ) in activityPreviewData.invalidActivities"
                                                :key="'iv' + i"
                                                class="rounded bg-background px-3 py-2 text-xs"
                                            >
                                                <div
                                                    class="mb-1 flex items-center gap-2"
                                                >
                                                    <XCircle
                                                        class="h-4 w-4 flex-shrink-0 text-red-500"
                                                    />
                                                    <span
                                                        class="truncate font-medium"
                                                        >{{
                                                            a.description ||
                                                            'Tanpa Deskripsi'
                                                        }}</span
                                                    >
                                                    <span
                                                        v-if="a.activity_code"
                                                        class="flex-shrink-0 text-muted-foreground"
                                                        >({{
                                                            a.activity_code
                                                        }})</span
                                                    >
                                                </div>
                                                <div class="pl-6">
                                                    <p
                                                        class="text-red-600 dark:text-red-400"
                                                    >
                                                        {{ a.reason }}
                                                    </p>
                                                    <div
                                                        v-if="
                                                            a.invalidItems &&
                                                            a.invalidItems
                                                                .length > 0
                                                        "
                                                        class="mt-1.5 space-y-1"
                                                    >
                                                        <p
                                                            class="text-xs font-medium text-amber-700 dark:text-amber-400"
                                                        >
                                                            Item bermasalah ({{
                                                                a.invalidItems
                                                                    .length
                                                            }}):
                                                        </p>
                                                        <div
                                                            v-for="(
                                                                item, j
                                                            ) in a.invalidItems.slice(
                                                                0,
                                                                5,
                                                            )"
                                                            :key="j"
                                                            class="flex items-start gap-1.5 rounded bg-red-50/50 px-2 py-1 dark:bg-red-950/10"
                                                        >
                                                            <span
                                                                class="mt-0.5 flex-shrink-0 text-red-400"
                                                                >•</span
                                                            >
                                                            <div
                                                                class="min-w-0"
                                                            >
                                                                <span
                                                                    class="truncate text-muted-foreground"
                                                                    >{{
                                                                        item.description ||
                                                                        'Item tanpa nama'
                                                                    }}</span
                                                                ><span
                                                                    class="text-red-500"
                                                                >
                                                                    -
                                                                    {{
                                                                        item.reason
                                                                    }}</span
                                                                >
                                                            </div>
                                                        </div>
                                                        <p
                                                            v-if="
                                                                a.invalidItems
                                                                    .length > 5
                                                            "
                                                            class="pl-4 text-xs text-muted-foreground"
                                                        >
                                                            ...dan
                                                            {{
                                                                a.invalidItems
                                                                    .length - 5
                                                            }}
                                                            lainnya
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- All Valid -->
                                    <div
                                        v-if="
                                            activityPreviewData.errors
                                                .length === 0 &&
                                            (!activityPreviewData.invalidActivities ||
                                                activityPreviewData
                                                    .invalidActivities
                                                    .length === 0)
                                        "
                                        class="flex items-center justify-center gap-2 rounded-md bg-green-50 p-2 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400"
                                    >
                                        <CheckCircle class="h-4 w-4" /><span
                                            >Semua data valid dan siap
                                            diimport</span
                                        >
                                    </div>
                                </div>
                            </div>
                            <DialogFooter class="gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    @click="closeUploadDialog"
                                    >Batal</Button
                                >
                                <Button
                                    type="button"
                                    @click="previewActivityUploadFile"
                                    :disabled="!activityUploadFile"
                                    class="gap-2"
                                    ><Search class="h-4 w-4" /> Preview</Button
                                >
                                <Button
                                    type="button"
                                    @click="confirmUploadToForm"
                                    :disabled="
                                        !activityPreviewData ||
                                        !activityPreviewData.validActivities ||
                                        activityPreviewData.validActivities
                                            .length === 0
                                    "
                                    class="gap-2 bg-green-600 hover:bg-green-700"
                                    ><Check class="h-4 w-4" /> Import ({{
                                        activityPreviewData?.validActivities
                                            ?.length || 0
                                    }})</Button
                                >
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <!-- Loading -->
                    <div
                        v-if="isLoading"
                        class="flex items-center justify-center py-12"
                    >
                        <div class="text-center">
                            <div
                                class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
                            ></div>
                            <p class="text-sm text-muted-foreground">
                                Memuat data...
                            </p>
                        </div>
                    </div>

                    <!-- Activities Table -->
                    <div v-else class="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead class="w-12">No</TableHead>
                                    <TableHead class="w-100"
                                        >Kegiatan</TableHead
                                    >
                                    <TableHead class="w-32"
                                        >Tgl Mulai</TableHead
                                    >
                                    <TableHead class="w-32"
                                        >Tgl Selesai</TableHead
                                    >
                                    <TableHead class="w-40">Total</TableHead>
                                    <TableHead class="w-24">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <template
                                    v-for="(
                                        activity, index
                                    ) in budgetActivities"
                                    :key="activity.id"
                                >
                                    <TableRow
                                        :class="{
                                            'border-l-4 border-l-amber-500':
                                                activity.activity_id === 0 &&
                                                !isReadOnly,
                                        }"
                                    >
                                        <TableCell class="font-medium">{{
                                            index + 1
                                        }}</TableCell>
                                        <TableCell>
                                            <div class="relative">
                                                <ActivitySelect
                                                    v-model="
                                                        activity.activity_id
                                                    "
                                                    @select="
                                                        (s) =>
                                                            updateActivityData(
                                                                index,
                                                                s,
                                                            )
                                                    "
                                                    :disabled="isReadOnly"
                                                    :searchable="true"
                                                    :unit-id="formData.unit_id"
                                                    placeholder="Pilih Kode Kegiatan"
                                                />
                                                <div
                                                    v-if="
                                                        activity.activity_id ===
                                                            0 && !isReadOnly
                                                    "
                                                    class="mt-1 flex items-center gap-1 text-xs text-amber-600"
                                                >
                                                    <AlertCircle
                                                        class="h-3 w-3"
                                                    /><span
                                                        >Pilih kode
                                                        kegiatan</span
                                                    >
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell
                                            ><Input
                                                v-model="activity.start_date"
                                                type="date"
                                                class="w-full"
                                                :disabled="isReadOnly"
                                        /></TableCell>
                                        <TableCell
                                            ><Input
                                                v-model="activity.end_date"
                                                type="date"
                                                class="w-full"
                                                :disabled="isReadOnly"
                                        /></TableCell>
                                        <TableCell class="font-medium"
                                            >Rp
                                            {{
                                                formatCurrency(
                                                    activity.total_amount,
                                                )
                                            }}</TableCell
                                        >
                                        <TableCell>
                                            <div class="flex gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    @click="
                                                        toggleActivityDetail(
                                                            index,
                                                        )
                                                    "
                                                    ><ChevronDown
                                                        v-if="
                                                            !activity.showItems
                                                        "
                                                        class="h-4 w-4" /><ChevronUp
                                                        v-if="
                                                            activity.showItems
                                                        "
                                                        class="h-4 w-4"
                                                /></Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    @click="
                                                        removeActivity(index)
                                                    "
                                                    class="text-destructive hover:bg-destructive/10"
                                                    :disabled="isReadOnly"
                                                    ><Trash2 class="h-4 w-4"
                                                /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    <!-- Items -->
                                    <TableRow
                                        v-if="activity.showItems"
                                        class="bg-muted/50"
                                    >
                                        <TableCell colspan="7" class="p-4">
                                            <div class="pl-4">
                                                <div
                                                    class="mb-3 flex items-center justify-between"
                                                >
                                                    <h4
                                                        class="font-medium text-foreground"
                                                    >
                                                        Rincian Item:
                                                        <span
                                                            class="font-bold text-red-600 dark:text-red-400"
                                                            >{{
                                                                activity.description ||
                                                                'Belum diberi nama'
                                                            }}</span
                                                        >
                                                    </h4>
                                                    <Button
                                                        v-if="!isReadOnly"
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        @click="
                                                            addNewActivityItem(
                                                                index,
                                                            )
                                                        "
                                                        class="gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                                        ><Plus
                                                            class="h-3 w-3"
                                                        />
                                                        Tambah Item</Button
                                                    >
                                                </div>
                                                <div
                                                    class="rounded-md border bg-background"
                                                >
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead
                                                                    class="w-12"
                                                                    >No</TableHead
                                                                >
                                                                <TableHead
                                                                    class="w-100"
                                                                    >Item
                                                                    Anggaran</TableHead
                                                                >
                                                                <TableHead
                                                                    class="w-28"
                                                                    >Volume</TableHead
                                                                >
                                                                <TableHead
                                                                    class="w-48"
                                                                    >Satuan</TableHead
                                                                >
                                                                <TableHead
                                                                    class="w-40"
                                                                    >Biaya</TableHead
                                                                >
                                                                <TableHead
                                                                    class="w-40"
                                                                    >Total</TableHead
                                                                >
                                                                <TableHead
                                                                    class="w-32"
                                                                    >Aksi</TableHead
                                                                >
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            <template
                                                                v-for="(
                                                                    item,
                                                                    itemIndex
                                                                ) in activity.request_items"
                                                                :key="item.id"
                                                            >
                                                                <TableRow
                                                                    :class="{
                                                                        'border-l-4 border-l-amber-500':
                                                                            item.activity_item_id ===
                                                                                null &&
                                                                            !isReadOnly,
                                                                    }"
                                                                >
                                                                    <TableCell
                                                                        class="font-medium"
                                                                        >{{
                                                                            itemIndex +
                                                                            1
                                                                        }}</TableCell
                                                                    >
                                                                    <TableCell>
                                                                        <div
                                                                            class="relative"
                                                                        >
                                                                            <ActivityItemSelect
                                                                                v-model="
                                                                                    item.activity_item_id
                                                                                "
                                                                                @select="
                                                                                    (
                                                                                        s,
                                                                                    ) =>
                                                                                        updateActivityItem(
                                                                                            index,
                                                                                            itemIndex,
                                                                                            s,
                                                                                        )
                                                                                "
                                                                                :disabled="
                                                                                    isReadOnly
                                                                                "
                                                                                :searchable="
                                                                                    true
                                                                                "
                                                                                placeholder="Pilih item"
                                                                                class="w-full"
                                                                            />
                                                                            <div
                                                                                v-if="
                                                                                    item.activity_item_id ===
                                                                                        null &&
                                                                                    !isReadOnly
                                                                                "
                                                                                class="mt-1 flex items-center gap-1 text-xs text-amber-600"
                                                                            >
                                                                                <AlertCircle
                                                                                    class="h-3 w-3"
                                                                                /><span
                                                                                    >Pilih
                                                                                    item</span
                                                                                >
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell
                                                                        ><Input
                                                                            v-model="
                                                                                item.quantity
                                                                            "
                                                                            type="number"
                                                                            min="0"
                                                                            @input="
                                                                                debouncedCalculateItemTotal(
                                                                                    activity.id,
                                                                                    item.id,
                                                                                )
                                                                            "
                                                                            class="w-full"
                                                                            :disabled="
                                                                                isReadOnly ||
                                                                                hasVendorType(
                                                                                    item,
                                                                                )
                                                                            "
                                                                    /></TableCell>
                                                                    <TableCell
                                                                        ><Input
                                                                            v-model="
                                                                                item.unit_measure_name
                                                                            "
                                                                            placeholder="-"
                                                                            class="w-full bg-muted"
                                                                            readonly
                                                                    /></TableCell>
                                                                    <TableCell>
                                                                        <div
                                                                            class="relative"
                                                                        >
                                                                            <span
                                                                                class="absolute top-2 left-3 text-muted-foreground"
                                                                                >Rp</span
                                                                            ><Input
                                                                                :model-value="
                                                                                    formatPrice(
                                                                                        item.unit_price,
                                                                                    )
                                                                                "
                                                                                type="text"
                                                                                placeholder="0"
                                                                                @input="
                                                                                    handleUnitPrice(
                                                                                        $event,
                                                                                        activity.id,
                                                                                        item,
                                                                                    )
                                                                                "
                                                                                class="w-full pl-10"
                                                                                :disabled="
                                                                                    isReadOnly ||
                                                                                    hasVendorType(
                                                                                        item,
                                                                                    )
                                                                                "
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell
                                                                        class="font-medium"
                                                                        >Rp
                                                                        {{
                                                                            formatCurrency(
                                                                                item.total_price,
                                                                            )
                                                                        }}</TableCell
                                                                    >
                                                                    <TableCell>
                                                                        <div
                                                                            class="flex gap-1"
                                                                        >
                                                                            <Button
                                                                                v-if="
                                                                                    hasVendorType(
                                                                                        item,
                                                                                    )
                                                                                "
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                @click="
                                                                                    toggleGoodsPanel(
                                                                                        index,
                                                                                        itemIndex,
                                                                                    )
                                                                                "
                                                                                class="gap-1"
                                                                                :class="
                                                                                    showGoodsPanel &&
                                                                                    currentActivityIndex ===
                                                                                        index &&
                                                                                    currentItemIndex ===
                                                                                        itemIndex
                                                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                                        : 'border-blue-300 text-blue-600'
                                                                                "
                                                                            >
                                                                                <Package
                                                                                    class="h-3 w-3"
                                                                                /><span
                                                                                    class="text-xs"
                                                                                    >Barang</span
                                                                                ><span
                                                                                    v-if="
                                                                                        item
                                                                                            .goods
                                                                                            ?.length
                                                                                    "
                                                                                    class="ml-1 rounded-full bg-blue-100 px-1.5 text-xs font-medium"
                                                                                    >{{
                                                                                        item
                                                                                            .goods
                                                                                            .length
                                                                                    }}</span
                                                                                >
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                @click="
                                                                                    removeActivityItem(
                                                                                        index,
                                                                                        itemIndex,
                                                                                    )
                                                                                "
                                                                                class="text-destructive hover:bg-destructive/10"
                                                                                :disabled="
                                                                                    isReadOnly
                                                                                "
                                                                                ><Trash2
                                                                                    class="h-3 w-3"
                                                                            /></Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </template>
                                                            <TableRow
                                                                v-if="
                                                                    activity
                                                                        .request_items
                                                                        .length ===
                                                                    0
                                                                "
                                                                ><TableCell
                                                                    colspan="7"
                                                                    class="py-4 text-center text-muted-foreground"
                                                                    >Belum ada
                                                                    item.</TableCell
                                                                ></TableRow
                                                            >
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                                <div class="mt-4 border-t pt-4">
                                                    <div
                                                        class="mb-3 flex items-center gap-2"
                                                    >
                                                        <Target
                                                            class="h-4 w-4 text-muted-foreground"
                                                        />
                                                        <h4
                                                            class="font-medium text-foreground"
                                                        >
                                                            Indikator Output
                                                        </h4>
                                                    </div>
                                                    <Textarea
                                                        v-model="
                                                            activity.output_indicator
                                                        "
                                                        placeholder="Isikan indikator output"
                                                        :disabled="isReadOnly"
                                                        class="min-h-[80px] resize-none"
                                                        rows="3"
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </template>
                                <TableRow v-if="budgetActivities.length === 0">
                                    <TableCell
                                        colspan="7"
                                        class="py-8 text-center text-muted-foreground"
                                        ><div
                                            class="flex flex-col items-center gap-2"
                                        >
                                            <ListChecks class="h-8 w-8" />
                                            <p>Belum ada kegiatan.</p>
                                        </div></TableCell
                                    >
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    <!-- Summary -->
                    <div class="mt-6 flex justify-end">
                        <div
                            class="w-80 space-y-3 rounded-lg border bg-muted p-4"
                        >
                            <div class="flex justify-between">
                                <span class="text-muted-foreground"
                                    >Jumlah Kegiatan:</span
                                ><span class="font-medium">{{
                                    budgetActivities.length
                                }}</span>
                            </div>
                            <div class="flex justify-between border-t pt-2">
                                <span class="text-lg font-medium">Total:</span
                                ><span class="text-lg font-bold text-primary"
                                    >Rp {{ formatCurrency(totalBudget) }}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-end space-x-3 border-t pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        @click="goBack"
                        class="gap-2"
                        ><ArrowLeft class="h-4 w-4" /> Kembali</Button
                    >
                    <div
                        v-if="!isReadOnly && !isLoading"
                        class="flex space-x-2"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            @click="resetForm"
                            :disabled="isPosting"
                            ><RotateCcw class="h-4 w-4" /> Reset</Button
                        >
                        <Button
                            v-if="
                                mode === 'create' ||
                                formData.status?.toUpperCase() === 'DRAFT'
                            "
                            type="button"
                            variant="default"
                            @click="saveAsDraft"
                            :disabled="isPosting"
                            ><Save class="h-4 w-4" /> Simpan Draft</Button
                        >
                        <Button
                            type="submit"
                            class="gap-2 bg-green-600 text-white hover:bg-green-700"
                            :disabled="isPosting"
                            ><Send class="h-4 w-4" />
                            {{ isPosting ? 'Menyimpan...' : 'Ajukan' }}</Button
                        >
                    </div>
                </div>
            </form>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/AppLayout.vue';
import AcademicPeriodSelect from '@/pages/masterdata/components/AcademicPeriodSelect.vue';
import ActivityItemSelect from '@/pages/masterdata/components/ActivityItemSelect.vue';
import ActivitySelect from '@/pages/masterdata/components/ActivitySelect.vue';
import BudgetCategorySelect from '@/pages/masterdata/components/BudgetCategorySelect.vue';
import FiscalYearSelect from '@/pages/masterdata/components/FiscalYearSelect.vue';
import UnitSelect from '@/pages/masterdata/components/UnitSelect.vue';
import { BreadcrumbItem } from '@/types';
import { ActivityItem } from '@/types/datamaster';
import { router } from '@inertiajs/vue3';
import axios from 'axios';
import { debounce } from 'lodash';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CalendarDays,
    Check,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Download,
    FileSpreadsheet,
    Info,
    ListChecks,
    Package,
    Plus,
    RotateCcw,
    Save,
    Search,
    Send,
    Target,
    Trash2,
    Upload,
    X,
    XCircle,
} from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import * as XLSX from 'xlsx';

// Types
interface BudgetRequestDetail {
    id: number;
    description: string;
    activity_item_id: number | null;
    quantity: number;
    unit_measure_id?: number | null;
    unit_price: number;
    total_price: number;
    unit_measure_name?: string;
    trans_type_group?: string;
    goods?: any[];
}
interface BudgetActivity {
    id: number;
    activity_id: number;
    description: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    showItems: boolean;
    request_items: BudgetRequestDetail[];
    files: any[];
    output_indicator: string;
}
interface BudgetRequestHeader {
    id?: number;
    request_no: string;
    request_date: string;
    fiscal_year_id: number;
    academic_period_id: number;
    unit_id: number;
    budget_type: string;
    budget_category_id: number;
    sub_budget_category_id: number;
    description: string;
    status: string;
    status_display: string;
    total_amount: number;
}

const props = defineProps<{ id?: number | string }>();

// State
const mode = ref<'create' | 'edit' | 'view'>('create');
const isPosting = ref(false);
const isLoading = ref(false);
const cachedActivities = ref<any[]>([]);
const cachedActivityItems = ref<any[]>([]);
const cacheLoaded = ref(false);
const showUploadDialog = ref(false);
const isUploadDragOver = ref(false);
const activityUploadFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const uploadDropzoneRef = ref<HTMLDivElement | null>(null);
const activityPreviewData = ref<any>(null);

const getTodayDate = () => new Date().toISOString().split('T')[0];
const formData = ref<BudgetRequestHeader>({
    request_no: '',
    request_date: getTodayDate(),
    fiscal_year_id: 0,
    academic_period_id: 0,
    unit_id: 0,
    budget_type: '',
    budget_category_id: 0,
    sub_budget_category_id: 0,
    description: '',
    status: 'draft',
    status_display: 'Draft',
    total_amount: 0,
});
const budgetActivities = ref<BudgetActivity[]>([]);
let activityIdCounter = 1,
    detailIdCounter = 1;

const isReadOnly = computed(
    () =>
        mode.value !== 'create' &&
        !['DRAFT', 'RETURNED'].includes(formData.value.status?.toUpperCase()),
);
const budgetTypeOptions = [
    { value: 'budgeter', label: 'Budgeter' },
    { value: 'non_budgeter', label: 'Non Budgeter' },
];
const currentDate = computed(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
});
const statusDescription = computed(
    () =>
        ({
            DRAFT: 'Penyusunan',
            SUBMITTED: 'Menunggu persetujuan',
            APPROVED: 'Disetujui',
            RETURNED: 'Perlu revisi',
            REJECTED: 'Ditolak',
        })[(formData.value.status ?? 'DRAFT').toUpperCase()] || '',
);
const totalBudget = computed(() =>
    budgetActivities.value
        .reduce((s, a) => s + (parseFloat(String(a.total_amount)) || 0), 0)
        .toFixed(2),
);
const hasVendorType = (item: BudgetRequestDetail) =>
    item.trans_type_group?.toUpperCase() === 'VENDOR';

const formatCurrency = (v: number | string) =>
    new Intl.NumberFormat('id-ID').format(
        typeof v === 'string' ? parseFloat(v) : v || 0,
    );
const formatFileSize = (b: number) => {
    if (!b) return '0 B';
    const k = 1024,
        s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + s[i];
};
const formatDateForActivityInput = () => {
    const t = new Date(),
        n = new Date();
    n.setDate(t.getDate() + 7);
    return {
        today: t.toISOString().split('T')[0],
        nextWeek: n.toISOString().split('T')[0],
    };
};
const debouncedCalculateItemTotal = debounce((aid: number, iid: number) => {
    const a = budgetActivities.value.find((x) => x.id === aid);
    if (a) {
        const it = a.request_items.find((x) => x.id === iid);
        if (it) {
            it.total_price =
                (parseFloat(String(it.quantity)) || 0) *
                (parseFloat(String(it.unit_price)) || 0);
            const ta = a.request_items.reduce(
                (s, x) => s + (Number(x.total_price) || 0),
                0,
            );
            a.total_amount = ta;
        }
    }
}, 300);
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { title: 'Dashboard', href: 'dashboard' },
    { title: 'Perencanaan Anggaran', href: '/perencanaan-anggaran' },
    { title: mode.value === 'create' ? 'Baru' : 'Detail', href: '' },
]);

// Cache
const loadSelectCache = async () => {
    if (cacheLoaded.value) return;
    try {
        const [a, b] = await Promise.all([
            axios.get('/api/v1/select/activities', {
                params: { unit_id: formData.value.unit_id, all: true },
            }),
            axios.get('/api/v1/select/activity-items', {
                params: { all: true },
            }),
        ]);
        cachedActivities.value = a.data?.data || [];
        cachedActivityItems.value = b.data?.data || [];
        cacheLoaded.value = true;
    } catch (e) {}
};
const findActivityByCode = (code: string) => {
    if (!code || !cachedActivities.value.length) return null;
    const nc = code.trim().toUpperCase();
    const f = cachedActivities.value.find(
        (x: any) =>
            (x.code || x.activity_code || '').trim().toUpperCase() === nc,
    );
    if (f)
        return { id: f.id, name: f.name || f.activity_name || f.label || '' };
    const p = cachedActivities.value.find((x: any) => {
        const c = (x.code || x.activity_code || '').trim().toUpperCase();
        return c.includes(nc) || nc.includes(c);
    });
    return p
        ? { id: p.id, name: p.name || p.activity_name || p.label || '' }
        : null;
};
const findActivityItemByCode = (code: string) => {
    if (!code || !cachedActivityItems.value.length) return null;
    const nc = code.trim().toUpperCase();
    const f = cachedActivityItems.value.find(
        (x: any) => (x.code || x.item_code || '').trim().toUpperCase() === nc,
    );
    if (f)
        return {
            id: f.id,
            item_name: f.item_name || f.name || '',
            unit_measure_id: f.unit_measure_id || 0,
            unit_measure_name:
                f.unit_measure?.name || f.unit_measure_name || '',
            estimation_price: f.estimation_price || f.unit_price || 0,
            trans_type_group: f.trans_type?.group_code || '',
        };
    const p = cachedActivityItems.value.find((x: any) => {
        const c = (x.code || x.item_code || '').trim().toUpperCase();
        return c.includes(nc) || nc.includes(c);
    });
    return p
        ? {
              id: p.id,
              item_name: p.item_name || p.name || '',
              unit_measure_id: p.unit_measure_id || 0,
              unit_measure_name:
                  p.unit_measure?.name || p.unit_measure_name || '',
              estimation_price: p.estimation_price || p.unit_price || 0,
              trans_type_group: p.trans_type?.group_code || '',
          }
        : null;
};

// Upload Dialog
const openUploadDialog = () => {
    showUploadDialog.value = true;
    activityUploadFile.value = null;
    activityPreviewData.value = null;
};
const closeUploadDialog = () => {
    showUploadDialog.value = false;
    activityUploadFile.value = null;
    activityPreviewData.value = null;
};
const handleUploadDrop = (e: DragEvent) => {
    isUploadDragOver.value = false;
    const f = e.dataTransfer?.files?.[0];
    if (f && validateActivityFileType(f)) {
        activityUploadFile.value = f;
        activityPreviewData.value = null;
    }
};
const handleActivityFileSelect = (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f && validateActivityFileType(f)) {
        activityUploadFile.value = f;
        activityPreviewData.value = null;
    }
    (e.target as HTMLInputElement).value = '';
};
const validateActivityFileType = (f: File) => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
        toast.warning('Format tidak valid');
        return false;
    }
    if (f.size > 5 * 1024 * 1024) {
        toast.warning('Max 5MB');
        return false;
    }
    return true;
};
const clearActivityUploadFile = () => {
    activityUploadFile.value = null;
    activityPreviewData.value = null;
};

const parseExcelDate = (v: any): string => {
    if (!v) return '';
    if (typeof v === 'number') {
        try {
            const d = XLSX.SSF.parse_date_code(v);
            if (d)
                return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
        } catch {}
    }
    const s = String(v).trim();
    const p = new Date(s);
    return !isNaN(p.getTime()) ? p.toISOString().split('T')[0] : s;
};

const previewActivityUploadFile = async () => {
    if (!activityUploadFile.value) return;
    try {
        const data = await new Promise<any[][]>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const d = new Uint8Array(e.target!.result as ArrayBuffer);
                    const wb = XLSX.read(d, { type: 'array' });
                    resolve(
                        XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
                            header: 1,
                            defval: '',
                            blankrows: false,
                        }) as any[][],
                    );
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Gagal membaca'));
            reader.readAsArrayBuffer(activityUploadFile.value!);
        });
        activityPreviewData.value = processData(data);
        toast.success('Data berhasil dipreview');
    } catch {
        toast.error('Gagal membaca file');
    }
};

const processData = (rows: any[][]) => {
    const all: any[] = [],
        valid: any[] = [],
        invalid: any[] = [],
        errs: string[] = [];
    let cur: any = null,
        tAct = 0,
        tItm = 0,
        gTotal = 0,
        mAct = 0,
        mItm = 0;
    let sr = 0;
    if (
        rows.length &&
        rows[0].some((c: any) =>
            ['kegiatan', 'activity', 'item', 'volume', 'harga'].some((k) =>
                String(c).toLowerCase().includes(k),
            ),
        )
    )
        sr = 1;

    for (let i = sr; i < rows.length; i++) {
        const r = rows[i];
        if (!r || r.every((c: any) => !c && c !== 0)) continue;
        try {
            const hasAct =
                (r[0] && String(r[0]).trim()) || (r[1] && String(r[1]).trim());
            if (hasAct && !cur) {
                cur = {
                    activity_id: 0,
                    activity_code: r[0] ? String(r[0]).trim() : '',
                    description: r[1] ? String(r[1]).trim() : '',
                    output_indicator: r[2] ? String(r[2]).trim() : '',
                    start_date: parseExcelDate(r[3]),
                    end_date: parseExcelDate(r[4]),
                    total_amount: 0,
                    items: [],
                    errors: [],
                    isValid: true,
                };
                tAct++;
            } else if (hasAct && cur) {
                finalizeAct(cur, valid, invalid, all);
                cur = {
                    activity_id: 0,
                    activity_code: r[0] ? String(r[0]).trim() : '',
                    description: r[1] ? String(r[1]).trim() : '',
                    output_indicator: r[2] ? String(r[2]).trim() : '',
                    start_date: parseExcelDate(r[3]),
                    end_date: parseExcelDate(r[4]),
                    total_amount: 0,
                    items: [],
                    errors: [],
                    isValid: true,
                };
                tAct++;
            } else if (!hasAct && !cur) continue;

            if (cur) {
                const ic = r[5] ? String(r[5]).trim() : '';
                const id = r[6] ? String(r[6]).trim() : '';
                if (!ic && !id) continue;
                const vol = parseFloat(r[7]) || 0,
                    prc = parseFloat(r[8]) || 0,
                    tot = vol * prc;
                const iErrs: string[] = [];
                let matched = false;
                if (ic) {
                    if (cachedActivityItems.value.length > 0) {
                        const m = findActivityItemByCode(ic);
                        if (m) {
                            matched = true;
                            mItm++;
                        } else
                            iErrs.push(
                                `Kode item "${ic}" tidak ditemukan di master data`,
                            );
                    }
                } else {
                    iErrs.push('Kode item kosong');
                }
                if (!id) iErrs.push('Deskripsi item kosong');
                if (vol <= 0) iErrs.push('Volume harus > 0');
                if (prc < 0) iErrs.push('Harga tidak boleh negatif');
                if (!r[9] || !String(r[9]).trim()) iErrs.push('Satuan kosong');

                cur.items.push({
                    id: -detailIdCounter++,
                    activity_item_id: null,
                    item_code: ic,
                    description: id,
                    unit_measure_name: r[9] ? String(r[9]).trim() : '',
                    quantity: vol,
                    unit_price: prc,
                    total_price: tot,
                    trans_type_group: '',
                    goods: [],
                    isValid: iErrs.length === 0,
                    errors: iErrs,
                    matched,
                });
                cur.total_amount += tot;
                tItm++;
                gTotal += tot;
            }
        } catch (e) {
            errs.push(`Baris ${i + 1}: ${(e as Error).message}`);
        }
    }
    if (cur) finalizeAct(cur, valid, invalid, all);

    // Validate activity codes
    all.forEach((a) => {
        if (a.activity_code && cachedActivities.value.length > 0) {
            const m = findActivityByCode(a.activity_code);
            if (m) {
                mAct++;
                a.matched = true;
            } else {
                if (!a.errors) a.errors = [];
                a.errors.push(
                    `Kode kegiatan "${a.activity_code}" tidak ditemukan di master data`,
                );
                a.isValid = false;
                const vi = valid.findIndex((x: any) => x === a);
                if (vi >= 0) {
                    valid.splice(vi, 1);
                    a.reason = a.errors.slice(0, 2).join('; ');
                    invalid.push(a);
                }
            }
        }
    });

    return {
        activities: all,
        validActivities: valid,
        invalidActivities: invalid,
        summary: {
            total_activities: tAct,
            total_items: tItm,
            grand_total: gTotal,
        },
        autoMatchSummary: { activities: mAct, items: mItm },
        errors: errs,
    };
};

const finalizeAct = (act: any, valid: any[], invalid: any[], all: any[]) => {
    all.push(act);
    const errs: string[] = [];
    if (!act.description) errs.push('Deskripsi kegiatan kosong');
    if (act.items.length === 0) errs.push('Tidak memiliki item');
    const invItms = act.items.filter((it: any) => !it.isValid);
    invItms.forEach((it: any) =>
        it.errors.forEach((e: string) =>
            errs.push(`Item "${it.description || 'Tanpa deskripsi'}": ${e}`),
        ),
    );
    if (errs.length > 0) {
        act.isValid = false;
        act.errors = errs;
        act.reason =
            errs.slice(0, 2).join('; ') +
            (errs.length > 2 ? ` (+${errs.length - 2})` : '');
        act.invalidItems = invItms.map((it: any) => ({
            description: it.description || 'Tanpa deskripsi',
            reason: it.errors.join(', '),
        }));
        invalid.push(act);
    } else {
        act.isValid = true;
        act.errors = [];
        act.invalidItems = [];
        valid.push(act);
    }
};

const confirmUploadToForm = async () => {
    if (!activityPreviewData.value) {
        toast.warning('Tidak ada data');
        return;
    }

    const toImport = activityPreviewData.value.validActivities || [];
    if (toImport.length === 0) {
        toast.warning(
            `Tidak ada data valid. ${(activityPreviewData.value.invalidActivities || []).length} kegiatan bermasalah.`,
        );
        return;
    }

    if (!cacheLoaded.value) await loadSelectCache();

    const dates = formatDateForActivityInput();
    let imported = 0,
        mAct = 0,
        mItm = 0;
    const skipped = (activityPreviewData.value.invalidActivities || []).length;

    for (const ua of toImport) {
        let aid = 0,
            adesc = ua.description;

        if (ua.activity_code && cachedActivities.value.length) {
            const m = findActivityByCode(ua.activity_code);
            if (m) {
                aid = m.id;
                adesc = m.name;
                mAct++;
            }
        }
        const vItems = ua.items.filter((it: any) => it.isValid !== false);
        const pItems = vItems.map((it: any) => {
            let iid: number | null = null,
                idesc = it.description,
                umid: number | null = null,
                umn = it.unit_measure_name || '',
                up = it.unit_price,
                ttg = '';
                
            if (it.item_code && cachedActivityItems.value.length) {
                const mi = findActivityItemByCode(it.item_code);
                if (mi) {
                    iid = mi.id;
                    idesc = mi.item_name;
                    umid = mi.unit_measure_id;
                    umn = mi.unit_measure_name || umn;
                    up = up || mi.estimation_price;
                    ttg = mi.trans_type_group;
                    mItm++;
                }
            }
            return {
                id: it.id || -detailIdCounter++,
                activity_item_id: iid,
                description: idesc,
                quantity: it.quantity,
                unit_measure_id: umid,
                unit_price: up,
                total_price: it.total_price,
                unit_measure_name: umn,
                trans_type_group: ttg,
                goods: [],
            };
        });
        budgetActivities.value.unshift({
            id: -activityIdCounter++,
            activity_id: aid,
            description: adesc,
            start_date: ua.start_date || dates.today,
            end_date: ua.end_date || dates.nextWeek,
            total_amount: pItems.reduce(
                (s: number, x: any) => s + (x.total_price || 0),
                0,
            ),
            showItems: aid === 0,
            request_items: pItems,
            files: [],
            output_indicator: ua.output_indicator || '',
        });
        imported++;
    }
    closeUploadDialog();
    const details: string[] = [];
    if (mAct > 0) details.push(`${mAct} kegiatan auto-match`);
    if (mItm > 0) details.push(`${mItm} item auto-match`);
    if (imported - mAct > 0)
        details.push(`${imported - mAct} kegiatan perlu dipilih manual`);
    if (skipped > 0) details.push(`${skipped} kegiatan tidak valid dilewati`);
    toast.success(`Import ${imported} kegiatan`, {
        description: details.join(' • '),
        duration: 6000,
    });
};

const downloadActivityTemplate = () => {
    try {
        const wb = XLSX.utils.book_new();
        const td = [
            [
                'Kode Kegiatan*',
                'Deskripsi',
                'Output',
                'Tgl Mulai',
                'Tgl Selesai',
                'Kode Item*',
                'Deskripsi Item',
                'Volume',
                'Harga',
                'Satuan',
            ],
            [
                'TR001',
                'Pelatihan',
                '100 peserta',
                '2024-01-01',
                '2024-12-31',
                'ITM001',
                'Modul',
                100,
                50000,
                'PCS',
            ],
        ];
        const ws = XLSX.utils.aoa_to_sheet(td);
        ws['!cols'] = [
            { wch: 18 },
            { wch: 35 },
            { wch: 30 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 30 },
            { wch: 12 },
            { wch: 18 },
            { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, 'template_kegiatan_item.xlsx');
        toast.success('Template diunduh');
    } catch {
        toast.error('Gagal');
    }
};

// Activity CRUD
const addNewActivity = () => {
    const d = formatDateForActivityInput();
    budgetActivities.value.unshift({
        id: -activityIdCounter++,
        activity_id: 0,
        description: '',
        start_date: d.today,
        end_date: d.nextWeek,
        total_amount: 0,
        showItems: true,
        request_items: [],
        files: [],
        output_indicator: '',
    });
};
const removeActivity = (i: number) => {
    if (confirm('Hapus?')) budgetActivities.value.splice(i, 1);
};
const toggleActivityDetail = (i: number) => {
    budgetActivities.value[i].showItems = !budgetActivities.value[i].showItems;
};
const updateActivityData = (
    i: number,
    s: { id: number; name: string } | null,
) => {
    if (s) {
        budgetActivities.value[i].activity_id = s.id;
        budgetActivities.value[i].description = s.name;
    } else {
        budgetActivities.value[i].activity_id = 0;
        budgetActivities.value[i].description = '';
    }
};
const addNewActivityItem = (ai: number) => {
    budgetActivities.value[ai].request_items.push({
        id: -detailIdCounter++,
        activity_item_id: null,
        description: '',
        quantity: 1,
        unit_measure_id: 0,
        unit_price: 0,
        total_price: 0,
        trans_type_group: '',
        goods: [],
    });
};
const removeActivityItem = (ai: number, ii: number) => {
    if (confirm('Hapus?')) {
        budgetActivities.value[ai].request_items.splice(ii, 1);
    }
};
const updateActivityItem = (ai: number, ii: number, s: ActivityItem | null) => {
    const it = budgetActivities.value[ai].request_items[ii];
    if (s) {
        it.activity_item_id = s.id;
        it.description = s.item_name;
        it.unit_measure_id = s.unit_measure_id;
        it.unit_price = s.estimation_price;
        it.unit_measure_name = s.unit_measure?.name;
        it.trans_type_group = s.trans_type?.group_code || '';
    } else {
        it.activity_item_id = null;
        it.description = '';
        it.unit_measure_id = null;
        it.unit_measure_name = '';
        it.unit_price = 0;
        it.trans_type_group = '';
    }
    debouncedCalculateItemTotal(budgetActivities.value[ai].id, it.id);
};
const handleUnitPrice = (e: Event, aid: number, item: any) => {
    item.unit_price = (e.target as HTMLInputElement).value
        .replace(/\D/g, '')
        .slice(0, 15);
    debouncedCalculateItemTotal(aid, item.id);
};
const formatPrice = (v: string | number): string => {
    if (!v && v !== 0) return '';
    const c = String(v).replace(/\D/g, '');
    return c ? Number(c).toLocaleString('id-ID') : '';
};

// Form
const buildFormData = () => {
    const fd = new FormData();
    fd.append('request_date', String(formData.value.request_date));
    fd.append('fiscal_year_id', String(formData.value.fiscal_year_id));
    fd.append('academic_period_id', String(formData.value.academic_period_id));
    fd.append('unit_id', String(formData.value.unit_id));
    fd.append('budget_type', String(formData.value.budget_type));
    fd.append('budget_category_id', String(formData.value.budget_category_id));
    fd.append(
        'sub_budget_category_id',
        String(formData.value.sub_budget_category_id),
    );
    fd.append('notes', formData.value.description ?? '');
    fd.append('total_amount', String(totalBudget.value));
    const sa = budgetActivities.value.map((a, ai) => ({
        id: a.id > 0 ? a.id : null,
        activity_id: a.activity_id,
        description: a.description ?? '',
        start_date: a.start_date ?? '',
        end_date: a.end_date ?? '',
        total_amount: a.total_amount,
        output_indicator: a.output_indicator ?? '',
        documents: (a.files || []).map((f: any, fi: number) => {
            if (!f.isExisting)
                fd.append(`activity_files[${ai}][${fi}]`, f.file, f.name);
            return {
                id: f.isExisting ? f.id : null,
                document_name: f.name,
                file_name: f.name,
                isExisting: f.isExisting,
                file_path: f.isExisting ? (f.url ?? '') : '',
                file_size: f.size ?? 0,
                file_type: f.type ?? '',
            };
        }),
        request_items: (a.request_items || []).map((it) => ({
            id: it.id > 0 ? it.id : null,
            activity_item_id: it.activity_item_id,
            description: it.description,
            volume: it.quantity,
            unit_measure_id: it.unit_measure_id,
            unit_price: it.unit_price,
            total_amount: it.total_price,
            goods: (it.goods || [])
                .filter((g: any) => g?.item_name?.trim())
                .map((g: any) => ({
                    id: g.id > 0 ? g.id : null,
                    item_name: g.item_name,
                    goods_type: g.goods_type || 'bhp',
                    specification: g.specification || '',
                    brand: g.brand || '',
                    quantity: g.quantity || 1,
                    unit_measure: g.unit_measure || '',
                    unit_price: g.unit_price || 0,
                    subtotal: g.subtotal || g.quantity * g.unit_price,
                    notes: g.notes || '',
                })),
        })),
    }));
    fd.append('budget_request_activities_json', JSON.stringify(sa));
    return fd;
};

const validateForm = () => {
    const rf = [
        'unit_id',
        'fiscal_year_id',
        'academic_period_id',
        'budget_type',
        'budget_category_id',
        'description',
    ];
    const fl: Record<string, string> = {
        unit_id: 'Unit',
        fiscal_year_id: 'Tahun Anggaran',
        academic_period_id: 'Periode Akademik',
        budget_type: 'Tipe Anggaran',
        budget_category_id: 'Kategori',
        description: 'Deskripsi',
    };
    for (const f of rf)
        if (!formData.value[f as keyof BudgetRequestHeader]) {
            toast.info(`${fl[f]} harus diisi!`);
            return false;
        }
    if (!budgetActivities.value.length) {
        toast.info('Minimal 1 kegiatan!');
        return false;
    }
    for (const a of budgetActivities.value) {
        if (!a.activity_id) {
            toast.info('Kode kegiatan harus dipilih!');
            return false;
        }
        if (!a.start_date || !a.end_date) {
            toast.info('Tanggal harus diisi!');
            return false;
        }
        if (!a.output_indicator?.trim()) {
            toast.info('Indikator output harus diisi!');
            return false;
        }
        if (!a.request_items.length) {
            toast.info('Minimal 1 item!');
            return false;
        }
        for (const it of a.request_items) {
            if (it.activity_item_id === null) {
                toast.info('Item harus dipilih!');
                return false;
            }
            if ((it.quantity || 0) <= 0 && !hasVendorType(it)) {
                toast.info('Volume > 0!');
                return false;
            }
        }
    }
    return true;
};

const saveAsDraft = async () => {
    if (!validateForm()) return;
    isPosting.value = true;
    try {
        const fd = buildFormData(),
            cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
        if (mode.value === 'create') {
            const r = await axios.post('/api/v1/budget-requests', fd, cfg);
            toast.info('Draft disimpan');
            if (r.data?.data?.id) {
                formData.value.id = r.data.data.id;
                mode.value = 'edit';
            }
            router.visit('/perencanaan-anggaran');
        } else {
            await axios.post(
                `/api/v1/budget-requests/${formData.value.id}?_method=PUT`,
                fd,
                cfg,
            );
            toast.info('Draft diperbarui');
        }
    } catch (e: any) {
        toast.error(e.response?.data?.message || 'Gagal');
    } finally {
        isPosting.value = false;
    }
};
const submitForm = async () => {
    if (!validateForm()) return;
    isPosting.value = true;
    try {
        let id = formData.value.id;
        const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
        if (mode.value === 'create') {
            const r = await axios.post(
                '/api/v1/budget-requests',
                buildFormData(),
                cfg,
            );
            id = r.data?.data?.id;
            formData.value.id = id;
        } else {
            await axios.post(
                `/api/v1/budget-requests/${id}?_method=PUT`,
                buildFormData(),
                cfg,
            );
        }
        await axios.post(
            formData.value.status?.toUpperCase() === 'RETURNED'
                ? `/api/v1/budget-requests/${id}/resubmit`
                : `/api/v1/budget-requests/${id}/submit`,
        );
        toast.success('Berhasil diajukan');
        router.visit('/perencanaan-anggaran');
    } catch (e: any) {
        toast.error(e.response?.data?.message || 'Gagal submit');
    } finally {
        isPosting.value = false;
    }
};
const resetForm = () => {
    if (confirm('Reset?')) {
        formData.value = {
            request_no: '',
            request_date: getTodayDate(),
            fiscal_year_id: 0,
            academic_period_id: 0,
            unit_id: 0,
            budget_type: '',
            budget_category_id: 0,
            sub_budget_category_id: 0,
            description: '',
            status: 'draft',
            status_display: 'Draft',
            total_amount: 0,
        };
        budgetActivities.value = [];
        activityIdCounter = 1;
        detailIdCounter = 1;
    }
};
const goBack = () => {
    if (
        mode.value === 'create' &&
        (formData.value.description || budgetActivities.value.length)
    ) {
        if (confirm('Keluar? Data akan hilang.'))
            router.visit('/perencanaan-anggaran');
    } else router.visit('/perencanaan-anggaran');
};

// Load
const loadBudgetRequest = async (id: number | string) => {
    isLoading.value = true;
    try {
        const r = await axios.get(`/api/v1/budget-requests/${id}`);
        const d = r.data.data;
        formData.value = {
            id: d.id,
            request_no: d.request_no,
            request_date: d.request_date,
            fiscal_year_id: d.fiscal_year_id,
            academic_period_id: d.academic_period_id,
            unit_id: d.unit_id,
            budget_type: d.budget_type,
            budget_category_id: d.budget_category_id,
            sub_budget_category_id: d.sub_budget_category_id,
            description: d.notes || '',
            status: d.status,
            status_display: d.status_display,
            total_amount: d.total_amount,
        };
        budgetActivities.value = (d.request_activities || []).map((a: any) => ({
            id: a.id,
            activity_id: a.activity_id,
            description: a?.activity_name || a.description || '',
            start_date: a.start_date?.split('T')[0] || '',
            end_date: a.end_date?.split('T')[0] || '',
            total_amount: a.total_amount || 0,
            showItems: false,
            request_items: (a.request_items || []).map((it: any) => ({
                id: it.id,
                activity_item_id: it.activity_item_id,
                description: it.description || '',
                quantity: it.volume || 0,
                unit_measure_id: it.unit_measure_id || 0,
                unit_measure_name: it.unit_measure?.name || '',
                unit_price: it.unit_price || 0,
                total_price: it.total_amount || 0,
                trans_type_group:
                    it.activity_item?.trans_type?.group_code || '',
                goods: (it.goods || []).map((g: any) => ({
                    ...g,
                    unit_price: parseFloat(g.unit_price) || 0,
                    subtotal: parseFloat(g.subtotal) || 0,
                })),
            })),
            files: (a.documents || []).map((att: any) => ({
                id: att.id,
                name: att.document_name,
                file: att.file_path,
                size: att.file_size,
                type: att.file_type,
                url: att.file_path,
                isExisting: true,
                status: 'success',
            })),
            output_indicator: a.output_indicator || '',
        }));
        mode.value = d.status?.toUpperCase() === 'DRAFT' ? 'edit' : 'view';
    } catch {
        toast.error('Gagal memuat');
        router.visit('/perencanaan-anggaran');
    } finally {
        isLoading.value = false;
    }
};

watch(
    () => formData.value.unit_id,
    (v) => {
        if (v && v > 0) {
            cacheLoaded.value = false;
            cachedActivities.value = [];
            cachedActivityItems.value = [];
            loadSelectCache();
        }
    },
);
onMounted(async () => {
    if (props.id) {
        await loadBudgetRequest(props.id);
        if (formData.value.unit_id > 0) await loadSelectCache();
    } else mode.value = 'create';
});
</script>

<style scoped>
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
    .grid-cols-2 {
        grid-template-columns: 1fr;
    }
}
</style>
