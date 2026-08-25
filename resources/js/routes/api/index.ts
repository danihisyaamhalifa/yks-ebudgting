import budgetRequests from './budget-requests'
import parameter from './parameter'
import parameters from './parameters'
import parameterValue from './parameter-value'
import parameterValues from './parameter-values'
import unit from './unit'
import units from './units'
import fiscalYear from './fiscal-year'
import fiscalYears from './fiscal-years'
import academicPeriod from './academic-period'
import academicPeriods from './academic-periods'
import coas from './coas'
import transactionType from './transaction-type'
import transactionTypes from './transaction-types'
import activity from './activity'
import activities from './activities'
import budgetCategory from './budget-category'
import budgetCategories from './budget-categories'
import cashBanks from './cash-banks'
import fundSources from './fund-sources'
import activity_items from './activity_items'
import activityItems from './activity-items'
import employees from './employees'
import vendors from './vendors'
import budgetDisbursements from './budget-disbursements'
import budgetFundReleases from './budget-fund-releases'
import budget from './budget'
import budgetAccountabilities from './budget-accountabilities'
import api from './api'
import fundTransfer from './fund-transfer'
import fundTransfers from './fund-transfers'
import cashMutation from './cash-mutation'
import cashMutations from './cash-mutations'
import user from './user'
import roles from './roles'
import permissions from './permissions'
import approvalWorkflow from './approval-workflow'
const api = {
    budgetRequests: Object.assign(budgetRequests, budgetRequests),
parameter: Object.assign(parameter, parameter),
parameters: Object.assign(parameters, parameters),
parameterValue: Object.assign(parameterValue, parameterValue),
parameterValues: Object.assign(parameterValues, parameterValues),
unit: Object.assign(unit, unit),
units: Object.assign(units, units),
fiscalYear: Object.assign(fiscalYear, fiscalYear),
fiscalYears: Object.assign(fiscalYears, fiscalYears),
academicPeriod: Object.assign(academicPeriod, academicPeriod),
academicPeriods: Object.assign(academicPeriods, academicPeriods),
coas: Object.assign(coas, coas),
transactionType: Object.assign(transactionType, transactionType),
transactionTypes: Object.assign(transactionTypes, transactionTypes),
activity: Object.assign(activity, activity),
activities: Object.assign(activities, activities),
budgetCategory: Object.assign(budgetCategory, budgetCategory),
budgetCategories: Object.assign(budgetCategories, budgetCategories),
cashBanks: Object.assign(cashBanks, cashBanks),
fundSources: Object.assign(fundSources, fundSources),
activity_items: Object.assign(activity_items, activity_items),
activityItems: Object.assign(activityItems, activityItems),
employees: Object.assign(employees, employees),
vendors: Object.assign(vendors, vendors),
budgetDisbursements: Object.assign(budgetDisbursements, budgetDisbursements),
budgetFundReleases: Object.assign(budgetFundReleases, budgetFundReleases),
budget: Object.assign(budget, budget),
budgetAccountabilities: Object.assign(budgetAccountabilities, budgetAccountabilities),
api: Object.assign(api, api),
fundTransfer: Object.assign(fundTransfer, fundTransfer),
fundTransfers: Object.assign(fundTransfers, fundTransfers),
cashMutation: Object.assign(cashMutation, cashMutation),
cashMutations: Object.assign(cashMutations, cashMutations),
user: Object.assign(user, user),
roles: Object.assign(roles, roles),
permissions: Object.assign(permissions, permissions),
approvalWorkflow: Object.assign(approvalWorkflow, approvalWorkflow),
}

export default api