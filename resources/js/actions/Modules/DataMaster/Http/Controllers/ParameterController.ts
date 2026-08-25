import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::values
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:39
 * @route '/api/v1/parameters/{groupCode}'
 */
export const values = (args: { groupCode: string | number } | [groupCode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: values.url(args, options),
    method: 'get',
})

values.definition = {
    methods: ["get","head"],
    url: '/api/v1/parameters/{groupCode}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::values
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:39
 * @route '/api/v1/parameters/{groupCode}'
 */
values.url = (args: { groupCode: string | number } | [groupCode: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { groupCode: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    groupCode: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        groupCode: args.groupCode,
                }

    return values.definition.url
            .replace('{groupCode}', parsedArgs.groupCode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::values
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:39
 * @route '/api/v1/parameters/{groupCode}'
 */
values.get = (args: { groupCode: string | number } | [groupCode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: values.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::values
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:39
 * @route '/api/v1/parameters/{groupCode}'
 */
values.head = (args: { groupCode: string | number } | [groupCode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: values.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::values
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:39
 * @route '/api/v1/parameters/{groupCode}'
 */
    const valuesForm = (args: { groupCode: string | number } | [groupCode: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: values.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::values
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:39
 * @route '/api/v1/parameters/{groupCode}'
 */
        valuesForm.get = (args: { groupCode: string | number } | [groupCode: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: values.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::values
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:39
 * @route '/api/v1/parameters/{groupCode}'
 */
        valuesForm.head = (args: { groupCode: string | number } | [groupCode: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: values.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    values.form = valuesForm
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/parameters',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
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
* @see \Modules\DataMaster\Http\Controllers\ParameterController::store
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:353
 * @route '/api/v1/parameters'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/parameters',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::store
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:353
 * @route '/api/v1/parameters'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::store
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:353
 * @route '/api/v1/parameters'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::store
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:353
 * @route '/api/v1/parameters'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::store
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:353
 * @route '/api/v1/parameters'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:340
 * @route '/api/v1/parameters/{parameter}'
 */
export const show = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/parameters/{parameter}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:340
 * @route '/api/v1/parameters/{parameter}'
 */
show.url = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { parameter: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    parameter: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        parameter: args.parameter,
                }

    return show.definition.url
            .replace('{parameter}', parsedArgs.parameter.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:340
 * @route '/api/v1/parameters/{parameter}'
 */
show.get = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:340
 * @route '/api/v1/parameters/{parameter}'
 */
show.head = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:340
 * @route '/api/v1/parameters/{parameter}'
 */
    const showForm = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:340
 * @route '/api/v1/parameters/{parameter}'
 */
        showForm.get = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::show
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:340
 * @route '/api/v1/parameters/{parameter}'
 */
        showForm.head = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\ParameterController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:371
 * @route '/api/v1/parameters/{parameter}'
 */
export const update = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/parameters/{parameter}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:371
 * @route '/api/v1/parameters/{parameter}'
 */
update.url = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { parameter: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    parameter: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        parameter: args.parameter,
                }

    return update.definition.url
            .replace('{parameter}', parsedArgs.parameter.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:371
 * @route '/api/v1/parameters/{parameter}'
 */
update.put = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:371
 * @route '/api/v1/parameters/{parameter}'
 */
update.patch = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:371
 * @route '/api/v1/parameters/{parameter}'
 */
    const updateForm = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:371
 * @route '/api/v1/parameters/{parameter}'
 */
        updateForm.put = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::update
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:371
 * @route '/api/v1/parameters/{parameter}'
 */
        updateForm.patch = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\ParameterController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:388
 * @route '/api/v1/parameters/{parameter}'
 */
export const destroy = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/parameters/{parameter}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:388
 * @route '/api/v1/parameters/{parameter}'
 */
destroy.url = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { parameter: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    parameter: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        parameter: args.parameter,
                }

    return destroy.definition.url
            .replace('{parameter}', parsedArgs.parameter.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:388
 * @route '/api/v1/parameters/{parameter}'
 */
destroy.delete = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:388
 * @route '/api/v1/parameters/{parameter}'
 */
    const destroyForm = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:388
 * @route '/api/v1/parameters/{parameter}'
 */
        destroyForm.delete = (args: { parameter: string | number } | [parameter: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const ParameterController = { values, index, store, show, update, destroy }

export default ParameterController