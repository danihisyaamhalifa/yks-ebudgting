import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:44
 * @route '/api/v1/select/vendors'
 */
export const forSelect = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forSelect.url(options),
    method: 'get',
})

forSelect.definition = {
    methods: ["get","head"],
    url: '/api/v1/select/vendors',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:44
 * @route '/api/v1/select/vendors'
 */
forSelect.url = (options?: RouteQueryOptions) => {
    return forSelect.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:44
 * @route '/api/v1/select/vendors'
 */
forSelect.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forSelect.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:44
 * @route '/api/v1/select/vendors'
 */
forSelect.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: forSelect.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:44
 * @route '/api/v1/select/vendors'
 */
    const forSelectForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: forSelect.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:44
 * @route '/api/v1/select/vendors'
 */
        forSelectForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forSelect.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:44
 * @route '/api/v1/select/vendors'
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
* @see \Modules\DataMaster\Http\Controllers\VendorController::index
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:23
 * @route '/api/v1/vendors'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/vendors',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::index
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:23
 * @route '/api/v1/vendors'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::index
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:23
 * @route '/api/v1/vendors'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::index
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:23
 * @route '/api/v1/vendors'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::index
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:23
 * @route '/api/v1/vendors'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::index
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:23
 * @route '/api/v1/vendors'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::index
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:23
 * @route '/api/v1/vendors'
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
* @see \Modules\DataMaster\Http\Controllers\VendorController::store
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:353
 * @route '/api/v1/vendors'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/vendors',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::store
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:353
 * @route '/api/v1/vendors'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::store
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:353
 * @route '/api/v1/vendors'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::store
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:353
 * @route '/api/v1/vendors'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::store
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:353
 * @route '/api/v1/vendors'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::show
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:340
 * @route '/api/v1/vendors/{vendor}'
 */
export const show = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/vendors/{vendor}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::show
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:340
 * @route '/api/v1/vendors/{vendor}'
 */
show.url = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { vendor: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    vendor: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        vendor: args.vendor,
                }

    return show.definition.url
            .replace('{vendor}', parsedArgs.vendor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::show
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:340
 * @route '/api/v1/vendors/{vendor}'
 */
show.get = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::show
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:340
 * @route '/api/v1/vendors/{vendor}'
 */
show.head = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::show
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:340
 * @route '/api/v1/vendors/{vendor}'
 */
    const showForm = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::show
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:340
 * @route '/api/v1/vendors/{vendor}'
 */
        showForm.get = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::show
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:340
 * @route '/api/v1/vendors/{vendor}'
 */
        showForm.head = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\VendorController::update
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:371
 * @route '/api/v1/vendors/{vendor}'
 */
export const update = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/vendors/{vendor}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::update
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:371
 * @route '/api/v1/vendors/{vendor}'
 */
update.url = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { vendor: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    vendor: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        vendor: args.vendor,
                }

    return update.definition.url
            .replace('{vendor}', parsedArgs.vendor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::update
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:371
 * @route '/api/v1/vendors/{vendor}'
 */
update.put = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::update
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:371
 * @route '/api/v1/vendors/{vendor}'
 */
update.patch = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::update
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:371
 * @route '/api/v1/vendors/{vendor}'
 */
    const updateForm = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::update
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:371
 * @route '/api/v1/vendors/{vendor}'
 */
        updateForm.put = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::update
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:371
 * @route '/api/v1/vendors/{vendor}'
 */
        updateForm.patch = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\VendorController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:388
 * @route '/api/v1/vendors/{vendor}'
 */
export const destroy = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/vendors/{vendor}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:388
 * @route '/api/v1/vendors/{vendor}'
 */
destroy.url = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { vendor: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    vendor: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        vendor: args.vendor,
                }

    return destroy.definition.url
            .replace('{vendor}', parsedArgs.vendor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\VendorController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:388
 * @route '/api/v1/vendors/{vendor}'
 */
destroy.delete = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:388
 * @route '/api/v1/vendors/{vendor}'
 */
    const destroyForm = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\VendorController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/VendorController.php:388
 * @route '/api/v1/vendors/{vendor}'
 */
        destroyForm.delete = (args: { vendor: string | number } | [vendor: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const VendorController = { forSelect, index, store, show, update, destroy }

export default VendorController