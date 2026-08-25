import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::index
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:27
 * @route '/api/v1/units'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/units',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::index
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:27
 * @route '/api/v1/units'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::index
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:27
 * @route '/api/v1/units'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\UnitController::index
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:27
 * @route '/api/v1/units'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::index
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:27
 * @route '/api/v1/units'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::index
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:27
 * @route '/api/v1/units'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\UnitController::index
 * @see Modules/DataMaster/app/Http/Controllers/UnitController.php:27
 * @route '/api/v1/units'
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
const unit = {
    index: Object.assign(index, index),
}

export default unit