// Vendor Model for PFMT Enhanced Application
// Represents project-specific vendor contracts that reference Company entities

export class Vendor {
  constructor(data = {}) {
    this.id = data.id || null
    this.projectId = data.projectId || ''
    this.companyId = data.companyId || ''
    this.contractId = data.contractId || ''
    this.role = data.role || '' // e.g., "General Contractor", "Electrical", "Plumbing"
    this.status = data.status || 'Active' // Active, Inactive, Completed
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
    this.notes = data.notes || ''
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }

  // Validate required fields
  validate() {
    const errors = []
    
    if (!this.projectId || this.projectId.trim().length === 0) {
      errors.push('Project ID is required')
    }
    
    if (!this.companyId || this.companyId.trim().length === 0) {
      errors.push('Company ID is required')
    }
    
    if (this.currentCommitment < 0) {
      errors.push('Current commitment cannot be negative')
    }
    
    if (this.billedToDate < 0) {
      errors.push('Billed to date cannot be negative')
    }
    
    if (this.percentSpent < 0 || this.percentSpent > 100) {
      errors.push('Percent spent must be between 0 and 100')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Calculate derived fields
  calculateDerivedFields() {
    // Calculate remaining commitment
    this.remainingCommitment = this.currentCommitment - this.billedToDate
    
    // Calculate percent spent if not provided
    if (this.currentCommitment > 0 && this.percentSpent === 0) {
      this.percentSpent = (this.billedToDate / this.currentCommitment) * 100
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
      notes: `Migrated from legacy vendor: ${legacyVendor.name || 'Unknown'}`
    })
  }
}

export default Vendor

