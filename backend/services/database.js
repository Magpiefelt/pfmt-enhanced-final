// Enhanced Database service using lowdb for JSON-based persistence
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
  ]
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
  
  if (migrationNeeded) {
    db.write()
    console.log('Database migrated to new project structure')
  }
}

// Get database instance
export function getDatabase() {
  return db
}

// Helper functions for common operations with enhanced filtering
export function getAllProjects(filters = {}) {
  db.read()
  let projects = db.data.projects || []
  
  // Apply role-based filtering
  if (filters.userId && filters.userRole) {
    const role = filters.userRole.toLowerCase()
    const userId = filters.userId
    
    if (role === 'project manager' || role === 'senior project manager' || role === 'pm') {
      // Project managers can see projects they own or manage
      projects = projects.filter(p => {
        return (
          p.ownerId === userId ||
          p.createdByUserId === userId ||
          (p.projectManager && p.projectManager.toLowerCase().includes(getUserNameById(userId)?.toLowerCase() || '')) ||
          (p.seniorProjectManager && p.seniorProjectManager.toLowerCase().includes(getUserNameById(userId)?.toLowerCase() || ''))
        )
      })
    }
  }
  
  // Apply additional filters
  if (filters.ownerId) {
    projects = projects.filter(p => p.ownerId === parseInt(filters.ownerId))
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

export function createProject(projectData, userContext = null) {
  db.read()
  
  const newProject = {
    id: uuidv4(),
    ...projectData,
    // Ensure proper user context is set for visibility
    createdByUserId: userContext?.id || projectData.createdByUserId || projectData.ownerId,
    ownerId: projectData.ownerId || userContext?.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  }
  
  db.data.projects = db.data.projects || []
  db.data.projects.push(newProject)
  db.write()
  
  return newProject
}

export function updateProject(id, updates) {
  db.read()
  
  const projectIndex = db.data.projects?.findIndex(p => p.id === id)
  if (projectIndex === -1) {
    return null
  }
  
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
    return false
  }
  
  db.data.projects.splice(projectIndex, 1)
  db.write()
  return true
}

export function getAllUsers() {
  db.read()
  return db.data.users || []
}

export function getUserById(id) {
  db.read()
  return db.data.users?.find(u => u.id === parseInt(id)) || null
}

