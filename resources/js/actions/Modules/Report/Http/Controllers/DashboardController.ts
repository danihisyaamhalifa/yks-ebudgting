import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \Modules\Report\Http\Controllers\DashboardController::index
 * @see Modules/Report/app/Http/Controllers/DashboardController.php:16
 * @route '/dashboard'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Report\Http\Controllers\DashboardController::index
 * @see Modules/Report/app/Http/Controllers/DashboardController.php:16
 * @route '/dashboard'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\Report\Http\Controllers\DashboardController::index
 * @see Modules/Report/app/Http/Controllers/DashboardController.php:16
 * @route '/dashboard'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\Report\Http\Controllers\DashboardController::index
 * @see Modules/Report/app/Http/Controllers/DashboardController.php:16
 * @route '/dashboard'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\Report\Http\Controllers\DashboardController::index
 * @see Modules/Report/app/Http/Controllers/DashboardController.php:16
 * @route '/dashboard'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Report\Http\Controllers\DashboardController::index
 * @see Modules/Report/app/Http/Controllers/DashboardController.php:16
 * @route '/dashboard'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Report\Http\Controllers\DashboardController::index
 * @see Modules/Report/app/Http/Controllers/DashboardController.php:16
 * @route '/dashboard'
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
const DashboardController = { index }

export default DashboardController