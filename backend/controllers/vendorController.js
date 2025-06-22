import VendorService from '../services/vendorService.js'
import multer from 'multer'
import path from 'path'

// Configure multer for file uploads with improved validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    })
    
    // Get file extension
    const ext = path.extname(file.originalname).toLowerCase()
    
    // Accept Excel files - check both MIME type and extension
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
      'application/octet-stream' // Sometimes Excel files are detected as this
    ]
    
    const allowedExtensions = ['.xlsx', '.xls', '.xlsm']
    
    // Check if either MIME type is allowed OR extension is allowed
    const mimeTypeValid = allowedMimes.includes(file.mimetype)
    const extensionValid = allowedExtensions.includes(ext)
    
    if (mimeTypeValid || extensionValid) {
      console.log('File validation passed:', { mimeTypeValid, extensionValid })
      cb(null, true)
    } else {
      console.log('File validation failed:', { 
        mimetype: file.mimetype, 
        extension: ext,
        allowedMimes,
        allowedExtensions
      })
      cb(new Error('Only Excel files (.xlsx, .xls, .xlsm) are allowed'), false)
    }
  }
})

export class VendorController {
  // GET /api/projects/:projectId/vendors
  static async getVendorsByProject(req, res) {
    try {
      const { projectId } = req.params
      const vendors = await VendorService.getVendorsByProject(projectId)
      
      res.json({
        success: true,
        data: vendors
      })
    } catch (error) {
      console.error('Error getting vendors:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve vendors',
        message: error.message
      })
    }
  }

  // GET /api/vendors/:id
  static async getVendorById(req, res) {
    try {
      const { id } = req.params
      const vendor = await VendorService.getVendorById(id)
      
      if (!vendor) {
        return res.status(404).json({
          success: false,
          error: 'Vendor not found'
        })
      }
      
      res.json({
        success: true,
        data: vendor
      })
    } catch (error) {
      console.error('Error getting vendor:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve vendor',
        message: error.message
      })
    }
  }

  // POST /api/projects/:projectId/vendors
  static async createVendor(req, res) {
    try {
      const { projectId } = req.params
      const vendorData = req.body
      const userId = req.headers['x-user-id'] || req.user?.id
      
      if (!userId) {
        console.warn('⚠️ No user context headers found')
      }
      
      const newVendor = await VendorService.createVendor(projectId, vendorData, userId)
      
      res.status(201).json({
        success: true,
        data: newVendor,
        message: 'Vendor created successfully'
      })
    } catch (error) {
      console.error('Error creating vendor:', error)
      
      if (error.message.includes('Validation failed')) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: error.message
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to create vendor',
        message: error.message
      })
    }
  }

  // PUT /api/vendors/:id
  static async updateVendor(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body
      const userId = req.headers['x-user-id'] || req.user?.id
      
      if (!userId) {
        console.warn('⚠️ No user context headers found')
      }
      
      const updatedVendor = await VendorService.updateVendor(id, updateData, userId)
      
      res.json({
        success: true,
        data: updatedVendor,
        message: 'Vendor updated successfully'
      })
    } catch (error) {
      console.error('Error updating vendor:', error)
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Vendor not found',
          message: error.message
        })
      }
      
      if (error.message.includes('Validation failed')) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: error.message
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to update vendor',
        message: error.message
      })
    }
  }

  // DELETE /api/vendors/:id
  static async deleteVendor(req, res) {
    try {
      const { id } = req.params
      const userId = req.headers['x-user-id'] || req.user?.id
      
      if (!userId) {
        console.warn('⚠️ No user context headers found')
      }
      
      await VendorService.deleteVendor(id, userId)
      
      res.json({
        success: true,
        message: 'Vendor deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting vendor:', error)
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Vendor not found',
          message: error.message
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to delete vendor',
        message: error.message
      })
    }
  }

  // POST /api/projects/:projectId/vendors/extract
  // Extract vendors from uploaded spreadsheet
  static async extractVendorsFromSpreadsheet(req, res) {
    try {
      const { projectId } = req.params
      const userId = req.headers['x-user-id'] || req.user?.id
      
      if (!userId) {
        console.warn('⚠️ No user context headers found')
      }
      
      // Use multer middleware to handle file upload
      upload.single('file')(req, res, async (err) => {
        if (err) {
          console.error('File upload error:', err)
          return res.status(400).json({
            success: false,
            error: 'File upload failed',
            message: err.message
          })
        }
        
        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: 'No file uploaded',
            message: 'Please select an Excel file to upload'
          })
        }
        
        try {
          const options = {
            startRow: parseInt(req.body.startRow) || 7,
            sheetName: req.body.sheetName || null
          }
          
          console.log('Starting vendor extraction:', {
            projectId,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            options
          })
          
          const result = await VendorService.extractVendorsFromSpreadsheet(
            projectId,
            req.file.buffer,
            req.file.originalname,
            options,
            userId
          )
          
          res.json({
            success: true,
            data: result,
            message: `Successfully extracted ${result.savedCount} vendors from ${result.extractedCount} total records`
          })
        } catch (extractionError) {
          console.error('Vendor extraction error:', extractionError)
          res.status(500).json({
            success: false,
            error: 'Extraction failed',
            message: extractionError.message
          })
        }
      })
    } catch (error) {
      console.error('Error in vendor extraction endpoint:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      })
    }
  }

  // POST /api/projects/:projectId/vendors/preview
  // Preview vendor extraction without saving
  static async previewVendorExtraction(req, res) {
    try {
      const { projectId } = req.params
      
      // Use multer middleware to handle file upload
      upload.single('file')(req, res, async (err) => {
        if (err) {
          console.error('File upload error:', err)
          return res.status(400).json({
            success: false,
            error: 'File upload failed',
            message: err.message
          })
        }
        
        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: 'No file uploaded',
            message: 'Please select an Excel file to upload'
          })
        }
        
        try {
          const options = {
            startRow: parseInt(req.body.startRow) || 7,
            sheetName: req.body.sheetName || null
          }
          
          console.log('Starting vendor extraction preview:', {
            projectId,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            options
          })
          
          const result = await VendorService.previewVendorExtraction(
            projectId,
            req.file.buffer,
            req.file.originalname,
            options
          )
          
          res.json({
            success: true,
            data: result,
            message: `Preview completed: ${result.validCount} valid vendors found out of ${result.extractedCount} total records`
          })
        } catch (extractionError) {
          console.error('Vendor extraction preview error:', extractionError)
          res.status(500).json({
            success: false,
            error: 'Preview failed',
            message: extractionError.message
          })
        }
      })
    } catch (error) {
      console.error('Error in vendor extraction preview endpoint:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      })
    }
  }

  // GET /api/projects/:projectId/vendors/dashboard
  // Get vendor dashboard data for project
  static async getVendorDashboard(req, res) {
    try {
      const { projectId } = req.params
      const dashboard = await VendorService.getVendorDashboard(projectId)
      
      res.json({
        success: true,
        data: dashboard
      })
    } catch (error) {
      console.error('Error getting vendor dashboard:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve vendor dashboard',
        message: error.message
      })
    }
  }

  // GET /api/projects/:projectId/vendors/extraction-history
  // Get vendor extraction history for project
  static async getExtractionHistory(req, res) {
    try {
      const { projectId } = req.params
      const history = await VendorService.getExtractionHistory(projectId)
      
      res.json({
        success: true,
        data: history
      })
    } catch (error) {
      console.error('Error getting extraction history:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve extraction history',
        message: error.message
      })
    }
  }
}

export default VendorController

