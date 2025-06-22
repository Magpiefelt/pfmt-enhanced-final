// Enhanced Project Model for PFMT Enhanced Application
// Extends the existing project structure to support comprehensive PDF requirements
// including project header, details, location, and team fields

export class EnhancedProject {
  constructor(data = {}) {
    // Existing project fields (maintain compatibility)
    this.id = data.id || null
    this.name = data.name || ''
    this.description = data.description || ''
    this.status = data.status || 'Planning'
    this.ownerId = data.ownerId || ''
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
    
    // Project Header Fields (from PDF requirements)
    this.reportStatus = data.reportStatus || 'Update Required' // Update Required, Updated by Project Team, Reviewed by Director
    this.projectStatus = data.projectStatus || 'Underway' // Underway, Complete, On Hold, Cancelled
    this.projectPhase = data.projectPhase || 'Planning' // Planning, Design, Construction
    this.modifiedBy = data.modifiedBy || ''
    this.modifiedDate = data.modifiedDate || new Date().toISOString()
    this.reportingDate = data.reportingDate || null
    this.directorReviewDate = data.directorReviewDate || null
    this.pfmtDataDate = data.pfmtDataDate || null
    this.archiveDate = data.archiveDate || null
    
    // Project Details Fields
    this.projectName = data.projectName || data.name || '' // Official project name
    this.projectCategory = data.projectCategory || '' // Planning Only, Design Only, etc.
    this.clientMinistry = data.clientMinistry || '' // Client ministry for the project
    this.fundedToComplete = data.fundedToComplete || '' // Funding stage
    this.pfmtFile = data.pfmtFile || '' // PFMT file reference
    this.projectType = data.projectType || '' // New, Replacement, etc.
    this.deliveryMethod = data.deliveryMethod || '' // DBB, DB, CM, P3, etc.
    this.deliveryType = data.deliveryType || '' // AI Managed, Grant Funded
    this.program = data.program || '' // Branch or program name
    this.geographicRegion = data.geographicRegion || '' // Edmonton, North, etc.
    this.projectDescription = data.projectDescription || data.description || ''
    this.squareMeters = data.squareMeters || 0
    this.numberOfBeds = data.numberOfBeds || 0
    this.numberOfJobs = data.numberOfJobs || 0
    this.totalOpeningCapacity = data.totalOpeningCapacity || 0
    this.capacityAtFullBuild = data.capacityAtFullBuild || 0
    this.capitalPlanLine = data.capitalPlanLine || ''
    this.charterSchool = data.charterSchool || false
    this.cpdNumber = data.cpdNumber || '' // Capital Project ID
    this.gradesFrom = data.gradesFrom || ''
    this.gradesTo = data.gradesTo || ''
    this.schoolJurisdiction = data.schoolJurisdiction || ''
    
    // Project Location Fields
    this.locationName = data.locationName || data.city || ''
    this.municipality = data.municipality || ''
    this.urbanRural = data.urbanRural || ''
    this.projectAddress = data.projectAddress || data.address || ''
    this.constituency = data.constituency || ''
    this.mla = data.mla || ''
    this.buildingName = data.buildingName || ''
    this.buildingType = data.buildingType || ''
    this.buildingId = data.buildingId || ''
    this.buildingOwner = data.buildingOwner || ''
    this.planNumber = data.planNumber || ''
    this.blockNumber = data.blockNumber || ''
    this.lotNumber = data.lotNumber || ''
    this.latitude = data.latitude || null
    this.longitude = data.longitude || null
    
    // Project Team Fields
    this.team = {
      executiveDirector: data.team?.executiveDirector || null,
      director: data.team?.director || null,
      srProjectManager: data.team?.srProjectManager || null,
      projectManager: data.team?.projectManager || null,
      projectCoordinator: data.team?.projectCoordinator || null,
      contractServicesAnalyst: data.team?.contractServicesAnalyst || null,
      integrationAnalyst: data.team?.integrationAnalyst || null,
      historicalMembers: data.team?.historicalMembers || [],
      additionalMembers: data.team?.additionalMembers || []
    }
    
    // Financial fields (existing)
    this.totalBudget = data.totalBudget || 0
    this.amountSpent = data.amountSpent || 0
    this.approvedTPC = data.approvedTPC || 0
    this.eac = data.eac || 0
    this.currentYearCashflow = data.currentYearCashflow || 0
    this.futureYearCashflow = data.futureYearCashflow || 0
    
    // PFMT integration fields
    this.pfmtFileName = data.pfmtFileName || null
    this.pfmtExtractedAt = data.pfmtExtractedAt || null
    this.pfmtData = data.pfmtData || null
  }

  // Validate enhanced project data
  validate() {
    const errors = []
    
    // Required fields validation
    if (!this.projectName || this.projectName.trim().length === 0) {
      errors.push('Project name is required')
    }
    
    // Status validation
    const validReportStatuses = ['Update Required', 'Updated by Project Team', 'Reviewed by Director']
    if (this.reportStatus && !validReportStatuses.includes(this.reportStatus)) {
      errors.push('Invalid report status')
    }
    
    const validProjectStatuses = ['Underway', 'Complete', 'On Hold', 'Cancelled']
    if (this.projectStatus && !validProjectStatuses.includes(this.projectStatus)) {
      errors.push('Invalid project status')
    }
    
    // Numeric field validation
    if (this.squareMeters < 0) {
      errors.push('Square meters cannot be negative')
    }
    
    if (this.numberOfBeds < 0) {
      errors.push('Number of beds cannot be negative')
    }
    
    if (this.numberOfJobs < 0) {
      errors.push('Number of jobs cannot be negative')
    }
    
    // Coordinate validation
    if (this.latitude !== null && (this.latitude < -90 || this.latitude > 90)) {
      errors.push('Latitude must be between -90 and 90')
    }
    
    if (this.longitude !== null && (this.longitude < -180 || this.longitude > 180)) {
      errors.push('Longitude must be between -180 and 180')
    }
    
    // Grade validation for school projects
    if (this.gradesFrom && this.gradesTo) {
      const fromGrade = parseInt(this.gradesFrom)
      const toGrade = parseInt(this.gradesTo)
      
      if (!isNaN(fromGrade) && !isNaN(toGrade) && fromGrade > toGrade) {
        errors.push('Grades From cannot be higher than Grades To')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Calculate derived fields
  calculateDerivedFields() {
    // Calculate number of jobs from Total Approved Funding if not provided
    if (!this.numberOfJobs && this.approvedTPC) {
      this.numberOfJobs = Math.round((this.approvedTPC / 1000000) * 5.6)
    }
    
    // Auto-determine urban/rural based on location if not set
    if (this.locationName && !this.urbanRural) {
      const urbanCenters = [
        'Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat',
        'Grande Prairie', 'Airdrie', 'Spruce Grove', 'Leduc', 'Lloydminster'
      ]
      
      this.urbanRural = urbanCenters.some(city => 
        this.locationName.toLowerCase().includes(city.toLowerCase())
      ) ? 'Urban' : 'Rural'
    }
    
    // Auto-set municipality if different from location
    if (this.locationName && !this.municipality) {
      this.municipality = this.locationName
    }
    
    // Update modified date
    this.modifiedDate = new Date().toISOString()
    this.updatedAt = new Date().toISOString()
  }

  // Convert to JSON for database storage
  toJSON() {
    return {
      id: this.id,
      name: this.projectName || this.name,
      description: this.projectDescription || this.description,
      status: this.projectStatus || this.status,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      
      // Project Header Fields
      reportStatus: this.reportStatus,
      projectStatus: this.projectStatus,
      projectPhase: this.projectPhase,
      modifiedBy: this.modifiedBy,
      modifiedDate: this.modifiedDate,
      reportingDate: this.reportingDate,
      directorReviewDate: this.directorReviewDate,
      pfmtDataDate: this.pfmtDataDate,
      archiveDate: this.archiveDate,
      
      // Project Details Fields
      projectName: this.projectName,
      projectCategory: this.projectCategory,
      clientMinistry: this.clientMinistry,
      fundedToComplete: this.fundedToComplete,
      pfmtFile: this.pfmtFile,
      projectType: this.projectType,
      deliveryMethod: this.deliveryMethod,
      deliveryType: this.deliveryType,
      program: this.program,
      geographicRegion: this.geographicRegion,
      projectDescription: this.projectDescription,
      squareMeters: this.squareMeters,
      numberOfBeds: this.numberOfBeds,
      numberOfJobs: this.numberOfJobs,
      totalOpeningCapacity: this.totalOpeningCapacity,
      capacityAtFullBuild: this.capacityAtFullBuild,
      capitalPlanLine: this.capitalPlanLine,
      charterSchool: this.charterSchool,
      cpdNumber: this.cpdNumber,
      gradesFrom: this.gradesFrom,
      gradesTo: this.gradesTo,
      schoolJurisdiction: this.schoolJurisdiction,
      
      // Project Location Fields
      locationName: this.locationName,
      municipality: this.municipality,
      urbanRural: this.urbanRural,
      projectAddress: this.projectAddress,
      constituency: this.constituency,
      mla: this.mla,
      buildingName: this.buildingName,
      buildingType: this.buildingType,
      buildingId: this.buildingId,
      buildingOwner: this.buildingOwner,
      planNumber: this.planNumber,
      blockNumber: this.blockNumber,
      lotNumber: this.lotNumber,
      latitude: this.latitude,
      longitude: this.longitude,
      
      // Project Team Fields
      team: this.team,
      
      // Financial fields
      totalBudget: this.totalBudget,
      amountSpent: this.amountSpent,
      approvedTPC: this.approvedTPC,
      eac: this.eac,
      currentYearCashflow: this.currentYearCashflow,
      futureYearCashflow: this.futureYearCashflow,
      
      // PFMT integration fields
      pfmtFileName: this.pfmtFileName,
      pfmtExtractedAt: this.pfmtExtractedAt,
      pfmtData: this.pfmtData
    }
  }

  // Create EnhancedProject from JSON data
  static fromJSON(data) {
    return new EnhancedProject(data)
  }

  // Update project with new data
  update(data) {
    Object.keys(data).forEach(key => {
      if (key !== 'id' && key !== 'createdAt' && this.hasOwnProperty(key)) {
        this[key] = data[key]
      }
    })
    
    // Handle team updates specially
    if (data.team) {
      this.team = { ...this.team, ...data.team }
    }
    
    this.calculateDerivedFields()
  }

  // Get project summary for dashboard
  getSummary() {
    return {
      id: this.id,
      name: this.projectName || this.name,
      status: this.projectStatus || this.status,
      phase: this.projectPhase,
      location: this.locationName,
      totalBudget: this.totalBudget,
      amountSpent: this.amountSpent,
      percentComplete: this.totalBudget > 0 ? (this.amountSpent / this.totalBudget) * 100 : 0,
      teamSize: this.getTeamSize(),
      lastModified: this.modifiedDate
    }
  }

  // Get team size
  getTeamSize() {
    const coreTeam = Object.values(this.team).filter(member => 
      member && typeof member === 'string' && member.trim() !== ''
    ).length
    
    const additionalMembers = (this.team.additionalMembers || []).length
    const historicalMembers = (this.team.historicalMembers || []).length
    
    return coreTeam + additionalMembers
  }

  // Check if project is overdue
  isOverdue() {
    // This would need to be implemented based on project timeline logic
    return false
  }

  // Check if project is over budget
  isOverBudget() {
    return this.amountSpent > this.totalBudget
  }

  // Get project health status
  getHealthStatus() {
    const indicators = []
    
    if (this.isOverBudget()) {
      indicators.push('OVER_BUDGET')
    }
    
    if (this.isOverdue()) {
      indicators.push('OVERDUE')
    }
    
    if (this.projectStatus === 'On Hold') {
      indicators.push('ON_HOLD')
    }
    
    if (indicators.length === 0) {
      indicators.push('HEALTHY')
    }
    
    return indicators
  }
}

export default EnhancedProject

