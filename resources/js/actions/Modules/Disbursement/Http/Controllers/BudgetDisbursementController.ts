import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:39
 * @route '/api/v1/budget-disbursements'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-disbursements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:39
 * @route '/api/v1/budget-disbursements'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:39
 * @route '/api/v1/budget-disbursements'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:39
 * @route '/api/v1/budget-disbursements'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:39
 * @route '/api/v1/budget-disbursements'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:39
 * @route '/api/v1/budget-disbursements'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:39
 * @route '/api/v1/budget-disbursements'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:76
 * @route '/api/v1/budget-disbursements'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/budget-disbursements',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:76
 * @route '/api/v1/budget-disbursements'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:76
 * @route '/api/v1/budget-disbursements'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:76
 * @route '/api/v1/budget-disbursements'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:76
 * @route '/api/v1/budget-disbursements'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:199
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
export const show = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-disbursements/{budget_disbursement}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:199
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
show.url = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_disbursement: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_disbursement: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_disbursement: args.budget_disbursement,
                }

    return show.definition.url
            .replace('{budget_disbursement}', parsedArgs.budget_disbursement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:199
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
show.get = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:199
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
show.head = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:199
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
    const showForm = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:199
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
        showForm.get = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:199
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
        showForm.head = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:136
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
export const update = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/budget-disbursements/{budget_disbursement}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:136
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
update.url = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_disbursement: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_disbursement: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_disbursement: args.budget_disbursement,
                }

    return update.definition.url
            .replace('{budget_disbursement}', parsedArgs.budget_disbursement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:136
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
update.put = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:136
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
update.patch = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:136
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
    const updateForm = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:136
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
        updateForm.put = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:136
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
        updateForm.patch = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:329
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
export const destroy = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/budget-disbursements/{budget_disbursement}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:329
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
destroy.url = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_disbursement: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_disbursement: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_disbursement: args.budget_disbursement,
                }

    return destroy.definition.url
            .replace('{budget_disbursement}', parsedArgs.budget_disbursement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:329
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
destroy.delete = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:329
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
    const destroyForm = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:329
 * @route '/api/v1/budget-disbursements/{budget_disbursement}'
 */
        destroyForm.delete = (args: { budget_disbursement: string | number } | [budget_disbursement: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:440
 * @route '/api/v1/budget-disbursements/{id}/approvals'
 */
export const approvals = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(args, options),
    method: 'get',
})

approvals.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-disbursements/{id}/approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:440
 * @route '/api/v1/budget-disbursements/{id}/approvals'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:440
 * @route '/api/v1/budget-disbursements/{id}/approvals'
 */
approvals.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:440
 * @route '/api/v1/budget-disbursements/{id}/approvals'
 */
approvals.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: approvals.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:440
 * @route '/api/v1/budget-disbursements/{id}/approvals'
 */
    const approvalsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: approvals.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:440
 * @route '/api/v1/budget-disbursements/{id}/approvals'
 */
        approvalsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvals.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:440
 * @route '/api/v1/budget-disbursements/{id}/approvals'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvalHistory
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:483
 * @route '/api/v1/budget-disbursements/{disbursement}/approval-history'
 */
export const approvalHistory = (args: { disbursement: number | { id: number } } | [disbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvalHistory.url(args, options),
    method: 'get',
})

approvalHistory.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-disbursements/{disbursement}/approval-history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvalHistory
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:483
 * @route '/api/v1/budget-disbursements/{disbursement}/approval-history'
 */
approvalHistory.url = (args: { disbursement: number | { id: number } } | [disbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { disbursement: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { disbursement: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    disbursement: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        disbursement: typeof args.disbursement === 'object'
                ? args.disbursement.id
                : args.disbursement,
                }

    return approvalHistory.definition.url
            .replace('{disbursement}', parsedArgs.disbursement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvalHistory
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:483
 * @route '/api/v1/budget-disbursements/{disbursement}/approval-history'
 */
approvalHistory.get = (args: { disbursement: number | { id: number } } | [disbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvalHistory.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvalHistory
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:483
 * @route '/api/v1/budget-disbursements/{disbursement}/approval-history'
 */
approvalHistory.head = (args: { disbursement: number | { id: number } } | [disbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: approvalHistory.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvalHistory
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:483
 * @route '/api/v1/budget-disbursements/{disbursement}/approval-history'
 */
    const approvalHistoryForm = (args: { disbursement: number | { id: number } } | [disbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: approvalHistory.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvalHistory
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:483
 * @route '/api/v1/budget-disbursements/{disbursement}/approval-history'
 */
        approvalHistoryForm.get = (args: { disbursement: number | { id: number } } | [disbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvalHistory.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approvalHistory
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:483
 * @route '/api/v1/budget-disbursements/{disbursement}/approval-history'
 */
        approvalHistoryForm.head = (args: { disbursement: number | { id: number } } | [disbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvalHistory.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    approvalHistory.form = approvalHistoryForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:503
 * @route '/api/v1/budget-disbursement-approvals/{id}/submit'
 */
export const submit = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

submit.definition = {
    methods: ["post"],
    url: '/api/v1/budget-disbursement-approvals/{id}/submit',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:503
 * @route '/api/v1/budget-disbursement-approvals/{id}/submit'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:503
 * @route '/api/v1/budget-disbursement-approvals/{id}/submit'
 */
submit.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:503
 * @route '/api/v1/budget-disbursement-approvals/{id}/submit'
 */
    const submitForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: submit.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:503
 * @route '/api/v1/budget-disbursement-approvals/{id}/submit'
 */
        submitForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: submit.url(args, options),
            method: 'post',
        })
    
    submit.form = submitForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:589
 * @route '/api/v1/budget-disbursement-approvals/{id}/resubmit'
 */
export const resubmit = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resubmit.url(args, options),
    method: 'post',
})

resubmit.definition = {
    methods: ["post"],
    url: '/api/v1/budget-disbursement-approvals/{id}/resubmit',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:589
 * @route '/api/v1/budget-disbursement-approvals/{id}/resubmit'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:589
 * @route '/api/v1/budget-disbursement-approvals/{id}/resubmit'
 */
resubmit.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resubmit.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:589
 * @route '/api/v1/budget-disbursement-approvals/{id}/resubmit'
 */
    const resubmitForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resubmit.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:589
 * @route '/api/v1/budget-disbursement-approvals/{id}/resubmit'
 */
        resubmitForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resubmit.url(args, options),
            method: 'post',
        })
    
    resubmit.form = resubmitForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:677
 * @route '/api/v1/budget-disbursement-approvals/{id}/approve'
 */
export const approve = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/api/v1/budget-disbursement-approvals/{id}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:677
 * @route '/api/v1/budget-disbursement-approvals/{id}/approve'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:677
 * @route '/api/v1/budget-disbursement-approvals/{id}/approve'
 */
approve.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:677
 * @route '/api/v1/budget-disbursement-approvals/{id}/approve'
 */
    const approveForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:677
 * @route '/api/v1/budget-disbursement-approvals/{id}/approve'
 */
        approveForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:750
 * @route '/api/v1/budget-disbursement-approvals/{id}/reject'
 */
export const reject = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/api/v1/budget-disbursement-approvals/{id}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:750
 * @route '/api/v1/budget-disbursement-approvals/{id}/reject'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:750
 * @route '/api/v1/budget-disbursement-approvals/{id}/reject'
 */
reject.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:750
 * @route '/api/v1/budget-disbursement-approvals/{id}/reject'
 */
    const rejectForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:750
 * @route '/api/v1/budget-disbursement-approvals/{id}/reject'
 */
        rejectForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:822
 * @route '/api/v1/budget-disbursement-approvals/{id}/return'
 */
export const returned = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: returned.url(args, options),
    method: 'post',
})

returned.definition = {
    methods: ["post"],
    url: '/api/v1/budget-disbursement-approvals/{id}/return',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:822
 * @route '/api/v1/budget-disbursement-approvals/{id}/return'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:822
 * @route '/api/v1/budget-disbursement-approvals/{id}/return'
 */
returned.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: returned.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:822
 * @route '/api/v1/budget-disbursement-approvals/{id}/return'
 */
    const returnedForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: returned.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetDisbursementController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetDisbursementController.php:822
 * @route '/api/v1/budget-disbursement-approvals/{id}/return'
 */
        returnedForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: returned.url(args, options),
            method: 'post',
        })
    
    returned.form = returnedForm
const BudgetDisbursementController = { index, store, show, update, destroy, approvals, approvalHistory, submit, resubmit, approve, reject, returned }

export default BudgetDisbursementController