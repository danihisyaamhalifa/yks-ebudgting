import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::index
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:17
 * @route '/monitoring-anggaran'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/monitoring-anggaran',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::index
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:17
 * @route '/monitoring-anggaran'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::index
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:17
 * @route '/monitoring-anggaran'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::index
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:17
 * @route '/monitoring-anggaran'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::index
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:17
 * @route '/monitoring-anggaran'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::index
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:17
 * @route '/monitoring-anggaran'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::index
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:17
 * @route '/monitoring-anggaran'
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
const budgetMonitoring = {
    index: Object.assign(index, index),
}

export default budgetMonitoring