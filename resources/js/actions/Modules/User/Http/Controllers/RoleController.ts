import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\User\Http\Controllers\RoleController::index
 * @see Modules/User/app/Http/Controllers/RoleController.php:27
 * @route '/api/v1/roles'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/roles',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\User\Http\Controllers\RoleController::index
 * @see Modules/User/app/Http/Controllers/RoleController.php:27
 * @route '/api/v1/roles'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\RoleController::index
 * @see Modules/User/app/Http/Controllers/RoleController.php:27
 * @route '/api/v1/roles'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\User\Http\Controllers\RoleController::index
 * @see Modules/User/app/Http/Controllers/RoleController.php:27
 * @route '/api/v1/roles'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\User\Http\Controllers\RoleController::index
 * @see Modules/User/app/Http/Controllers/RoleController.php:27
 * @route '/api/v1/roles'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\User\Http\Controllers\RoleController::index
 * @see Modules/User/app/Http/Controllers/RoleController.php:27
 * @route '/api/v1/roles'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\User\Http\Controllers\RoleController::index
 * @see Modules/User/app/Http/Controllers/RoleController.php:27
 * @route '/api/v1/roles'
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
* @see \Modules\User\Http\Controllers\RoleController::store
 * @see Modules/User/app/Http/Controllers/RoleController.php:353
 * @route '/api/v1/roles'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/roles',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\User\Http\Controllers\RoleController::store
 * @see Modules/User/app/Http/Controllers/RoleController.php:353
 * @route '/api/v1/roles'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\RoleController::store
 * @see Modules/User/app/Http/Controllers/RoleController.php:353
 * @route '/api/v1/roles'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\User\Http\Controllers\RoleController::store
 * @see Modules/User/app/Http/Controllers/RoleController.php:353
 * @route '/api/v1/roles'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\User\Http\Controllers\RoleController::store
 * @see Modules/User/app/Http/Controllers/RoleController.php:353
 * @route '/api/v1/roles'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\User\Http\Controllers\RoleController::show
 * @see Modules/User/app/Http/Controllers/RoleController.php:340
 * @route '/api/v1/roles/{role}'
 */
export const show = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/roles/{role}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\User\Http\Controllers\RoleController::show
 * @see Modules/User/app/Http/Controllers/RoleController.php:340
 * @route '/api/v1/roles/{role}'
 */
show.url = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { role: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    role: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        role: args.role,
                }

    return show.definition.url
            .replace('{role}', parsedArgs.role.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\RoleController::show
 * @see Modules/User/app/Http/Controllers/RoleController.php:340
 * @route '/api/v1/roles/{role}'
 */
show.get = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\User\Http\Controllers\RoleController::show
 * @see Modules/User/app/Http/Controllers/RoleController.php:340
 * @route '/api/v1/roles/{role}'
 */
show.head = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\User\Http\Controllers\RoleController::show
 * @see Modules/User/app/Http/Controllers/RoleController.php:340
 * @route '/api/v1/roles/{role}'
 */
    const showForm = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\User\Http\Controllers\RoleController::show
 * @see Modules/User/app/Http/Controllers/RoleController.php:340
 * @route '/api/v1/roles/{role}'
 */
        showForm.get = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\User\Http\Controllers\RoleController::show
 * @see Modules/User/app/Http/Controllers/RoleController.php:340
 * @route '/api/v1/roles/{role}'
 */
        showForm.head = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\User\Http\Controllers\RoleController::update
 * @see Modules/User/app/Http/Controllers/RoleController.php:87
 * @route '/api/v1/roles/{role}'
 */
export const update = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/roles/{role}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\User\Http\Controllers\RoleController::update
 * @see Modules/User/app/Http/Controllers/RoleController.php:87
 * @route '/api/v1/roles/{role}'
 */
update.url = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { role: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    role: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        role: args.role,
                }

    return update.definition.url
            .replace('{role}', parsedArgs.role.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\RoleController::update
 * @see Modules/User/app/Http/Controllers/RoleController.php:87
 * @route '/api/v1/roles/{role}'
 */
update.put = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\User\Http\Controllers\RoleController::update
 * @see Modules/User/app/Http/Controllers/RoleController.php:87
 * @route '/api/v1/roles/{role}'
 */
update.patch = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\User\Http\Controllers\RoleController::update
 * @see Modules/User/app/Http/Controllers/RoleController.php:87
 * @route '/api/v1/roles/{role}'
 */
    const updateForm = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\User\Http\Controllers\RoleController::update
 * @see Modules/User/app/Http/Controllers/RoleController.php:87
 * @route '/api/v1/roles/{role}'
 */
        updateForm.put = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\User\Http\Controllers\RoleController::update
 * @see Modules/User/app/Http/Controllers/RoleController.php:87
 * @route '/api/v1/roles/{role}'
 */
        updateForm.patch = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\User\Http\Controllers\RoleController::destroy
 * @see Modules/User/app/Http/Controllers/RoleController.php:388
 * @route '/api/v1/roles/{role}'
 */
export const destroy = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/roles/{role}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\User\Http\Controllers\RoleController::destroy
 * @see Modules/User/app/Http/Controllers/RoleController.php:388
 * @route '/api/v1/roles/{role}'
 */
destroy.url = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { role: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    role: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        role: args.role,
                }

    return destroy.definition.url
            .replace('{role}', parsedArgs.role.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\RoleController::destroy
 * @see Modules/User/app/Http/Controllers/RoleController.php:388
 * @route '/api/v1/roles/{role}'
 */
destroy.delete = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\User\Http\Controllers\RoleController::destroy
 * @see Modules/User/app/Http/Controllers/RoleController.php:388
 * @route '/api/v1/roles/{role}'
 */
    const destroyForm = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\User\Http\Controllers\RoleController::destroy
 * @see Modules/User/app/Http/Controllers/RoleController.php:388
 * @route '/api/v1/roles/{role}'
 */
        destroyForm.delete = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const RoleController = { index, store, show, update, destroy }

export default RoleController