import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
 * @see Modules/Budget/routes/web.php:43
 * @route '/laporan-keuangan'
 */
export const cashBankLedger = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cashBankLedger.url(options),
    method: 'get',
})

cashBankLedger.definition = {
    methods: ["get","head"],
    url: '/laporan-keuangan',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see Modules/Budget/routes/web.php:43
 * @route '/laporan-keuangan'
 */
cashBankLedger.url = (options?: RouteQueryOptions) => {
    return cashBankLedger.definition.url + queryParams(options)
}

/**
 * @see Modules/Budget/routes/web.php:43
 * @route '/laporan-keuangan'
 */
cashBankLedger.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cashBankLedger.url(options),
    method: 'get',
})
/**
 * @see Modules/Budget/routes/web.php:43
 * @route '/laporan-keuangan'
 */
cashBankLedger.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: cashBankLedger.url(options),
    method: 'head',
})

    /**
 * @see Modules/Budget/routes/web.php:43
 * @route '/laporan-keuangan'
 */
    const cashBankLedgerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: cashBankLedger.url(options),
        method: 'get',
    })

            /**
 * @see Modules/Budget/routes/web.php:43
 * @route '/laporan-keuangan'
 */
        cashBankLedgerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cashBankLedger.url(options),
            method: 'get',
        })
            /**
 * @see Modules/Budget/routes/web.php:43
 * @route '/laporan-keuangan'
 */
        cashBankLedgerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cashBankLedger.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    cashBankLedger.form = cashBankLedgerForm
const repor = {
    cashBankLedger: Object.assign(cashBankLedger, cashBankLedger),
}

export default repor