import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/parameter-values',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ParameterValueController::index
 * @see Modules/DataMaster/app/Http/Controllers/ParameterValueController.php:24
 * @route '/api/v1/parameter-values'
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
const parameterValue = {
    index: Object.assign(index, index),
}

export default parameterValue