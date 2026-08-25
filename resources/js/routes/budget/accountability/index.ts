import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
 * @see Modules/Disbursement/routes/web.php:71
 * @route '/pertanggungjawaban'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/pertanggungjawaban',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:71
 * @route '/pertanggungjawaban'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:71
 * @route '/pertanggungjawaban'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:71
 * @route '/pertanggungjawaban'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:71
 * @route '/pertanggungjawaban'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:71
 * @route '/pertanggungjawaban'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:71
 * @route '/pertanggungjawaban'
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
 * @see Modules/Disbursement/routes/web.php:75
 * @route '/pertanggungjawaban/input'
 */
export const input = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: input.url(options),
    method: 'get',
})

input.definition = {
    methods: ["get","head"],
    url: '/pertanggungjawaban/input',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:75
 * @route '/pertanggungjawaban/input'
 */
input.url = (options?: RouteQueryOptions) => {
    return input.definition.url + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:75
 * @route '/pertanggungjawaban/input'
 */
input.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: input.url(options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:75
 * @route '/pertanggungjawaban/input'
 */
input.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: input.url(options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:75
 * @route '/pertanggungjawaban/input'
 */
    const inputForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: input.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:75
 * @route '/pertanggungjawaban/input'
 */
        inputForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: input.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:75
 * @route '/pertanggungjawaban/input'
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
 * @see Modules/Disbursement/routes/web.php:79
 * @route '/pertanggungjawaban/{id}/{mode}'
 */
export const edit = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/pertanggungjawaban/{id}/{mode}',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:79
 * @route '/pertanggungjawaban/{id}/{mode}'
 */
edit.url = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions) => {
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

    return edit.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace('{mode}', parsedArgs.mode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:79
 * @route '/pertanggungjawaban/{id}/{mode}'
 */
edit.get = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:79
 * @route '/pertanggungjawaban/{id}/{mode}'
 */
edit.head = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:79
 * @route '/pertanggungjawaban/{id}/{mode}'
 */
    const editForm = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:79
 * @route '/pertanggungjawaban/{id}/{mode}'
 */
        editForm.get = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:79
 * @route '/pertanggungjawaban/{id}/{mode}'
 */
        editForm.head = (args: { id: string | number, mode: string | number } | [id: string | number, mode: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
 * @see Modules/Disbursement/routes/web.php:86
 * @route '/verifikasi-pertanggungjawaban'
 */
export const verification = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verification.url(options),
    method: 'get',
})

verification.definition = {
    methods: ["get","head"],
    url: '/verifikasi-pertanggungjawaban',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:86
 * @route '/verifikasi-pertanggungjawaban'
 */
verification.url = (options?: RouteQueryOptions) => {
    return verification.definition.url + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:86
 * @route '/verifikasi-pertanggungjawaban'
 */
verification.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verification.url(options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:86
 * @route '/verifikasi-pertanggungjawaban'
 */
verification.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verification.url(options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:86
 * @route '/verifikasi-pertanggungjawaban'
 */
    const verificationForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verification.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:86
 * @route '/verifikasi-pertanggungjawaban'
 */
        verificationForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verification.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:86
 * @route '/verifikasi-pertanggungjawaban'
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
 * @see Modules/Disbursement/routes/web.php:90
 * @route '/verifikasi-pertanggungjawaban/{id}/verify'
 */
export const verify = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})

verify.definition = {
    methods: ["get","head"],
    url: '/verifikasi-pertanggungjawaban/{id}/verify',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:90
 * @route '/verifikasi-pertanggungjawaban/{id}/verify'
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
 * @see Modules/Disbursement/routes/web.php:90
 * @route '/verifikasi-pertanggungjawaban/{id}/verify'
 */
verify.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:90
 * @route '/verifikasi-pertanggungjawaban/{id}/verify'
 */
verify.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verify.url(args, options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:90
 * @route '/verifikasi-pertanggungjawaban/{id}/verify'
 */
    const verifyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verify.url(args, options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:90
 * @route '/verifikasi-pertanggungjawaban/{id}/verify'
 */
        verifyForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verify.url(args, options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:90
 * @route '/verifikasi-pertanggungjawaban/{id}/verify'
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
const accountability = {
    index: Object.assign(index, index),
input: Object.assign(input, input),
edit: Object.assign(edit, edit),
verification: Object.assign(verification, verification),
verify: Object.assign(verify, verify),
}

export default accountability