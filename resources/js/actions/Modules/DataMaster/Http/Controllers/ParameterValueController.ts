import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/parameter-values',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
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
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::store
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:353
 * @route '/api/v1/parameter-values'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/parameter-values',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::store
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:353
 * @route '/api/v1/parameter-values'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::store
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:353
 * @route '/api/v1/parameter-values'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::store
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:353
 * @route '/api/v1/parameter-values'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::store
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:353
 * @route '/api/v1/parameter-values'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:340
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
export const show = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/parameter-values/{parameter_value}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:340
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
show.url = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { parameter_value: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    parameter_value: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        parameter_value: args.parameter_value,
                }

    return show.definition.url
            .replace('{parameter_value}', parsedArgs.parameter_value.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:340
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
show.get = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:340
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
show.head = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:340
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
    const showForm = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:340
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
        showForm.get = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:340
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
        showForm.head = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:371
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
export const update = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/parameter-values/{parameter_value}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:371
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
update.url = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { parameter_value: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    parameter_value: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        parameter_value: args.parameter_value,
                }

    return update.definition.url
            .replace('{parameter_value}', parsedArgs.parameter_value.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:371
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
update.put = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:371
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
update.patch = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:371
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
    const updateForm = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:371
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
        updateForm.put = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:371
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
        updateForm.patch = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:388
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
export const destroy = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/parameter-values/{parameter_value}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:388
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
destroy.url = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { parameter_value: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    parameter_value: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        parameter_value: args.parameter_value,
                }

    return destroy.definition.url
            .replace('{parameter_value}', parsedArgs.parameter_value.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:388
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
destroy.delete = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:388
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
    const destroyForm = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:388
 * @route '/api/v1/parameter-values/{parameter_value}'
 */
        destroyForm.delete = (args: { parameter_value: string | number } | [parameter_value: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const ParameterValueController = { index, store, show, update, destroy }

export default ParameterValueController