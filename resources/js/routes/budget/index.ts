import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import requestA1f53f from './request'
import fundrelease from './fundrelease'
import accountability from './accountability'
/**
 * @see Modules/Budget/routes/web.php:7
 * @route '/perencanaan-anggaran'
 */
export const request = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: request.url(options),
    method: 'get',
})

request.definition = {
    methods: ["get","head"],
    url: '/perencanaan-anggaran',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Budget/routes/web.php:7
 * @route '/perencanaan-anggaran'
 */
request.url = (options?: RouteQueryOptions) => {
    return request.definition.url + queryParams(options)
}

/**
 * @see Modules/Budget/routes/web.php:7
 * @route '/perencanaan-anggaran'
 */
request.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: request.url(options),
    method: 'get',
})
/**
 * @see Modules/Budget/routes/web.php:7
 * @route '/perencanaan-anggaran'
 */
request.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: request.url(options),
    method: 'head',
})

    /**
 * @see Modules/Budget/routes/web.php:7
 * @route '/perencanaan-anggaran'
 */
    const requestForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: request.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Budget/routes/web.php:7
 * @route '/perencanaan-anggaran'
 */
        requestForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: request.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Budget/routes/web.php:7
 * @route '/perencanaan-anggaran'
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
/**
 * @see Modules/Budget/routes/web.php:28
 * @route '/verifikasi-anggaran'
 */
export const verification = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verification.url(options),
    method: 'get',
})

verification.definition = {
    methods: ["get","head"],
    url: '/verifikasi-anggaran',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Budget/routes/web.php:28
 * @route '/verifikasi-anggaran'
 */
verification.url = (options?: RouteQueryOptions) => {
    return verification.definition.url + queryParams(options)
}

/**
 * @see Modules/Budget/routes/web.php:28
 * @route '/verifikasi-anggaran'
 */
verification.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verification.url(options),
    method: 'get',
})
/**
 * @see Modules/Budget/routes/web.php:28
 * @route '/verifikasi-anggaran'
 */
verification.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verification.url(options),
    method: 'head',
})

    /**
 * @see Modules/Budget/routes/web.php:28
 * @route '/verifikasi-anggaran'
 */
    const verificationForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verification.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Budget/routes/web.php:28
 * @route '/verifikasi-anggaran'
 */
        verificationForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verification.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Budget/routes/web.php:28
 * @route '/verifikasi-anggaran'
 */
        verificationForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verification.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    verification.form = verificationForm
/**
 * @see Modules/Budget/routes/web.php:39
 * @route '/pagu-anggaran'
 */
export const allocated = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: allocated.url(options),
    method: 'get',
})

allocated.definition = {
    methods: ["get","head"],
    url: '/pagu-anggaran',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Budget/routes/web.php:39
 * @route '/pagu-anggaran'
 */
allocated.url = (options?: RouteQueryOptions) => {
    return allocated.definition.url + queryParams(options)
}

/**
 * @see Modules/Budget/routes/web.php:39
 * @route '/pagu-anggaran'
 */
allocated.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: allocated.url(options),
    method: 'get',
})
/**
 * @see Modules/Budget/routes/web.php:39
 * @route '/pagu-anggaran'
 */
allocated.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: allocated.url(options),
    method: 'head',
})

    /**
 * @see Modules/Budget/routes/web.php:39
 * @route '/pagu-anggaran'
 */
    const allocatedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: allocated.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Budget/routes/web.php:39
 * @route '/pagu-anggaran'
 */
        allocatedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: allocated.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Budget/routes/web.php:39
 * @route '/pagu-anggaran'
 */
        allocatedForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: allocated.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    allocated.form = allocatedForm
const budget = {
    request: Object.assign(request, requestA1f53f),
verification: Object.assign(verification, verification),
allocated: Object.assign(allocated, allocated),
fundrelease: Object.assign(fundrelease, fundrelease),
accountability: Object.assign(accountability, accountability),
}

export default budget