import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
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
const cashMutation = {
    index: Object.assign(index, index),
}

export default cashMutation