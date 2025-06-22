// Enhanced Vendor service layer with extraction capabilities
import * as db from './database.js'
import Vendor from '../models/Vendor.js'
import CompanyService from './companyService.js'
import { v4 as uuidv4 } from 'uuid'
import XLSX from 'xlsx'

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
    
    // For enhanced vendors with external company ID, try to match existing company
    if (!companyId && vendorData.externalCompanyId) {
      const company = CompanyService.getCompanyByExternalId(vendorData.externalCompanyId)
      if (company) {
        companyId = company.id
      }
    }
    
    // Make company optional - vendors can be created without companies
    if (!companyId) {
      console.warn('Creating vendor without company information')
      // Set companyId to null to allow vendor creation without company
      companyId = null
    }
    
    // Verify company exists (only if companyId is provided)
    let company = null
    if (companyId) {
      company = CompanyService.getCompanyById(companyId)
      if (!company) {
        console.warn(`Company with ID "${companyId}" not found, creating vendor without company`)
        companyId = null
      }
    }
    
    // Create Vendor instance (company is optional)
    const vendor = new Vendor({
      ...vendorData,
      companyId: companyId || null
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
    
    // Verify company exists (only if companyId is provided)
    let company = null
    if (companyId) {
      company = CompanyService.getCompanyById(companyId)
      if (!company) {
        console.warn(`Company with ID "${companyId}" not found during update, keeping vendor without company`)
        companyId = null
      }
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

  // ENHANCED FUNCTIONALITY - Spreadsheet Extraction

  // Extract vendors from spreadsheet buffer
  static async extractVendorsFromSpreadsheet(projectId, fileBuffer, options = {}) {
    try {
      const {
        startRow = 7,
        sheetName = null,
        extractedBy = null,
        previewOnly = false
      } = options

      // Parse the Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      
      // Get the target worksheet
      let worksheet
      if (sheetName && workbook.SheetNames.includes(sheetName)) {
        worksheet = workbook.Sheets[sheetName]
      } else {
        // Use the first sheet if no specific sheet name provided
        worksheet = workbook.Sheets[workbook.SheetNames[0]]
      }

      if (!worksheet) {
        throw new Error('No valid worksheet found in the Excel file')
      }

      // Convert worksheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        raw: false
      })

      // Extract vendor data starting from the specified row
      const extractedVendors = []
      const errors = []

      for (let i = startRow - 1; i < jsonData.length; i++) {
        const row = jsonData[i]
        
        // Skip empty rows
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
          continue
        }

        try {
          const vendorData = this.parseVendorRow(row, i + 1)
          if (vendorData) {
            const vendor = Vendor.fromSpreadsheetData(vendorData, projectId, extractedBy)
            
            // Validate the vendor
            const validation = vendor.validate()
            if (validation.isValid) {
              vendor.validationStatus = 'Validated'
              extractedVendors.push(vendor)
            } else {
              vendor.validationStatus = 'Rejected'
              vendor.validationErrors = validation.errors
              extractedVendors.push(vendor)
              errors.push({
                row: i + 1,
                errors: validation.errors
              })
            }
          }
        } catch (error) {
          errors.push({
            row: i + 1,
            errors: [error.message]
          })
        }
      }

      // If this is just a preview, return the extracted data without saving
      if (previewOnly) {
        return {
          success: true,
          preview: true,
          extractedCount: extractedVendors.length,
          validCount: extractedVendors.filter(v => v.validationStatus === 'Validated').length,
          errorCount: errors.length,
          vendors: extractedVendors.map(v => v.toJSON()),
          errors: errors
        }
      }

      // Save valid vendors to database
      const savedVendors = []
      for (const vendor of extractedVendors) {
        if (vendor.validationStatus === 'Validated') {
          try {
            // Handle company creation/matching
            let companyId = await this.findOrCreateCompany(vendor)
            vendor.companyId = companyId
            
            // Generate ID and calculate derived fields
            vendor.id = uuidv4()
            vendor.calculateDerivedFields()
            
            // Save to database
            const savedVendor = db.createVendor(vendor.toJSON())
            savedVendors.push(savedVendor)
          } catch (error) {
            errors.push({
              vendor: vendor.companyName,
              errors: [error.message]
            })
          }
        }
      }

      return {
        success: true,
        extractedCount: extractedVendors.length,
        savedCount: savedVendors.length,
        errorCount: errors.length,
        vendors: savedVendors,
        errors: errors
      }

    } catch (error) {
      throw new Error(`Failed to extract vendors from spreadsheet: ${error.message}`)
    }
  }

  // Parse a single vendor row from spreadsheet
  static parseVendorRow(row, rowNumber) {
    // Column mapping based on PDF requirements
    // B=Company Name, C=Company ID, D=Current Spend, E=Contract Status, 
    // F=Original Contract Total, G=Amendments, H=Current Commitment, 
    // J=Percent Spent, M=Work Start Date, N=Expected End Date, 
    // O=Work Type 1, P=Work Type 2, T=Funding Source

    const companyName = row[1] ? row[1].toString().trim() : '' // Column B
    
    // Skip rows without company name
    if (!companyName) {
      return null
    }

    return {
      companyName: companyName,
      companyId: row[2] ? row[2].toString().trim() : '', // Column C
      currentSpend: this.parseNumeric(row[3]), // Column D
      contractStatus: row[4] ? row[4].toString().trim() : 'Open', // Column E
      originalContractTotal: this.parseNumeric(row[5]), // Column F
      amendments: this.parseNumeric(row[6]), // Column G
      currentCommitment: this.parseNumeric(row[7]), // Column H
      percentSpent: this.parseNumeric(row[9]), // Column J
      workStartDate: this.parseDate(row[12]), // Column M
      expectedEndDate: this.parseDate(row[13]), // Column N
      workType1: row[14] ? row[14].toString().trim() : '', // Column O
      workType2: row[15] ? row[15].toString().trim() : '', // Column P
      fundingSource: row[19] ? row[19].toString().trim() : '' // Column T
    }
  }

  // Helper method to parse numeric values
  static parseNumeric(value) {
    if (!value) return 0
    
    // Remove currency symbols, commas, and other non-numeric characters
    const cleaned = value.toString().replace(/[$,\s%]/g, '')
    const parsed = parseFloat(cleaned)
    
    return isNaN(parsed) ? 0 : parsed
  }

  // Helper method to parse date values
  static parseDate(value) {
    if (!value) return ''
    
    try {
      // Handle Excel date serial numbers
      if (typeof value === 'number') {
        const date = XLSX.SSF.parse_date_code(value)
        return new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0]
      }
      
      // Handle string dates
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
      
      return value.toString().trim()
    } catch (error) {
      return value.toString().trim()
    }
  }

  // Find or create company for vendor
  static async findOrCreateCompany(vendor) {
    // Try to find existing company by external ID first
    if (vendor.externalCompanyId) {
      const existingCompany = CompanyService.getCompanyByExternalId(vendor.externalCompanyId)
      if (existingCompany) {
        return existingCompany.id
      }
    }

    // Try to find by name
    if (vendor.companyName) {
      const existingCompany = CompanyService.getCompanyByName(vendor.companyName)
      if (existingCompany) {
        return existingCompany.id
      }

      // Create new company
      const newCompany = CompanyService.createCompany({
        name: vendor.companyName,
        externalId: vendor.externalCompanyId,
        notes: 'Created from vendor extraction'
      })
      return newCompany.id
    }

    throw new Error('Cannot create company: no name or external ID provided')
  }

  // Get extraction history for a project
  static getExtractionHistory(projectId) {
    const vendors = this.getVendorsByProject(projectId)
    
    return vendors
      .filter(vendor => vendor.dataSource === 'Spreadsheet')
      .map(vendor => ({
        id: vendor.id,
        companyName: vendor.companyName,
        extractedAt: vendor.extractedAt,
        extractedBy: vendor.extractedBy,
        validationStatus: vendor.validationStatus,
        validationErrors: vendor.validationErrors
      }))
      .sort((a, b) => new Date(b.extractedAt) - new Date(a.extractedAt))
  }

  // Get vendor dashboard data
  static getVendorDashboard(projectId) {
    const vendors = this.getVendorsByProject(projectId)
    const summary = this.getVendorSummaryForProject(projectId)
    
    // Calculate additional dashboard metrics
    const dashboard = {
      ...summary,
      vendorsNeedingAttention: vendors.filter(v => {
        const vendor = Vendor.fromJSON(v)
        return vendor.getStatusSummary().needsAttention
      }).length,
      overBudgetVendors: vendors.filter(v => v.billedToDate > v.currentCommitment).length,
      recentExtractions: this.getExtractionHistory(projectId).slice(0, 5)
    }
    
    return dashboard
  }
}

export default VendorService

