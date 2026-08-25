import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import requestA1f53f from './request'
/**
 * @see Modules/Disbursement/routes/web.php:11
 * @route '/pengajuan-pencairan/input'
 */
export const request = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: request.url(options),
    method: 'get',
})

request.definition = {
    methods: ["get","head"],
    url: '/pengajuan-pencairan/input',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:11
 * @route '/pengajuan-pencairan/input'
 */
request.url = (options?: RouteQueryOptions) => {
    return request.definition.url + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:11
 * @route '/pengajuan-pencairan/input'
 */
request.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: request.url(options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:11
 * @route '/pengajuan-pencairan/input'
 */
request.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: request.url(options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:11
 * @route '/pengajuan-pencairan/input'
 */
    const requestForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: request.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:11
 * @route '/pengajuan-pencairan/input'
 */
        requestForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: request.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:11
 * @route '/pengajuan-pencairan/input'
 */
        requestForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: request.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    request.form = requestForm
const disbursement = {
    request: Object.assign(request, requestA1f53f),
}

export default disbursement