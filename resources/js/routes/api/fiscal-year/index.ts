import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/fiscal-years',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\FiscalYearController::index
 * @see Modules/DataMaster/app/Http/Controllers/FiscalYearController.php:23
 * @route '/api/v1/fiscal-years'
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
const fiscalYear = {
    index: Object.assign(index, index),
}

export default fiscalYear