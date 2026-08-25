import DashboardController from './DashboardController'
import BudgetMonitoringController from './BudgetMonitoringController'
const Controllers = {
    DashboardController: Object.assign(DashboardController, DashboardController),
BudgetMonitoringController: Object.assign(BudgetMonitoringController, BudgetMonitoringController),
}

export default Controllers