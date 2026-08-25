import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::store
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:353
 * @route '/api/v1/activity-items'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/activity-items',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::store
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:353
 * @route '/api/v1/activity-items'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::store
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:353
 * @route '/api/v1/activity-items'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::store
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:353
 * @route '/api/v1/activity-items'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::store
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:353
 * @route '/api/v1/activity-items'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::show
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:340
 * @route '/api/v1/activity-items/{activity_item}'
 */
export const show = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/activity-items/{activity_item}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::show
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:340
 * @route '/api/v1/activity-items/{activity_item}'
 */
show.url = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { activity_item: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    activity_item: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        activity_item: args.activity_item,
                }

    return show.definition.url
            .replace('{activity_item}', parsedArgs.activity_item.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::show
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:340
 * @route '/api/v1/activity-items/{activity_item}'
 */
show.get = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::show
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:340
 * @route '/api/v1/activity-items/{activity_item}'
 */
show.head = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::show
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:340
 * @route '/api/v1/activity-items/{activity_item}'
 */
    const showForm = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::show
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:340
 * @route '/api/v1/activity-items/{activity_item}'
 */
        showForm.get = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::show
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:340
 * @route '/api/v1/activity-items/{activity_item}'
 */
        showForm.head = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::update
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:371
 * @route '/api/v1/activity-items/{activity_item}'
 */
export const update = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/activity-items/{activity_item}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::update
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:371
 * @route '/api/v1/activity-items/{activity_item}'
 */
update.url = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { activity_item: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    activity_item: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        activity_item: args.activity_item,
                }

    return update.definition.url
            .replace('{activity_item}', parsedArgs.activity_item.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::update
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:371
 * @route '/api/v1/activity-items/{activity_item}'
 */
update.put = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::update
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:371
 * @route '/api/v1/activity-items/{activity_item}'
 */
update.patch = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::update
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:371
 * @route '/api/v1/activity-items/{activity_item}'
 */
    const updateForm = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::update
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:371
 * @route '/api/v1/activity-items/{activity_item}'
 */
        updateForm.put = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::update
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:371
 * @route '/api/v1/activity-items/{activity_item}'
 */
        updateForm.patch = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:388
 * @route '/api/v1/activity-items/{activity_item}'
 */
export const destroy = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/activity-items/{activity_item}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:388
 * @route '/api/v1/activity-items/{activity_item}'
 */
destroy.url = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { activity_item: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    activity_item: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        activity_item: args.activity_item,
                }

    return destroy.definition.url
            .replace('{activity_item}', parsedArgs.activity_item.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:388
 * @route '/api/v1/activity-items/{activity_item}'
 */
destroy.delete = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:388
 * @route '/api/v1/activity-items/{activity_item}'
 */
    const destroyForm = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\ActivityItemController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/ActivityItemController.php:388
 * @route '/api/v1/activity-items/{activity_item}'
 */
        destroyForm.delete = (args: { activity_item: string | number } | [activity_item: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const activityItems = {
    store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default activityItems