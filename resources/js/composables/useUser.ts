import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'
import type { User, Role, Permission } from '@/types'

export function useUser() {
  const page = usePage()
  
  // Get the authenticated user from Inertia's shared props
  const user = computed<User | null>(() => page.props.auth?.user || null)

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!user.value)
  
  // Get user roles
  const roles = computed<Role[]>(() => user.value?.roles || [])
  
  // Get user permissions (both direct and through roles)
  // const permissions = computed<Permission[]>(() => {
  //   return user.value?.roles?.[0].permissions || []
  // })

  const permissions = computed<Permission[]>(() => {
        return user.value?.permissions || [];
    });
  
  // Helper functions for role checking
  const hasRole = (roleName: string): boolean => {
    return roles.value.some(role => role.name === roleName)
  }
  
  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some(roleName => hasRole(roleName))
  }
  
  const hasAllRoles = (roleNames: string[]): boolean => {
    return roleNames.every(roleName => hasRole(roleName))
  }
  
  // Helper functions for permission checking
  const hasPermission = (permissionName: string): boolean => {
    return permissions.value.some(permission => permission.name === permissionName)
  }
  
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(permissionName => hasPermission(permissionName))
  }
  
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(permissionName => hasPermission(permissionName))
  }
  
  // Specific role checks
  const isSuperAdmin = computed(() => hasRole('superadmin'))
  const isAdmin = computed(() => hasRole('admin'))
  const isKitchenAdmin = computed(() => hasRole('kitchen_admin'))
  const isMitra = computed(() => hasRole('mitra'))
  
  // Combined role checks
  const hasAdminAccess = computed(() => isSuperAdmin.value || isAdmin.value)
  const hasKitchenAccess = computed(() => isKitchenAdmin.value || isSuperAdmin.value)
  
  return {
    // Core data
    user,
    roles,
    permissions,
    isAuthenticated,
    
    // Role checking functions
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Permission checking functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Specific role checks
    isSuperAdmin,
    isAdmin,
    isKitchenAdmin,
    isMitra,
    
    // Combined access checks
    hasAdminAccess,
    hasKitchenAccess,
  }
}