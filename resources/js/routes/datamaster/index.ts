import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
 * @see Modules/DataMaster/routes/web.php:12
 * @route '/unit'
 */
export const units = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: units.url(options),
    method: 'get',
})

units.definition = {
    methods: ["get","head"],
    url: '/unit',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:12
 * @route '/unit'
 */
units.url = (options?: RouteQueryOptions) => {
    return units.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:12
 * @route '/unit'
 */
units.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: units.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:12
 * @route '/unit'
 */
units.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: units.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:12
 * @route '/unit'
 */
    const unitsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: units.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:12
 * @route '/unit'
 */
        unitsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: units.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:12
 * @route '/unit'
 */
        unitsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: units.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    units.form = unitsForm
/**
 * @see Modules/DataMaster/routes/web.php:16
 * @route '/coa'
 */
export const coas = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: coas.url(options),
    method: 'get',
})

coas.definition = {
    methods: ["get","head"],
    url: '/coa',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:16
 * @route '/coa'
 */
coas.url = (options?: RouteQueryOptions) => {
    return coas.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:16
 * @route '/coa'
 */
coas.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: coas.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:16
 * @route '/coa'
 */
coas.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: coas.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:16
 * @route '/coa'
 */
    const coasForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: coas.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:16
 * @route '/coa'
 */
        coasForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: coas.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:16
 * @route '/coa'
 */
        coasForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: coas.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    coas.form = coasForm
/**
 * @see Modules/DataMaster/routes/web.php:20
 * @route '/tahun-anggaran'
 */
export const fiscalYears = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fiscalYears.url(options),
    method: 'get',
})

fiscalYears.definition = {
    methods: ["get","head"],
    url: '/tahun-anggaran',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:20
 * @route '/tahun-anggaran'
 */
fiscalYears.url = (options?: RouteQueryOptions) => {
    return fiscalYears.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:20
 * @route '/tahun-anggaran'
 */
fiscalYears.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fiscalYears.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:20
 * @route '/tahun-anggaran'
 */
fiscalYears.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: fiscalYears.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:20
 * @route '/tahun-anggaran'
 */
    const fiscalYearsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: fiscalYears.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:20
 * @route '/tahun-anggaran'
 */
        fiscalYearsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fiscalYears.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:20
 * @route '/tahun-anggaran'
 */
        fiscalYearsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fiscalYears.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    fiscalYears.form = fiscalYearsForm
/**
 * @see Modules/DataMaster/routes/web.php:24
 * @route '/periode-akademik'
 */
export const academicPeriods = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: academicPeriods.url(options),
    method: 'get',
})

academicPeriods.definition = {
    methods: ["get","head"],
    url: '/periode-akademik',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:24
 * @route '/periode-akademik'
 */
academicPeriods.url = (options?: RouteQueryOptions) => {
    return academicPeriods.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:24
 * @route '/periode-akademik'
 */
academicPeriods.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: academicPeriods.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:24
 * @route '/periode-akademik'
 */
academicPeriods.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: academicPeriods.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:24
 * @route '/periode-akademik'
 */
    const academicPeriodsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: academicPeriods.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:24
 * @route '/periode-akademik'
 */
        academicPeriodsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: academicPeriods.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:24
 * @route '/periode-akademik'
 */
        academicPeriodsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: academicPeriods.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    academicPeriods.form = academicPeriodsForm
/**
 * @see Modules/DataMaster/routes/web.php:28
 * @route '/kegiatan'
 */
export const activities = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activities.url(options),
    method: 'get',
})

activities.definition = {
    methods: ["get","head"],
    url: '/kegiatan',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:28
 * @route '/kegiatan'
 */
activities.url = (options?: RouteQueryOptions) => {
    return activities.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:28
 * @route '/kegiatan'
 */
activities.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activities.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:28
 * @route '/kegiatan'
 */
activities.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activities.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:28
 * @route '/kegiatan'
 */
    const activitiesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: activities.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:28
 * @route '/kegiatan'
 */
        activitiesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: activities.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:28
 * @route '/kegiatan'
 */
        activitiesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: activities.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    activities.form = activitiesForm
/**
 * @see Modules/DataMaster/routes/web.php:32
 * @route '/kategori-anggaran'
 */
export const budgetCategories = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: budgetCategories.url(options),
    method: 'get',
})

budgetCategories.definition = {
    methods: ["get","head"],
    url: '/kategori-anggaran',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:32
 * @route '/kategori-anggaran'
 */
budgetCategories.url = (options?: RouteQueryOptions) => {
    return budgetCategories.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:32
 * @route '/kategori-anggaran'
 */
budgetCategories.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: budgetCategories.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:32
 * @route '/kategori-anggaran'
 */
budgetCategories.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: budgetCategories.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:32
 * @route '/kategori-anggaran'
 */
    const budgetCategoriesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: budgetCategories.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:32
 * @route '/kategori-anggaran'
 */
        budgetCategoriesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: budgetCategories.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:32
 * @route '/kategori-anggaran'
 */
        budgetCategoriesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: budgetCategories.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    budgetCategories.form = budgetCategoriesForm
/**
 * @see Modules/DataMaster/routes/web.php:36
 * @route '/sub-kategori-anggaran'
 */
export const subBudgetCategories = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subBudgetCategories.url(options),
    method: 'get',
})

subBudgetCategories.definition = {
    methods: ["get","head"],
    url: '/sub-kategori-anggaran',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:36
 * @route '/sub-kategori-anggaran'
 */
subBudgetCategories.url = (options?: RouteQueryOptions) => {
    return subBudgetCategories.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:36
 * @route '/sub-kategori-anggaran'
 */
subBudgetCategories.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subBudgetCategories.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:36
 * @route '/sub-kategori-anggaran'
 */
subBudgetCategories.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: subBudgetCategories.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:36
 * @route '/sub-kategori-anggaran'
 */
    const subBudgetCategoriesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: subBudgetCategories.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:36
 * @route '/sub-kategori-anggaran'
 */
        subBudgetCategoriesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: subBudgetCategories.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:36
 * @route '/sub-kategori-anggaran'
 */
        subBudgetCategoriesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: subBudgetCategories.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    subBudgetCategories.form = subBudgetCategoriesForm
/**
 * @see Modules/DataMaster/routes/web.php:40
 * @route '/kas-bank'
 */
export const cashBanks = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cashBanks.url(options),
    method: 'get',
})

cashBanks.definition = {
    methods: ["get","head"],
    url: '/kas-bank',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:40
 * @route '/kas-bank'
 */
cashBanks.url = (options?: RouteQueryOptions) => {
    return cashBanks.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:40
 * @route '/kas-bank'
 */
cashBanks.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cashBanks.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:40
 * @route '/kas-bank'
 */
cashBanks.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: cashBanks.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:40
 * @route '/kas-bank'
 */
    const cashBanksForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: cashBanks.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:40
 * @route '/kas-bank'
 */
        cashBanksForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cashBanks.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:40
 * @route '/kas-bank'
 */
        cashBanksForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cashBanks.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    cashBanks.form = cashBanksForm
/**
 * @see Modules/DataMaster/routes/web.php:44
 * @route '/sumber-dana'
 */
export const fundSource = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fundSource.url(options),
    method: 'get',
})

fundSource.definition = {
    methods: ["get","head"],
    url: '/sumber-dana',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:44
 * @route '/sumber-dana'
 */
fundSource.url = (options?: RouteQueryOptions) => {
    return fundSource.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:44
 * @route '/sumber-dana'
 */
fundSource.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fundSource.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:44
 * @route '/sumber-dana'
 */
fundSource.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: fundSource.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:44
 * @route '/sumber-dana'
 */
    const fundSourceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: fundSource.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:44
 * @route '/sumber-dana'
 */
        fundSourceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fundSource.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:44
 * @route '/sumber-dana'
 */
        fundSourceForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fundSource.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    fundSource.form = fundSourceForm
/**
 * @see Modules/DataMaster/routes/web.php:48
 * @route '/item-anggaran'
 */
export const activityItem = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activityItem.url(options),
    method: 'get',
})

activityItem.definition = {
    methods: ["get","head"],
    url: '/item-anggaran',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:48
 * @route '/item-anggaran'
 */
activityItem.url = (options?: RouteQueryOptions) => {
    return activityItem.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:48
 * @route '/item-anggaran'
 */
activityItem.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activityItem.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:48
 * @route '/item-anggaran'
 */
activityItem.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activityItem.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:48
 * @route '/item-anggaran'
 */
    const activityItemForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: activityItem.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:48
 * @route '/item-anggaran'
 */
        activityItemForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: activityItem.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:48
 * @route '/item-anggaran'
 */
        activityItemForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: activityItem.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    activityItem.form = activityItemForm
/**
 * @see Modules/DataMaster/routes/web.php:52
 * @route '/pegawai'
 */
export const employees = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employees.url(options),
    method: 'get',
})

employees.definition = {
    methods: ["get","head"],
    url: '/pegawai',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:52
 * @route '/pegawai'
 */
employees.url = (options?: RouteQueryOptions) => {
    return employees.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:52
 * @route '/pegawai'
 */
employees.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employees.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:52
 * @route '/pegawai'
 */
employees.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: employees.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:52
 * @route '/pegawai'
 */
    const employeesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: employees.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:52
 * @route '/pegawai'
 */
        employeesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: employees.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:52
 * @route '/pegawai'
 */
        employeesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: employees.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    employees.form = employeesForm
/**
 * @see Modules/DataMaster/routes/web.php:56
 * @route '/vendor'
 */
export const vendors = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vendors.url(options),
    method: 'get',
})

vendors.definition = {
    methods: ["get","head"],
    url: '/vendor',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:56
 * @route '/vendor'
 */
vendors.url = (options?: RouteQueryOptions) => {
    return vendors.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:56
 * @route '/vendor'
 */
vendors.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vendors.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:56
 * @route '/vendor'
 */
vendors.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: vendors.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:56
 * @route '/vendor'
 */
    const vendorsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: vendors.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:56
 * @route '/vendor'
 */
        vendorsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vendors.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:56
 * @route '/vendor'
 */
        vendorsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vendors.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    vendors.form = vendorsForm
const datamaster = {
    units: Object.assign(units, units),
coas: Object.assign(coas, coas),
fiscalYears: Object.assign(fiscalYears, fiscalYears),
academicPeriods: Object.assign(academicPeriods, academicPeriods),
activities: Object.assign(activities, activities),
budgetCategories: Object.assign(budgetCategories, budgetCategories),
subBudgetCategories: Object.assign(subBudgetCategories, subBudgetCategories),
cashBanks: Object.assign(cashBanks, cashBanks),
fundSource: Object.assign(fundSource, fundSource),
activityItem: Object.assign(activityItem, activityItem),
employees: Object.assign(employees, employees),
vendors: Object.assign(vendors, vendors),
}

export default datamaster