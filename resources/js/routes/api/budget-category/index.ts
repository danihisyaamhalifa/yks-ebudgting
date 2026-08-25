import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
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
const budgetCategory = {
    index: Object.assign(index, index),
}

export default budgetCategory