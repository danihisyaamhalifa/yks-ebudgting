import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import disposition from './disposition'
/**
 * @see Modules/Disbursement/routes/web.php:46
 * @route '/realisasi-pencairan'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/realisasi-pencairan',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:46
 * @route '/realisasi-pencairan'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:46
 * @route '/realisasi-pencairan'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:46
 * @route '/realisasi-pencairan'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:46
 * @route '/realisasi-pencairan'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:46
 * @route '/realisasi-pencairan'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:46
 * @route '/realisasi-pencairan'
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
 * @see Modules/Disbursement/routes/web.php:50
 * @route '/realisasi-pencairan/input'
 */
export const input = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: input.url(options),
    method: 'get',
})

input.definition = {
    methods: ["get","head"],
    url: '/realisasi-pencairan/input',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:50
 * @route '/realisasi-pencairan/input'
 */
input.url = (options?: RouteQueryOptions) => {
    return input.definition.url + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:50
 * @route '/realisasi-pencairan/input'
 */
input.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: input.url(options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:50
 * @route '/realisasi-pencairan/input'
 */
input.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: input.url(options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:50
 * @route '/realisasi-pencairan/input'
 */
    const inputForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: input.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:50
 * @route '/realisasi-pencairan/input'
 */
        inputForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: input.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:50
 * @route '/realisasi-pencairan/input'
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
 * @see Modules/Disbursement/routes/web.php:54
 * @route '/realisasi-pencairan/{id}/{mode}'
 */
export const form = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: form.url(args, options),
    method: 'get',
})

form.definition = {
    methods: ["get","head"],
    url: '/realisasi-pencairan/{id}/{mode}',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:54
 * @route '/realisasi-pencairan/{id}/{mode}'
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
 * @see Modules/Disbursement/routes/web.php:54
 * @route '/realisasi-pencairan/{id}/{mode}'
 */
form.get = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: form.url(args, options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:54
 * @route '/realisasi-pencairan/{id}/{mode}'
 */
form.head = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: form.url(args, options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:54
 * @route '/realisasi-pencairan/{id}/{mode}'
 */
    const formForm = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: form.url(args, options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:54
 * @route '/realisasi-pencairan/{id}/{mode}'
 */
        formForm.get = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: form.url(args, options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:54
 * @route '/realisasi-pencairan/{id}/{mode}'
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
/**
 * @see Modules/Disbursement/routes/web.php:61
 * @route '/verifikasi-realisasi-pencairan'
 */
export const verification = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verification.url(options),
    method: 'get',
})

verification.definition = {
    methods: ["get","head"],
    url: '/verifikasi-realisasi-pencairan',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:61
 * @route '/verifikasi-realisasi-pencairan'
 */
verification.url = (options?: RouteQueryOptions) => {
    return verification.definition.url + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:61
 * @route '/verifikasi-realisasi-pencairan'
 */
verification.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verification.url(options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:61
 * @route '/verifikasi-realisasi-pencairan'
 */
verification.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verification.url(options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:61
 * @route '/verifikasi-realisasi-pencairan'
 */
    const verificationForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verification.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:61
 * @route '/verifikasi-realisasi-pencairan'
 */
        verificationForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verification.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:61
 * @route '/verifikasi-realisasi-pencairan'
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
 * @see Modules/Disbursement/routes/web.php:65
 * @route '/verifikasi-realisasi-pencairan/{id}/verify'
 */
export const verify = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})

verify.definition = {
    methods: ["get","head"],
    url: '/verifikasi-realisasi-pencairan/{id}/verify',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:65
 * @route '/verifikasi-realisasi-pencairan/{id}/verify'
 */
verify.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return verify.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:65
 * @route '/verifikasi-realisasi-pencairan/{id}/verify'
 */
verify.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:65
 * @route '/verifikasi-realisasi-pencairan/{id}/verify'
 */
verify.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verify.url(args, options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:65
 * @route '/verifikasi-realisasi-pencairan/{id}/verify'
 */
    const verifyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verify.url(args, options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:65
 * @route '/verifikasi-realisasi-pencairan/{id}/verify'
 */
        verifyForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verify.url(args, options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:65
 * @route '/verifikasi-realisasi-pencairan/{id}/verify'
 */
        verifyForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verify.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    verify.form = verifyForm
const fundrelease = {
    disposition: Object.assign(disposition, disposition),
index: Object.assign(index, index),
input: Object.assign(input, input),
form: Object.assign(form, form),
verification: Object.assign(verification, verification),
verify: Object.assign(verify, verify),
}

export default fundrelease