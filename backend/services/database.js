// Enhanced Database service using lowdb for JSON-based persistence - FIXED VERSION
import { Low } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database file path
const dbFile = path.join(__dirname, '..', 'db.json')

// Database adapter
const adapter = new JSONFileSync(dbFile)
const db = new Low(adapter, {})

// Enhanced default data structure with new fields
const defaultData = {
  projects: [
    {
      id: "88:36:D3",
      name: "Calgary Elementary School Renovation",
      contractor: "ABC Construction Ltd.",
      startDate: "2024-03-15",
      submissions: 12,
      status: "Active",
      reportStatus: "Update Required",
      description: "Complete renovation of elementary school facilities including classroom upgrades and safety improvements",
      phase: "Construction",
      category: "Education",
      deliveryMethod: "Design-Build",
      
      // Enhanced project details
      projectManager: "Sarah Johnson",
      seniorProjectManager: "Michael Brown",
      director: "Lisa Wilson",
      primeContractor: "ABC Construction Ltd.",
      clientMinistry: "Education",
      projectType: "Renovation",
      branch: "Infrastructure",
      geographicRegion: "Calgary",
      municipality: "Calgary",
      projectAddress: "123 School Street, Calgary, AB T2P 1A1",
      constituency: "Calgary-Centre",
      buildingName: "Calgary Elementary School",
      buildingType: "Educational Facility",
      buildingId: "EDU-001",
      primaryOwner: "Alberta Education",
      squareMeters: "2500",
      numberOfStructures: "1",
      numberOfJobs: "15",
      
      // Enhanced financial data
      approvedTPC: 2450000,
      totalBudget: 2450000,
      amountSpent: 1680000,
      taf: 2450000,
      eac: 2520000,
      currentYearCashflow: 1200000,
      futureYearCashflow: 1250000,
      currentYearBudgetTarget: 1150000,
      currentYearApprovedTarget: 1200000,
      targetCashflow: 1150000,
      
      // Enhanced arrays
      fundingLines: [
        {
          source: "P-002360",
          description: "General Facilities Infrastructure",
          capitalPlanLine: "Calgary Elementary School Renovation",
          approvedValue: 2450000,
          currentYearBudget: 1150000,
          currentYearApproved: 1200000,
          projectId: "B0536D-0010",
          wbs: "P-002360"
        }
      ],
      
      vendors: [
        {
          name: "ABC Construction Ltd.",
          contractId: "CON-001",
          currentCommitment: 2200000,
          billedToDate: 1680000,
          percentSpent: 76.4,
          holdback: 168000,
          latestCostDate: "2024-06-01",
          cashflowTotal: 1200000,
          cmsValue: 2200000,
          cmsAsOfDate: "2024-06-01",
          variance: 50000
        }
      ],
      
      changeOrders: [
        {
          vendor: "ABC Construction Ltd.",
          contractId: "CON-001",
          status: "Approved",
          approvedDate: "2024-05-15",
          value: 70000,
          referenceNumber: "CO-001",
          reasonCode: "Material Supply Delays",
          description: "Additional steel reinforcement due to supply chain issues",
          notes: "Approved by project manager and client"
        }
      ],
      
      additionalTeam: ["John Doe - Engineer", "Jane Smith - Architect"],
      programs: ["Capital Infrastructure Program"],
      
      // Status and tracking
      lastPfmtUpdate: "2024-06-12T10:30:00Z",
      scheduleStatus: "Green",
      budgetStatus: "Yellow",
      scheduleReasonCode: "",
      budgetReasonCode: "Material Supply Delays",
      monthlyComments: "Foundation work completed ahead of schedule but material delays affecting budget",
      previousHighlights: "Completed foundation work 2 weeks early",
      nextSteps: "Proceed with framing and electrical rough-in",
      budgetVarianceExplanation: "Steel prices increased by 15% due to supply chain issues",
      cashflowVarianceExplanation: "Additional payments required for expedited material delivery",
      
      // Approval workflow
      submittedBy: null,
      submittedDate: null,
      approvedBy: null,
      approvedDate: null,
      directorApproved: false,
      seniorPmReviewed: false,
      
      // Project milestones by phase
      milestones: {
        Planning: {
          "Design Approval": { completed: true, date: "2024-02-15" },
          "Permits Obtained": { completed: true, date: "2024-03-01" }
        },
        Design: {
          "Schematic Design": { completed: true, date: "2024-01-30" },
          "Design Development": { completed: true, date: "2024-02-28" }
        },
        Construction: {
          "Foundation Complete": { completed: true, date: "2024-04-15" },
          "Framing Complete": { completed: false, date: null }
        },
        Closeout: {}
      },
      
      // Metadata
      ownerId: 1,
      createdAt: "2024-03-01T08:00:00.000Z",
      updatedAt: "2024-06-12T10:30:00.000Z",
      lastUpdated: "2024-06-12T10:30:00.000Z",
      createdFrom: "Manual",
      originalFileName: null,
      pfmtFileName: null,
      pfmtExtractedAt: null,
      pfmtData: null
    },
    {
      id: "77:24:B1",
      name: "Edmonton Hospital Wing Addition",
      contractor: "MediConstruct Inc.",
      startDate: "2024-01-10",
      submissions: 8,
      status: "Active",
      reportStatus: "Current",
      description: "New wing addition to Edmonton General Hospital with specialized medical equipment installation",
      phase: "Design Development",
      category: "Healthcare",
      deliveryMethod: "Traditional",
      
      // Enhanced project details
      projectManager: "Michael Brown",
      seniorProjectManager: "Lisa Wilson",
      director: "David Chen",
      primeContractor: "MediConstruct Inc.",
      clientMinistry: "Health",
      projectType: "Addition",
      branch: "Healthcare Infrastructure",
      geographicRegion: "Edmonton",
      municipality: "Edmonton",
      projectAddress: "456 Health Avenue, Edmonton, AB T5K 2M3",
      constituency: "Edmonton-Centre",
      buildingName: "Edmonton General Hospital",
      buildingType: "Healthcare Facility",
      buildingId: "HLT-002",
      primaryOwner: "Alberta Health Services",
      squareMeters: "5000",
      numberOfStructures: "1",
      numberOfJobs: "25",
      
      // Enhanced financial data
      approvedTPC: 5200000,
      totalBudget: 5200000,
      amountSpent: 1560000,
      taf: 5200000,
      eac: 5100000,
      currentYearCashflow: 2100000,
      futureYearCashflow: 3000000,
      currentYearBudgetTarget: 2200000,
      currentYearApprovedTarget: 2100000,
      targetCashflow: 2200000,
      
      // Enhanced arrays
      fundingLines: [
        {
          source: "P-002361",
          description: "Healthcare Infrastructure",
          capitalPlanLine: "Edmonton Hospital Wing Addition",
          approvedValue: 5200000,
          currentYearBudget: 2200000,
          currentYearApproved: 2100000,
          projectId: "B0068AE-0030",
          wbs: "P-002361"
        }
      ],
      
      vendors: [
        {
          name: "MediConstruct Inc.",
          contractId: "CON-002",
          currentCommitment: 4800000,
          billedToDate: 1560000,
          percentSpent: 32.5,
          holdback: 156000,
          latestCostDate: "2024-05-15",
          cashflowTotal: 2100000,
          cmsValue: 4800000,
          cmsAsOfDate: "2024-05-15",
          variance: -100000
        }
      ],
      
      changeOrders: [],
      
      additionalTeam: ["Dr. Sarah Lee - Medical Consultant", "Tom Wilson - MEP Engineer"],
      programs: ["Healthcare Capital Program"],
      
      // Status and tracking
      lastPfmtUpdate: "2024-05-15T10:30:00Z",
      scheduleStatus: "Green",
      budgetStatus: "Green",
      scheduleReasonCode: "",
      budgetReasonCode: "",
      monthlyComments: "Project progressing well with all milestones on track",
      previousHighlights: "Completed design phase approval",
      nextSteps: "Begin construction phase and equipment procurement",
      budgetVarianceExplanation: "",
      cashflowVarianceExplanation: "",
      
      // Approval workflow
      submittedBy: "Michael Brown",
      submittedDate: "2024-05-20T14:00:00Z",
      approvedBy: "Lisa Wilson",
      approvedDate: "2024-05-21T09:15:00Z",
      directorApproved: true,
      seniorPmReviewed: true,
      
      // Project milestones by phase
      milestones: {
        Planning: {
          "Feasibility Study": { completed: true, date: "2023-12-15" },
          "Environmental Assessment": { completed: true, date: "2024-01-05" }
        },
        Design: {
          "Schematic Design": { completed: true, date: "2024-02-28" },
          "Design Development": { completed: true, date: "2024-04-30" }
        },
        Construction: {},
        Closeout: {}
      },
      
      // Metadata
      ownerId: 2,
      createdAt: "2024-01-01T08:00:00.000Z",
      updatedAt: "2024-05-21T09:15:00.000Z",
      lastUpdated: "2024-05-21T09:15:00.000Z",
      createdFrom: "PFMT Upload",
      originalFileName: "Edmonton-Hospital-PFMT-May2024.xlsx",
      pfmtFileName: "Edmonton-Hospital-PFMT-May2024.xlsx",
      pfmtExtractedAt: "2024-05-15T10:30:00Z",
      pfmtData: {
        sheetsProcessed: ["SP Fields", "SP Fund Src", "Cost Tracking"],
        extractedAt: "2024-05-15T10:30:00Z"
      }
    }
  ],
  users: [
    { id: 1, name: "Sarah Johnson", role: "Project Manager", email: "sarah.johnson@company.com" },
    { id: 2, name: "Michael Brown", role: "Senior Project Manager", email: "michael.brown@company.com" },
    { id: 3, name: "Lisa Wilson", role: "Director", email: "lisa.wilson@company.com" },
    { id: 4, name: "David Chen", role: "Director", email: "david.chen@company.com" },
    { id: 5, name: "John Smith", role: "Vendor", email: "john.smith@vendor.com" }
  ],
  companies: [
    {
      id: "company-1",
      name: "ABC Construction Ltd.",
      contactPerson: "Robert Smith",
      contactEmail: "robert.smith@abcconstruction.com",
      contactPhone: "(403) 555-0123",
      address: "123 Industrial Ave",
      city: "Calgary",
      province: "AB",
      postalCode: "T2E 1A1",
      website: "www.abcconstruction.com",
      businessNumber: "123456789RT0001",
      notes: "Primary general contractor for education projects",
      createdAt: "2024-01-01T08:00:00.000Z",
      updatedAt: "2024-01-01T08:00:00.000Z"
    }
  ],
  vendors: []
}

// Initialize database
export function initializeDatabase() {
  try {
    db.read()
    
    // Initialize with default data if database is empty
    if (!db.data || Object.keys(db.data).length === 0) {
      db.data = defaultData
      db.write()
      console.log('Database initialized with enhanced default data')
    } else {
      // Migrate existing projects to new structure if needed
      migrateProjectsToNewStructure()
    }
    
    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// Migration function to update existing projects with new fields
function migrateProjectsToNewStructure() {
  let migrationNeeded = false
  
  if (db.data.projects) {
    for (let project of db.data.projects) {
      // Check if project needs migration (missing new fields)
      if (!project.hasOwnProperty('approvedTPC')) {
        migrationNeeded = true
        
        // Add new financial fields with defaults
        project.approvedTPC = project.totalBudget || 0
        project.futureYearCashflow = 0
        project.currentYearBudgetTarget = project.targetCashflow || 0
        project.currentYearApprovedTarget = project.currentYearCashflow || 0
        
        // Add new project detail fields
        project.category = project.category || ''
        project.deliveryMethod = project.deliveryMethod || ''
        project.primeContractor = project.contractor || ''
        project.clientMinistry = ''
        project.projectType = ''
        project.branch = ''
        project.geographicRegion = project.region || ''
        project.municipality = ''
        project.projectAddress = project.location || ''
        project.constituency = ''
        project.buildingName = ''
        project.buildingType = ''
        project.buildingId = ''
        project.primaryOwner = ''
        project.squareMeters = ''
        project.numberOfStructures = ''
        project.numberOfJobs = ''
        
        // Add new array fields if they don't exist
        project.fundingLines = project.fundingLines || []
        project.vendors = project.vendors || []
        project.changeOrders = project.changeOrders || []
        project.programs = project.programs || []
        
        // Add milestones structure if it doesn't exist
        project.milestones = project.milestones || {
          Planning: {},
          Design: {},
          Construction: {},
          Closeout: {}
        }
        
        // Add PFMT metadata fields
        project.pfmtData = project.pfmtData || null
        project.createdFrom = project.createdFrom || 'Manual'
        project.originalFileName = project.originalFileName || null
        
        // Ensure lastUpdated field exists
        project.lastUpdated = project.lastUpdated || project.updatedAt || new Date().toISOString()
      }
    }
  }
  
  // Initialize companies collection if it doesn't exist
  if (!db.data.companies) {
    db.data.companies = defaultData.companies
    migrationNeeded = true
    console.log('Companies collection initialized')
  }
  
  // Initialize vendors collection if it doesn't exist
  if (!db.data.vendors) {
    db.data.vendors = defaultData.vendors
    migrationNeeded = true
    console.log('Vendors collection initialized')
  }
  
  if (migrationNeeded) {
    db.write()
    console.log('Database migrated to new project structure')
  }
}

// Get database instance
export function getDatabase() {
  return db
}

// Helper functions for common operations with enhanced filtering - FIXED VERSION
export function getAllProjects(filters = {}) {
  db.read()
  let projects = db.data.projects || []
  
  // Apply role-based filtering
  if (filters.userId && filters.userRole) {
    const role = filters.userRole.toLowerCase()
    // FIXED: Ensure userId is always an integer for consistent comparison
    const userId = parseInt(filters.userId)
    
    if (role === 'project manager' || role === 'senior project manager' || role === 'pm') {
      // Project managers can see projects they own or manage
      projects = projects.filter(p => {
        return (
          // FIXED: Ensure both sides of comparison are integers
          parseInt(p.ownerId) === userId ||
          parseInt(p.createdByUserId) === userId ||
          (p.projectManager && p.projectManager.toLowerCase().includes(getUserNameById(userId)?.toLowerCase() || '')) ||
          (p.seniorProjectManager && p.seniorProjectManager.toLowerCase().includes(getUserNameById(userId)?.toLowerCase() || ''))
        )
      })
    }
  }
  
  // Apply additional filters
  if (filters.ownerId) {
    // FIXED: Ensure consistent integer comparison
    projects = projects.filter(p => parseInt(p.ownerId) === parseInt(filters.ownerId))
  }
  
  if (filters.status) {
    projects = projects.filter(p => p.status === filters.status)
  }
  
  if (filters.reportStatus) {
    projects = projects.filter(p => p.reportStatus === filters.reportStatus)
  }
  
  // Sort by createdAt descending (newest first)
  projects.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA
  })
  
  return projects
}

// Helper function to get user name by ID
function getUserNameById(userId) {
  const user = getUserById(userId)
  return user ? user.name : null
}

export function getProjectById(id) {
  db.read()
  return db.data.projects?.find(p => p.id === id) || null
}

// FIXED: Enhanced createProject function with proper data types and field assignments
export function createProject(projectData, userContext = null) {
  db.read()
  
  console.log('=== Database createProject (ENHANCED & FIXED) ===')
  console.log('Project data:', JSON.stringify(projectData, null, 2))
  console.log('User context:', JSON.stringify(userContext, null, 2))
  
  const newProject = {
    id: uuidv4(),
    ...projectData,
    // FIXED: Ensure proper user context is set for visibility with correct data types
    createdByUserId: userContext?.id || projectData.createdByUserId || projectData.ownerId,
    ownerId: projectData.ownerId || userContext?.id,
    // FIXED: Store user name in createdBy field, not user ID
    createdBy: userContext?.name || projectData.createdBy || getUserNameById(userContext?.id),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  }
  
  // CRITICAL: Ensure ownerId is set for project visibility
  if (!newProject.ownerId) {
    console.error('❌ CRITICAL: No ownerId set - project will not be visible to creator!')
    throw new Error('User context required for project creation - ownerId must be set')
  }
  
  // FIXED: Ensure ownerId is stored as integer for consistent filtering
  newProject.ownerId = parseInt(newProject.ownerId)
  if (newProject.createdByUserId) {
    newProject.createdByUserId = parseInt(newProject.createdByUserId)
  }
  
  console.log(`✅ Creating project with ownerId: ${newProject.ownerId} (type: ${typeof newProject.ownerId})`)
  console.log(`✅ Creating project with createdBy: ${newProject.createdBy}`)
  console.log(`✅ Creating project with createdByUserId: ${newProject.createdByUserId} (type: ${typeof newProject.createdByUserId})`)
  
  // Add to database
  if (!db.data.projects) {
    db.data.projects = []
  }
  
  db.data.projects.push(newProject)
  db.write()
  
  console.log(`✅ Project created successfully with ID: ${newProject.id}`)
  
  return newProject
}

export function updateProject(id, updates) {
  db.read()
  
  const projectIndex = db.data.projects?.findIndex(p => p.id === id)
  if (projectIndex === -1) {
    throw new Error('Project not found')
  }
  
  // Update project with new data
  db.data.projects[projectIndex] = {
    ...db.data.projects[projectIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  }
  
  db.write()
  return db.data.projects[projectIndex]
}

export function deleteProject(id) {
  db.read()
  
  const projectIndex = db.data.projects?.findIndex(p => p.id === id)
  if (projectIndex === -1) {
    throw new Error('Project not found')
  }
  
  const deletedProject = db.data.projects[projectIndex]
  db.data.projects.splice(projectIndex, 1)
  db.write()
  
  return deletedProject
}

// User management functions
export function getAllUsers() {
  db.read()
  return db.data.users || []
}

export function getUserById(id) {
  db.read()
  // FIXED: Ensure consistent integer comparison for user lookup
  return db.data.users?.find(u => parseInt(u.id) === parseInt(id)) || null
}

export function createUser(userData) {
  db.read()
  
  const newUser = {
    id: Date.now(), // Simple ID generation
    ...userData,
    createdAt: new Date().toISOString()
  }
  
  if (!db.data.users) {
    db.data.users = []
  }
  
  db.data.users.push(newUser)
  db.write()
  
  return newUser
}

export function updateUser(id, updates) {
  db.read()
  
  const userIndex = db.data.users?.findIndex(u => parseInt(u.id) === parseInt(id))
  if (userIndex === -1) {
    throw new Error('User not found')
  }
  
  db.data.users[userIndex] = {
    ...db.data.users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  db.write()
  return db.data.users[userIndex]
}

export function deleteUser(id) {
  db.read()
  
  const userIndex = db.data.users?.findIndex(u => parseInt(u.id) === parseInt(id))
  if (userIndex === -1) {
    throw new Error('User not found')
  }
  
  const deletedUser = db.data.users[userIndex]
  db.data.users.splice(userIndex, 1)
  db.write()
  
  return deletedUser
}

// Company CRUD operations
export function getAllCompanies() {
  db.read()
  return db.data.companies || []
}

export function getCompanyById(id) {
  db.read()
  return db.data.companies?.find(c => c.id === id)
}

export function createCompany(companyData) {
  db.read()
  
  if (!db.data.companies) {
    db.data.companies = []
  }
  
  const newCompany = {
    ...companyData,
    createdAt: companyData.createdAt || new Date().toISOString(),
    updatedAt: companyData.updatedAt || new Date().toISOString()
  }
  
  db.data.companies.push(newCompany)
  db.write()
  
  return newCompany
}

export function updateCompany(id, updates) {
  db.read()
  
  const companyIndex = db.data.companies?.findIndex(c => c.id === id)
  if (companyIndex === -1) {
    throw new Error('Company not found')
  }
  
  db.data.companies[companyIndex] = {
    ...db.data.companies[companyIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  db.write()
  return db.data.companies[companyIndex]
}

export function deleteCompany(id) {
  db.read()
  
  const companyIndex = db.data.companies?.findIndex(c => c.id === id)
  if (companyIndex === -1) {
    throw new Error('Company not found')
  }
  
  const deletedCompany = db.data.companies[companyIndex]
  db.data.companies.splice(companyIndex, 1)
  db.write()
  
  return deletedCompany
}

// Vendor CRUD operations
export function getAllVendors() {
  db.read()
  return db.data.vendors || []
}

export function getVendorById(id) {
  db.read()
  return db.data.vendors?.find(v => v.id === id)
}

export function getVendorsByProject(projectId) {
  db.read()
  return (db.data.vendors || []).filter(v => v.projectId === projectId)
}

export function getVendorsByCompany(companyId) {
  db.read()
  return (db.data.vendors || []).filter(v => v.companyId === companyId)
}

export function createVendor(vendorData) {
  db.read()
  
  if (!db.data.vendors) {
    db.data.vendors = []
  }
  
  const newVendor = {
    ...vendorData,
    createdAt: vendorData.createdAt || new Date().toISOString(),
    updatedAt: vendorData.updatedAt || new Date().toISOString()
  }
  
  db.data.vendors.push(newVendor)
  db.write()
  
  return newVendor
}

export function updateVendor(id, updates) {
  db.read()
  
  const vendorIndex = db.data.vendors?.findIndex(v => v.id === id)
  if (vendorIndex === -1) {
    throw new Error('Vendor not found')
  }
  
  db.data.vendors[vendorIndex] = {
    ...db.data.vendors[vendorIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  db.write()
  return db.data.vendors[vendorIndex]
}

export function deleteVendor(id) {
  db.read()
  
  const vendorIndex = db.data.vendors?.findIndex(v => v.id === id)
  if (vendorIndex === -1) {
    throw new Error('Vendor not found')
  }
  
  const deletedVendor = db.data.vendors[vendorIndex]
  db.data.vendors.splice(vendorIndex, 1)
  db.write()
  
  return deletedVendor
}

// Export database instance for direct access if needed
export { db }

