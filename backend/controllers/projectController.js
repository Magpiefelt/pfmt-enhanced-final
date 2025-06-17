// Enhanced Project controller for handling HTTP requests with fixed permissions - COMPLETE FIXED VERSION
import { ProjectService } from '../services/projectService.js'
import { UserService } from '../services/userService.js'

export class ProjectController {
  // GET /api/projects - Fixed to ensure project managers can see their projects
  static async getAllProjects(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        ownerId,
        status,
        reportStatus
      } = req.query
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit)
      }
      
      // Enhanced filtering logic to fix visibility issues
      // If user is authenticated, apply role-based filtering
      if (req.user) {
        const userRole = req.user.role?.toLowerCase()
        // FIXED: Ensure userId is always an integer for consistent comparison
        const userId = parseInt(req.user.id)
        
        // Admin users can see all projects
        if (userRole === 'admin' || userRole === 'director') {
          // Apply any additional filters if provided
          if (ownerId) options.ownerId = parseInt(ownerId)
          if (status) options.status = status
          if (reportStatus) options.reportStatus = reportStatus
        }
        // Project managers and senior project managers can see their own projects
        else if (userRole === 'project manager' || userRole === 'senior project manager' || userRole === 'pm') {
          // Show projects where user is the owner, project manager, or senior project manager
          options.userId = userId
          options.userRole = userRole
          
          // Apply additional filters if provided
          if (status) options.status = status
          if (reportStatus) options.reportStatus = reportStatus
          
          // Don't override ownerId filter if user is trying to filter by specific owner
          if (ownerId) options.ownerId = parseInt(ownerId)
        }
        // Other roles get limited access
        else {
          options.ownerId = userId
          if (status) options.status = status
          if (reportStatus) options.reportStatus = reportStatus
        }
      } else {
        // If no user context, apply basic filters
        if (ownerId) options.ownerId = parseInt(ownerId)
        if (status) options.status = status
        if (reportStatus) options.reportStatus = reportStatus
      }
      
      const result = ProjectService.getProjects(options)
      
      res.json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
        userContext: req.user ? {
          id: parseInt(req.user.id),
          role: req.user.role,
          name: req.user.name
        } : null
      })
    } catch (error) {
      console.error('Error getting projects:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve projects',
        message: error.message
      })
    }
  }
  
  // GET /api/projects/:id
  static async getProjectById(req, res) {
    try {
      const { id } = req.params
      const project = ProjectService.getProjectById(id)
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }
      
      // Check if user has permission to view this project
      if (req.user) {
        const userRole = req.user.role?.toLowerCase()
        // FIXED: Ensure userId is always an integer for consistent comparison
        const userId = parseInt(req.user.id)
        
        // Admin and directors can view all projects
        if (userRole === 'admin' || userRole === 'director') {
          // Allow access
        }
        // Project managers can view projects they own or manage
        else if (userRole === 'project manager' || userRole === 'senior project manager' || userRole === 'pm') {
          const hasAccess = (
            // FIXED: Ensure both sides of comparison are integers
            parseInt(project.ownerId) === userId ||
            project.projectManager === req.user.name ||
            project.seniorProjectManager === req.user.name
          )
          
          if (!hasAccess) {
            return res.status(403).json({
              success: false,
              error: 'Access denied',
              message: 'You do not have permission to view this project'
            })
          }
        }
        // Other roles can only view their own projects
        else {
          if (parseInt(project.ownerId) !== userId) {
            return res.status(403).json({
              success: false,
              error: 'Access denied',
              message: 'You do not have permission to view this project'
            })
          }
        }
      }
      
      res.json({
        success: true,
        data: project
      })
    } catch (error) {
      console.error('Error getting project:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve project',
        message: error.message
      })
    }
  }
  
  // POST /api/projects - Enhanced to ensure proper ownership assignment
  static async createProject(req, res) {
    try {
      const projectData = req.body
      
      console.log('=== Controller createProject (ENHANCED & FIXED) ===')
      console.log('Request body:', JSON.stringify(projectData, null, 2))
      console.log('Request user:', JSON.stringify(req.user, null, 2))
      
      // Validate required fields - only name is required now
      if (!projectData.name) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Project name is required'
        })
      }
      
      // ENHANCED: Ensure proper ownership assignment
      if (req.user) {
        // FIXED: Ensure ownerId is stored as integer
        if (!projectData.ownerId) {
          projectData.ownerId = parseInt(req.user.id)
          console.log(`✅ Set ownerId to: ${projectData.ownerId} (type: ${typeof projectData.ownerId})`)
        } else {
          projectData.ownerId = parseInt(projectData.ownerId)
        }
        
        // Set project manager if not specified and user is a PM
        if (!projectData.projectManager && 
            (req.user.role?.toLowerCase() === 'project manager' || req.user.role?.toLowerCase() === 'pm')) {
          projectData.projectManager = req.user.name
          console.log(`✅ Set projectManager to: ${req.user.name}`)
        }
        
        // Add creation metadata
        projectData.createdBy = req.user.name
        projectData.createdByUserId = parseInt(req.user.id)
        console.log(`✅ Set createdBy to: ${req.user.name}`)
        console.log(`✅ Set createdByUserId to: ${projectData.createdByUserId} (type: ${typeof projectData.createdByUserId})`)
      } else {
        console.error('❌ CRITICAL: No user context in request!')
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'User context required for project creation'
        })
      }
      
      const newProject = ProjectService.createProject(projectData, req.user)
      
      console.log(`✅ Project created successfully: ${newProject.id}`)
      console.log(`✅ Project owner: ${newProject.ownerId} (type: ${typeof newProject.ownerId})`)
      
      res.status(201).json({
        success: true,
        data: newProject,
        message: 'Project created successfully'
      })
    } catch (error) {
      console.error('Error creating project:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create project',
        message: error.message
      })
    }
  }
  
  // PUT /api/projects/:id
  static async updateProject(req, res) {
    try {
      const { id } = req.params
      const updates = req.body
      
      // Get existing project to check permissions
      const existingProject = ProjectService.getProjectById(id)
      if (!existingProject) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }
      
      // Check if user has permission to update this project
      if (req.user) {
        const userRole = req.user.role?.toLowerCase()
        const userId = parseInt(req.user.id)
        
        // Admin and directors can update all projects
        if (userRole === 'admin' || userRole === 'director') {
          // Allow update
        }
        // Project managers can update projects they own or manage
        else if (userRole === 'project manager' || userRole === 'senior project manager' || userRole === 'pm') {
          const hasAccess = (
            parseInt(existingProject.ownerId) === userId ||
            existingProject.projectManager === req.user.name ||
            existingProject.seniorProjectManager === req.user.name
          )
          
          if (!hasAccess) {
            return res.status(403).json({
              success: false,
              error: 'Access denied',
              message: 'You do not have permission to update this project'
            })
          }
        }
        // Other roles can only update their own projects
        else {
          if (parseInt(existingProject.ownerId) !== userId) {
            return res.status(403).json({
              success: false,
              error: 'Access denied',
              message: 'You do not have permission to update this project'
            })
          }
        }
      }
      
      const updatedProject = ProjectService.updateProject(id, updates)
      
      res.json({
        success: true,
        data: updatedProject,
        message: 'Project updated successfully'
      })
    } catch (error) {
      console.error('Error updating project:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update project',
        message: error.message
      })
    }
  }
  
  // DELETE /api/projects/:id
  static async deleteProject(req, res) {
    try {
      const { id } = req.params
      
      // Get existing project to check permissions
      const existingProject = ProjectService.getProjectById(id)
      if (!existingProject) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }
      
      // Check if user has permission to delete this project
      if (req.user) {
        const userRole = req.user.role?.toLowerCase()
        const userId = parseInt(req.user.id)
        
        // Admin and directors can delete all projects
        if (userRole === 'admin' || userRole === 'director') {
          // Allow deletion
        }
        // Project managers can delete projects they own or manage
        else if (userRole === 'project manager' || userRole === 'senior project manager' || userRole === 'pm') {
          const hasAccess = (
            parseInt(existingProject.ownerId) === userId ||
            existingProject.projectManager === req.user.name ||
            existingProject.seniorProjectManager === req.user.name
          )
          
          if (!hasAccess) {
            return res.status(403).json({
              success: false,
              error: 'Access denied',
              message: 'You do not have permission to delete this project'
            })
          }
        }
        // Other roles can only delete their own projects
        else {
          if (parseInt(existingProject.ownerId) !== userId) {
            return res.status(403).json({
              success: false,
              error: 'Access denied',
              message: 'You do not have permission to delete this project'
            })
          }
        }
      }
      
      const deletedProject = ProjectService.deleteProject(id)
      
      res.json({
        success: true,
        data: deletedProject,
        message: 'Project deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete project',
        message: error.message
      })
    }
  }
  
  // POST /api/projects/:id/excel - Enhanced with permission checks and FIXED data types
  static async uploadExcel(req, res) {
    try {
      const { id } = req.params
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          message: 'Please select an Excel file to upload'
        })
      }
      
      // Check if user has permission to upload to this project
      const existingProject = ProjectService.getProjectById(id)
      if (!existingProject) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }
      
      if (req.user) {
        const userRole = req.user.role?.toLowerCase()
        const userId = parseInt(req.user.id)  // FIXED: Ensure integer comparison
        
        // Admin and directors can upload to all projects
        if (userRole === 'admin' || userRole === 'director') {
          // Allow upload
        }
        // Project managers can upload to projects they own or manage
        else if (userRole === 'project manager' || userRole === 'senior project manager' || userRole === 'pm') {
          const hasAccess = (
            parseInt(existingProject.ownerId) === userId ||  // FIXED: Integer comparison
            existingProject.projectManager === req.user.name ||
            existingProject.seniorProjectManager === req.user.name
          )
          
          if (!hasAccess) {
            return res.status(403).json({
              success: false,
              error: 'Access denied',
              message: 'You do not have permission to upload files to this project'
            })
          }
        }
        // Other roles can only upload to their own projects
        else {
          if (parseInt(existingProject.ownerId) !== userId) {  // FIXED: Integer comparison
            return res.status(403).json({
              success: false,
              error: 'Access denied',
              message: 'You do not have permission to upload files to this project'
            })
          }
        }
      }
      
      const result = await ProjectService.processExcelUpload(
        id,
        req.file.path,
        req.file.originalname
      )
      
      res.json({
        success: true,
        data: result.project,
        extractedData: result.extractedData,
        message: 'Excel file processed successfully'
      })
    } catch (error) {
      console.error('Error processing Excel upload:', error)
      
      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }
      
      if (error.message.includes('No worksheets found')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Excel file',
          message: 'The uploaded file does not contain any worksheets'
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to process Excel file',
        message: error.message
      })
    }
  }

  // POST /api/projects/:id/pfmt-excel - Enhanced with permission checks and FIXED data types
  static async uploadPFMTExcel(req, res) {
    try {
      const { id } = req.params
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          message: 'Please select a PFMT Excel file to upload'
        })
      }
      
      // Check if user has permission to upload to this project
      const existingProject = ProjectService.getProjectById(id)
      if (!existingProject) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }
      
      if (req.user) {
        const userRole = req.user.role?.toLowerCase()
        const userId = parseInt(req.user.id)  // FIXED: Ensure integer comparison
        
        // Admin and directors can upload to all projects
        if (userRole === 'admin' || userRole === 'director') {
          // Allow upload
        }
        // Project managers can upload to projects they own or manage
        else if (userRole === 'project manager' || userRole === 'senior project manager' || userRole === 'pm') {
          const hasAccess = (
            parseInt(existingProject.ownerId) === userId ||  // FIXED: Integer comparison
            existingProject.projectManager === req.user.name ||
            existingProject.seniorProjectManager === req.user.name
          )
          
          if (!hasAccess) {
            return res.status(403).json({
              success: false,
              error: 'Access denied',
              message: 'You do not have permission to upload files to this project'
            })
          }
        }
        // Other roles can only upload to their own projects
        else {
          if (parseInt(existingProject.ownerId) !== userId) {  // FIXED: Integer comparison
            return res.status(403).json({
              success: false,
              error: 'Access denied',
              message: 'You do not have permission to upload files to this project'
            })
          }
        }
      }
      
      const result = await ProjectService.processPFMTExcelUpload(
        id,
        req.file.path,
        req.file.originalname
      )
      
      res.json({
        success: true,
        data: result.project,
        extractedData: result.extractedData,
        message: 'PFMT Excel file processed successfully'
      })
    } catch (error) {
      console.error('Error processing PFMT Excel upload:', error)
      
      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }
      
      if (error.message.includes('Unable to extract project name')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid PFMT Excel file',
          message: 'Could not extract project name from Excel file. Please ensure the project name is in cell C6 of the Validations sheet.'
        })
      }
      
      if (error.message.includes('No worksheets found')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Excel file',
          message: 'The uploaded file does not contain any worksheets'
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to process PFMT Excel file',
        message: error.message
      })
    }
  }
}

