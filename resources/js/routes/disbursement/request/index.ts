import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
 * @see Modules/Disbursement/routes/web.php:7
 * @route '/pengajuan-pencairan'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/pengajuan-pencairan',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:7
 * @route '/pengajuan-pencairan'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:7
 * @route '/pengajuan-pencairan'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:7
 * @route '/pengajuan-pencairan'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:7
 * @route '/pengajuan-pencairan'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:7
 * @route '/pengajuan-pencairan'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:7
 * @route '/pengajuan-pencairan'
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
 * @see Modules/Disbursement/routes/web.php:15
 * @route '/pengajuan-pencairan/{id}/edit'
 */
export const edit = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/pengajuan-pencairan/{id}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:15
 * @route '/pengajuan-pencairan/{id}/edit'
 */
edit.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return edit.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:15
 * @route '/pengajuan-pencairan/{id}/edit'
 */
edit.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:15
 * @route '/pengajuan-pencairan/{id}/edit'
 */
edit.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:15
 * @route '/pengajuan-pencairan/{id}/edit'
 */
    const editForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:15
 * @route '/pengajuan-pencairan/{id}/edit'
 */
        editForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:15
 * @route '/pengajuan-pencairan/{id}/edit'
 */
        editForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
 * @see Modules/Disbursement/routes/web.php:21
 * @route '/verifikasi-pengajuan'
 */
export const verification = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verification.url(options),
    method: 'get',
})

verification.definition = {
    methods: ["get","head"],
    url: '/verifikasi-pengajuan',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:21
 * @route '/verifikasi-pengajuan'
 */
verification.url = (options?: RouteQueryOptions) => {
    return verification.definition.url + queryParams(options)
}

/**
 * @see Modules/Disbursement/routes/web.php:21
 * @route '/verifikasi-pengajuan'
 */
verification.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verification.url(options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:21
 * @route '/verifikasi-pengajuan'
 */
verification.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verification.url(options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:21
 * @route '/verifikasi-pengajuan'
 */
    const verificationForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verification.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:21
 * @route '/verifikasi-pengajuan'
 */
        verificationForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verification.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:21
 * @route '/verifikasi-pengajuan'
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
 * @see Modules/Disbursement/routes/web.php:25
 * @route '/verifikasi-pengajuan/{id}/verify'
 */
export const verify = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})

verify.definition = {
    methods: ["get","head"],
    url: '/verifikasi-pengajuan/{id}/verify',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Disbursement/routes/web.php:25
 * @route '/verifikasi-pengajuan/{id}/verify'
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
 * @see Modules/Disbursement/routes/web.php:25
 * @route '/verifikasi-pengajuan/{id}/verify'
 */
verify.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})
/**
 * @see Modules/Disbursement/routes/web.php:25
 * @route '/verifikasi-pengajuan/{id}/verify'
 */
verify.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verify.url(args, options),
    method: 'head',
})

    /**
 * @see Modules/Disbursement/routes/web.php:25
 * @route '/verifikasi-pengajuan/{id}/verify'
 */
    const verifyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verify.url(args, options),
        method: 'get',
    })

            /**
 * @see Modules/Disbursement/routes/web.php:25
 * @route '/verifikasi-pengajuan/{id}/verify'
 */
        verifyForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verify.url(args, options),
            method: 'get',
        })
            /**
 * @see Modules/Disbursement/routes/web.php:25
 * @route '/verifikasi-pengajuan/{id}/verify'
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
const request = {
    edit: Object.assign(edit, edit),
verification: Object.assign(verification, verification),
verify: Object.assign(verify, verify),
}

export default request