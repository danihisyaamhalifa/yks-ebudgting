import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::index
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:25
 * @route '/api/v1/coas'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/coas',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::index
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:25
 * @route '/api/v1/coas'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::index
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:25
 * @route '/api/v1/coas'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::index
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:25
 * @route '/api/v1/coas'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::index
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:25
 * @route '/api/v1/coas'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::index
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:25
 * @route '/api/v1/coas'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::index
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:25
 * @route '/api/v1/coas'
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
* @see \Modules\DataMaster\Http\Controllers\CoaController::store
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:353
 * @route '/api/v1/coas'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/coas',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::store
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:353
 * @route '/api/v1/coas'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::store
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:353
 * @route '/api/v1/coas'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::store
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:353
 * @route '/api/v1/coas'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::store
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:353
 * @route '/api/v1/coas'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::show
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:340
 * @route '/api/v1/coas/{coa}'
 */
export const show = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/coas/{coa}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::show
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:340
 * @route '/api/v1/coas/{coa}'
 */
show.url = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { coa: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    coa: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        coa: args.coa,
                }

    return show.definition.url
            .replace('{coa}', parsedArgs.coa.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::show
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:340
 * @route '/api/v1/coas/{coa}'
 */
show.get = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::show
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:340
 * @route '/api/v1/coas/{coa}'
 */
show.head = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::show
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:340
 * @route '/api/v1/coas/{coa}'
 */
    const showForm = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::show
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:340
 * @route '/api/v1/coas/{coa}'
 */
        showForm.get = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::show
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:340
 * @route '/api/v1/coas/{coa}'
 */
        showForm.head = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\CoaController::update
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:371
 * @route '/api/v1/coas/{coa}'
 */
export const update = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/coas/{coa}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::update
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:371
 * @route '/api/v1/coas/{coa}'
 */
update.url = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { coa: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    coa: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        coa: args.coa,
                }

    return update.definition.url
            .replace('{coa}', parsedArgs.coa.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::update
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:371
 * @route '/api/v1/coas/{coa}'
 */
update.put = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::update
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:371
 * @route '/api/v1/coas/{coa}'
 */
update.patch = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::update
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:371
 * @route '/api/v1/coas/{coa}'
 */
    const updateForm = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::update
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:371
 * @route '/api/v1/coas/{coa}'
 */
        updateForm.put = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::update
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:371
 * @route '/api/v1/coas/{coa}'
 */
        updateForm.patch = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\CoaController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:388
 * @route '/api/v1/coas/{coa}'
 */
export const destroy = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/coas/{coa}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:388
 * @route '/api/v1/coas/{coa}'
 */
destroy.url = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { coa: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    coa: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        coa: args.coa,
                }

    return destroy.definition.url
            .replace('{coa}', parsedArgs.coa.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\CoaController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:388
 * @route '/api/v1/coas/{coa}'
 */
destroy.delete = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:388
 * @route '/api/v1/coas/{coa}'
 */
    const destroyForm = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\CoaController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/CoaController.php:388
 * @route '/api/v1/coas/{coa}'
 */
        destroyForm.delete = (args: { coa: string | number } | [coa: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const coas = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default coas