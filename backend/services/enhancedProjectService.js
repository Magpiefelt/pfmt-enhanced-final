// Enhanced Project Service with Relational Data Model Support
import { enhancedDatabaseService } from './enhancedDatabase.js'
import XLSX from 'xlsx'
import fs from 'fs/promises'

export class EnhancedProjectService {
  constructor() {
    this.db = enhancedDatabaseService
  }

  // Get all projects with enhanced filtering and relationship loading
  static async getProjects(options = {}) {
    const {
      page = 1,
      limit = 10,
      ownerId,
      status,
      reportStatus,
      userId,
      userRole,
      includeRelationships = true
    } = options
    
    await enhancedDatabaseService.initialize()
    
    // Build filter options
    const filterOptions = {}
    if (status) filterOptions.status = status
    if (reportStatus) filterOptions.reportStatus = reportStatus
    if (ownerId) filterOptions.ownerId = ownerId
    
    // Get projects with proper access control
    let projects
    if (userId && userRole) {
      projects = await enhancedDatabaseService.getProjectsForUser(userId, userRole, filterOptions)
    } else {
      // Fallback for admin access
      projects = await enhancedDatabaseService.repositories.projects.findManyWithRelationships(filterOptions)
    }
    
    // Apply pagination
    const total = projects.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    const paginatedProjects = projects.slice(startIndex, endIndex)
    
    return {
      projects: paginatedProjects,
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
  
  // Get single project with full relationship data
  static async getProjectById(id, userContext = null) {
    await enhancedDatabaseService.initialize()
    
    if (userContext) {
      return enhancedDatabaseService.getProjectById(id, userContext.id, userContext.role)
    }
    
    return enhancedDatabaseService.getProjectById(id)
  }
  
  // Create new project with enhanced validation and relationship handling
  static async createProject(projectData, userContext = null) {
    await enhancedDatabaseService.initialize()
    
    // Validate required fields
    const requiredFields = ['name']
    for (const field of requiredFields) {
      if (!projectData[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    
    if (!userContext?.id) {
      throw new Error('User context required for project creation')
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
      
      // Location structure
      location: {
        geographicRegion: '',
        municipality: '',
        address: '',
        constituency: '',
        coordinates: {
          latitude: null,
          longitude: null
        }
      },
      
      // Building structure
      building: {
        name: '',
        type: '',
        id: '',
        primaryOwner: '',
        squareMeters: 0,
        numberOfStructures: 0,
        numberOfJobs: 0
      },
      
      // Financial structure
      financial: {
        approvedTPC: 0,
        totalBudget: 0,
        amountSpent: 0,
        taf: 0,
        eac: 0,
        currentYearCashflow: 0,
        futureYearCashflow: 0,
        currentYearBudgetTarget: 0,
        currentYearApprovedTarget: 0,
        variance: 0,
        lastFinancialUpdate: new Date().toISOString()
      },
      
      // Status tracking structure
      statusTracking: {
        schedule: 'Green',
        budget: 'Green',
        scope: 'Green',
        scheduleReasonCode: '',
        budgetReasonCode: '',
        lastStatusUpdate: new Date().toISOString()
      },
      
      // Workflow structure
      workflow: {
        submittedBy: null,
        submittedDate: null,
        approvedBy: null,
        approvedDate: null,
        directorApproved: false,
        seniorPmReviewed: false,
        currentStage: 'Planning',
        nextApprovalRequired: null
      },
      
      // PFMT structure
      pfmt: {
        lastUpdate: null,
        fileName: null,
        extractedAt: null,
        sheetsProcessed: [],
        dataQuality: 'Good'
      },
      
      // Comments structure
      comments: {
        monthlyComments: '',
        previousHighlights: '',
        nextSteps: '',
        budgetVarianceExplanation: '',
        cashflowVarianceExplanation: ''
      },
      
      // Project milestones by phase
      milestones: {
        Planning: {},
        Design: {},
        Construction: {},
        Closeout: {}
      },
      
      // Metadata
      createdFrom: 'Manual',
      lastUpdated: new Date().toISOString()
    }
    
    // Merge with provided data
    const newProject = this.mergeProjectData(defaultProject, projectData)
    
    return enhancedDatabaseService.createProject(newProject, userContext)
  }
  
  // Update project with enhanced validation
  static async updateProject(id, updates, userContext = null) {
    await enhancedDatabaseService.initialize()
    
    const project = await enhancedDatabaseService.getProjectById(id)
    if (!project) {
      throw new Error('Project not found')
    }
    
    // Merge updates with proper structure handling
    const processedUpdates = this.processProjectUpdates(updates)
    
    return enhancedDatabaseService.updateProject(id, processedUpdates, userContext)
  }
  
  // Delete project
  static async deleteProject(id, userContext = null) {
    await enhancedDatabaseService.initialize()
    
    const project = await enhancedDatabaseService.getProjectById(id)
    if (!project) {
      throw new Error('Project not found')
    }
    
    // Check permissions if user context provided
    if (userContext) {
      const hasAccess = await enhancedDatabaseService.accessControlManager
        .canAccessProject(userContext.id, id, 'edit')
      if (!hasAccess) {
        throw new Error('Access denied to delete project')
      }
    }
    
    return enhancedDatabaseService.repositories.projects.delete(id)
  }
  
  // Vendor management
  static async getAllVendors() {
    await enhancedDatabaseService.initialize()
    return enhancedDatabaseService.getAllVendors()
  }
  
  static async createVendor(vendorData) {
    await enhancedDatabaseService.initialize()
    
    // Validate required fields
    if (!vendorData.name) {
      throw new Error('Vendor name is required')
    }
    
    // Check for duplicate vendor names
    const existingVendor = await enhancedDatabaseService.repositories.vendors.findByName(vendorData.name)
    if (existingVendor) {
      throw new Error('Vendor with this name already exists')
    }
    
    const defaultVendor = {
      contactName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Canada'
      },
      vendorType: 'Contractor',
      certifications: [],
      capabilities: [],
      isActive: true,
      metadata: {
        totalProjects: 0,
        activeProjects: 0,
        averageRating: 0,
        lastContractDate: null,
        totalContractValue: 0
      }
    }
    
    const newVendor = { ...defaultVendor, ...vendorData }
    return enhancedDatabaseService.createVendor(newVendor)
  }
  
  // Project assignment management
  static async assignUserToProject(projectId, userId, accessLevel, grantedBy) {
    await enhancedDatabaseService.initialize()
    
    // Validate access level
    const validAccessLevels = ['Viewer', 'Editor', 'Admin']
    if (!validAccessLevels.includes(accessLevel)) {
      throw new Error('Invalid access level')
    }
    
    // Check if assignment already exists
    const existingAssignment = await enhancedDatabaseService.repositories.projectAssignments
      .findByUserAndProject(userId, projectId)
    
    if (existingAssignment) {
      // Update existing assignment
      return enhancedDatabaseService.repositories.projectAssignments.update(existingAssignment.id, {
        accessLevel,
        grantedBy,
        isActive: true,
        updatedAt: new Date().toISOString()
      })
    }
    
    return enhancedDatabaseService.assignUserToProject(projectId, userId, accessLevel, grantedBy)
  }
  
  static async removeUserFromProject(projectId, userId, removedBy) {
    await enhancedDatabaseService.initialize()
    
    const assignment = await enhancedDatabaseService.repositories.projectAssignments
      .findByUserAndProject(userId, projectId)
    
    if (!assignment) {
      throw new Error('Assignment not found')
    }
    
    // Check permissions
    const canRemove = await enhancedDatabaseService.accessControlManager
      .canGrantAccess(removedBy, projectId)
    if (!canRemove) {
      throw new Error('Insufficient permissions to remove user from project')
    }
    
    return enhancedDatabaseService.repositories.projectAssignments.update(assignment.id, {
      isActive: false,
      updatedAt: new Date().toISOString()
    })
  }
  
  // Enhanced PFMT Excel processing with relational data handling
  static async processPFMTExcelUpload(projectId, filePath, fileName, userContext = null) {
    try {
      // Verify project exists and user has access
      const project = await this.getProjectById(projectId, userContext)
      if (!project) {
        throw new Error('Project not found or access denied')
      }
      
      // Read and parse Excel file
      const workbook = XLSX.readFile(filePath, { 
        sheetStubs: true,
        defval: "",
        cellDates: true
      })
      
      console.log('Available sheets:', workbook.SheetNames)
      
      // Initialize extracted data with enhanced structure
      let extractedData = {
        // Preserve existing project name
        name: project.name,
        
        // Financial data structure
        financial: { ...project.financial },
        
        // Arrays for relationship entities
        fundingLines: [],
        vendors: [],
        changeOrders: [],
        
        // PFMT metadata
        pfmt: {
          lastUpdate: new Date().toISOString(),
          fileName: fileName,
          extractedAt: new Date().toISOString(),
          sheetsProcessed: [],
          dataQuality: 'Good'
        }
      }
      
      // Process sheets in priority order
      const sheetProcessors = [
        { name: 'Validations', processor: this.processValidations },
        { name: 'SP Fields', processor: this.processSPFields },
        { name: 'SP Fund Src', processor: this.processSPFundSrc },
        { name: 'FundingLines Lookup', processor: this.processFundingLinesLookup },
        { name: 'Change Tracking', processor: this.processChangeTracking },
        { name: 'Cost Tracking', processor: this.processCostTracking },
        { name: 'Prime Cont. Summary', processor: this.processPrimeContractorSummary }
      ]
      
      for (const { name, processor } of sheetProcessors) {
        if (workbook.SheetNames.includes(name)) {
          console.log(`Processing ${name} sheet...`)
          try {
            const sheetData = processor.call(this, workbook.Sheets[name])
            
            if (name === 'SP Fields') {
              // Merge financial data
              extractedData.financial = { ...extractedData.financial, ...sheetData }
            } else if (name === 'SP Fund Src' || name === 'FundingLines Lookup') {
              extractedData.fundingLines = [...extractedData.fundingLines, ...sheetData]
            } else if (name === 'Cost Tracking') {
              extractedData.vendors = sheetData
            } else if (name === 'Change Tracking') {
              extractedData.changeOrders = sheetData
            } else {
              extractedData = { ...extractedData, ...sheetData }
            }
            
            extractedData.pfmt.sheetsProcessed.push(name)
          } catch (sheetError) {
            console.error(`Error processing ${name} sheet:`, sheetError)
            extractedData.pfmt.dataQuality = 'Warning'
          }
        }
      }
      
      // Update project with extracted data
      const updatedProject = await this.updateProject(projectId, extractedData, userContext)
      
      // Update relationship entities
      await this.updateProjectRelationships(projectId, extractedData)
      
      // Clean up uploaded file
      try {
        await fs.unlink(filePath)
      } catch (cleanupError) {
        console.log('Failed to clean up uploaded file:', cleanupError.message)
      }
      
      return {
        project: updatedProject,
        extractedData: extractedData
      }
      
    } catch (error) {
      // Clean up uploaded file on error
      try {
        await fs.unlink(filePath)
      } catch (cleanupError) {
        console.log('Failed to clean up uploaded file after error:', cleanupError.message)
      }
      
      throw error
    }
  }
  
  // Update project relationships based on extracted data
  static async updateProjectRelationships(projectId, extractedData) {
    await enhancedDatabaseService.initialize()
    
    // Update funding lines
    if (extractedData.fundingLines?.length > 0) {
      // Remove existing funding lines
      const existingFundingLines = await enhancedDatabaseService.repositories.fundingLines
        .findMany({ projectId })
      
      for (const fundingLine of existingFundingLines) {
        await enhancedDatabaseService.repositories.fundingLines.update(fundingLine.id, {
          isActive: false
        })
      }
      
      // Create new funding lines
      for (const fundingLineData of extractedData.fundingLines) {
        await enhancedDatabaseService.repositories.fundingLines.create({
          ...fundingLineData,
          projectId,
          isActive: true
        })
      }
    }
    
    // Update vendor relationships
    if (extractedData.vendors?.length > 0) {
      for (const vendorData of extractedData.vendors) {
        // Find or create vendor
        let vendor = await enhancedDatabaseService.repositories.vendors.findByName(vendorData.name)
        if (!vendor) {
          vendor = await enhancedDatabaseService.repositories.vendors.create({
            name: vendorData.name,
            vendorType: 'Contractor',
            isActive: true
          })
        }
        
        // Update or create project-vendor relationship
        const existingRelationship = await enhancedDatabaseService.repositories.projectVendors
          .findOne({ projectId, vendorId: vendor.id })
        
        const relationshipData = {
          projectId,
          vendorId: vendor.id,
          contractId: vendorData.contractId || '',
          vendorRole: 'Contractor',
          contractValue: vendorData.currentCommitment || 0,
          currentCommitment: vendorData.currentCommitment || 0,
          billedToDate: vendorData.billedToDate || 0,
          holdback: vendorData.holdback || 0,
          percentComplete: vendorData.percentSpent || 0,
          status: 'Active',
          isActive: true
        }
        
        if (existingRelationship) {
          await enhancedDatabaseService.repositories.projectVendors.update(
            existingRelationship.id, 
            relationshipData
          )
        } else {
          await enhancedDatabaseService.repositories.projectVendors.create(relationshipData)
        }
      }
    }
    
    // Update change orders
    if (extractedData.changeOrders?.length > 0) {
      for (const changeOrderData of extractedData.changeOrders) {
        // Find vendor if specified
        let vendorId = null
        if (changeOrderData.vendor) {
          const vendor = await enhancedDatabaseService.repositories.vendors.findByName(changeOrderData.vendor)
          vendorId = vendor?.id || null
        }
        
        await enhancedDatabaseService.repositories.changeOrders.create({
          ...changeOrderData,
          projectId,
          vendorId,
          isActive: true
        })
      }
    }
  }
  
  // Helper methods for data processing
  static mergeProjectData(defaultProject, projectData) {
    const merged = { ...defaultProject }
    
    // Handle nested structures properly
    for (const [key, value] of Object.entries(projectData)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = { ...merged[key], ...value }
      } else {
        merged[key] = value
      }
    }
    
    return merged
  }
  
  static processProjectUpdates(updates) {
    const processed = { ...updates }
    
    // Ensure lastUpdated is set
    processed.lastUpdated = new Date().toISOString()
    
    // Handle nested structure updates
    if (updates.financial) {
      processed.financial = { ...processed.financial, lastFinancialUpdate: new Date().toISOString() }
    }
    
    if (updates.statusTracking) {
      processed.statusTracking = { ...processed.statusTracking, lastStatusUpdate: new Date().toISOString() }
    }
    
    return processed
  }
  
  // Excel processing methods (enhanced versions of existing methods)
  static getCellValue(worksheet, cellAddress) {
    const cell = worksheet[cellAddress]
    if (!cell) return null
    
    if (cell.t === 'n') return cell.v
    if (cell.t === 's') return cell.v
    if (cell.t === 'b') return cell.v
    if (cell.t === 'd') return cell.v
    
    return cell.v
  }
  
  static toNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') {
      return defaultValue
    }
    
    if (typeof value === 'number') {
      return Math.round(value * 100) / 100
    }
    
    if (typeof value === 'string') {
      const cleanValue = value.replace(/[$,\s]/g, '')
      const numValue = parseFloat(cleanValue)
      
      if (isNaN(numValue)) {
        return defaultValue
      }
      
      return Math.round(numValue * 100) / 100
    }
    
    return defaultValue
  }
  
  static processSPFields(worksheet) {
    const spData = {}
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:B30')
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      const fieldCell = worksheet[XLSX.utils.encode_cell({r: row, c: 0})]
      const valueCell = worksheet[XLSX.utils.encode_cell({r: row, c: 1})]
      
      if (fieldCell && valueCell && fieldCell.v && valueCell.v !== undefined) {
        const field = fieldCell.v.toString().trim()
        const value = valueCell.v
        spData[field] = value
      }
    }
    
    return {
      approvedTPC: this.toNumber(spData.SPOApprovedTPC) || 0,
      totalBudget: this.toNumber(spData.SPOBudgetTotal) || 0,
      currentYearCashflow: this.toNumber(spData.SPOCashflowCurrentYearTotal) || 0,
      futureYearCashflow: this.toNumber(spData.SPOCashflowFutureYearTotal) || 0,
      taf: this.toNumber(spData.SPOTotalApprovedFunding || spData.TAF || spData.SPOApprovedTPC) || 0,
      eac: this.toNumber(spData.SPOEAC || spData.EAC) || 0,
      amountSpent: this.toNumber(spData.SPOTotalExpenditurestoDate) || 0,
      currentYearBudgetTarget: this.toNumber(spData.SPOCurrentYearBudgetTarget) || 0,
      currentYearApprovedTarget: this.toNumber(spData.SPOCurrentYearApprovedTarget) || 0,
      variance: this.toNumber(spData.SPOVariance) || 0
    }
  }
  
  static processSPFundSrc(worksheet) {
    const fundingData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: "",
      range: 1
    })
    
    const fundingLines = []
    
    for (const row of fundingData) {
      if (row[0] && row[0] !== '--') {
        fundingLines.push({
          source: row[0] || '',
          description: row[1] || '',
          capitalPlanLine: row[2] || '',
          approvedValue: this.toNumber(row[3]),
          currentYearBudget: this.toNumber(row[4]),
          currentYearApproved: this.toNumber(row[5]),
          wbs: row[0] || '',
          projectCode: row[6] || '',
          fiscalYear: '2024-25',
          fundingType: 'Capital',
          isActive: true
        })
      }
    }
    
    return fundingLines
  }
  
  static processFundingLinesLookup(worksheet) {
    return this.processSPFundSrc(worksheet) // Same structure
  }
  
  static processChangeTracking(worksheet) {
    const changeData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 9,
      defval: ""
    })
    
    const changeOrders = []
    
    for (const row of changeData) {
      if (row['Vendor / Org.']) {
        changeOrders.push({
          vendor: row['Vendor / Org.'] || '',
          contractId: row['Contract ID'] || '',
          status: row['Change Status'] || 'Pending',
          requestDate: row['Request Date'] || new Date().toISOString(),
          approvedDate: row['Approved Date'] || null,
          value: this.toNumber(row['Change Value']),
          referenceNumber: row['Reference #'] || '',
          reasonCode: row['Reason Code'] || '',
          description: row['Description'] || '',
          justification: row['Notes'] || '',
          impactAnalysis: {
            scheduleImpact: 'None',
            budgetImpact: 'Increase',
            scopeImpact: 'Enhancement',
            riskAssessment: 'Low'
          }
        })
      }
    }
    
    return changeOrders
  }
  
  static processCostTracking(worksheet) {
    const costData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: ""
    })
    
    const vendors = []
    const headerRowIndex = 3
    
    if (headerRowIndex >= costData.length) {
      return vendors
    }
    
    const headers = costData[headerRowIndex]
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
      }
    }
    
    for (let i = headerRowIndex + 1; i < costData.length; i++) {
      const row = costData[i]
      if (!Array.isArray(row)) continue
      
      const vendorName = row[columnMap.vendorName] || row[1] || ''
      
      if (vendorName && typeof vendorName === 'string' && vendorName.trim().length > 2) {
        const trimmedName = vendorName.trim()
        
        if (!trimmedName.toLowerCase().includes('vendor') && 
            !trimmedName.toLowerCase().includes('summary') &&
            !trimmedName.toLowerCase().includes('total')) {
          
          vendors.push({
            name: trimmedName,
            contractId: row[columnMap.contractId] || '',
            currentCommitment: this.toNumber(row[columnMap.currentCommitment]) || 0,
            billedToDate: this.toNumber(row[columnMap.billedToDate]) || 0,
            percentSpent: this.toNumber(row[columnMap.percentSpent]) || 0,
            holdback: this.toNumber(row[columnMap.holdback]) || 0,
            status: 'Active'
          })
        }
      }
    }
    
    return vendors
  }
  
  static processPrimeContractorSummary(worksheet) {
    const primeContractor = this.getCellValue(worksheet, 'B3') || ''
    const deliveryMethod = this.getCellValue(worksheet, 'C2') || ''
    
    return {
      primeContractor,
      deliveryMethod
    }
  }
  
  static processValidations(worksheet) {
    const validationData = {}
    
    // Try to extract project name from expected cell
    const projectNameCell = worksheet['C6']
    if (projectNameCell && projectNameCell.v) {
      validationData.name = projectNameCell.v.toString().trim()
    }
    
    // Extract other validation fields
    validationData.projectManager = this.getCellValue(worksheet, 'B10') || ''
    validationData.category = this.getCellValue(worksheet, 'B8') || ''
    validationData.phase = this.getCellValue(worksheet, 'B9') || ''
    validationData.geographicRegion = this.getCellValue(worksheet, 'B11') || ''
    
    return validationData
  }
  
  // Legacy method for backward compatibility
  static async processExcelUpload(projectId, filePath, fileName) {
    return this.processPFMTExcelUpload(projectId, filePath, fileName)
  }
}

// Export for backward compatibility
export { EnhancedProjectService as ProjectService }

