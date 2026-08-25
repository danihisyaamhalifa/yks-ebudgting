import FundTransferController from './FundTransferController'
import CashMutationController from './CashMutationController'
const Controllers = {
    FundTransferController: Object.assign(FundTransferController, FundTransferController),
CashMutationController: Object.assign(CashMutationController, CashMutationController),
}

export default Controllers