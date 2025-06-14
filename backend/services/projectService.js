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
  static createProject(projectData) {
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
    
    return db.createProject(newProject)
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
    
    // Read key-value pairs from SP Fields sheet
    // Assuming format: Column A = Field, Column B = Value
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:B20')
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      const fieldCell = worksheet[XLSX.utils.encode_cell({r: row, c: 0})]
      const valueCell = worksheet[XLSX.utils.encode_cell({r: row, c: 1})]
      
      if (fieldCell && valueCell) {
        const field = fieldCell.v
        const value = valueCell.v
        
        if (field && value !== undefined) {
          spData[field] = value
        }
      }
    }
    
    return {
      approvedTPC: this.toNumber(spData.SPOApprovedTPC),
      totalBudget: this.toNumber(spData.SPOBudgetTotal),
      currentYearCashflow: this.toNumber(spData.SPOCashflowCurrentYearTotal),
      futureYearCashflow: this.toNumber(spData.SPOCashflowFutureYearTotal)
    }
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
  
  // Process Cost Tracking sheet
  static processCostTracking(worksheet) {
    const costData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 4, // Header is on row 4 based on analysis
      defval: ""
    })
    
    const vendors = []
    
    for (const row of costData) {
      if (row['Vendor / Org.']) {
        vendors.push({
          name: row['Vendor / Org.'] || '',
          currentCommitment: this.toNumber(row['Current Commitment']),
          billedToDate: this.toNumber(row['Billed to Date']),
          percentSpent: this.toNumber(row['% Spent']),
          holdback: this.toNumber(row['Holdback']),
          latestCostDate: row['Latest Cost Date'] || '',
          cashflowTotal: this.toNumber(row['Cashflow Total']),
          cmsValue: this.toNumber(row['CMS Value']),
          cmsAsOfDate: row['CMS As of Date'] || '',
          variance: this.toNumber(row['Variance'])
        })
      }
    }
    
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
    
    // Look for project title
    const projectTitle = this.getCellValue(worksheet, 'B5') || ''
    
    // Look for other validation data
    // This would need to be customized based on the actual structure
    
    return {
      name: projectTitle
    }
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
      
      // Process SP Fields sheet (highest priority)
      if (workbook.SheetNames.includes('SP Fields')) {
        console.log('Processing SP Fields sheet...')
        const spFieldsData = this.processSPFields(workbook.Sheets['SP Fields'])
        extractedData = { ...extractedData, ...spFieldsData }
        extractedData.sheetsProcessed.push('SP Fields')
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
      
      // Process Validations sheet
      if (workbook.SheetNames.includes('Validations')) {
        console.log('Processing Validations sheet...')
        const validationData = this.processValidations(workbook.Sheets['Validations'])
        extractedData = { ...extractedData, ...validationData }
        extractedData.sheetsProcessed.push('Validations')
      }
      
      // Calculate derived values
      const tafEacVariance = extractedData.eac - extractedData.taf
      const cashflowVariance = extractedData.currentYearCashflow - extractedData.currentYearBudgetTarget
      const budgetUtilization = extractedData.totalBudget > 0 ? 
        (extractedData.amountSpent / extractedData.totalBudget) * 100 : 0
      
      // Prepare comprehensive update data
      const updateData = {
        // Core project data
        name: extractedData.name || project.name,
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

