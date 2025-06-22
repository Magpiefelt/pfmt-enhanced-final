// Enhanced Vendor Extraction Service for processing PFMT spreadsheet vendor data
import XLSX from 'xlsx'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import CompanyService from './companyService.js'
import VendorService from './vendorService.js'

class VendorExtractionService {
  // Extract vendors from uploaded spreadsheet
  static async extractVendorsFromSpreadsheet(projectId, fileBuffer, fileName, options = {}, userId) {
    try {
      const {
        startRow = 7,
        sheetName = null,
        batchSize = 50
      } = options
      
      console.log('Starting vendor extraction:', { projectId, fileName, startRow, sheetName })
      
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      
      // Find the Vendor Listing sheet specifically
      const worksheet = this.findVendorListingSheet(workbook, sheetName)
      
      if (!worksheet) {
        throw new Error('Could not find "Vendor Listing" sheet in the PFMT workbook. Please ensure your Excel file contains a sheet named "Vendor Listing" or similar.')
      }
      
      // Convert worksheet to array of arrays
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
      
      // Validate data structure for vendor listing
      this.validateVendorListingData(data, startRow)
      
      // Extract vendor rows (starting from specified row, default row 7)
      const vendorRows = data.slice(startRow - 1)
      
      // Process vendors in batches
      const results = await this.processVendorBatch(vendorRows, projectId, startRow, fileName, userId)
      
      console.log('Vendor extraction completed:', results)
      
      return {
        success: true,
        extractedCount: results.processedVendors,
        savedCount: results.createdVendors,
        companiesCreated: results.createdCompanies,
        errors: results.errors,
        warnings: results.warnings,
        vendors: results.vendors
      }
      
    } catch (error) {
      console.error('Vendor extraction failed:', error)
      throw new Error(`Vendor extraction failed: ${error.message}`)
    }
  }

  // Preview vendor extraction without saving
  static async previewVendorExtraction(projectId, fileBuffer, fileName, options = {}) {
    try {
      const {
        startRow = 7,
        sheetName = null,
        previewLimit = 10
      } = options
      
      console.log('Starting vendor extraction preview:', { projectId, fileName, startRow, sheetName })
      
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      
      // Find the Vendor Listing sheet specifically
      const worksheet = this.findVendorListingSheet(workbook, sheetName)
      
      if (!worksheet) {
        throw new Error('Could not find "Vendor Listing" sheet in the PFMT workbook. Please ensure your Excel file contains a sheet named "Vendor Listing" or similar.')
      }
      
      // Convert worksheet to array of arrays
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
      
      // Validate data structure for vendor listing
      this.validateVendorListingData(data, startRow)
      
      // Extract vendor rows (starting from specified row, default row 7)
      const vendorRows = data.slice(startRow - 1).slice(0, previewLimit)
      
      // Process vendors for preview only
      const results = await this.processVendorBatch(vendorRows, projectId, startRow, fileName, null, true)
      
      return {
        success: true,
        extractedCount: results.processedVendors,
        validCount: results.vendors.filter(v => v.isValid).length,
        errors: results.errors,
        warnings: results.warnings,
        preview: results.vendors.slice(0, previewLimit),
        sheetFound: true
      }
      
    } catch (error) {
      console.error('Vendor extraction preview failed:', error)
      throw new Error(`Vendor extraction preview failed: ${error.message}`)
    }
  }

  // Find the Vendor Listing sheet specifically in the workbook
  static findVendorListingSheet(workbook, preferredSheetName = null) {
    const sheetNames = workbook.SheetNames
    console.log('Available sheets in workbook:', sheetNames)
    
    // If specific sheet name provided, try to find it first
    if (preferredSheetName) {
      const exactMatch = sheetNames.find(name => 
        name.toLowerCase() === preferredSheetName.toLowerCase()
      )
      if (exactMatch) {
        console.log(`Found preferred sheet: ${exactMatch}`)
        return workbook.Sheets[exactMatch]
      }
    }
    
    // Look specifically for "Vendor Listing" sheet (exact match)
    const vendorListingExact = sheetNames.find(name => 
      name.toLowerCase() === 'vendor listing'
    )
    if (vendorListingExact) {
      console.log(`Found Vendor Listing sheet: ${vendorListingExact}`)
      return workbook.Sheets[vendorListingExact]
    }
    
    // Look for variations of vendor listing sheet names
    const vendorListingVariations = [
      'vendor list',
      'vendors',
      'vendor_listing',
      'vendorlisting',
      'contractor listing',
      'contractors',
      'company listing',
      'companies'
    ]
    
    for (const variation of vendorListingVariations) {
      const match = sheetNames.find(name => 
        name.toLowerCase().includes(variation)
      )
      if (match) {
        console.log(`Found vendor sheet variation: ${match}`)
        return workbook.Sheets[match]
      }
    }
    
    // Log available sheets for debugging
    console.warn('Could not find Vendor Listing sheet. Available sheets:', sheetNames)
    
    return null
  }

  // Validate vendor listing data structure
  static validateVendorListingData(data, startRow) {
    if (!data || data.length === 0) {
      throw new Error('Vendor Listing sheet appears to be empty')
    }
    
    if (data.length < startRow) {
      throw new Error(`Vendor Listing sheet has fewer rows than the specified start row (${startRow}). Expected vendor data to start at row ${startRow}.`)
    }
    
    // Check if we have the expected columns based on the requirements
    // Row 7 should contain vendor data with Company Name in Column B, Company ID in Column C, etc.
    const headerRow = data[startRow - 2] || [] // Row before data starts (usually headers)
    const firstDataRow = data[startRow - 1] || [] // First data row
    
    // Validate that we have data in the expected columns
    if (firstDataRow.length < 20) { // Should have at least columns A through T
      console.warn(`First data row has only ${firstDataRow.length} columns. Expected at least 20 columns (A-T).`)
    }
    
    // Validate that we have data rows beyond the start row
    const dataRows = data.slice(startRow - 1)
    const nonEmptyRows = dataRows.filter(row => 
      row && row.some(cell => cell && cell.toString().trim() !== '')
    )
    
    if (nonEmptyRows.length === 0) {
      throw new Error(`No vendor data found starting from row ${startRow} in the Vendor Listing sheet`)
    }
    
    console.log(`Found ${nonEmptyRows.length} non-empty vendor rows starting from row ${startRow}`)
    return true
  }

  // Process vendor batch
  static async processVendorBatch(rows, projectId, startRowIndex, fileName, userId, previewOnly = false) {
    const results = {
      processedVendors: 0,
      createdVendors: 0,
      createdCompanies: 0,
      errors: [],
      warnings: [],
      vendors: []
    }
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowIndex = startRowIndex + i
      
      try {
        // Skip empty rows
        if (!row || !row.some(cell => cell && cell.toString().trim() !== '')) {
          continue
        }
        
        // Convert row array to object with PFMT Vendor Listing column mappings
        const rowData = this.mapVendorListingRowToColumns(row)
        
        // Skip rows without company name (Column B) - this is required
        if (!rowData.companyName || rowData.companyName.trim() === '') {
          results.warnings.push({
            row: rowIndex,
            message: 'Skipping row with empty company name (Column B)'
          })
          continue
        }
        
        results.processedVendors++
        
        // Handle company creation/lookup using both name (Column B) and external ID (Column C)
        const companyResult = await this.handleCompanyCreation(rowData, previewOnly)
        if (companyResult.created) {
          results.createdCompanies++
        }
        
        // Create vendor data with company information
        const vendorData = {
          companyId: companyResult.company?.id || null,
          companyName: rowData.companyName,
          externalCompanyId: rowData.externalCompanyId,
          currentSpend: rowData.currentSpend,
          contractStatus: rowData.contractStatus,
          originalContractTotal: rowData.originalContractTotal,
          amendments: rowData.amendments,
          currentCommitment: rowData.currentCommitment,
          percentageSpent: rowData.percentageSpent,
          workStartDate: rowData.workStartDate,
          expectedEndDate: rowData.expectedEndDate,
          workType1: rowData.workType1,
          workType2: rowData.workType2,
          fundingSource: rowData.fundingSource,
          dataSource: 'Spreadsheet',
          extractedAt: new Date().toISOString(),
          extractedBy: userId,
          extractionSource: {
            fileName,
            rowIndex,
            extractedAt: new Date().toISOString(),
            extractedBy: userId
          }
        }
        
        if (!previewOnly) {
          // Create vendor in database using the existing VendorService
          const createdVendor = VendorService.createVendor(vendorData)
          results.createdVendors++
          results.vendors.push({
            ...createdVendor,
            isValid: true,
            rowIndex
          })
        } else {
          // For preview, just validate the data
          results.vendors.push({
            ...vendorData,
            company: companyResult.company,
            isValid: true,
            rowIndex
          })
        }
        
      } catch (error) {
        console.error(`Error processing vendor row ${rowIndex}:`, error)
        results.errors.push({
          row: rowIndex,
          message: error.message,
          data: row
        })
      }
    }
    
    return results
  }

  // Map row array to column object based on PFMT Vendor Listing spreadsheet structure
  static mapVendorListingRowToColumns(row) {
    // Map array indices to meaningful column names based on PFMT Vendor Listing requirements
    // Real data starts on Row 7, Column mappings as specified:
    return {
      companyName: (row[1] || '').toString().trim(), // Column B - Company name
      externalCompanyId: (row[2] || '').toString().trim(), // Column C - Company ID
      currentSpend: this.parseNumeric(row[3]), // Column D - Current spend
      contractStatus: this.parseContractStatus(row[4]), // Column E - Contract status (open/closed)
      originalContractTotal: this.parseNumeric(row[5]), // Column F - Original contract total
      amendments: this.parseNumeric(row[6]), // Column G - Amendments/change orders
      currentCommitment: this.parseNumeric(row[7]), // Column H - Current commitment
      percentageSpent: this.parseNumeric(row[9]), // Column J - Percentage spent
      workStartDate: this.parseDate(row[12]), // Column M - Work start date
      expectedEndDate: this.parseDate(row[13]), // Column N - Expected end date
      workType1: (row[14] || '').toString().trim(), // Column O - Type of work 1
      workType2: (row[15] || '').toString().trim(), // Column P - Type of work 2
      fundingSource: (row[19] || '').toString().trim() // Column T - Funding source/funding lines
    }
  }

  // Parse contract status with validation
  static parseContractStatus(value) {
    if (!value) return 'open'
    
    const status = value.toString().toLowerCase().trim()
    
    // Map various status values to open/closed
    if (status.includes('open') || status.includes('active') || status.includes('ongoing')) {
      return 'open'
    }
    if (status.includes('closed') || status.includes('complete') || status.includes('finished')) {
      return 'closed'
    }
    
    // Default to open if unclear
    return 'open'
  }

  // Parse numeric values with error handling
  static parseNumeric(value) {
    if (value === null || value === undefined || value === '') {
      return 0
    }
    
    // Handle string values that might contain currency symbols or commas
    if (typeof value === 'string') {
      const cleaned = value.replace(/[$,\s%]/g, '')
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? 0 : parsed
    }
    
    // Handle numeric values
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value
    }
    
    return 0
  }

  // Parse date values with error handling
  static parseDate(value) {
    if (!value) return null
    
    try {
      // Handle Excel date numbers
      if (typeof value === 'number') {
        const date = XLSX.SSF.parse_date_code(value)
        return new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0]
      }
      
      // Handle string dates
      if (typeof value === 'string') {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0]
        }
      }
      
      return null
    } catch (error) {
      console.warn('Failed to parse date:', value, error.message)
      return null
    }
  }

  // Handle company creation or lookup using both name (Column B) and external ID (Column C)
  static async handleCompanyCreation(rowData, previewOnly = false) {
    try {
      const { companyName, externalCompanyId } = rowData
      
      // First, try to find existing company by external ID (Column C)
      if (externalCompanyId) {
        try {
          const existingCompany = CompanyService.getCompanyByExternalId(externalCompanyId)
          if (existingCompany) {
            console.log(`Found existing company by external ID: ${externalCompanyId}`)
            return { company: existingCompany, created: false }
          }
        } catch (error) {
          console.warn(`Failed to lookup company by external ID ${externalCompanyId}:`, error.message)
        }
      }
      
      // If not found by external ID, try to find by name (Column B)
      if (companyName) {
        try {
          const existingCompany = CompanyService.getCompanyByName(companyName)
          if (existingCompany) {
            console.log(`Found existing company by name: ${companyName}`)
            // Update the existing company with external ID if it doesn't have one
            if (externalCompanyId && !existingCompany.externalId && !previewOnly) {
              CompanyService.updateCompany(existingCompany.id, { 
                externalId: externalCompanyId 
              })
              existingCompany.externalId = externalCompanyId
            }
            return { company: existingCompany, created: false }
          }
        } catch (error) {
          console.warn(`Failed to lookup company by name ${companyName}:`, error.message)
        }
      }
      
      // If company doesn't exist, create new one (unless preview mode)
      if (!previewOnly && companyName) {
        try {
          const newCompanyData = {
            name: companyName,
            externalId: externalCompanyId || null,
            createdFrom: 'pfmt_vendor_extraction'
          }
          
          const newCompany = CompanyService.createCompany(newCompanyData)
          console.log(`Created new company: ${companyName} (External ID: ${externalCompanyId})`)
          return { company: newCompany, created: true }
        } catch (error) {
          console.warn(`Failed to create company ${companyName}:`, error.message)
          return { company: null, created: false }
        }
      }
      
      // For preview mode, return placeholder company data
      if (previewOnly && companyName) {
        return {
          company: {
            id: 'preview-company',
            name: companyName,
            externalId: externalCompanyId
          },
          created: false
        }
      }
      
      return { company: null, created: false }
      
    } catch (error) {
      console.error('Error in company creation/lookup:', error)
      return { company: null, created: false }
    }
  }
}

export default VendorExtractionService

