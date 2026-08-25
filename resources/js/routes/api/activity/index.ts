import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\ActivityController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityController.php:23
 * @route '/api/v1/activities'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/activities',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ActivityController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityController.php:23
 * @route '/api/v1/activities'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ActivityController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityController.php:23
 * @route '/api/v1/activities'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ActivityController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityController.php:23
 * @route '/api/v1/activities'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ActivityController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityController.php:23
 * @route '/api/v1/activities'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ActivityController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityController.php:23
 * @route '/api/v1/activities'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ActivityController::index
 * @see Modules/DataMaster/app/Http/Controllers/ActivityController.php:23
 * @route '/api/v1/activities'
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
const activity = {
    index: Object.assign(index, index),
}

export default activity