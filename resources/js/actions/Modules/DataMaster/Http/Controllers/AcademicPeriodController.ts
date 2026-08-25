import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:42
 * @route '/api/v1/select/academic-periods'
 */
export const forSelect = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forSelect.url(options),
    method: 'get',
})

forSelect.definition = {
    methods: ["get","head"],
    url: '/api/v1/select/academic-periods',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:42
 * @route '/api/v1/select/academic-periods'
 */
forSelect.url = (options?: RouteQueryOptions) => {
    return forSelect.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:42
 * @route '/api/v1/select/academic-periods'
 */
forSelect.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forSelect.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:42
 * @route '/api/v1/select/academic-periods'
 */
forSelect.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: forSelect.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:42
 * @route '/api/v1/select/academic-periods'
 */
    const forSelectForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: forSelect.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:42
 * @route '/api/v1/select/academic-periods'
 */
        forSelectForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forSelect.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:42
 * @route '/api/v1/select/academic-periods'
 */
        forSelectForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forSelect.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    forSelect.form = forSelectForm
/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/academic-periods',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::store
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:353
 * @route '/api/v1/academic-periods'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/academic-periods',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::store
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:353
 * @route '/api/v1/academic-periods'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::store
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:353
 * @route '/api/v1/academic-periods'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::store
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:353
 * @route '/api/v1/academic-periods'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::store
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:353
 * @route '/api/v1/academic-periods'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::show
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:340
 * @route '/api/v1/academic-periods/{academic_period}'
 */
export const show = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/academic-periods/{academic_period}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::show
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:340
 * @route '/api/v1/academic-periods/{academic_period}'
 */
show.url = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { academic_period: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    academic_period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        academic_period: args.academic_period,
                }

    return show.definition.url
            .replace('{academic_period}', parsedArgs.academic_period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::show
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:340
 * @route '/api/v1/academic-periods/{academic_period}'
 */
show.get = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::show
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:340
 * @route '/api/v1/academic-periods/{academic_period}'
 */
show.head = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::show
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:340
 * @route '/api/v1/academic-periods/{academic_period}'
 */
    const showForm = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::show
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:340
 * @route '/api/v1/academic-periods/{academic_period}'
 */
        showForm.get = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::show
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:340
 * @route '/api/v1/academic-periods/{academic_period}'
 */
        showForm.head = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::update
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:371
 * @route '/api/v1/academic-periods/{academic_period}'
 */
export const update = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/academic-periods/{academic_period}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::update
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:371
 * @route '/api/v1/academic-periods/{academic_period}'
 */
update.url = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { academic_period: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    academic_period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        academic_period: args.academic_period,
                }

    return update.definition.url
            .replace('{academic_period}', parsedArgs.academic_period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::update
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:371
 * @route '/api/v1/academic-periods/{academic_period}'
 */
update.put = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::update
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:371
 * @route '/api/v1/academic-periods/{academic_period}'
 */
update.patch = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::update
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:371
 * @route '/api/v1/academic-periods/{academic_period}'
 */
    const updateForm = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::update
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:371
 * @route '/api/v1/academic-periods/{academic_period}'
 */
        updateForm.put = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::update
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:371
 * @route '/api/v1/academic-periods/{academic_period}'
 */
        updateForm.patch = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:388
 * @route '/api/v1/academic-periods/{academic_period}'
 */
export const destroy = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/academic-periods/{academic_period}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:388
 * @route '/api/v1/academic-periods/{academic_period}'
 */
destroy.url = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { academic_period: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    academic_period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        academic_period: args.academic_period,
                }

    return destroy.definition.url
            .replace('{academic_period}', parsedArgs.academic_period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:388
 * @route '/api/v1/academic-periods/{academic_period}'
 */
destroy.delete = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:388
 * @route '/api/v1/academic-periods/{academic_period}'
 */
    const destroyForm = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:388
 * @route '/api/v1/academic-periods/{academic_period}'
 */
        destroyForm.delete = (args: { academic_period: string | number } | [academic_period: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const AcademicPeriodController = { forSelect, index, store, show, update, destroy }

export default AcademicPeriodController