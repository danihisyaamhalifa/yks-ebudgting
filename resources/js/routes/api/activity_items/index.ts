import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:23
 * @route '/api/v1/activity-items'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/activity-items',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:23
 * @route '/api/v1/activity-items'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:23
 * @route '/api/v1/activity-items'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:23
 * @route '/api/v1/activity-items'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:23
 * @route '/api/v1/activity-items'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:23
 * @route '/api/v1/activity-items'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:23
 * @route '/api/v1/activity-items'
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
const activity_items = {
    index: Object.assign(index, index),
}

export default activity_items