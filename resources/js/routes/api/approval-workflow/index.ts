import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:18
 * @route '/api/v1/approval-workflows'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/approval-workflows',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:18
 * @route '/api/v1/approval-workflows'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:18
 * @route '/api/v1/approval-workflows'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:18
 * @route '/api/v1/approval-workflows'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:18
 * @route '/api/v1/approval-workflows'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:18
 * @route '/api/v1/approval-workflows'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:18
 * @route '/api/v1/approval-workflows'
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
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::store
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:37
 * @route '/api/v1/approval-workflows'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/approval-workflows',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::store
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:37
 * @route '/api/v1/approval-workflows'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::store
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:37
 * @route '/api/v1/approval-workflows'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::store
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:37
 * @route '/api/v1/approval-workflows'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::store
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:37
 * @route '/api/v1/approval-workflows'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:340
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
export const show = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/approval-workflows/{approval_workflow}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:340
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
show.url = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { approval_workflow: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    approval_workflow: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        approval_workflow: args.approval_workflow,
                }

    return show.definition.url
            .replace('{approval_workflow}', parsedArgs.approval_workflow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:340
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
show.get = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:340
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
show.head = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:340
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
    const showForm = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:340
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
        showForm.get = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:340
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
        showForm.head = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:371
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
export const update = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/approval-workflows/{approval_workflow}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:371
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
update.url = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { approval_workflow: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    approval_workflow: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        approval_workflow: args.approval_workflow,
                }

    return update.definition.url
            .replace('{approval_workflow}', parsedArgs.approval_workflow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:371
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
update.put = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:371
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
update.patch = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:371
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
    const updateForm = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:371
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
        updateForm.put = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:371
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
        updateForm.patch = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::destroy
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:388
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
export const destroy = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/approval-workflows/{approval_workflow}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::destroy
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:388
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
destroy.url = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { approval_workflow: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    approval_workflow: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        approval_workflow: args.approval_workflow,
                }

    return destroy.definition.url
            .replace('{approval_workflow}', parsedArgs.approval_workflow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::destroy
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:388
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
destroy.delete = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::destroy
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:388
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
    const destroyForm = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowController::destroy
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowController.php:388
 * @route '/api/v1/approval-workflows/{approval_workflow}'
 */
        destroyForm.delete = (args: { approval_workflow: string | number } | [approval_workflow: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const approvalWorkflow = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default approvalWorkflow