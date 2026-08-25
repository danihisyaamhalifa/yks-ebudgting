/**
 * Formats a permission name by trimming, converting to lowercase,
 * and replacing spaces with underscores
 * @param value The permission name to format
 * @returns The formatted permission name
 */
export const formatPermissionName = (value: string): string => {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
};

/**
 * Extracts the base permission name from a permission string
 * @param permissionName The full permission name (e.g., 'create_users')
 * @returns The base permission name (e.g., 'users')
 */
export const getBasePermissionName = (permissionName: string): string => {
  const parts = permissionName.split(' ');
  if (['create', 'view', 'edit', 'delete'].includes(parts[0].toLowerCase())) {
    return parts.slice(1).join(' ');
  }
  return permissionName;
};

/**
 * Formats a permission name for display
 * @param permissionName The permission name to format
 * @returns A human-readable version of the permission name
 */
export const formatPermissionLabel = (permissionName: string): string => {
  const baseName = getBasePermissionName(permissionName);
  return baseName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
