import UserController from './UserController'
import RoleController from './RoleController'
import PermissionController from './PermissionController'
import ApprovalWorkflowController from './ApprovalWorkflowController'
import ApprovalWorkflowHeaderController from './ApprovalWorkflowHeaderController'
const Controllers = {
    UserController: Object.assign(UserController, UserController),
RoleController: Object.assign(RoleController, RoleController),
PermissionController: Object.assign(PermissionController, PermissionController),
ApprovalWorkflowController: Object.assign(ApprovalWorkflowController, ApprovalWorkflowController),
ApprovalWorkflowHeaderController: Object.assign(ApprovalWorkflowHeaderController, ApprovalWorkflowHeaderController),
}

export default Controllers