import BudgetDisbursementController from './BudgetDisbursementController'
import BudgetFundReleaseController from './BudgetFundReleaseController'
import BudgetAccountabilityController from './BudgetAccountabilityController'
const Controllers = {
    BudgetDisbursementController: Object.assign(BudgetDisbursementController, BudgetDisbursementController),
BudgetFundReleaseController: Object.assign(BudgetFundReleaseController, BudgetFundReleaseController),
BudgetAccountabilityController: Object.assign(BudgetAccountabilityController, BudgetAccountabilityController),
}

export default Controllers