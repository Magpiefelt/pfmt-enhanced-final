// Company controller for handling company-related HTTP requests
import CompanyService from '../services/companyService.js'

export class CompanyController {
  // GET /api/companies
  static async getAllCompanies(req, res) {
    try {
      const { search } = req.query
      
      let companies
      if (search) {
        companies = CompanyService.searchCompaniesByName(search)
      } else {
        companies = CompanyService.getAllCompanies()
      }
      
      res.json({
        success: true,
        data: companies
      })
    } catch (error) {
      console.error('Error getting companies:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve companies',
        message: error.message
      })
    }
  }
  
  // GET /api/companies/:id
  static async getCompanyById(req, res) {
    try {
      const { id } = req.params
      const company = CompanyService.getCompanyById(id)
      
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        })
      }
      
      res.json({
        success: true,
        data: company
      })
    } catch (error) {
      console.error('Error getting company:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve company',
        message: error.message
      })
    }
  }
  
  // POST /api/companies
  static async createCompany(req, res) {
    try {
      const companyData = req.body
      
      if (!companyData.name) {
        return res.status(400).json({
          success: false,
          error: 'Company name is required'
        })
      }
      
      const newCompany = CompanyService.createCompany(companyData)
      
      res.status(201).json({
        success: true,
        data: newCompany,
        message: 'Company created successfully'
      })
    } catch (error) {
      console.error('Error creating company:', error)
      
      // Handle specific validation errors
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'Company already exists',
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
        error: 'Failed to create company',
        message: error.message
      })
    }
  }
  
  // PUT /api/companies/:id
  static async updateCompany(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body
      
      const updatedCompany = CompanyService.updateCompany(id, updateData)
      
      res.json({
        success: true,
        data: updatedCompany,
        message: 'Company updated successfully'
      })
    } catch (error) {
      console.error('Error updating company:', error)
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Company not found',
          message: error.message
        })
      }
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'Company name already exists',
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
        error: 'Failed to update company',
        message: error.message
      })
    }
  }
  
  // DELETE /api/companies/:id
  static async deleteCompany(req, res) {
    try {
      const { id } = req.params
      
      const deletedCompany = CompanyService.deleteCompany(id)
      
      res.json({
        success: true,
        data: deletedCompany,
        message: 'Company deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting company:', error)
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Company not found',
          message: error.message
        })
      }
      
      if (error.message.includes('referenced by')) {
        return res.status(409).json({
          success: false,
          error: 'Cannot delete company',
          message: error.message
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to delete company',
        message: error.message
      })
    }
  }
  
  // GET /api/companies/with-vendor-count
  static async getCompaniesWithVendorCount(req, res) {
    try {
      const companies = CompanyService.getCompaniesWithVendorCount()
      
      res.json({
        success: true,
        data: companies
      })
    } catch (error) {
      console.error('Error getting companies with vendor count:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve companies with vendor count',
        message: error.message
      })
    }
  }
}

export default CompanyController

