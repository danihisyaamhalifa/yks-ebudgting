import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::index
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:29
 * @route '/api/v1/cash-mutations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/cash-mutations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::index
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:29
 * @route '/api/v1/cash-mutations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::index
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:29
 * @route '/api/v1/cash-mutations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::index
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:29
 * @route '/api/v1/cash-mutations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::index
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:29
 * @route '/api/v1/cash-mutations'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::index
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:29
 * @route '/api/v1/cash-mutations'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::index
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:29
 * @route '/api/v1/cash-mutations'
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
* @see \Modules\Transaction\Http\Controllers\CashMutationController::store
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:49
 * @route '/api/v1/cash-mutations'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/cash-mutations',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::store
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:49
 * @route '/api/v1/cash-mutations'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::store
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:49
 * @route '/api/v1/cash-mutations'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::store
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:49
 * @route '/api/v1/cash-mutations'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::store
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:49
 * @route '/api/v1/cash-mutations'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::show
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:340
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
export const show = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/cash-mutations/{cash_mutation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::show
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:340
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
show.url = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cash_mutation: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    cash_mutation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        cash_mutation: args.cash_mutation,
                }

    return show.definition.url
            .replace('{cash_mutation}', parsedArgs.cash_mutation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::show
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:340
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
show.get = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::show
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:340
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
show.head = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::show
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:340
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
    const showForm = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::show
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:340
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
        showForm.get = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::show
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:340
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
        showForm.head = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\Transaction\Http\Controllers\CashMutationController::update
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:195
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
export const update = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/cash-mutations/{cash_mutation}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::update
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:195
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
update.url = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cash_mutation: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    cash_mutation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        cash_mutation: args.cash_mutation,
                }

    return update.definition.url
            .replace('{cash_mutation}', parsedArgs.cash_mutation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::update
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:195
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
update.put = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::update
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:195
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
update.patch = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::update
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:195
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
    const updateForm = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::update
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:195
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
        updateForm.put = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::update
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:195
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
        updateForm.patch = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\Transaction\Http\Controllers\CashMutationController::destroy
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:388
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
export const destroy = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/cash-mutations/{cash_mutation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::destroy
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:388
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
destroy.url = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cash_mutation: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    cash_mutation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        cash_mutation: args.cash_mutation,
                }

    return destroy.definition.url
            .replace('{cash_mutation}', parsedArgs.cash_mutation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::destroy
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:388
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
destroy.delete = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::destroy
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:388
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
    const destroyForm = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Transaction\Http\Controllers\CashMutationController::destroy
 * @see Modules/Transaction/app/Http/Controllers/CashMutationController.php:388
 * @route '/api/v1/cash-mutations/{cash_mutation}'
 */
        destroyForm.delete = (args: { cash_mutation: string | number } | [cash_mutation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const CashMutationController = { index, store, show, update, destroy }

export default CashMutationController