// Enhanced Project service layer for comprehensive PFMT Excel processing
import * as db from './database.js'
import * as XLSX from 'xlsx'
import fs from 'fs/promises'

export class ProjectService {
  // Get all projects with pagination and filtering - Enhanced for proper visibility
  static getProjects(options = {}) {
    const {
      page = 1,
      limit = 10,
      ownerId,
      status,
      reportStatus,
      userId,
      userRole
    } = options
    
    // Enhanced filtering for role-based access
    const filterOptions = {
      status,
      reportStatus
    }
    
    // Apply role-based filtering
    if (userId && userRole) {
      const role = userRole.toLowerCase()
      
      if (role === 'admin' || role === 'director') {
        // Admin and directors see all projects, apply additional filters if specified
        if (ownerId) filterOptions.ownerId = ownerId
      } else if (role === 'project manager' || role === 'senior project manager' || role === 'pm') {
        // Project managers see projects they own or manage
        filterOptions.userId = userId
        filterOptions.userRole = role
        
        // If specific ownerId is requested, use it (for filtering)
        if (ownerId) filterOptions.ownerId = ownerId
      } else {
        // Other roles only see their own projects
        filterOptions.ownerId = userId
      }
    } else if (ownerId) {
      // If no user context but ownerId specified, use it
      filterOptions.ownerId = ownerId
    }
    
    // Get filtered projects
    const allProjects = db.getAllProjects(filterOptions)
    
    // Calculate pagination
    const total = allProjects.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    // Get page data
    const projects = allProjects.slice(startIndex, endIndex)
    
    return {
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }
  
  // Get single project by ID
  static getProjectById(id) {
    return db.getProjectById(id)
  }
  
  // Create new project
  static createProject(projectData, userContext = null) {
    // Validate required fields
    const requiredFields = ['name']
    for (const field of requiredFields) {
      if (!projectData[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    
    // Set default values with enhanced structure
    const defaultProject = {
      // Basic Information
      status: 'Active',
      reportStatus: 'Update Required',
      phase: 'Planning',
      category: '',
      deliveryMethod: '',
      description: '',
      
      // Financial Data
      approvedTPC: 0,
      totalBudget: 0,
      eac: 0,
      taf: 0,
      amountSpent: 0,
      currentYearCashflow: 0,
      futureYearCashflow: 0,
      currentYearBudgetTarget: 0,
      currentYearApprovedTarget: 0,
      
      // Legacy fields for backward compatibility
      submissions: 0,
      targetCashflow: 0,
      scheduleStatus: 'On Track',
      budgetStatus: 'On Track',
      scopeStatus: 'On Track',
      scheduleReasonCode: '',
      budgetReasonCode: '',
      monthlyComments: '',
      previousHighlights: '',
      nextSteps: '',
      budgetVarianceExplanation: '',
      cashflowVarianceExplanation: '',
      submittedBy: null,
      submittedDate: null,
      approvedBy: null,
      approvedDate: null,
      directorApproved: false,
      seniorPmReviewed: false,
      
      // Project Details
      projectManager: '',
      primeContractor: '',
      clientMinistry: '',
      projectType: '',
      branch: '',
      geographicRegion: '',
      municipality: '',
      projectAddress: '',
      constituency: '',
      buildingName: '',
      buildingType: '',
      buildingId: '',
      primaryOwner: '',
      plan: '',
      block: '',
      lot: '',
      latitude: '',
      longitude: '',
      squareMeters: '',
      numberOfStructures: '',
      numberOfJobs: '',
      
      // Array fields
      fundingLines: [],
      vendors: [],
      changeOrders: [],
      additionalTeam: [],
      programs: [],
      
      // Project milestones by phase
      milestones: {
        Planning: {},
        Design: {},
        Construction: {},
        Closeout: {}
      },
      
      // PFMT metadata
      lastPfmtUpdate: null,
      pfmtFileName: null,
      pfmtExtractedAt: null,
      
      // Metadata
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      createdFrom: 'Manual',
      originalFileName: null
    }
    
    const newProject = {
      ...defaultProject,
      ...projectData,
      lastUpdated: new Date().toISOString()
    }
    
    return db.createProject(newProject, userContext)
  }
  
  // Update project
  static updateProject(id, updates) {
    const project = db.getProjectById(id)
    if (!project) {
      throw new Error('Project not found')
    }
    
    // Add lastUpdated timestamp to all updates
    const updatesWithTimestamp = {
      ...updates,
      lastUpdated: new Date().toISOString()
    }
    
    return db.updateProject(id, updatesWithTimestamp)
  }
  
  // Delete project
  static deleteProject(id) {
    const project = db.getProjectById(id)
    if (!project) {
      throw new Error('Project not found')
    }
    
    return db.deleteProject(id)
  }
  
  // Helper function to safely get cell value
  static getCellValue(worksheet, cellAddress) {
    const cell = worksheet[cellAddress]
    if (!cell) return null
    
    // Handle different cell types
    if (cell.t === 'n') return cell.v // number
    if (cell.t === 's') return cell.v // string
    if (cell.t === 'b') return cell.v // boolean
    if (cell.t === 'd') return cell.v // date
    
    return cell.v
  }
  
  // Helper function to convert string to number safely
  static toNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') return defaultValue
    if (typeof value === 'number') return value
    
    const numValue = parseFloat(value)
    return isNaN(numValue) ? defaultValue : numValue
  }
  
  // Process SP Fields sheet
  static processSPFields(worksheet) {
    const spData = {}
    
    console.log('Processing SP Fields sheet with correct field mappings...')
    
    // Read key-value pairs from SP Fields sheet
    // Based on analysis: Column A = Field, Column B = Value
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:B30')
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      const fieldCell = worksheet[XLSX.utils.encode_cell({r: row, c: 0})]
      const valueCell = worksheet[XLSX.utils.encode_cell({r: row, c: 1})]
      
      if (fieldCell && valueCell) {
        const field = fieldCell.v
        const value = valueCell.v
        
        if (field && value !== undefined) {
          spData[field] = value
          console.log(`  SP Field found: ${field} = ${value}`)
        }
      }
    }
    
    // Map to standardized field names with correct mappings from analysis
    const result = {
      approvedTPC: this.toNumber(spData.SPOApprovedTPC) || 0,
      totalBudget: this.toNumber(spData.SPOBudgetTotal) || 0,
      currentYearCashflow: this.toNumber(spData.SPOCashflowCurrentYearTotal) || 0,
      futureYearCashflow: this.toNumber(spData.SPOCashflowFutureYearTotal) || 0,
      taf: this.toNumber(spData.SPOTotalApprovedFunding || spData.TAF || spData.SPOApprovedTPC) || 0,
      eac: this.toNumber(spData.SPOEstimateAtCompletion || spData.EAC) || 0,
      amountSpent: this.toNumber(spData.SPOAmountSpentTotal) || 0,
      commitment: this.toNumber(spData.SPOCommitmentTotal) || 0,
      variance: this.toNumber(spData.SPOVarianceTotal) || 0
    }
    
    // Calculate derived values if not present
    result.totalCashflow = result.currentYearCashflow + result.futureYearCashflow
    if (!result.variance && result.approvedTPC && result.eac) {
      result.variance = result.approvedTPC - result.eac
    }
    
    console.log('Final SP Fields mapping:', result)
    return result
  }
  
  // Process SP Fund Src sheet
  static processSPFundSrc(worksheet) {
    const fundingData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: "",
      range: 1 // Skip header row
    })
    
    const fundingLines = []
    
    for (const row of fundingData) {
      if (row[0] && row[0] !== '--') { // Skip empty or placeholder rows
        fundingLines.push({
          source: row[0] || '',
          description: row[1] || '',
          capitalPlanLine: row[2] || '',
          approvedValue: this.toNumber(row[3]),
          currentYearBudget: this.toNumber(row[4]),
          currentYearApproved: this.toNumber(row[5])
        })
      }
    }
    
    return fundingLines
  }
  
  // Process FundingLines Lookup sheet
  static processFundingLinesLookup(worksheet) {
    const fundingData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: "",
      range: 1 // Skip header row
    })
    
    const fundingLines = []
    
    for (const row of fundingData) {
      if (row[0]) { // WBS column
        fundingLines.push({
          wbs: row[0] || '',
          description: row[1] || '',
          fundingLine: row[2] || '',
          fundingDescription: row[3] || '',
          projectId: row[4] || ''
        })
      }
    }
    
    return fundingLines
  }
  
  // Process Change Tracking sheet
  static processChangeTracking(worksheet) {
    const changeData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 9, // Header is on row 9 based on analysis
      defval: ""
    })
    
    const changeOrders = []
    
    for (const row of changeData) {
      if (row['Vendor / Org.']) {
        changeOrders.push({
          vendor: row['Vendor / Org.'] || '',
          contractId: row['Contract ID'] || '',
          status: row['Change Status'] || '',
          approvedDate: row['Approved Date'] || '',
          value: this.toNumber(row['Change Value']),
          referenceNumber: row['Reference #'] || '',
          reasonCode: row['Reason Code'] || '',
          description: row['Description'] || '',
          notes: row['Notes'] || ''
        })
      }
    }
    
    return changeOrders
  }
  
  // Process Cost Tracking sheet for vendor data with correct mappings
  static processCostTracking(worksheet) {
    console.log('Processing Cost Tracking sheet with correct header mappings...')
    
    // Based on analysis: header row is 4 (0-indexed as 3)
    const costData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, // Start from row 1 to capture headers properly
      defval: ""
    })
    
    const vendors = []
    
    // Use header row 4 (index 3) based on analysis
    const headerRowIndex = 3 // Row 4 in Excel (0-indexed)
    
    if (headerRowIndex >= costData.length) {
      console.log('Header row not found in Cost Tracking sheet')
      return vendors
    }
    
    const headers = costData[headerRowIndex]
    console.log('Cost Tracking headers from row 4:', headers)
    
    // Map column indices based on analysis findings
    const columnMap = {}
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j] ? headers[j].toString().toLowerCase().trim() : ''
      
      if (header.includes('vendor') || header.includes('org')) {
        columnMap.vendorName = j
      } else if (header.includes('contract') && header.includes('id')) {
        columnMap.contractId = j
      } else if (header.includes('current') && header.includes('commitment')) {
        columnMap.currentCommitment = j
      } else if (header.includes('billed') && header.includes('date')) {
        columnMap.billedToDate = j
      } else if (header.includes('spent') && header.includes('%')) {
        columnMap.percentSpent = j
      } else if (header.includes('holdback')) {
        columnMap.holdback = j
      } else if (header.includes('latest') && header.includes('cost') && header.includes('date')) {
        columnMap.latestCostDate = j
      } else if (header.includes('cashflow') && header.includes('total')) {
        columnMap.cashflowTotal = j
      }
    }
    
    console.log('Column mapping:', columnMap)
    
    // Process data rows starting from row 5 (index 4)
    for (let i = headerRowIndex + 1; i < costData.length; i++) {
      const row = costData[i]
      if (!Array.isArray(row)) continue
      
      // Get vendor name from mapped column or fallback to column B (index 1)
      const vendorName = row[columnMap.vendorName] || row[1] || ''
      
      if (vendorName && typeof vendorName === 'string' && vendorName.trim().length > 2) {
        const trimmedName = vendorName.trim()
        
        // Skip header-like entries
        if (trimmedName.toLowerCase().includes('vendor') || 
            trimmedName.toLowerCase().includes('summary') ||
            trimmedName.toLowerCase().includes('total')) {
          continue
        }
        
        const vendor = {
          name: trimmedName,
          contractId: row[columnMap.contractId] || '',
          currentCommitment: this.toNumber(row[columnMap.currentCommitment]) || 0,
          billedToDate: this.toNumber(row[columnMap.billedToDate]) || 0,
          percentSpent: this.toNumber(row[columnMap.percentSpent]) || 0,
          holdback: this.toNumber(row[columnMap.holdback]) || 0,
          latestCostDate: row[columnMap.latestCostDate] || '',
          cashflowTotal: this.toNumber(row[columnMap.cashflowTotal]) || 0,
          status: 'Active',
          changeStatus: '',
          changeValue: 0
        }
        
        // Calculate remaining commitment
        vendor.remainingCommitment = vendor.currentCommitment - vendor.billedToDate
        
        vendors.push(vendor)
        console.log(`  Vendor extracted: ${vendor.name} (Contract: ${vendor.contractId})`)
      }
    }
    
    console.log(`Total vendors extracted: ${vendors.length}`)
    return vendors
  }
  
  // Process Prime Contractor Summary sheet
  static processPrimeContractorSummary(worksheet) {
    // Look for specific cells containing prime contractor info
    const primeContractor = this.getCellValue(worksheet, 'B3') || '' // Adjust cell reference as needed
    const deliveryMethod = this.getCellValue(worksheet, 'C2') || ''
    
    return {
      primeContractor,
      deliveryMethod
    }
  }
  
  // Process Validations sheet for project setup data
  static processValidations(worksheet) {
    const validationData = {}
    
    // Extract project title from C6 based on analysis results
    const projectTitle = this.getCellValue(worksheet, 'C6') || 
                        this.getCellValue(worksheet, 'A5') || 
                        this.getCellValue(worksheet, 'B5') || ''
    
    console.log('Checking project name extraction:')
    console.log('  C6:', this.getCellValue(worksheet, 'C6'))
    console.log('  A5:', this.getCellValue(worksheet, 'A5'))
    console.log('  B5:', this.getCellValue(worksheet, 'B5'))
    
    if (projectTitle && projectTitle.trim()) {
      validationData.name = projectTitle.trim()
      console.log(`Project name extracted: "${validationData.name}"`)
    } else {
      // Fallback: scan for project name patterns
      console.log('No project name found in expected cells, scanning...')
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:F20')
      for (let row = range.s.r; row <= Math.min(range.e.r, 20); row++) {
        for (let col = range.s.c; col <= Math.min(range.e.c, 5); col++) {
          const cellAddr = XLSX.utils.encode_cell({r: row, c: col})
          const cellValue = this.getCellValue(worksheet, cellAddr)
          
          if (cellValue && typeof cellValue === 'string') {
            // Look for patterns that might indicate a project name
            if (cellValue.toLowerCase().includes('justice') || 
                cellValue.toLowerCase().includes('center') ||
                cellValue.toLowerCase().includes('centre') ||
                (cellValue.length > 5 && cellValue.length < 100 && 
                 !cellValue.toLowerCase().includes('field') &&
                 !cellValue.toLowerCase().includes('value') &&
                 !cellValue.toLowerCase().includes('validation') &&
                 !cellValue.toLowerCase().includes('category'))) {
              validationData.name = cellValue.trim()
              console.log(`Found potential project name at ${cellAddr}: ${cellValue}`)
              break
            }
          }
        }
        if (validationData.name) break
      }
    }
    
    // Extract other validation fields
    validationData.projectManager = this.getCellValue(worksheet, 'B10') || ''
    validationData.category = this.getCellValue(worksheet, 'B8') || ''
    validationData.phase = this.getCellValue(worksheet, 'B9') || ''
    validationData.geographicRegion = this.getCellValue(worksheet, 'B11') || ''
    
    console.log('Final extracted validation data:', validationData)
    return validationData
  }
  
  // Enhanced PFMT Excel processing with comprehensive field mapping
  static async processPFMTExcelUpload(projectId, filePath, fileName) {
    try {
      // Verify project exists
      const project = db.getProjectById(projectId)
      if (!project) {
        throw new Error('Project not found')
      }
      
      // Read and parse Excel file with enhanced options
      const workbook = XLSX.readFile(filePath, { 
        sheetStubs: true,
        defval: "",
        cellDates: true
      })
      
      console.log('Available sheets:', workbook.SheetNames)
      
      // Initialize extracted data
      let extractedData = {
        // Basic fields
        name: project.name,
        approvedTPC: 0,
        totalBudget: 0,
        currentYearCashflow: 0,
        futureYearCashflow: 0,
        
        // Arrays
        fundingLines: [],
        vendors: [],
        changeOrders: [],
        
        // Metadata
        extractedAt: new Date().toISOString(),
        fileName: fileName,
        sheetsProcessed: []
      }
      
      // Process Validations sheet FIRST (highest priority for project name)
      if (workbook.SheetNames.includes('Validations')) {
        console.log('Processing Validations sheet (priority for project name)...')
        const validationData = this.processValidations(workbook.Sheets['Validations'])
        extractedData = { ...extractedData, ...validationData }
        extractedData.sheetsProcessed.push('Validations')
        console.log(`✅ Project name from Validations: "${extractedData.name}"`)
      }
      
      // Process SP Fields sheet (financial data only - DO NOT override name)
      if (workbook.SheetNames.includes('SP Fields')) {
        console.log('Processing SP Fields sheet (financial data only)...')
        const spFieldsData = this.processSPFields(workbook.Sheets['SP Fields'])
        
        // CRITICAL: Remove any name field from SP Fields to prevent override
        if (spFieldsData.name) {
          console.log(`⚠️  Removing incorrect name from SP Fields: "${spFieldsData.name}"`)
          delete spFieldsData.name
        }
        
        extractedData = { ...extractedData, ...spFieldsData }
        extractedData.sheetsProcessed.push('SP Fields')
        console.log(`✅ Project name preserved: "${extractedData.name}"`)
      }
      
      // Process SP Fund Src sheet
      if (workbook.SheetNames.includes('SP Fund Src')) {
        console.log('Processing SP Fund Src sheet...')
        const fundingSrcData = this.processSPFundSrc(workbook.Sheets['SP Fund Src'])
        extractedData.fundingLines = [...extractedData.fundingLines, ...fundingSrcData]
        extractedData.sheetsProcessed.push('SP Fund Src')
      }
      
      // Process FundingLines Lookup sheet
      if (workbook.SheetNames.includes('FundingLines Lookup')) {
        console.log('Processing FundingLines Lookup sheet...')
        const fundingLookupData = this.processFundingLinesLookup(workbook.Sheets['FundingLines Lookup'])
        // Merge with existing funding lines or create separate array
        extractedData.fundingLinesLookup = fundingLookupData
        extractedData.sheetsProcessed.push('FundingLines Lookup')
      }
      
      // Process Change Tracking sheet
      if (workbook.SheetNames.includes('Change Tracking')) {
        console.log('Processing Change Tracking sheet...')
        const changeData = this.processChangeTracking(workbook.Sheets['Change Tracking'])
        extractedData.changeOrders = changeData
        extractedData.sheetsProcessed.push('Change Tracking')
      }
      
      // Process Cost Tracking sheet
      if (workbook.SheetNames.includes('Cost Tracking')) {
        console.log('Processing Cost Tracking sheet...')
        const vendorData = this.processCostTracking(workbook.Sheets['Cost Tracking'])
        extractedData.vendors = vendorData
        extractedData.sheetsProcessed.push('Cost Tracking')
      }
      
      // Process Prime Contractor Summary sheet
      if (workbook.SheetNames.includes('Prime Cont. Summary')) {
        console.log('Processing Prime Cont. Summary sheet...')
        const primeContractorData = this.processPrimeContractorSummary(workbook.Sheets['Prime Cont. Summary'])
        extractedData = { ...extractedData, ...primeContractorData }
        extractedData.sheetsProcessed.push('Prime Cont. Summary')
      }
      
      // Validations sheet already processed first for project name priority
      
      // Calculate derived values
      const tafEacVariance = extractedData.eac - extractedData.taf
      const cashflowVariance = extractedData.currentYearCashflow - extractedData.currentYearBudgetTarget
      const budgetUtilization = extractedData.totalBudget > 0 ? 
        (extractedData.amountSpent / extractedData.totalBudget) * 100 : 0
      
      // Prepare comprehensive update data
      const updateData = {
        // Core project data - PROTECT project name from financial data override
        name: (extractedData.name && extractedData.name.includes && !extractedData.name.includes('SPO') && !extractedData.name.includes('1515172')) 
              ? extractedData.name 
              : project.name,
        approvedTPC: extractedData.approvedTPC,
        totalBudget: extractedData.totalBudget,
        currentYearCashflow: extractedData.currentYearCashflow,
        futureYearCashflow: extractedData.futureYearCashflow,
        
        // Contractor and delivery info
        primeContractor: extractedData.primeContractor || project.primeContractor,
        deliveryMethod: extractedData.deliveryMethod || project.deliveryMethod,
        
        // Array data
        fundingLines: extractedData.fundingLines,
        vendors: extractedData.vendors,
        changeOrders: extractedData.changeOrders,
        
        // PFMT metadata
        lastPfmtUpdate: new Date().toISOString(),
        pfmtFileName: fileName,
        pfmtExtractedAt: new Date().toISOString(),
        reportStatus: 'Current',
        
        // Store complete PFMT data for future reference
        pfmtData: extractedData,
        
        // Calculated values
        tafEacVariance,
        cashflowVariance,
        budgetUtilization
      }
      
      // Update project with extracted data
      const updatedProject = db.updateProject(projectId, updateData)
      
      // Clean up uploaded file
      try {
        await fs.unlink(filePath)
      } catch (cleanupError) {
        console.warn('Failed to clean up uploaded file:', cleanupError)
      }
      
      return {
        project: updatedProject,
        extractedData: {
          ...extractedData,
          tafEacVariance,
          cashflowVariance,
          budgetUtilization,
          fileName,
          extractedAt: updateData.pfmtExtractedAt
        },
        pfmtData: extractedData
      }
      
    } catch (error) {
      // Clean up uploaded file on error
      try {
        await fs.unlink(filePath)
      } catch (cleanupError) {
        console.warn('Failed to clean up uploaded file after error:', cleanupError)
      }
      
      throw error
    }
  }
  
  // Legacy Excel processing for backward compatibility
  static async processExcelUpload(projectId, filePath, fileName) {
    // Use the enhanced PFMT processing for all Excel uploads
    return this.processPFMTExcelUpload(projectId, filePath, fileName)
  }
}

