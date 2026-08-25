import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:35
 * @route '/api/v1/budget-accountabilities'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-accountabilities',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:35
 * @route '/api/v1/budget-accountabilities'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:35
 * @route '/api/v1/budget-accountabilities'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:35
 * @route '/api/v1/budget-accountabilities'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:35
 * @route '/api/v1/budget-accountabilities'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:35
 * @route '/api/v1/budget-accountabilities'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:35
 * @route '/api/v1/budget-accountabilities'
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
const accountability = {
    index: Object.assign(index, index),
}

export default accountability