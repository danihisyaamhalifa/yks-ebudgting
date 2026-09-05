import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:37
 * @route '/api/v1/budget-accountabilities'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-accountabilities',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:37
 * @route '/api/v1/budget-accountabilities'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:37
 * @route '/api/v1/budget-accountabilities'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:37
 * @route '/api/v1/budget-accountabilities'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:37
 * @route '/api/v1/budget-accountabilities'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:37
 * @route '/api/v1/budget-accountabilities'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::index
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:37
 * @route '/api/v1/budget-accountabilities'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:69
 * @route '/api/v1/budget-accountabilities'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/budget-accountabilities',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:69
 * @route '/api/v1/budget-accountabilities'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:69
 * @route '/api/v1/budget-accountabilities'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:69
 * @route '/api/v1/budget-accountabilities'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::store
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:69
 * @route '/api/v1/budget-accountabilities'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:151
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
export const show = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-accountabilities/{budget_accountability}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:151
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
show.url = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_accountability: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_accountability: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_accountability: args.budget_accountability,
                }

    return show.definition.url
            .replace('{budget_accountability}', parsedArgs.budget_accountability.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:151
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
show.get = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:151
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
show.head = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:151
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
    const showForm = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:151
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
        showForm.get = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::show
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:151
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
        showForm.head = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:193
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
export const update = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/budget-accountabilities/{budget_accountability}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:193
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
update.url = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_accountability: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_accountability: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_accountability: args.budget_accountability,
                }

    return update.definition.url
            .replace('{budget_accountability}', parsedArgs.budget_accountability.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:193
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
update.put = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:193
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
update.patch = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:193
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
    const updateForm = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:193
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
        updateForm.put = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::update
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:193
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
        updateForm.patch = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:266
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
export const destroy = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/budget-accountabilities/{budget_accountability}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:266
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
destroy.url = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_accountability: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_accountability: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_accountability: args.budget_accountability,
                }

    return destroy.definition.url
            .replace('{budget_accountability}', parsedArgs.budget_accountability.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:266
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
destroy.delete = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:266
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
    const destroyForm = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::destroy
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:266
 * @route '/api/v1/budget-accountabilities/{budget_accountability}'
 */
        destroyForm.delete = (args: { budget_accountability: string | number } | [budget_accountability: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:393
 * @route '/api/v1/budget-accountabilities/{id}/approvals'
 */
export const approvals = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(args, options),
    method: 'get',
})

approvals.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-accountabilities/{id}/approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:393
 * @route '/api/v1/budget-accountabilities/{id}/approvals'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:393
 * @route '/api/v1/budget-accountabilities/{id}/approvals'
 */
approvals.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:393
 * @route '/api/v1/budget-accountabilities/{id}/approvals'
 */
approvals.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: approvals.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:393
 * @route '/api/v1/budget-accountabilities/{id}/approvals'
 */
    const approvalsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: approvals.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:393
 * @route '/api/v1/budget-accountabilities/{id}/approvals'
 */
        approvalsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvals.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::approvals
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:393
 * @route '/api/v1/budget-accountabilities/{id}/approvals'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:439
 * @route '/api/v1/budget-accountability-approvals/{id}/submit'
 */
export const submit = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

submit.definition = {
    methods: ["post"],
    url: '/api/v1/budget-accountability-approvals/{id}/submit',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:439
 * @route '/api/v1/budget-accountability-approvals/{id}/submit'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:439
 * @route '/api/v1/budget-accountability-approvals/{id}/submit'
 */
submit.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:439
 * @route '/api/v1/budget-accountability-approvals/{id}/submit'
 */
    const submitForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: submit.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::submit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:439
 * @route '/api/v1/budget-accountability-approvals/{id}/submit'
 */
        submitForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: submit.url(args, options),
            method: 'post',
        })
    
    submit.form = submitForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:493
 * @route '/api/v1/budget-accountability-approvals/{id}/resubmit'
 */
export const resubmit = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resubmit.url(args, options),
    method: 'post',
})

resubmit.definition = {
    methods: ["post"],
    url: '/api/v1/budget-accountability-approvals/{id}/resubmit',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:493
 * @route '/api/v1/budget-accountability-approvals/{id}/resubmit'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:493
 * @route '/api/v1/budget-accountability-approvals/{id}/resubmit'
 */
resubmit.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resubmit.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:493
 * @route '/api/v1/budget-accountability-approvals/{id}/resubmit'
 */
    const resubmitForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resubmit.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::resubmit
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:493
 * @route '/api/v1/budget-accountability-approvals/{id}/resubmit'
 */
        resubmitForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resubmit.url(args, options),
            method: 'post',
        })
    
    resubmit.form = resubmitForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:557
 * @route '/api/v1/budget-accountability-approvals/{id}/approve'
 */
export const approve = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/api/v1/budget-accountability-approvals/{id}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:557
 * @route '/api/v1/budget-accountability-approvals/{id}/approve'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:557
 * @route '/api/v1/budget-accountability-approvals/{id}/approve'
 */
approve.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:557
 * @route '/api/v1/budget-accountability-approvals/{id}/approve'
 */
    const approveForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::approve
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:557
 * @route '/api/v1/budget-accountability-approvals/{id}/approve'
 */
        approveForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:644
 * @route '/api/v1/budget-accountability-approvals/{id}/reject'
 */
export const reject = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/api/v1/budget-accountability-approvals/{id}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:644
 * @route '/api/v1/budget-accountability-approvals/{id}/reject'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:644
 * @route '/api/v1/budget-accountability-approvals/{id}/reject'
 */
reject.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:644
 * @route '/api/v1/budget-accountability-approvals/{id}/reject'
 */
    const rejectForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::reject
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:644
 * @route '/api/v1/budget-accountability-approvals/{id}/reject'
 */
        rejectForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:706
 * @route '/api/v1/budget-accountability-approvals/{id}/return'
 */
export const returned = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: returned.url(args, options),
    method: 'post',
})

returned.definition = {
    methods: ["post"],
    url: '/api/v1/budget-accountability-approvals/{id}/return',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:706
 * @route '/api/v1/budget-accountability-approvals/{id}/return'
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
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:706
 * @route '/api/v1/budget-accountability-approvals/{id}/return'
 */
returned.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: returned.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:706
 * @route '/api/v1/budget-accountability-approvals/{id}/return'
 */
    const returnedForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: returned.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Disbursement\Http\Controllers\BudgetAccountabilityController::returned
 * @see Modules/Disbursement/app/Http/Controllers/BudgetAccountabilityController.php:706
 * @route '/api/v1/budget-accountability-approvals/{id}/return'
 */
        returnedForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: returned.url(args, options),
            method: 'post',
        })
    
    returned.form = returnedForm
const BudgetAccountabilityController = { index, store, show, update, destroy, approvals, submit, resubmit, approve, reject, returned }

export default BudgetAccountabilityController