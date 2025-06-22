// Enhanced Project Routes with PDF Requirements Support
import express from 'express'
import EnhancedProjectController from '../controllers/enhancedProjectController.js'

const router = express.Router()

// Middleware to simulate user authentication (replace with actual auth middleware)
const mockAuthMiddleware = (req, res, next) => {
  // In a real application, this would validate JWT tokens and set req.user
  // For now, we'll use a mock user based on headers or query params
  const userId = req.headers['x-user-id'] || req.query.userId || '1'
  const userRole = req.headers['x-user-role'] || req.query.userRole || 'Project Manager'
  const userName = req.headers['x-user-name'] || req.query.userName || 'Test User'
  
  req.user = {
    id: parseInt(userId),
    role: userRole,
    name: userName,
    permissions: getPermissionsForRole(userRole)
  }
  
  // Set user headers for downstream services
  req.headers['x-user-id'] = userId
  req.headers['x-user-role'] = userRole
  req.headers['x-user-name'] = userName
  
  next()
}

// Helper function to get permissions based on role
function getPermissionsForRole(role) {
  const permissionSets = {
    'Project Manager': {
      canCreateProjects: true,
      canViewAllProjects: false,
      canApproveReports: false,
      canManageUsers: false,
      canManageVendors: false
    },
    'Senior Project Manager': {
      canCreateProjects: true,
      canViewAllProjects: true,
      canApproveReports: true,
      canManageUsers: false,
      canManageVendors: true
    },
    'Director': {
      canCreateProjects: true,
      canViewAllProjects: true,
      canApproveReports: true,
      canManageUsers: true,
      canManageVendors: true
    },
    'Admin': {
      canCreateProjects: true,
      canViewAllProjects: true,
      canApproveReports: true,
      canManageUsers: true,
      canManageVendors: true
    }
  }
  
  return permissionSets[role] || permissionSets['Project Manager']
}

// Apply mock auth middleware to all routes
router.use(mockAuthMiddleware)

// Enhanced project routes
router.get('/', EnhancedProjectController.getEnhancedProjects)
router.post('/', EnhancedProjectController.createEnhancedProject)
router.get('/dashboard', EnhancedProjectController.getEnhancedProjectDashboard)
router.get('/attention', EnhancedProjectController.getProjectsRequiringAttention)
router.get('/field-options', EnhancedProjectController.getProjectFieldOptions)

router.get('/:id', EnhancedProjectController.getEnhancedProjectById)
router.put('/:id', EnhancedProjectController.updateEnhancedProject)
router.put('/:id/team', EnhancedProjectController.updateProjectTeam)
router.put('/:id/location', EnhancedProjectController.updateProjectLocation)
router.post('/:id/pfmt-integration', EnhancedProjectController.integratePFMTData)

export default router

