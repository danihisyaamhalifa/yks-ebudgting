import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::index
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:28
 * @route '/api/v1/fund-sources'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/fund-sources',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::index
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:28
 * @route '/api/v1/fund-sources'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::index
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:28
 * @route '/api/v1/fund-sources'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::index
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:28
 * @route '/api/v1/fund-sources'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::index
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:28
 * @route '/api/v1/fund-sources'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::index
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:28
 * @route '/api/v1/fund-sources'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::index
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:28
 * @route '/api/v1/fund-sources'
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
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::store
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:353
 * @route '/api/v1/fund-sources'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/fund-sources',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::store
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:353
 * @route '/api/v1/fund-sources'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::store
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:353
 * @route '/api/v1/fund-sources'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::store
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:353
 * @route '/api/v1/fund-sources'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::store
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:353
 * @route '/api/v1/fund-sources'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::show
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:340
 * @route '/api/v1/fund-sources/{fund_source}'
 */
export const show = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/fund-sources/{fund_source}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::show
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:340
 * @route '/api/v1/fund-sources/{fund_source}'
 */
show.url = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { fund_source: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    fund_source: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        fund_source: args.fund_source,
                }

    return show.definition.url
            .replace('{fund_source}', parsedArgs.fund_source.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::show
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:340
 * @route '/api/v1/fund-sources/{fund_source}'
 */
show.get = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::show
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:340
 * @route '/api/v1/fund-sources/{fund_source}'
 */
show.head = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::show
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:340
 * @route '/api/v1/fund-sources/{fund_source}'
 */
    const showForm = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::show
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:340
 * @route '/api/v1/fund-sources/{fund_source}'
 */
        showForm.get = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::show
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:340
 * @route '/api/v1/fund-sources/{fund_source}'
 */
        showForm.head = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::update
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:371
 * @route '/api/v1/fund-sources/{fund_source}'
 */
export const update = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/fund-sources/{fund_source}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::update
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:371
 * @route '/api/v1/fund-sources/{fund_source}'
 */
update.url = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { fund_source: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    fund_source: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        fund_source: args.fund_source,
                }

    return update.definition.url
            .replace('{fund_source}', parsedArgs.fund_source.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::update
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:371
 * @route '/api/v1/fund-sources/{fund_source}'
 */
update.put = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::update
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:371
 * @route '/api/v1/fund-sources/{fund_source}'
 */
update.patch = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::update
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:371
 * @route '/api/v1/fund-sources/{fund_source}'
 */
    const updateForm = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::update
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:371
 * @route '/api/v1/fund-sources/{fund_source}'
 */
        updateForm.put = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::update
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:371
 * @route '/api/v1/fund-sources/{fund_source}'
 */
        updateForm.patch = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:388
 * @route '/api/v1/fund-sources/{fund_source}'
 */
export const destroy = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/fund-sources/{fund_source}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:388
 * @route '/api/v1/fund-sources/{fund_source}'
 */
destroy.url = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { fund_source: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    fund_source: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        fund_source: args.fund_source,
                }

    return destroy.definition.url
            .replace('{fund_source}', parsedArgs.fund_source.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:388
 * @route '/api/v1/fund-sources/{fund_source}'
 */
destroy.delete = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:388
 * @route '/api/v1/fund-sources/{fund_source}'
 */
    const destroyForm = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\FundSourceController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/FundSourceController.php:388
 * @route '/api/v1/fund-sources/{fund_source}'
 */
        destroyForm.delete = (args: { fund_source: string | number } | [fund_source: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const fundSources = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default fundSources