// Enhanced Project Routes with Relational Data Model Support
import express from 'express'
import EnhancedProjectController from '../controllers/enhancedProjectController.js'

const router = express.Router()

// Middleware to simulate user authentication (replace with actual auth middleware)
const mockAuthMiddleware = (req, res, next) => {
  // In a real application, this would validate JWT tokens and set req.user
  // For now, we'll use a mock user based on headers or query params
  const userId = req.headers['x-user-id'] || req.query.userId
  const userRole = req.headers['x-user-role'] || req.query.userRole || 'Project Manager'
  
  if (userId) {
    req.user = {
      id: parseInt(userId),
      role: userRole,
      permissions: getPermissionsForRole(userRole)
    }
  }
  
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

// Core project routes
router.get('/', EnhancedProjectController.getProjects)
router.post('/', EnhancedProjectController.createProject)
router.get('/:id', EnhancedProjectController.getProject)
router.put('/:id', EnhancedProjectController.updateProject)
router.delete('/:id', EnhancedProjectController.deleteProject)

// PFMT file upload
router.post('/:id/upload-pfmt', EnhancedProjectController.uploadPFMT)

// Project relationship endpoints
router.get('/:id/vendors', EnhancedProjectController.getProjectVendors)
router.get('/:id/funding-lines', EnhancedProjectController.getProjectFundingLines)
router.get('/:id/change-orders', EnhancedProjectController.getProjectChangeOrders)
router.get('/:id/assignments', EnhancedProjectController.getProjectAssignments)

// Project assignment management
router.post('/:id/assignments', EnhancedProjectController.assignUserToProject)
router.delete('/:id/assignments/:userId', EnhancedProjectController.removeUserFromProject)

// Project analytics
router.get('/:id/analytics', EnhancedProjectController.getProjectAnalytics)

// Vendor management
router.get('/vendors/all', EnhancedProjectController.getAllVendors)
router.post('/vendors', EnhancedProjectController.createVendor)

// Legacy compatibility routes (redirect to new endpoints)
router.get('/legacy/all', (req, res) => {
  res.redirect('/api/projects')
})

router.post('/legacy/create', (req, res) => {
  res.redirect(307, '/api/projects')
})

router.get('/legacy/:id', (req, res) => {
  res.redirect(`/api/projects/${req.params.id}`)
})

router.put('/legacy/:id', (req, res) => {
  res.redirect(307, `/api/projects/${req.params.id}`)
})

router.post('/legacy/:id/upload', (req, res) => {
  res.redirect(307, `/api/projects/${req.params.id}/upload-pfmt`)
})

export default router

