import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:121
 * @route '/api/v1/select/cash-banks'
 */
export const forSelect = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forSelect.url(options),
    method: 'get',
})

forSelect.definition = {
    methods: ["get","head"],
    url: '/api/v1/select/cash-banks',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:121
 * @route '/api/v1/select/cash-banks'
 */
forSelect.url = (options?: RouteQueryOptions) => {
    return forSelect.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:121
 * @route '/api/v1/select/cash-banks'
 */
forSelect.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forSelect.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:121
 * @route '/api/v1/select/cash-banks'
 */
forSelect.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: forSelect.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:121
 * @route '/api/v1/select/cash-banks'
 */
    const forSelectForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: forSelect.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:121
 * @route '/api/v1/select/cash-banks'
 */
        forSelectForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forSelect.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::forSelect
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:121
 * @route '/api/v1/select/cash-banks'
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
* @see \Modules\DataMaster\Http\Controllers\CashBankController::index
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:26
 * @route '/api/v1/cash-banks'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/cash-banks',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::index
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:26
 * @route '/api/v1/cash-banks'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::index
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:26
 * @route '/api/v1/cash-banks'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::index
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:26
 * @route '/api/v1/cash-banks'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::index
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:26
 * @route '/api/v1/cash-banks'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::index
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:26
 * @route '/api/v1/cash-banks'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::index
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:26
 * @route '/api/v1/cash-banks'
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
* @see \Modules\DataMaster\Http\Controllers\CashBankController::store
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:46
 * @route '/api/v1/cash-banks'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/cash-banks',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::store
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:46
 * @route '/api/v1/cash-banks'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::store
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:46
 * @route '/api/v1/cash-banks'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::store
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:46
 * @route '/api/v1/cash-banks'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::store
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:46
 * @route '/api/v1/cash-banks'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::show
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:40
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
export const show = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/cash-banks/{cash_bank}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::show
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:40
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
show.url = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cash_bank: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    cash_bank: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        cash_bank: args.cash_bank,
                }

    return show.definition.url
            .replace('{cash_bank}', parsedArgs.cash_bank.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::show
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:40
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
show.get = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::show
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:40
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
show.head = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::show
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:40
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
    const showForm = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::show
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:40
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
        showForm.get = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::show
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:40
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
        showForm.head = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\CashBankController::update
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:72
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
export const update = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/cash-banks/{cash_bank}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::update
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:72
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
update.url = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cash_bank: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    cash_bank: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        cash_bank: args.cash_bank,
                }

    return update.definition.url
            .replace('{cash_bank}', parsedArgs.cash_bank.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::update
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:72
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
update.put = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::update
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:72
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
update.patch = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::update
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:72
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
    const updateForm = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::update
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:72
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
        updateForm.put = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::update
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:72
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
        updateForm.patch = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\CashBankController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:105
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
export const destroy = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/cash-banks/{cash_bank}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:105
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
destroy.url = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cash_bank: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    cash_bank: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        cash_bank: args.cash_bank,
                }

    return destroy.definition.url
            .replace('{cash_bank}', parsedArgs.cash_bank.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:105
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
destroy.delete = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:105
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
    const destroyForm = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\CashBankController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/CashBankController.php:105
 * @route '/api/v1/cash-banks/{cash_bank}'
 */
        destroyForm.delete = (args: { cash_bank: string | number } | [cash_bank: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const CashBankController = { forSelect, index, store, show, update, destroy }

export default CashBankController