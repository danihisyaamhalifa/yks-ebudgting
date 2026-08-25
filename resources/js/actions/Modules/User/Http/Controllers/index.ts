import UserController from './UserController'
import RoleController from './RoleController'
import PermissionController from './PermissionController'
import ApprovalWorkflowController from './ApprovalWorkflowController'
const Controllers = {
    UserController: Object.assign(UserController, UserController),
RoleController: Object.assign(RoleController, RoleController),
PermissionController: Object.assign(PermissionController, PermissionController),
ApprovalWorkflowController: Object.assign(ApprovalWorkflowController, ApprovalWorkflowController),
}

export default Controllers