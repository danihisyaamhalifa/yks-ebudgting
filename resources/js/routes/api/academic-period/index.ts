import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/academic-periods',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\AcademicPeriodController::index
 * @see Modules/DataMaster/app/Http/Controllers/AcademicPeriodController.php:23
 * @route '/api/v1/academic-periods'
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
const academicPeriod = {
    index: Object.assign(index, index),
}

export default academicPeriod