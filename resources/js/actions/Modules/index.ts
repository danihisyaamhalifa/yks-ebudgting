import Report from './Report'
import Budget from './Budget'
import DataMaster from './DataMaster'
import Disbursement from './Disbursement'
import Transaction from './Transaction'
import User from './User'
const Modules = {
    Report: Object.assign(Report, Report),
Budget: Object.assign(Budget, Budget),
DataMaster: Object.assign(DataMaster, DataMaster),
Disbursement: Object.assign(Disbursement, Disbursement),
Transaction: Object.assign(Transaction, Transaction),
User: Object.assign(User, User),
}

export default Modules