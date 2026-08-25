import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forRootSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:108
 * @route '/api/v1/budget-category-root'
 */
export const forRootSelect = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forRootSelect.url(options),
    method: 'get',
})

forRootSelect.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-category-root',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forRootSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:108
 * @route '/api/v1/budget-category-root'
 */
forRootSelect.url = (options?: RouteQueryOptions) => {
    return forRootSelect.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forRootSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:108
 * @route '/api/v1/budget-category-root'
 */
forRootSelect.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forRootSelect.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forRootSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:108
 * @route '/api/v1/budget-category-root'
 */
forRootSelect.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: forRootSelect.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forRootSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:108
 * @route '/api/v1/budget-category-root'
 */
    const forRootSelectForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: forRootSelect.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forRootSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:108
 * @route '/api/v1/budget-category-root'
 */
        forRootSelectForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forRootSelect.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forRootSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:108
 * @route '/api/v1/budget-category-root'
 */
        forRootSelectForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forRootSelect.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    forRootSelect.form = forRootSelectForm
/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forChildSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:127
 * @route '/api/v1/budget-category-child'
 */
export const forChildSelect = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forChildSelect.url(options),
    method: 'get',
})

forChildSelect.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-category-child',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forChildSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:127
 * @route '/api/v1/budget-category-child'
 */
forChildSelect.url = (options?: RouteQueryOptions) => {
    return forChildSelect.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forChildSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:127
 * @route '/api/v1/budget-category-child'
 */
forChildSelect.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forChildSelect.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forChildSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:127
 * @route '/api/v1/budget-category-child'
 */
forChildSelect.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: forChildSelect.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forChildSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:127
 * @route '/api/v1/budget-category-child'
 */
    const forChildSelectForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: forChildSelect.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forChildSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:127
 * @route '/api/v1/budget-category-child'
 */
        forChildSelectForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forChildSelect.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::forChildSelect
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:127
 * @route '/api/v1/budget-category-child'
 */
        forChildSelectForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forChildSelect.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    forChildSelect.form = forChildSelectForm
/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::index
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:26
 * @route '/api/v1/budget-categories'
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
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::store
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:42
 * @route '/api/v1/budget-categories'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/budget-categories',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::store
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:42
 * @route '/api/v1/budget-categories'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::store
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:42
 * @route '/api/v1/budget-categories'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::store
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:42
 * @route '/api/v1/budget-categories'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::store
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:42
 * @route '/api/v1/budget-categories'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::show
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:340
 * @route '/api/v1/budget-categories/{budget_category}'
 */
export const show = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/budget-categories/{budget_category}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::show
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:340
 * @route '/api/v1/budget-categories/{budget_category}'
 */
show.url = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_category: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_category: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_category: args.budget_category,
                }

    return show.definition.url
            .replace('{budget_category}', parsedArgs.budget_category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::show
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:340
 * @route '/api/v1/budget-categories/{budget_category}'
 */
show.get = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::show
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:340
 * @route '/api/v1/budget-categories/{budget_category}'
 */
show.head = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::show
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:340
 * @route '/api/v1/budget-categories/{budget_category}'
 */
    const showForm = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::show
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:340
 * @route '/api/v1/budget-categories/{budget_category}'
 */
        showForm.get = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::show
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:340
 * @route '/api/v1/budget-categories/{budget_category}'
 */
        showForm.head = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::update
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:72
 * @route '/api/v1/budget-categories/{budget_category}'
 */
export const update = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/budget-categories/{budget_category}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::update
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:72
 * @route '/api/v1/budget-categories/{budget_category}'
 */
update.url = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_category: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_category: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_category: args.budget_category,
                }

    return update.definition.url
            .replace('{budget_category}', parsedArgs.budget_category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::update
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:72
 * @route '/api/v1/budget-categories/{budget_category}'
 */
update.put = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::update
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:72
 * @route '/api/v1/budget-categories/{budget_category}'
 */
update.patch = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::update
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:72
 * @route '/api/v1/budget-categories/{budget_category}'
 */
    const updateForm = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::update
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:72
 * @route '/api/v1/budget-categories/{budget_category}'
 */
        updateForm.put = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::update
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:72
 * @route '/api/v1/budget-categories/{budget_category}'
 */
        updateForm.patch = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:388
 * @route '/api/v1/budget-categories/{budget_category}'
 */
export const destroy = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/budget-categories/{budget_category}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:388
 * @route '/api/v1/budget-categories/{budget_category}'
 */
destroy.url = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget_category: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    budget_category: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        budget_category: args.budget_category,
                }

    return destroy.definition.url
            .replace('{budget_category}', parsedArgs.budget_category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:388
 * @route '/api/v1/budget-categories/{budget_category}'
 */
destroy.delete = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:388
 * @route '/api/v1/budget-categories/{budget_category}'
 */
    const destroyForm = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\DataMaster\Http\Controllers\BudgetCategoryController::destroy
 * @see Modules/DataMaster/app/Http/Controllers/BudgetCategoryController.php:388
 * @route '/api/v1/budget-categories/{budget_category}'
 */
        destroyForm.delete = (args: { budget_category: string | number } | [budget_category: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const BudgetCategoryController = { forRootSelect, forChildSelect, index, store, show, update, destroy }

export default BudgetCategoryController