// Enhanced Project Controller with Relational Data Model Support
import { EnhancedProjectService } from '../services/enhancedProjectService.js'
import { enhancedDatabaseService } from '../services/enhancedDatabase.js'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Only Excel files are allowed'))
    }
  }
})

export class EnhancedProjectController {
  // Get all projects with enhanced filtering and pagination
  static async getProjects(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        ownerId,
        status,
        reportStatus,
        search,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = req.query

      // Get user context from request (assuming middleware sets this)
      const userContext = req.user || null
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        ownerId: ownerId ? parseInt(ownerId) : undefined,
        status,
        reportStatus,
        userId: userContext?.id,
        userRole: userContext?.role,
        includeRelationships: true
      }

      const result = await EnhancedProjectService.getProjects(options)
      
      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase()
        result.projects = result.projects.filter(project => 
          project.name.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower) ||
          project.owner?.name.toLowerCase().includes(searchLower)
        )
        
        // Recalculate pagination after search
        result.pagination.total = result.projects.length
        result.pagination.totalPages = Math.ceil(result.projects.length / options.limit)
      }
      
      // Apply sorting
      result.projects.sort((a, b) => {
        let aValue = a[sortBy]
        let bValue = b[sortBy]
        
        // Handle nested properties
        if (sortBy.includes('.')) {
          const path = sortBy.split('.')
          aValue = path.reduce((obj, key) => obj?.[key], a)
          bValue = path.reduce((obj, key) => obj?.[key], b)
        }
        
        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1
        } else {
          return aValue > bValue ? 1 : -1
        }
      })

      res.json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
        meta: {
          userRole: userContext?.role,
          accessLevel: userContext ? 'authenticated' : 'anonymous'
        }
      })
    } catch (error) {
      console.error('Error fetching projects:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch projects',
        details: error.message
      })
    }
  }

  // Get single project with full relationship data
  static async getProject(req, res) {
    try {
      const { id } = req.params
      const userContext = req.user || null

      const project = await EnhancedProjectService.getProjectById(id, userContext)
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }

      res.json({
        success: true,
        data: project,
        meta: {
          hasEditAccess: userContext ? await enhancedDatabaseService.accessControlManager
            .canAccessProject(userContext.id, id, 'edit') : false,
          hasApprovalAccess: userContext ? await enhancedDatabaseService.accessControlManager
            .hasProjectPermission(userContext.id, id, 'approve') : false
        }
      })
    } catch (error) {
      console.error('Error fetching project:', error)
      
      if (error.message === 'Access denied to project') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project',
        details: error.message
      })
    }
  }

  // Create new project
  static async createProject(req, res) {
    try {
      const userContext = req.user
      
      if (!userContext) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
      }

      const projectData = req.body
      
      // Validate required fields
      if (!projectData.name) {
        return res.status(400).json({
          success: false,
          error: 'Project name is required'
        })
      }

      const project = await EnhancedProjectService.createProject(projectData, userContext)

      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully'
      })
    } catch (error) {
      console.error('Error creating project:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create project',
        details: error.message
      })
    }
  }

  // Update project
  static async updateProject(req, res) {
    try {
      const { id } = req.params
      const userContext = req.user
      const updates = req.body

      const project = await EnhancedProjectService.updateProject(id, updates, userContext)

      res.json({
        success: true,
        data: project,
        message: 'Project updated successfully'
      })
    } catch (error) {
      console.error('Error updating project:', error)
      
      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }
      
      if (error.message === 'Access denied to edit project') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to update project',
        details: error.message
      })
    }
  }

  // Delete project
  static async deleteProject(req, res) {
    try {
      const { id } = req.params
      const userContext = req.user

      const deletedProject = await EnhancedProjectService.deleteProject(id, userContext)

      res.json({
        success: true,
        data: deletedProject,
        message: 'Project deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      
      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }
      
      if (error.message === 'Access denied to delete project') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to delete project',
        details: error.message
      })
    }
  }

  // Upload and process PFMT Excel file
  static async uploadPFMT(req, res) {
    const uploadSingle = upload.single('pfmtFile')
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err)
        return res.status(400).json({
          success: false,
          error: 'File upload failed',
          details: err.message
        })
      }

      try {
        const { id } = req.params
        const userContext = req.user
        
        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: 'No file uploaded'
          })
        }

        console.log('Processing PFMT upload for project:', id)
        console.log('File:', req.file.originalname)

        const result = await EnhancedProjectService.processPFMTExcelUpload(
          id,
          req.file.path,
          req.file.originalname,
          userContext
        )

        res.json({
          success: true,
          data: result.project,
          extractedData: result.extractedData,
          message: 'PFMT file processed successfully'
        })
      } catch (error) {
        console.error('Error processing PFMT upload:', error)
        
        if (error.message === 'Project not found or access denied') {
          return res.status(404).json({
            success: false,
            error: 'Project not found or access denied'
          })
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to process PFMT file',
          details: error.message
        })
      }
    })
  }

  // Get project vendors
  static async getProjectVendors(req, res) {
    try {
      const { id } = req.params
      const userContext = req.user

      const project = await EnhancedProjectService.getProjectById(id, userContext)
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }

      res.json({
        success: true,
        data: project.vendors || [],
        meta: {
          projectId: id,
          totalVendors: project.vendors?.length || 0
        }
      })
    } catch (error) {
      console.error('Error fetching project vendors:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project vendors',
        details: error.message
      })
    }
  }

  // Get project funding lines
  static async getProjectFundingLines(req, res) {
    try {
      const { id } = req.params
      const userContext = req.user

      const project = await EnhancedProjectService.getProjectById(id, userContext)
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }

      res.json({
        success: true,
        data: project.fundingLines || [],
        meta: {
          projectId: id,
          totalFundingLines: project.fundingLines?.length || 0,
          totalApprovedValue: project.fundingLines?.reduce((sum, fl) => sum + (fl.approvedValue || 0), 0) || 0
        }
      })
    } catch (error) {
      console.error('Error fetching project funding lines:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project funding lines',
        details: error.message
      })
    }
  }

  // Get project change orders
  static async getProjectChangeOrders(req, res) {
    try {
      const { id } = req.params
      const userContext = req.user

      const project = await EnhancedProjectService.getProjectById(id, userContext)
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }

      res.json({
        success: true,
        data: project.changeOrders || [],
        meta: {
          projectId: id,
          totalChangeOrders: project.changeOrders?.length || 0,
          totalChangeOrderValue: project.changeOrders?.reduce((sum, co) => sum + (co.value || 0), 0) || 0
        }
      })
    } catch (error) {
      console.error('Error fetching project change orders:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project change orders',
        details: error.message
      })
    }
  }

  // Get project assignments
  static async getProjectAssignments(req, res) {
    try {
      const { id } = req.params
      const userContext = req.user

      const project = await EnhancedProjectService.getProjectById(id, userContext)
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }

      res.json({
        success: true,
        data: project.assignments || [],
        meta: {
          projectId: id,
          totalAssignments: project.assignments?.length || 0,
          owner: project.owner
        }
      })
    } catch (error) {
      console.error('Error fetching project assignments:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project assignments',
        details: error.message
      })
    }
  }

  // Assign user to project
  static async assignUserToProject(req, res) {
    try {
      const { id } = req.params
      const { userId, accessLevel } = req.body
      const userContext = req.user

      if (!userContext) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
      }

      if (!userId || !accessLevel) {
        return res.status(400).json({
          success: false,
          error: 'User ID and access level are required'
        })
      }

      const assignment = await EnhancedProjectService.assignUserToProject(
        id,
        userId,
        accessLevel,
        userContext.id
      )

      res.json({
        success: true,
        data: assignment,
        message: 'User assigned to project successfully'
      })
    } catch (error) {
      console.error('Error assigning user to project:', error)
      
      if (error.message === 'Insufficient permissions to grant project access') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to assign user to project',
        details: error.message
      })
    }
  }

  // Remove user from project
  static async removeUserFromProject(req, res) {
    try {
      const { id, userId } = req.params
      const userContext = req.user

      if (!userContext) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
      }

      await EnhancedProjectService.removeUserFromProject(id, parseInt(userId), userContext.id)

      res.json({
        success: true,
        message: 'User removed from project successfully'
      })
    } catch (error) {
      console.error('Error removing user from project:', error)
      
      if (error.message === 'Assignment not found') {
        return res.status(404).json({
          success: false,
          error: 'Assignment not found'
        })
      }
      
      if (error.message === 'Insufficient permissions to remove user from project') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to remove user from project',
        details: error.message
      })
    }
  }

  // Get all vendors
  static async getAllVendors(req, res) {
    try {
      const vendors = await EnhancedProjectService.getAllVendors()

      res.json({
        success: true,
        data: vendors,
        meta: {
          totalVendors: vendors.length
        }
      })
    } catch (error) {
      console.error('Error fetching vendors:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendors',
        details: error.message
      })
    }
  }

  // Create new vendor
  static async createVendor(req, res) {
    try {
      const userContext = req.user
      
      if (!userContext) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
      }

      // Check permissions
      if (!userContext.permissions?.canManageVendors) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to manage vendors'
        })
      }

      const vendorData = req.body
      
      if (!vendorData.name) {
        return res.status(400).json({
          success: false,
          error: 'Vendor name is required'
        })
      }

      const vendor = await EnhancedProjectService.createVendor(vendorData)

      res.status(201).json({
        success: true,
        data: vendor,
        message: 'Vendor created successfully'
      })
    } catch (error) {
      console.error('Error creating vendor:', error)
      
      if (error.message === 'Vendor with this name already exists') {
        return res.status(409).json({
          success: false,
          error: 'Vendor with this name already exists'
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to create vendor',
        details: error.message
      })
    }
  }

  // Get project analytics
  static async getProjectAnalytics(req, res) {
    try {
      const { id } = req.params
      const userContext = req.user

      const project = await EnhancedProjectService.getProjectById(id, userContext)
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }

      // Calculate analytics
      const analytics = {
        financial: {
          budgetUtilization: project.financial.totalBudget > 0 
            ? (project.financial.amountSpent / project.financial.totalBudget) * 100 
            : 0,
          variance: project.financial.variance || 0,
          variancePercentage: project.financial.approvedTPC > 0 
            ? ((project.financial.variance || 0) / project.financial.approvedTPC) * 100 
            : 0,
          remainingBudget: project.financial.totalBudget - project.financial.amountSpent
        },
        vendors: {
          totalVendors: project.vendors?.length || 0,
          totalContractValue: project.vendors?.reduce((sum, v) => sum + (v.contractValue || 0), 0) || 0,
          totalBilled: project.vendors?.reduce((sum, v) => sum + (v.billedToDate || 0), 0) || 0,
          averageCompletion: project.vendors?.length > 0 
            ? project.vendors.reduce((sum, v) => sum + (v.percentComplete || 0), 0) / project.vendors.length 
            : 0
        },
        changeOrders: {
          totalChangeOrders: project.changeOrders?.length || 0,
          totalChangeOrderValue: project.changeOrders?.reduce((sum, co) => sum + (co.value || 0), 0) || 0,
          approvedChangeOrders: project.changeOrders?.filter(co => co.status === 'Approved').length || 0,
          pendingChangeOrders: project.changeOrders?.filter(co => co.status === 'Pending').length || 0
        },
        timeline: {
          daysElapsed: project.startDate 
            ? Math.floor((new Date() - new Date(project.startDate)) / (1000 * 60 * 60 * 24))
            : 0,
          daysRemaining: project.endDate 
            ? Math.floor((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24))
            : 0
        }
      }

      res.json({
        success: true,
        data: analytics,
        meta: {
          projectId: id,
          calculatedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error calculating project analytics:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to calculate project analytics',
        details: error.message
      })
    }
  }
}

// Export for use in routes
export default EnhancedProjectController

