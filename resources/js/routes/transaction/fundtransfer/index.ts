import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
 * @see Modules/Transaction/routes/web.php:7
 * @route '/transfer-dana'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/transfer-dana',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Transaction/routes/web.php:7
 * @route '/transfer-dana'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
 * @see Modules/Transaction/routes/web.php:7
 * @route '/transfer-dana'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
 * @see Modules/Transaction/routes/web.php:7
 * @route '/transfer-dana'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
 * @see Modules/Transaction/routes/web.php:7
 * @route '/transfer-dana'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Transaction/routes/web.php:7
 * @route '/transfer-dana'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Transaction/routes/web.php:7
 * @route '/transfer-dana'
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
const fundtransfer = {
    index: Object.assign(index, index),
}

export default fundtransfer