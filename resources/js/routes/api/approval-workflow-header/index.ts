import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::select
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:52
 * @route '/api/v1/approval-workflow-headers/select'
 */
export const select = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: select.url(options),
    method: 'get',
})

select.definition = {
    methods: ["get","head"],
    url: '/api/v1/approval-workflow-headers/select',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::select
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:52
 * @route '/api/v1/approval-workflow-headers/select'
 */
select.url = (options?: RouteQueryOptions) => {
    return select.definition.url + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::select
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:52
 * @route '/api/v1/approval-workflow-headers/select'
 */
select.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: select.url(options),
    method: 'get',
})
/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::select
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:52
 * @route '/api/v1/approval-workflow-headers/select'
 */
select.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: select.url(options),
    method: 'head',
})

    /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::select
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:52
 * @route '/api/v1/approval-workflow-headers/select'
 */
    const selectForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: select.url(options),
        method: 'get',
    })

            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::select
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:52
 * @route '/api/v1/approval-workflow-headers/select'
 */
        selectForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: select.url(options),
            method: 'get',
        })
            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::select
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:52
 * @route '/api/v1/approval-workflow-headers/select'
 */
        selectForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: select.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    select.form = selectForm
/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:21
 * @route '/api/v1/approval-workflow-headers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/approval-workflow-headers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:21
 * @route '/api/v1/approval-workflow-headers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:21
 * @route '/api/v1/approval-workflow-headers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:21
 * @route '/api/v1/approval-workflow-headers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:21
 * @route '/api/v1/approval-workflow-headers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:21
 * @route '/api/v1/approval-workflow-headers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::index
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:21
 * @route '/api/v1/approval-workflow-headers'
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
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::store
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:63
 * @route '/api/v1/approval-workflow-headers'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/approval-workflow-headers',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::store
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:63
 * @route '/api/v1/approval-workflow-headers'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::store
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:63
 * @route '/api/v1/approval-workflow-headers'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::store
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:63
 * @route '/api/v1/approval-workflow-headers'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::store
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:63
 * @route '/api/v1/approval-workflow-headers'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:340
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
export const show = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/approval-workflow-headers/{approval_workflow_header}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:340
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
show.url = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { approval_workflow_header: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    approval_workflow_header: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        approval_workflow_header: args.approval_workflow_header,
                }

    return show.definition.url
            .replace('{approval_workflow_header}', parsedArgs.approval_workflow_header.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:340
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
show.get = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:340
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
show.head = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:340
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
    const showForm = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:340
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
        showForm.get = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::show
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:340
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
        showForm.head = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:98
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
export const update = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/approval-workflow-headers/{approval_workflow_header}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:98
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
update.url = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { approval_workflow_header: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    approval_workflow_header: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        approval_workflow_header: args.approval_workflow_header,
                }

    return update.definition.url
            .replace('{approval_workflow_header}', parsedArgs.approval_workflow_header.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:98
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
update.put = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:98
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
update.patch = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:98
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
    const updateForm = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:98
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
        updateForm.put = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::update
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:98
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
        updateForm.patch = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::destroy
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:140
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
export const destroy = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/approval-workflow-headers/{approval_workflow_header}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::destroy
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:140
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
destroy.url = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { approval_workflow_header: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    approval_workflow_header: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        approval_workflow_header: args.approval_workflow_header,
                }

    return destroy.definition.url
            .replace('{approval_workflow_header}', parsedArgs.approval_workflow_header.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::destroy
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:140
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
destroy.delete = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::destroy
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:140
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
    const destroyForm = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\User\Http\Controllers\ApprovalWorkflowHeaderController::destroy
 * @see Modules/User/app/Http/Controllers/ApprovalWorkflowHeaderController.php:140
 * @route '/api/v1/approval-workflow-headers/{approval_workflow_header}'
 */
        destroyForm.delete = (args: { approval_workflow_header: string | number } | [approval_workflow_header: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const approvalWorkflowHeader = {
    select: Object.assign(select, select),
index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default approvalWorkflowHeader