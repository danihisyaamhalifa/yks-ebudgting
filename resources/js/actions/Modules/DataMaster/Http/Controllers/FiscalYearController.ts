import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:41
 * @route '/api/v1/select/fiscal-years'
 */
export const forSelect = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forSelect.url(options),
    method: 'get',
})

forSelect.definition = {
    methods: ["get","head"],
    url: '/api/v1/select/fiscal-years',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:41
 * @route '/api/v1/select/fiscal-years'
 */
forSelect.url = (options?: RouteQueryOptions) => {
    return forSelect.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:41
 * @route '/api/v1/select/fiscal-years'
 */
forSelect.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forSelect.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:41
 * @route '/api/v1/select/fiscal-years'
 */
forSelect.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: forSelect.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:41
 * @route '/api/v1/select/fiscal-years'
 */
    const forSelectForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: forSelect.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:41
 * @route '/api/v1/select/fiscal-years'
 */
        forSelectForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forSelect.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:41
 * @route '/api/v1/select/fiscal-years'
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
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/fiscal-years',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
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
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::store
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:353
 * @route '/api/v1/fiscal-years'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/fiscal-years',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::store
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:353
 * @route '/api/v1/fiscal-years'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::store
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:353
 * @route '/api/v1/fiscal-years'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::store
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:353
 * @route '/api/v1/fiscal-years'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::store
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:353
 * @route '/api/v1/fiscal-years'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::show
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:340
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
export const show = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/fiscal-years/{fiscal_year}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::show
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:340
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
show.url = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { fiscal_year: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    fiscal_year: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        fiscal_year: args.fiscal_year,
                }

    return show.definition.url
            .replace('{fiscal_year}', parsedArgs.fiscal_year.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::show
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:340
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
show.get = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::show
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:340
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
show.head = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::show
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:340
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
    const showForm = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::show
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:340
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
        showForm.get = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::show
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:340
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
        showForm.head = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::update
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:371
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
export const update = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/fiscal-years/{fiscal_year}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::update
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:371
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
update.url = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { fiscal_year: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    fiscal_year: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        fiscal_year: args.fiscal_year,
                }

    return update.definition.url
            .replace('{fiscal_year}', parsedArgs.fiscal_year.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::update
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:371
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
update.put = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::update
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:371
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
update.patch = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::update
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:371
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
    const updateForm = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::update
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:371
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
        updateForm.put = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::update
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:371
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
        updateForm.patch = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:388
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
export const destroy = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/fiscal-years/{fiscal_year}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:388
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
destroy.url = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { fiscal_year: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    fiscal_year: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        fiscal_year: args.fiscal_year,
                }

    return destroy.definition.url
            .replace('{fiscal_year}', parsedArgs.fiscal_year.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:388
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
destroy.delete = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:388
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
    const destroyForm = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:388
 * @route '/api/v1/fiscal-years/{fiscal_year}'
 */
        destroyForm.delete = (args: { fiscal_year: string | number } | [fiscal_year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const FiscalYearController = { forSelect, index, store, show, update, destroy }

export default FiscalYearController