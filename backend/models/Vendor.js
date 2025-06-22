// Enhanced Vendor Model for PFMT Application
// Represents project-specific vendor contracts with comprehensive field support

export class Vendor {
  constructor(data = {}) {
    // Core vendor fields
    this.id = data.id || null
    this.projectId = data.projectId || ''
    this.companyId = data.companyId || ''
    this.contractId = data.contractId || ''
    this.role = data.role || '' // e.g., "General Contractor", "Electrical", "Plumbing"
    this.status = data.status || 'Active' // Active, Inactive, Completed
    
    // Financial fields
    this.currentCommitment = data.currentCommitment || 0
    this.billedToDate = data.billedToDate || 0
    this.percentSpent = data.percentSpent || 0
    this.holdback = data.holdback || 0
    this.latestCostDate = data.latestCostDate || ''
    this.cashflowTotal = data.cashflowTotal || 0
    this.cmsValue = data.cmsValue || 0
    this.cmsAsOfDate = data.cmsAsOfDate || ''
    this.variance = data.variance || 0
    this.remainingCommitment = data.remainingCommitment || 0
    this.changeValue = data.changeValue || 0
    
    // Enhanced fields from PDF requirements
    this.companyName = data.companyName || ''
    this.externalCompanyId = data.externalCompanyId || ''
    this.contractStatus = data.contractStatus || 'Open' // Open, Closed
    this.originalContractTotal = data.originalContractTotal || 0
    this.amendments = data.amendments || 0
    this.currentSpend = data.currentSpend || 0
    this.workStartDate = data.workStartDate || ''
    this.expectedEndDate = data.expectedEndDate || ''
    this.workType1 = data.workType1 || ''
    this.workType2 = data.workType2 || ''
    this.fundingSource = data.fundingSource || ''
    
    // Contact information
    this.primaryContact = data.primaryContact || ''
    this.contactEmail = data.contactEmail || ''
    this.contactPhone = data.contactPhone || ''
    
    // Performance tracking
    this.performanceRating = data.performanceRating || ''
    this.qualityScore = data.qualityScore || 0
    this.timelinessScore = data.timelinessScore || 0
    this.communicationScore = data.communicationScore || 0
    
    // Metadata and audit fields
    this.dataSource = data.dataSource || 'Manual' // Manual, Spreadsheet, API
    this.extractedAt = data.extractedAt || null
    this.extractedBy = data.extractedBy || null
    this.validationStatus = data.validationStatus || 'Pending' // Pending, Validated, Rejected
    this.validationErrors = data.validationErrors || []
    this.lastModifiedBy = data.lastModifiedBy || null
    this.notes = data.notes || ''
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }

  // Validate required fields and business rules
  validate() {
    const errors = []
    
    // Core required fields
    if (!this.projectId || this.projectId.trim().length === 0) {
      errors.push('Project ID is required')
    }
    
    if (!this.companyId && !this.companyName) {
      errors.push('Company ID or company name is required')
    }
    
    // Financial validation
    if (this.currentCommitment < 0) {
      errors.push('Current commitment cannot be negative')
    }
    
    if (this.billedToDate < 0) {
      errors.push('Billed to date cannot be negative')
    }
    
    if (this.percentSpent < 0 || this.percentSpent > 100) {
      errors.push('Percent spent must be between 0 and 100')
    }
    
    if (this.originalContractTotal < 0) {
      errors.push('Original contract total cannot be negative')
    }
    
    if (this.amendments < 0) {
      errors.push('Amendments cannot be negative')
    }
    
    // Date validation
    if (this.workStartDate && this.expectedEndDate) {
      const startDate = new Date(this.workStartDate)
      const endDate = new Date(this.expectedEndDate)
      if (startDate > endDate) {
        errors.push('Work start date cannot be after expected end date')
      }
    }
    
    // Email validation
    if (this.contactEmail && !this.isValidEmail(this.contactEmail)) {
      errors.push('Contact email format is invalid')
    }
    
    // Contract status validation
    const validStatuses = ['Open', 'Closed']
    if (this.contractStatus && !validStatuses.includes(this.contractStatus)) {
      errors.push('Contract status must be Open or Closed')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Email validation helper
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Calculate derived fields and financial metrics
  calculateDerivedFields() {
    // Calculate remaining commitment
    this.remainingCommitment = this.currentCommitment - this.billedToDate
    
    // Calculate percent spent if not provided
    if (this.currentCommitment > 0 && this.percentSpent === 0) {
      this.percentSpent = Math.round((this.billedToDate / this.currentCommitment) * 100 * 100) / 100
    }
    
    // Calculate current commitment from original contract and amendments
    if (this.originalContractTotal > 0 && this.currentCommitment === 0) {
      this.currentCommitment = this.originalContractTotal + (this.amendments || 0)
    }
    
    // Set current spend if not provided
    if (this.currentSpend === 0 && this.billedToDate > 0) {
      this.currentSpend = this.billedToDate
    }
    
    // Calculate variance
    if (this.currentCommitment > 0 && this.billedToDate > 0) {
      this.variance = this.currentCommitment - this.billedToDate
    }
    
    // Update timestamp
    this.updatedAt = new Date().toISOString()
  }

  // Convert to plain object for database storage
  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      companyId: this.companyId,
      contractId: this.contractId,
      role: this.role,
      status: this.status,
      currentCommitment: this.currentCommitment,
      billedToDate: this.billedToDate,
      percentSpent: this.percentSpent,
      holdback: this.holdback,
      latestCostDate: this.latestCostDate,
      cashflowTotal: this.cashflowTotal,
      cmsValue: this.cmsValue,
      cmsAsOfDate: this.cmsAsOfDate,
      variance: this.variance,
      remainingCommitment: this.remainingCommitment,
      changeValue: this.changeValue,
      
      // Enhanced fields
      companyName: this.companyName,
      externalCompanyId: this.externalCompanyId,
      contractStatus: this.contractStatus,
      originalContractTotal: this.originalContractTotal,
      amendments: this.amendments,
      currentSpend: this.currentSpend,
      workStartDate: this.workStartDate,
      expectedEndDate: this.expectedEndDate,
      workType1: this.workType1,
      workType2: this.workType2,
      fundingSource: this.fundingSource,
      
      // Contact information
      primaryContact: this.primaryContact,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      
      // Performance tracking
      performanceRating: this.performanceRating,
      qualityScore: this.qualityScore,
      timelinessScore: this.timelinessScore,
      communicationScore: this.communicationScore,
      
      // Metadata
      dataSource: this.dataSource,
      extractedAt: this.extractedAt,
      extractedBy: this.extractedBy,
      validationStatus: this.validationStatus,
      validationErrors: this.validationErrors,
      lastModifiedBy: this.lastModifiedBy,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  // Create Vendor instance from database data
  static fromJSON(data) {
    return new Vendor(data)
  }

  // Update vendor data
  update(data) {
    Object.keys(data).forEach(key => {
      if (key !== 'id' && key !== 'createdAt' && this.hasOwnProperty(key)) {
        this[key] = data[key]
      }
    })
    this.calculateDerivedFields()
  }

  // Create vendor from legacy vendor data (for migration)
  static fromLegacyVendor(legacyVendor, projectId, companyId) {
    return new Vendor({
      projectId: projectId,
      companyId: companyId,
      contractId: legacyVendor.contractId || '',
      currentCommitment: legacyVendor.currentCommitment || 0,
      billedToDate: legacyVendor.billedToDate || 0,
      percentSpent: legacyVendor.percentSpent || 0,
      holdback: legacyVendor.holdback || 0,
      latestCostDate: legacyVendor.latestCostDate || '',
      cashflowTotal: legacyVendor.cashflowTotal || 0,
      cmsValue: legacyVendor.cmsValue || 0,
      cmsAsOfDate: legacyVendor.cmsAsOfDate || '',
      variance: legacyVendor.variance || 0,
      changeValue: legacyVendor.changeValue || 0,
      notes: `Migrated from legacy vendor: ${legacyVendor.name || 'Unknown'}`,
      dataSource: 'Migration'
    })
  }

  // Create vendor from spreadsheet extraction
  static fromSpreadsheetData(rowData, projectId, extractedBy = null) {
    return new Vendor({
      projectId: projectId,
      companyName: rowData.companyName || '',
      externalCompanyId: rowData.companyId || '',
      contractStatus: rowData.contractStatus || 'Open',
      originalContractTotal: parseFloat(rowData.originalContractTotal) || 0,
      amendments: parseFloat(rowData.amendments) || 0,
      currentCommitment: parseFloat(rowData.currentCommitment) || 0,
      currentSpend: parseFloat(rowData.currentSpend) || 0,
      percentSpent: parseFloat(rowData.percentSpent) || 0,
      workStartDate: rowData.workStartDate || '',
      expectedEndDate: rowData.expectedEndDate || '',
      workType1: rowData.workType1 || '',
      workType2: rowData.workType2 || '',
      fundingSource: rowData.fundingSource || '',
      dataSource: 'Spreadsheet',
      extractedAt: new Date().toISOString(),
      extractedBy: extractedBy,
      validationStatus: 'Pending'
    })
  }

  // Get vendor status summary
  getStatusSummary() {
    const summary = {
      isActive: this.status === 'Active',
      isOverBudget: this.billedToDate > this.currentCommitment,
      isNearCompletion: this.percentSpent > 90,
      hasAmendments: this.amendments > 0,
      needsAttention: false
    }
    
    // Determine if vendor needs attention
    summary.needsAttention = summary.isOverBudget || 
                           (this.validationStatus === 'Rejected') ||
                           (this.expectedEndDate && new Date(this.expectedEndDate) < new Date())
    
    return summary
  }

  // Get financial health indicator
  getFinancialHealth() {
    if (this.currentCommitment === 0) return 'Unknown'
    
    const spentRatio = this.billedToDate / this.currentCommitment
    
    if (spentRatio > 1.1) return 'Critical' // Over budget by 10%
    if (spentRatio > 1.0) return 'Warning'  // Over budget
    if (spentRatio > 0.9) return 'Caution'  // Near budget limit
    return 'Good'
  }
}

export default Vendor

