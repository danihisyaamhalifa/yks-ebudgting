import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::index
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:39
 * @route '/api/v1/budget-requests'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::index
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:39
 * @route '/api/v1/budget-requests'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::index
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:39
 * @route '/api/v1/budget-requests'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::index
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:39
 * @route '/api/v1/budget-requests'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::index
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:39
 * @route '/api/v1/budget-requests'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::index
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:39
 * @route '/api/v1/budget-requests'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::index
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:39
 * @route '/api/v1/budget-requests'
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
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::store
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:83
 * @route '/api/v1/budget-requests'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/budget-requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::store
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:83
 * @route '/api/v1/budget-requests'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::store
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:83
 * @route '/api/v1/budget-requests'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::store
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:83
 * @route '/api/v1/budget-requests'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::store
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:83
 * @route '/api/v1/budget-requests'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::show
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:251
 * @route '/api/v1/budget-requests/{budget_request}'
 */
export const show = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-requests/{budget_request}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::show
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:251
 * @route '/api/v1/budget-requests/{budget_request}'
 */
show.url = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_request: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_request: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_request: args.budget_request,
                }

    return show.definition.url
            .replace('{budget_request}', parsedArgs.budget_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::show
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:251
 * @route '/api/v1/budget-requests/{budget_request}'
 */
show.get = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::show
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:251
 * @route '/api/v1/budget-requests/{budget_request}'
 */
show.head = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::show
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:251
 * @route '/api/v1/budget-requests/{budget_request}'
 */
    const showForm = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::show
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:251
 * @route '/api/v1/budget-requests/{budget_request}'
 */
        showForm.get = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::show
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:251
 * @route '/api/v1/budget-requests/{budget_request}'
 */
        showForm.head = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::update
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:306
 * @route '/api/v1/budget-requests/{budget_request}'
 */
export const update = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/budget-requests/{budget_request}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::update
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:306
 * @route '/api/v1/budget-requests/{budget_request}'
 */
update.url = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_request: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_request: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_request: args.budget_request,
                }

    return update.definition.url
            .replace('{budget_request}', parsedArgs.budget_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::update
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:306
 * @route '/api/v1/budget-requests/{budget_request}'
 */
update.put = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::update
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:306
 * @route '/api/v1/budget-requests/{budget_request}'
 */
update.patch = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::update
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:306
 * @route '/api/v1/budget-requests/{budget_request}'
 */
    const updateForm = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::update
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:306
 * @route '/api/v1/budget-requests/{budget_request}'
 */
        updateForm.put = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::update
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:306
 * @route '/api/v1/budget-requests/{budget_request}'
 */
        updateForm.patch = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::destroy
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:388
 * @route '/api/v1/budget-requests/{budget_request}'
 */
export const destroy = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/budget-requests/{budget_request}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::destroy
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:388
 * @route '/api/v1/budget-requests/{budget_request}'
 */
destroy.url = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_request: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_request: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_request: args.budget_request,
                }

    return destroy.definition.url
            .replace('{budget_request}', parsedArgs.budget_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::destroy
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:388
 * @route '/api/v1/budget-requests/{budget_request}'
 */
destroy.delete = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::destroy
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:388
 * @route '/api/v1/budget-requests/{budget_request}'
 */
    const destroyForm = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::destroy
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:388
 * @route '/api/v1/budget-requests/{budget_request}'
 */
        destroyForm.delete = (args: { budget_request: string | number } | [budget_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::submit
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:775
 * @route '/api/v1/budget-requests/{id}/submit'
 */
export const submit = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

submit.definition = {
    methods: ["post"],
    url: '/api/v1/budget-requests/{id}/submit',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::submit
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:775
 * @route '/api/v1/budget-requests/{id}/submit'
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
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::submit
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:775
 * @route '/api/v1/budget-requests/{id}/submit'
 */
submit.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::submit
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:775
 * @route '/api/v1/budget-requests/{id}/submit'
 */
    const submitForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: submit.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::submit
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:775
 * @route '/api/v1/budget-requests/{id}/submit'
 */
        submitForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: submit.url(args, options),
            method: 'post',
        })
    
    submit.form = submitForm
/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::resubmit
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:860
 * @route '/api/v1/budget-requests/{id}/resubmit'
 */
export const resubmit = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resubmit.url(args, options),
    method: 'post',
})

resubmit.definition = {
    methods: ["post"],
    url: '/api/v1/budget-requests/{id}/resubmit',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::resubmit
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:860
 * @route '/api/v1/budget-requests/{id}/resubmit'
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
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::resubmit
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:860
 * @route '/api/v1/budget-requests/{id}/resubmit'
 */
resubmit.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resubmit.url(args, options),
    method: 'post',
})

    /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::resubmit
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:860
 * @route '/api/v1/budget-requests/{id}/resubmit'
 */
    const resubmitForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resubmit.url(args, options),
        method: 'post',
    })

            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::resubmit
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:860
 * @route '/api/v1/budget-requests/{id}/resubmit'
 */
        resubmitForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resubmit.url(args, options),
            method: 'post',
        })
    
    resubmit.form = resubmitForm
/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvals
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:696
 * @route '/api/v1/budget-requests/{id}/approvals'
 */
export const approvals = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(args, options),
    method: 'get',
})

approvals.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-requests/{id}/approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvals
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:696
 * @route '/api/v1/budget-requests/{id}/approvals'
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
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvals
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:696
 * @route '/api/v1/budget-requests/{id}/approvals'
 */
approvals.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvals
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:696
 * @route '/api/v1/budget-requests/{id}/approvals'
 */
approvals.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: approvals.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvals
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:696
 * @route '/api/v1/budget-requests/{id}/approvals'
 */
    const approvalsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: approvals.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvals
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:696
 * @route '/api/v1/budget-requests/{id}/approvals'
 */
        approvalsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvals.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvals
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:696
 * @route '/api/v1/budget-requests/{id}/approvals'
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
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvalHistory
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:755
 * @route '/api/v1/budget-requests/{request}/approval-history'
 */
export const approvalHistory = (args: { request: number | { id: number } } | [request: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvalHistory.url(args, options),
    method: 'get',
})

approvalHistory.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-requests/{request}/approval-history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvalHistory
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:755
 * @route '/api/v1/budget-requests/{request}/approval-history'
 */
approvalHistory.url = (args: { request: number | { id: number } } | [request: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { request: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { request: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    request: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        request: typeof args.request === 'object'
                ? args.request.id
                : args.request,
                }

    return approvalHistory.definition.url
            .replace('{request}', parsedArgs.request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvalHistory
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:755
 * @route '/api/v1/budget-requests/{request}/approval-history'
 */
approvalHistory.get = (args: { request: number | { id: number } } | [request: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvalHistory.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvalHistory
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:755
 * @route '/api/v1/budget-requests/{request}/approval-history'
 */
approvalHistory.head = (args: { request: number | { id: number } } | [request: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: approvalHistory.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvalHistory
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:755
 * @route '/api/v1/budget-requests/{request}/approval-history'
 */
    const approvalHistoryForm = (args: { request: number | { id: number } } | [request: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: approvalHistory.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvalHistory
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:755
 * @route '/api/v1/budget-requests/{request}/approval-history'
 */
        approvalHistoryForm.get = (args: { request: number | { id: number } } | [request: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvalHistory.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Budget\Http\Controllers\BudgetRequestController::approvalHistory
 * @see Modules/Budget/app/Http/Controllers/BudgetRequestController.php:755
 * @route '/api/v1/budget-requests/{request}/approval-history'
 */
        approvalHistoryForm.head = (args: { request: number | { id: number } } | [request: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvalHistory.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    approvalHistory.form = approvalHistoryForm
const budgetRequests = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
submit: Object.assign(submit, submit),
resubmit: Object.assign(resubmit, resubmit),
approvals: Object.assign(approvals, approvals),
approvalHistory: Object.assign(approvalHistory, approvalHistory),
}

export default budgetRequests