import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::index
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:23
 * @route '/api/v1/transaction-types'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/transaction-types',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::index
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:23
 * @route '/api/v1/transaction-types'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::index
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:23
 * @route '/api/v1/transaction-types'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::index
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:23
 * @route '/api/v1/transaction-types'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::index
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:23
 * @route '/api/v1/transaction-types'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::index
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:23
 * @route '/api/v1/transaction-types'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\TransactionTypeController::index
 * @see Modules/DataMaster/app/Http/Controllers/TransactionTypeController.php:23
 * @route '/api/v1/transaction-types'
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
const transactionType = {
    index: Object.assign(index, index),
}

export default transactionType