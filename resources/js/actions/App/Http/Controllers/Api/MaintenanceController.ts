import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\MaintenanceController::clearCache
 * @see app/Http/Controllers/Api/MaintenanceController.php:62
 * @route '/maintenance/clear-cache'
 */
export const clearCache = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: clearCache.url(options),
    method: 'get',
})

clearCache.definition = {
    methods: ["get","head"],
    url: '/maintenance/clear-cache',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\MaintenanceController::clearCache
 * @see app/Http/Controllers/Api/MaintenanceController.php:62
 * @route '/maintenance/clear-cache'
 */
clearCache.url = (options?: RouteQueryOptions) => {
    return clearCache.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MaintenanceController::clearCache
 * @see app/Http/Controllers/Api/MaintenanceController.php:62
 * @route '/maintenance/clear-cache'
 */
clearCache.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: clearCache.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\MaintenanceController::clearCache
 * @see app/Http/Controllers/Api/MaintenanceController.php:62
 * @route '/maintenance/clear-cache'
 */
clearCache.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: clearCache.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\MaintenanceController::clearCache
 * @see app/Http/Controllers/Api/MaintenanceController.php:62
 * @route '/maintenance/clear-cache'
 */
    const clearCacheForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: clearCache.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\MaintenanceController::clearCache
 * @see app/Http/Controllers/Api/MaintenanceController.php:62
 * @route '/maintenance/clear-cache'
 */
        clearCacheForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: clearCache.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\MaintenanceController::clearCache
 * @see app/Http/Controllers/Api/MaintenanceController.php:62
 * @route '/maintenance/clear-cache'
 */
        clearCacheForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: clearCache.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    clearCache.form = clearCacheForm
/**
* @see \App\Http\Controllers\Api\MaintenanceController::activateStorage
 * @see app/Http/Controllers/Api/MaintenanceController.php:12
 * @route '/maintenance/activate-storage'
 */
export const activateStorage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activateStorage.url(options),
    method: 'get',
})

activateStorage.definition = {
    methods: ["get","head"],
    url: '/maintenance/activate-storage',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\MaintenanceController::activateStorage
 * @see app/Http/Controllers/Api/MaintenanceController.php:12
 * @route '/maintenance/activate-storage'
 */
activateStorage.url = (options?: RouteQueryOptions) => {
    return activateStorage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MaintenanceController::activateStorage
 * @see app/Http/Controllers/Api/MaintenanceController.php:12
 * @route '/maintenance/activate-storage'
 */
activateStorage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activateStorage.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\MaintenanceController::activateStorage
 * @see app/Http/Controllers/Api/MaintenanceController.php:12
 * @route '/maintenance/activate-storage'
 */
activateStorage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activateStorage.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\MaintenanceController::activateStorage
 * @see app/Http/Controllers/Api/MaintenanceController.php:12
 * @route '/maintenance/activate-storage'
 */
    const activateStorageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: activateStorage.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\MaintenanceController::activateStorage
 * @see app/Http/Controllers/Api/MaintenanceController.php:12
 * @route '/maintenance/activate-storage'
 */
        activateStorageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: activateStorage.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\MaintenanceController::activateStorage
 * @see app/Http/Controllers/Api/MaintenanceController.php:12
 * @route '/maintenance/activate-storage'
 */
        activateStorageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: activateStorage.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    activateStorage.form = activateStorageForm
const MaintenanceController = { clearCache, activateStorage }

export default MaintenanceController