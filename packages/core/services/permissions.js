export const canAccessDepartment = (user, deptId) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return Array.isArray(user.departments) && user.departments.includes(deptId)
}