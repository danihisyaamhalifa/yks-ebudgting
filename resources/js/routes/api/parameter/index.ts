import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/parameters',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterController.php:25
 * @route '/api/v1/parameters'
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
const parameter = {
    index: Object.assign(index, index),
}

export default parameter