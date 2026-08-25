import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::data
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:22
 * @route '/api/v1/budget-monitoring/data'
 */
export const data = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})

data.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-monitoring/data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::data
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:22
 * @route '/api/v1/budget-monitoring/data'
 */
data.url = (options?: RouteQueryOptions) => {
    return data.definition.url + queryParams(options)
}

/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::data
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:22
 * @route '/api/v1/budget-monitoring/data'
 */
data.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})
/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::data
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:22
 * @route '/api/v1/budget-monitoring/data'
 */
data.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: data.url(options),
    method: 'head',
})

    /**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::data
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:22
 * @route '/api/v1/budget-monitoring/data'
 */
    const dataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: data.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::data
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:22
 * @route '/api/v1/budget-monitoring/data'
 */
        dataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: data.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::data
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:22
 * @route '/api/v1/budget-monitoring/data'
 */
        dataForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: data.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    data.form = dataForm
/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::summary
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:111
 * @route '/api/v1/budget-monitoring/summary'
 */
export const summary = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(options),
    method: 'get',
})

summary.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-monitoring/summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::summary
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:111
 * @route '/api/v1/budget-monitoring/summary'
 */
summary.url = (options?: RouteQueryOptions) => {
    return summary.definition.url + queryParams(options)
}

/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::summary
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:111
 * @route '/api/v1/budget-monitoring/summary'
 */
summary.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(options),
    method: 'get',
})
/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::summary
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:111
 * @route '/api/v1/budget-monitoring/summary'
 */
summary.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: summary.url(options),
    method: 'head',
})

    /**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::summary
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:111
 * @route '/api/v1/budget-monitoring/summary'
 */
    const summaryForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: summary.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::summary
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:111
 * @route '/api/v1/budget-monitoring/summary'
 */
        summaryForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: summary.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::summary
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:111
 * @route '/api/v1/budget-monitoring/summary'
 */
        summaryForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: summary.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    summary.form = summaryForm
const budgetMonitoring = {
    data: Object.assign(data, data),
summary: Object.assign(summary, summary),
}

export default budgetMonitoring