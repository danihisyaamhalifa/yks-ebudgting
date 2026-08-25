import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
 * @see Modules/Disbursement/routes/web.php:31
 * @route '/disposisi-pencairan'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/disposisi-pencairan',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:31
 * @route '/disposisi-pencairan'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:31
 * @route '/disposisi-pencairan'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:31
 * @route '/disposisi-pencairan'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:31
 * @route '/disposisi-pencairan'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:31
 * @route '/disposisi-pencairan'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:31
 * @route '/disposisi-pencairan'
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
/**
 * @see Modules/Disbursement/routes/web.php:35
 * @route '/disposisi-pencairan/input'
 */
export const input = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: input.url(options),
    method: 'get',
})

input.definition = {
    methods: ["get","head"],
    url: '/disposisi-pencairan/input',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:35
 * @route '/disposisi-pencairan/input'
 */
input.url = (options?: RouteQueryOptions) => {
    return input.definition.url + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:35
 * @route '/disposisi-pencairan/input'
 */
input.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: input.url(options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:35
 * @route '/disposisi-pencairan/input'
 */
input.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: input.url(options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:35
 * @route '/disposisi-pencairan/input'
 */
    const inputForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: input.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:35
 * @route '/disposisi-pencairan/input'
 */
        inputForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: input.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:35
 * @route '/disposisi-pencairan/input'
 */
        inputForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: input.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    input.form = inputForm
/**
 * @see Modules/Disbursement/routes/web.php:39
 * @route '/disposisi-pencairan/{id}/{mode}'
 */
export const form = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: form.url(args, options),
    method: 'get',
})

form.definition = {
    methods: ["get","head"],
    url: '/disposisi-pencairan/{id}/{mode}',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:39
 * @route '/disposisi-pencairan/{id}/{mode}'
 */
form.url = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                    mode: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                                mode: args.mode,
                }

    return form.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace('{mode}', parsedArgs.mode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:39
 * @route '/disposisi-pencairan/{id}/{mode}'
 */
form.get = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: form.url(args, options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:39
 * @route '/disposisi-pencairan/{id}/{mode}'
 */
form.head = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: form.url(args, options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:39
 * @route '/disposisi-pencairan/{id}/{mode}'
 */
    const formForm = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: form.url(args, options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:39
 * @route '/disposisi-pencairan/{id}/{mode}'
 */
        formForm.get = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: form.url(args, options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:39
 * @route '/disposisi-pencairan/{id}/{mode}'
 */
        formForm.head = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: form.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    form.form = formForm
const disposition = {
    index: Object.assign(index, index),
input: Object.assign(input, input),
form: Object.assign(form, form),
}

export default disposition