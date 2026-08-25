import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::store
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:353
 * @route '/api/v1/units'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/units',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::store
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:353
 * @route '/api/v1/units'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::store
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:353
 * @route '/api/v1/units'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::store
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:353
 * @route '/api/v1/units'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::store
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:353
 * @route '/api/v1/units'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::show
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:340
 * @route '/api/v1/units/{unit}'
 */
export const show = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/units/{unit}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::show
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:340
 * @route '/api/v1/units/{unit}'
 */
show.url = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { unit: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    unit: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        unit: args.unit,
                }

    return show.definition.url
            .replace('{unit}', parsedArgs.unit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::show
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:340
 * @route '/api/v1/units/{unit}'
 */
show.get = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::show
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:340
 * @route '/api/v1/units/{unit}'
 */
show.head = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::show
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:340
 * @route '/api/v1/units/{unit}'
 */
    const showForm = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::show
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:340
 * @route '/api/v1/units/{unit}'
 */
        showForm.get = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::show
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:340
 * @route '/api/v1/units/{unit}'
 */
        showForm.head = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\UnitController::update
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:371
 * @route '/api/v1/units/{unit}'
 */
export const update = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/units/{unit}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::update
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:371
 * @route '/api/v1/units/{unit}'
 */
update.url = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { unit: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    unit: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        unit: args.unit,
                }

    return update.definition.url
            .replace('{unit}', parsedArgs.unit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::update
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:371
 * @route '/api/v1/units/{unit}'
 */
update.put = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::update
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:371
 * @route '/api/v1/units/{unit}'
 */
update.patch = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::update
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:371
 * @route '/api/v1/units/{unit}'
 */
    const updateForm = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::update
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:371
 * @route '/api/v1/units/{unit}'
 */
        updateForm.put = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::update
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:371
 * @route '/api/v1/units/{unit}'
 */
        updateForm.patch = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\UnitController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:388
 * @route '/api/v1/units/{unit}'
 */
export const destroy = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/units/{unit}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:388
 * @route '/api/v1/units/{unit}'
 */
destroy.url = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { unit: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    unit: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        unit: args.unit,
                }

    return destroy.definition.url
            .replace('{unit}', parsedArgs.unit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:388
 * @route '/api/v1/units/{unit}'
 */
destroy.delete = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:388
 * @route '/api/v1/units/{unit}'
 */
    const destroyForm = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:388
 * @route '/api/v1/units/{unit}'
 */
        destroyForm.delete = (args: { unit: string | number } | [unit: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const units = {
    store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default units