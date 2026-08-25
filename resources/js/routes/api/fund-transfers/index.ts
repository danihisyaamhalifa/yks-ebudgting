import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::store
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:55
 * @route '/api/v1/fund-transfers'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/fund-transfers',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::store
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:55
 * @route '/api/v1/fund-transfers'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::store
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:55
 * @route '/api/v1/fund-transfers'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::store
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:55
 * @route '/api/v1/fund-transfers'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::store
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:55
 * @route '/api/v1/fund-transfers'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::show
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:340
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
export const show = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/fund-transfers/{fund_transfer}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::show
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:340
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
show.url = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { fund_transfer: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    fund_transfer: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        fund_transfer: args.fund_transfer,
                }

    return show.definition.url
            .replace('{fund_transfer}', parsedArgs.fund_transfer.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::show
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:340
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
show.get = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::show
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:340
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
show.head = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::show
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:340
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
    const showForm = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::show
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:340
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
        showForm.get = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::show
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:340
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
        showForm.head = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\Transaction\Http\Controllers\FundTransferController::update
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:161
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
export const update = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/fund-transfers/{fund_transfer}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::update
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:161
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
update.url = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { fund_transfer: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    fund_transfer: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        fund_transfer: args.fund_transfer,
                }

    return update.definition.url
            .replace('{fund_transfer}', parsedArgs.fund_transfer.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::update
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:161
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
update.put = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::update
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:161
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
update.patch = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::update
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:161
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
    const updateForm = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::update
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:161
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
        updateForm.put = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::update
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:161
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
        updateForm.patch = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\Transaction\Http\Controllers\FundTransferController::destroy
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:313
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
export const destroy = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/fund-transfers/{fund_transfer}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::destroy
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:313
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
destroy.url = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { fund_transfer: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    fund_transfer: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        fund_transfer: args.fund_transfer,
                }

    return destroy.definition.url
            .replace('{fund_transfer}', parsedArgs.fund_transfer.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::destroy
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:313
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
destroy.delete = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::destroy
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:313
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
    const destroyForm = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::destroy
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:313
 * @route '/api/v1/fund-transfers/{fund_transfer}'
 */
        destroyForm.delete = (args: { fund_transfer: string | number } | [fund_transfer: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const fundTransfers = {
    store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default fundTransfers