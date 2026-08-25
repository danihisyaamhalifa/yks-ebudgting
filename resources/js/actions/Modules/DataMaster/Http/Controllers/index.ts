import CoaController from './CoaController'
import FiscalYearController from './FiscalYearController'
import AcademicPeriodController from './AcademicPeriodController'
import UnitController from './UnitController'
import ActivityController from './ActivityController'
import CashBankController from './CashBankController'
import FundSourceController from './FundSourceController'
import ActivityItemController from './ActivityItemController'
import EmployeeController from './EmployeeController'
import VendorController from './VendorController'
import ParameterController from './ParameterController'
import BudgetCategoryController from './BudgetCategoryController'
import ParameterValueController from './ParameterValueController'
import TransactionTypeController from './TransactionTypeController'
const Controllers = {
    CoaController: Object.assign(CoaController, CoaController),
FiscalYearController: Object.assign(FiscalYearController, FiscalYearController),
AcademicPeriodController: Object.assign(AcademicPeriodController, AcademicPeriodController),
UnitController: Object.assign(UnitController, UnitController),
ActivityController: Object.assign(ActivityController, ActivityController),
CashBankController: Object.assign(CashBankController, CashBankController),
FundSourceController: Object.assign(FundSourceController, FundSourceController),
ActivityItemController: Object.assign(ActivityItemController, ActivityItemController),
EmployeeController: Object.assign(EmployeeController, EmployeeController),
VendorController: Object.assign(VendorController, VendorController),
ParameterController: Object.assign(ParameterController, ParameterController),
BudgetCategoryController: Object.assign(BudgetCategoryController, BudgetCategoryController),
ParameterValueController: Object.assign(ParameterValueController, ParameterValueController),
TransactionTypeController: Object.assign(TransactionTypeController, TransactionTypeController),
}

export default Controllers