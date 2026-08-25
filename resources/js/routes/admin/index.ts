import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
 * @see routes/web.php:23
 * @route '/user'
 */
export const users = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(options),
    method: 'get',
})

users.definition = {
    methods: ["get","head"],
    url: '/user',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:23
 * @route '/user'
 */
users.url = (options?: RouteQueryOptions) => {
    return users.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:23
 * @route '/user'
 */
users.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:23
 * @route '/user'
 */
users.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: users.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:23
 * @route '/user'
 */
    const usersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: users.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:23
 * @route '/user'
 */
        usersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: users.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:23
 * @route '/user'
 */
        usersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: users.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    users.form = usersForm
/**
 * @see routes/web.php:27
 * @route '/role'
 */
export const roles = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: roles.url(options),
    method: 'get',
})

roles.definition = {
    methods: ["get","head"],
    url: '/role',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:27
 * @route '/role'
 */
roles.url = (options?: RouteQueryOptions) => {
    return roles.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:27
 * @route '/role'
 */
roles.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: roles.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:27
 * @route '/role'
 */
roles.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: roles.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:27
 * @route '/role'
 */
    const rolesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: roles.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:27
 * @route '/role'
 */
        rolesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: roles.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:27
 * @route '/role'
 */
        rolesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: roles.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    roles.form = rolesForm
/**
 * @see Modules/DataMaster/routes/web.php:8
 * @route '/parameter'
 */
export const parameters = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: parameters.url(options),
    method: 'get',
})

parameters.definition = {
    methods: ["get","head"],
    url: '/parameter',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/DataMaster/routes/web.php:8
 * @route '/parameter'
 */
parameters.url = (options?: RouteQueryOptions) => {
    return parameters.definition.url + queryParams(options)
}

/**
 * @see Modules/DataMaster/routes/web.php:8
 * @route '/parameter'
 */
parameters.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: parameters.url(options),
    method: 'get',
})
/**
 * @see Modules/DataMaster/routes/web.php:8
 * @route '/parameter'
 */
parameters.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: parameters.url(options),
    method: 'head',
})

    /**
 * @see Modules/DataMaster/routes/web.php:8
 * @route '/parameter'
 */
    const parametersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: parameters.url(options),
        method: 'get',
    })

            /**
 * @see Modules/DataMaster/routes/web.php:8
 * @route '/parameter'
 */
        parametersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: parameters.url(options),
            method: 'get',
        })
            /**
 * @see Modules/DataMaster/routes/web.php:8
 * @route '/parameter'
 */
        parametersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: parameters.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    parameters.form = parametersForm
const admin = {
    users: Object.assign(users, users),
roles: Object.assign(roles, roles),
parameters: Object.assign(parameters, parameters),
}

export default admin