// Vendor controller for handling vendor contract-related HTTP requests
import VendorService from '../services/vendorService.js'

export class VendorController {
  // GET /api/projects/:projectId/vendors
  static async getVendorsByProject(req, res) {
    try {
      const { projectId } = req.params
      const vendors = VendorService.getVendorsByProject(projectId)
      
      res.json({
        success: true,
        data: vendors
      })
    } catch (error) {
      console.error('Error getting vendors for project:', error)
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
      const vendor = VendorService.getVendorById(id)
      
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
      const vendorData = {
        ...req.body,
        projectId: projectId
      }
      
      if (!vendorData.companyId && !vendorData.companyData && !vendorData.companyName) {
        return res.status(400).json({
          success: false,
          error: 'Company information is required (companyId, companyData, or companyName)'
        })
      }
      
      const newVendor = VendorService.createVendor(vendorData)
      
      res.status(201).json({
        success: true,
        data: newVendor,
        message: 'Vendor contract created successfully'
      })
    } catch (error) {
      console.error('Error creating vendor:', error)
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Referenced entity not found',
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
        error: 'Failed to create vendor contract',
        message: error.message
      })
    }
  }
  
  // PUT /api/vendors/:id
  static async updateVendor(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body
      
      const updatedVendor = VendorService.updateVendor(id, updateData)
      
      res.json({
        success: true,
        data: updatedVendor,
        message: 'Vendor contract updated successfully'
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
        error: 'Failed to update vendor contract',
        message: error.message
      })
    }
  }
  
  // DELETE /api/vendors/:id
  static async deleteVendor(req, res) {
    try {
      const { id } = req.params
      
      const deletedVendor = VendorService.deleteVendor(id)
      
      res.json({
        success: true,
        data: deletedVendor,
        message: 'Vendor contract deleted successfully'
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
        error: 'Failed to delete vendor contract',
        message: error.message
      })
    }
  }
  
  // GET /api/companies/:companyId/vendors
  static async getVendorsByCompany(req, res) {
    try {
      const { companyId } = req.params
      const vendors = VendorService.getVendorsByCompany(companyId)
      
      res.json({
        success: true,
        data: vendors
      })
    } catch (error) {
      console.error('Error getting vendors for company:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve vendors for company',
        message: error.message
      })
    }
  }
  
  // GET /api/projects/:projectId/vendors/summary
  static async getVendorSummaryForProject(req, res) {
    try {
      const { projectId } = req.params
      const summary = VendorService.getVendorSummaryForProject(projectId)
      
      res.json({
        success: true,
        data: summary
      })
    } catch (error) {
      console.error('Error getting vendor summary for project:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve vendor summary',
        message: error.message
      })
    }
  }
}

export default VendorController

