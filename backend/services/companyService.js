// Company service layer for company management
import * as db from './database.js'
import Company from '../models/Company.js'
import { v4 as uuidv4 } from 'uuid'

export class CompanyService {
  // Get all companies
  static getAllCompanies() {
    return db.getAllCompanies()
  }
  
  // Get company by ID
  static getCompanyById(id) {
    return db.getCompanyById(id)
  }
  
  // Get company by name (for duplicate checking)
  static getCompanyByName(name) {
    const companies = db.getAllCompanies()
    return companies.find(company => 
      company.name.toLowerCase().trim() === name.toLowerCase().trim()
    )
  }
  
  // Create new company
  static createCompany(companyData) {
    // Create Company instance for validation
    const company = new Company(companyData)
    
    // Validate company data
    const validation = company.validate()
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Check for duplicate company name
    const existingCompany = this.getCompanyByName(company.name)
    if (existingCompany) {
      throw new Error(`Company with name "${company.name}" already exists`)
    }
    
    // Generate unique ID
    company.id = uuidv4()
    
    // Set timestamps
    const now = new Date().toISOString()
    company.createdAt = now
    company.updatedAt = now
    
    // Save to database
    return db.createCompany(company.toJSON())
  }
  
  // Update existing company
  static updateCompany(id, updateData) {
    // Get existing company
    const existingCompany = this.getCompanyById(id)
    if (!existingCompany) {
      throw new Error(`Company with ID "${id}" not found`)
    }
    
    // Create Company instance with existing data
    const company = Company.fromJSON(existingCompany)
    
    // Update with new data
    company.update(updateData)
    
    // Validate updated company
    const validation = company.validate()
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Check for duplicate name if name is being changed
    if (updateData.name && updateData.name !== existingCompany.name) {
      const duplicateCompany = this.getCompanyByName(updateData.name)
      if (duplicateCompany && duplicateCompany.id !== id) {
        throw new Error(`Company with name "${updateData.name}" already exists`)
      }
    }
    
    // Save to database
    return db.updateCompany(id, company.toJSON())
  }
  
  // Delete company
  static deleteCompany(id) {
    // Check if company exists
    const existingCompany = this.getCompanyById(id)
    if (!existingCompany) {
      throw new Error(`Company with ID "${id}" not found`)
    }
    
    // Check if company is referenced by any vendors
    const vendors = db.getAllVendors()
    const referencedVendors = vendors.filter(vendor => vendor.companyId === id)
    
    if (referencedVendors.length > 0) {
      throw new Error(`Cannot delete company "${existingCompany.name}" as it is referenced by ${referencedVendors.length} vendor contract(s)`)
    }
    
    // Delete from database
    return db.deleteCompany(id)
  }
  
  // Search companies by name (for autocomplete/dropdown)
  static searchCompaniesByName(searchTerm) {
    const companies = this.getAllCompanies()
    const term = searchTerm.toLowerCase().trim()
    
    return companies.filter(company =>
      company.name.toLowerCase().includes(term)
    ).sort((a, b) => a.name.localeCompare(b.name))
  }
  
  // Get companies with vendor count (for admin/reporting)
  static getCompaniesWithVendorCount() {
    const companies = this.getAllCompanies()
    const vendors = db.getAllVendors()
    
    return companies.map(company => {
      const vendorCount = vendors.filter(vendor => vendor.companyId === company.id).length
      return {
        ...company,
        vendorCount
      }
    })
  }
  
  // Create company from vendor name (for migration)
  static createCompanyFromVendorName(vendorName) {
    if (!vendorName || vendorName.trim().length === 0) {
      throw new Error('Vendor name is required')
    }
    
    // Check if company already exists
    const existingCompany = this.getCompanyByName(vendorName)
    if (existingCompany) {
      return existingCompany
    }
    
    // Create new company with minimal data
    const companyData = {
      name: vendorName.trim(),
      notes: 'Created from vendor migration'
    }
    
    return this.createCompany(companyData)
  }
}

export default CompanyService

