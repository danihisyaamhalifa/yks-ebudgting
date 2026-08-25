import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::store
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:353
 * @route '/api/v1/transaction-types'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/transaction-types',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::store
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:353
 * @route '/api/v1/transaction-types'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::store
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:353
 * @route '/api/v1/transaction-types'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::store
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:353
 * @route '/api/v1/transaction-types'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::store
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:353
 * @route '/api/v1/transaction-types'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::show
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:340
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
export const show = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/transaction-types/{transaction_type}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::show
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:340
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
show.url = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { transaction_type: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    transaction_type: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        transaction_type: args.transaction_type,
                }

    return show.definition.url
            .replace('{transaction_type}', parsedArgs.transaction_type.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::show
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:340
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
show.get = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::show
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:340
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
show.head = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::show
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:340
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
    const showForm = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::show
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:340
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
        showForm.get = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::show
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:340
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
        showForm.head = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::update
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:371
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
export const update = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/transaction-types/{transaction_type}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::update
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:371
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
update.url = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { transaction_type: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    transaction_type: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        transaction_type: args.transaction_type,
                }

    return update.definition.url
            .replace('{transaction_type}', parsedArgs.transaction_type.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::update
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:371
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
update.put = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::update
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:371
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
update.patch = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::update
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:371
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
    const updateForm = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::update
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:371
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
        updateForm.put = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::update
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:371
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
        updateForm.patch = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:388
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
export const destroy = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/transaction-types/{transaction_type}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:388
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
destroy.url = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { transaction_type: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    transaction_type: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        transaction_type: args.transaction_type,
                }

    return destroy.definition.url
            .replace('{transaction_type}', parsedArgs.transaction_type.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:388
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
destroy.delete = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:388
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
    const destroyForm = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:388
 * @route '/api/v1/transaction-types/{transaction_type}'
 */
        destroyForm.delete = (args: { transaction_type: string | number } | [transaction_type: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const transactionTypes = {
    store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default transactionTypes