// Vendor service layer for vendor contract management
import * as db from './database.js'
import Vendor from '../models/Vendor.js'
import CompanyService from './companyService.js'
import { v4 as uuidv4 } from 'uuid'

export class VendorService {
  // Get all vendors for a specific project
  static getVendorsByProject(projectId) {
    const vendors = db.getVendorsByProject(projectId)
    
    // Enrich vendors with company information
    return vendors.map(vendor => {
      const company = CompanyService.getCompanyById(vendor.companyId)
      return {
        ...vendor,
        company: company || null
      }
    })
  }
  
  // Get vendor by ID
  static getVendorById(id) {
    const vendor = db.getVendorById(id)
    if (!vendor) {
      return null
    }
    
    // Enrich with company information
    const company = CompanyService.getCompanyById(vendor.companyId)
    return {
      ...vendor,
      company: company || null
    }
  }
  
  // Create new vendor contract
  static createVendor(vendorData) {
    // Handle company creation/selection
    let companyId = vendorData.companyId
    
    // If no companyId provided but company data is provided, create new company
    if (!companyId && vendorData.companyData) {
      const newCompany = CompanyService.createCompany(vendorData.companyData)
      companyId = newCompany.id
    }
    
    // If company name is provided without ID, try to find existing or create new
    if (!companyId && vendorData.companyName) {
      let company = CompanyService.getCompanyByName(vendorData.companyName)
      if (!company) {
        company = CompanyService.createCompany({ name: vendorData.companyName })
      }
      companyId = company.id
    }
    
    if (!companyId) {
      throw new Error('Company ID or company information is required')
    }
    
    // Verify company exists
    const company = CompanyService.getCompanyById(companyId)
    if (!company) {
      throw new Error(`Company with ID "${companyId}" not found`)
    }
    
    // Create Vendor instance
    const vendor = new Vendor({
      ...vendorData,
      companyId: companyId
    })
    
    // Validate vendor data
    const validation = vendor.validate()
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Generate unique ID
    vendor.id = uuidv4()
    
    // Calculate derived fields
    vendor.calculateDerivedFields()
    
    // Save to database
    const savedVendor = db.createVendor(vendor.toJSON())
    
    // Return vendor with company information
    return {
      ...savedVendor,
      company: company
    }
  }
  
  // Update existing vendor
  static updateVendor(id, updateData) {
    // Get existing vendor
    const existingVendor = db.getVendorById(id)
    if (!existingVendor) {
      throw new Error(`Vendor with ID "${id}" not found`)
    }
    
    // Handle company updates
    let companyId = updateData.companyId || existingVendor.companyId
    
    // If new company data is provided, create new company
    if (updateData.companyData) {
      const newCompany = CompanyService.createCompany(updateData.companyData)
      companyId = newCompany.id
    }
    
    // If company name is provided, try to find existing or create new
    if (updateData.companyName && updateData.companyName !== existingVendor.companyName) {
      let company = CompanyService.getCompanyByName(updateData.companyName)
      if (!company) {
        company = CompanyService.createCompany({ name: updateData.companyName })
      }
      companyId = company.id
    }
    
    // Verify company exists
    const company = CompanyService.getCompanyById(companyId)
    if (!company) {
      throw new Error(`Company with ID "${companyId}" not found`)
    }
    
    // Create Vendor instance with existing data
    const vendor = Vendor.fromJSON(existingVendor)
    
    // Update with new data
    vendor.update({
      ...updateData,
      companyId: companyId
    })
    
    // Validate updated vendor
    const validation = vendor.validate()
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Save to database
    const updatedVendor = db.updateVendor(id, vendor.toJSON())
    
    // Return vendor with company information
    return {
      ...updatedVendor,
      company: company
    }
  }
  
  // Delete vendor
  static deleteVendor(id) {
    // Check if vendor exists
    const existingVendor = db.getVendorById(id)
    if (!existingVendor) {
      throw new Error(`Vendor with ID "${id}" not found`)
    }
    
    // Delete from database (this only removes the vendor contract, not the company)
    return db.deleteVendor(id)
  }
  
  // Get vendors by company
  static getVendorsByCompany(companyId) {
    const vendors = db.getVendorsByCompany(companyId)
    const company = CompanyService.getCompanyById(companyId)
    
    return vendors.map(vendor => ({
      ...vendor,
      company: company || null
    }))
  }
  
  // Create vendor from legacy vendor data (for migration)
  static createVendorFromLegacy(legacyVendor, projectId) {
    // Extract company name from legacy vendor
    const companyName = legacyVendor.name || legacyVendor.vendor || 'Unknown Company'
    
    // Create or find company
    let company = CompanyService.getCompanyByName(companyName)
    if (!company) {
      company = CompanyService.createCompanyFromVendorName(companyName)
    }
    
    // Create vendor using legacy data
    const vendor = Vendor.fromLegacyVendor(legacyVendor, projectId, company.id)
    
    // Generate unique ID
    vendor.id = uuidv4()
    
    // Calculate derived fields
    vendor.calculateDerivedFields()
    
    // Save to database
    const savedVendor = db.createVendor(vendor.toJSON())
    
    return {
      ...savedVendor,
      company: company
    }
  }
  
  // Bulk create vendors from Excel import
  static createVendorsFromExcelData(vendorDataArray, projectId) {
    const createdVendors = []
    
    for (const vendorData of vendorDataArray) {
      try {
        const vendor = this.createVendorFromLegacy(vendorData, projectId)
        createdVendors.push(vendor)
      } catch (error) {
        console.error(`Failed to create vendor from Excel data:`, error)
        // Continue with other vendors even if one fails
      }
    }
    
    return createdVendors
  }
  
  // Get vendor summary for project
  static getVendorSummaryForProject(projectId) {
    const vendors = this.getVendorsByProject(projectId)
    
    const summary = {
      totalVendors: vendors.length,
      totalCommitment: 0,
      totalBilled: 0,
      totalHoldback: 0,
      totalVariance: 0,
      activeVendors: 0,
      companies: new Set()
    }
    
    vendors.forEach(vendor => {
      summary.totalCommitment += vendor.currentCommitment || 0
      summary.totalBilled += vendor.billedToDate || 0
      summary.totalHoldback += vendor.holdback || 0
      summary.totalVariance += vendor.variance || 0
      
      if (vendor.status === 'Active') {
        summary.activeVendors++
      }
      
      if (vendor.company) {
        summary.companies.add(vendor.company.name)
      }
    })
    
    summary.uniqueCompanies = summary.companies.size
    delete summary.companies // Remove Set object for JSON serialization
    
    return summary
  }
}

export default VendorService

