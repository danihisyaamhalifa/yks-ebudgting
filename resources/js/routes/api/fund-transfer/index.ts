import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::index
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:33
 * @route '/api/v1/fund-transfers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/fund-transfers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::index
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:33
 * @route '/api/v1/fund-transfers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::index
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:33
 * @route '/api/v1/fund-transfers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::index
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:33
 * @route '/api/v1/fund-transfers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::index
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:33
 * @route '/api/v1/fund-transfers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::index
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:33
 * @route '/api/v1/fund-transfers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Transaction\Http\Controllers\FundTransferController::index
 * @see Modules/Transaction/app/Http/Controllers/FundTransferController.php:33
 * @route '/api/v1/fund-transfers'
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
const fundTransfer = {
    index: Object.assign(index, index),
}

export default fundTransfer