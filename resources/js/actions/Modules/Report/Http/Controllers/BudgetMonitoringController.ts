import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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
/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::transactions
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:200
 * @route '/api/v1/budget-monitoring/transactions/{id}'
 */
export const transactions = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: transactions.url(args, options),
    method: 'get',
})

transactions.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-monitoring/transactions/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::transactions
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:200
 * @route '/api/v1/budget-monitoring/transactions/{id}'
 */
transactions.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return transactions.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::transactions
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:200
 * @route '/api/v1/budget-monitoring/transactions/{id}'
 */
transactions.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: transactions.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::transactions
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:200
 * @route '/api/v1/budget-monitoring/transactions/{id}'
 */
transactions.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: transactions.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::transactions
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:200
 * @route '/api/v1/budget-monitoring/transactions/{id}'
 */
    const transactionsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: transactions.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::transactions
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:200
 * @route '/api/v1/budget-monitoring/transactions/{id}'
 */
        transactionsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: transactions.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Report\Http\Controllers\BudgetMonitoringController::transactions
 * @see Modules/Report/app/Http/Controllers/BudgetMonitoringController.php:200
 * @route '/api/v1/budget-monitoring/transactions/{id}'
 */
        transactionsForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: transactions.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    transactions.form = transactionsForm
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
const BudgetMonitoringController = { data, summary, transactions, index }

export default BudgetMonitoringController