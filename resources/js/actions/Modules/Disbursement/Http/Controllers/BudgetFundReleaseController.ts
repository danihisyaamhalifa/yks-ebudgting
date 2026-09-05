import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:36
 * @route '/api/v1/budget-fund-releases'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-fund-releases',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:36
 * @route '/api/v1/budget-fund-releases'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:36
 * @route '/api/v1/budget-fund-releases'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:36
 * @route '/api/v1/budget-fund-releases'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:36
 * @route '/api/v1/budget-fund-releases'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:36
 * @route '/api/v1/budget-fund-releases'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:36
 * @route '/api/v1/budget-fund-releases'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:73
 * @route '/api/v1/budget-fund-releases'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/budget-fund-releases',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:73
 * @route '/api/v1/budget-fund-releases'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:73
 * @route '/api/v1/budget-fund-releases'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:73
 * @route '/api/v1/budget-fund-releases'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:73
 * @route '/api/v1/budget-fund-releases'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:180
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
export const show = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-fund-releases/{budget_fund_release}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:180
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
show.url = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_fund_release: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_fund_release: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_fund_release: args.budget_fund_release,
                }

    return show.definition.url
            .replace('{budget_fund_release}', parsedArgs.budget_fund_release.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:180
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
show.get = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:180
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
show.head = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:180
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
    const showForm = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:180
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
        showForm.get = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:180
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
        showForm.head = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:216
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
export const update = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/budget-fund-releases/{budget_fund_release}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:216
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
update.url = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_fund_release: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_fund_release: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_fund_release: args.budget_fund_release,
                }

    return update.definition.url
            .replace('{budget_fund_release}', parsedArgs.budget_fund_release.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:216
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
update.put = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:216
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
update.patch = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:216
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
    const updateForm = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:216
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
        updateForm.put = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:216
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
        updateForm.patch = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:447
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
export const destroy = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/budget-fund-releases/{budget_fund_release}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:447
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
destroy.url = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_fund_release: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_fund_release: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_fund_release: args.budget_fund_release,
                }

    return destroy.definition.url
            .replace('{budget_fund_release}', parsedArgs.budget_fund_release.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:447
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
destroy.delete = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:447
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
    const destroyForm = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:447
 * @route '/api/v1/budget-fund-releases/{budget_fund_release}'
 */
        destroyForm.delete = (args: { budget_fund_release: string | number } | [budget_fund_release: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:633
 * @route '/api/v1/budget-fund-releases/{id}/approvals'
 */
export const approvals = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(args, options),
    method: 'get',
})

approvals.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-fund-releases/{id}/approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:633
 * @route '/api/v1/budget-fund-releases/{id}/approvals'
 */
approvals.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return approvals.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:633
 * @route '/api/v1/budget-fund-releases/{id}/approvals'
 */
approvals.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:633
 * @route '/api/v1/budget-fund-releases/{id}/approvals'
 */
approvals.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: approvals.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:633
 * @route '/api/v1/budget-fund-releases/{id}/approvals'
 */
    const approvalsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: approvals.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:633
 * @route '/api/v1/budget-fund-releases/{id}/approvals'
 */
        approvalsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvals.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:633
 * @route '/api/v1/budget-fund-releases/{id}/approvals'
 */
        approvalsForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvals.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    approvals.form = approvalsForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:689
 * @route '/api/v1/budget-fund-release-approvals/{id}/submit'
 */
export const submit = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

submit.definition = {
    methods: ["post"],
    url: '/api/v1/budget-fund-release-approvals/{id}/submit',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:689
 * @route '/api/v1/budget-fund-release-approvals/{id}/submit'
 */
submit.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return submit.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:689
 * @route '/api/v1/budget-fund-release-approvals/{id}/submit'
 */
submit.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:689
 * @route '/api/v1/budget-fund-release-approvals/{id}/submit'
 */
    const submitForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: submit.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:689
 * @route '/api/v1/budget-fund-release-approvals/{id}/submit'
 */
        submitForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: submit.url(args, options),
            method: 'post',
        })
    
    submit.form = submitForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:778
 * @route '/api/v1/budget-fund-release-approvals/{id}/resubmit'
 */
export const resubmit = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resubmit.url(args, options),
    method: 'post',
})

resubmit.definition = {
    methods: ["post"],
    url: '/api/v1/budget-fund-release-approvals/{id}/resubmit',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:778
 * @route '/api/v1/budget-fund-release-approvals/{id}/resubmit'
 */
resubmit.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return resubmit.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:778
 * @route '/api/v1/budget-fund-release-approvals/{id}/resubmit'
 */
resubmit.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resubmit.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:778
 * @route '/api/v1/budget-fund-release-approvals/{id}/resubmit'
 */
    const resubmitForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resubmit.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:778
 * @route '/api/v1/budget-fund-release-approvals/{id}/resubmit'
 */
        resubmitForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resubmit.url(args, options),
            method: 'post',
        })
    
    resubmit.form = resubmitForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:878
 * @route '/api/v1/budget-fund-release-approvals/{id}/approve'
 */
export const approve = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/api/v1/budget-fund-release-approvals/{id}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:878
 * @route '/api/v1/budget-fund-release-approvals/{id}/approve'
 */
approve.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return approve.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:878
 * @route '/api/v1/budget-fund-release-approvals/{id}/approve'
 */
approve.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:878
 * @route '/api/v1/budget-fund-release-approvals/{id}/approve'
 */
    const approveForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:878
 * @route '/api/v1/budget-fund-release-approvals/{id}/approve'
 */
        approveForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:951
 * @route '/api/v1/budget-fund-release-approvals/{id}/reject'
 */
export const reject = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/api/v1/budget-fund-release-approvals/{id}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:951
 * @route '/api/v1/budget-fund-release-approvals/{id}/reject'
 */
reject.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reject.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:951
 * @route '/api/v1/budget-fund-release-approvals/{id}/reject'
 */
reject.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:951
 * @route '/api/v1/budget-fund-release-approvals/{id}/reject'
 */
    const rejectForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:951
 * @route '/api/v1/budget-fund-release-approvals/{id}/reject'
 */
        rejectForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:1010
 * @route '/api/v1/budget-fund-release-approvals/{id}/return'
 */
export const returned = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: returned.url(args, options),
    method: 'post',
})

returned.definition = {
    methods: ["post"],
    url: '/api/v1/budget-fund-release-approvals/{id}/return',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:1010
 * @route '/api/v1/budget-fund-release-approvals/{id}/return'
 */
returned.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return returned.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:1010
 * @route '/api/v1/budget-fund-release-approvals/{id}/return'
 */
returned.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: returned.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:1010
 * @route '/api/v1/budget-fund-release-approvals/{id}/return'
 */
    const returnedForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: returned.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetFundReleaseController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetFundReleaseController.php:1010
 * @route '/api/v1/budget-fund-release-approvals/{id}/return'
 */
        returnedForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: returned.url(args, options),
            method: 'post',
        })
    
    returned.form = returnedForm
const BudgetFundReleaseController = { index, store, show, update, destroy, approvals, submit, resubmit, approve, reject, returned }

export default BudgetFundReleaseController