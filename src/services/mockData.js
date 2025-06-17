// Enhanced mock data service with improved data model
import { generateId } from '../utils/index.js'

// Project template for new projects
export const projectTemplate = {
  milestones: [
    {
      id: 1,
      name: "Project Initiation",
      status: "pending",
      plannedDate: null,
      actualDate: null,
      baselineDate: null,
      description: "Project kickoff and team mobilization",
      notes: "",
      isNA: false,
      isRequired: true
    },
    {
      id: 2,
      name: "Design Completion",
      status: "pending",
      plannedDate: null,
      actualDate: null,
      baselineDate: null,
      description: "Final design approval and documentation",
      notes: "",
      isNA: false,
      isRequired: true
    },
    {
      id: 3,
      name: "Construction Start",
      status: "pending",
      plannedDate: null,
      actualDate: null,
      baselineDate: null,
      description: "Begin construction activities",
      notes: "",
      isNA: false,
      isRequired: true
    },
    {
      id: 4,
      name: "Structural Completion",
      status: "pending",
      plannedDate: null,
      actualDate: null,
      baselineDate: null,
      description: "Complete structural work",
      notes: "",
      isNA: false,
      isRequired: true
    },
    {
      id: 5,
      name: "MEP Rough-in",
      status: "pending",
      plannedDate: null,
      actualDate: null,
      baselineDate: null,
      description: "Mechanical, electrical, and plumbing rough-in",
      notes: "",
      isNA: false,
      isRequired: true
    },
    {
      id: 6,
      name: "Final Inspection",
      status: "pending",
      plannedDate: null,
      actualDate: null,
      baselineDate: null,
      description: "Final building inspection and certification",
      notes: "",
      isNA: false,
      isRequired: true
    }
  ],
  vendors: [
    {
      id: 1,
      name: "Primary Contractor",
      type: "General Contractor",
      contact: "",
      email: "",
      phone: "",
      status: "Active"
    }
  ],
  closeoutData: {
    finalInspectionDate: null,
    certificateOfOccupancy: null,
    warrantyPeriod: "12 months",
    deficiencyList: [],
    finalCost: null,
    lessonsLearned: "",
    projectRating: null
  },
  monthlyArchive: []
}

// Enhanced mock data with improved structure
export const mockProjects = [
  {
    id: "p1001",
    name: "Calgary Elementary School Renovation",
    ownerId: "u1",
    userIds: ["u1", "u2"],
    vendorIds: ["v1", "v2"],
    status: "Active",
    files: ["file_001", "file_002"],
    fundingTotal: 2450000,
    spentTotal: 1680000,
    fundingSources: [
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
    costs: [
      {
        id: "exp1",
        vendorId: "v1",
        description: "Initial contract payment",
        amount: 1200000,
        date: "2024-05-01"
      },
      {
        id: "exp2",
        vendorId: "v1",
        description: "Material supply payment",
        amount: 480000,
        date: "2024-06-15"
      }
    ],
    active: true,
    createdAt: "2024-03-01T08:00:00.000Z",
    updatedAt: "2024-06-12T10:30:00.000Z",
    
    // Legacy fields for backward compatibility
    contractor: "ABC Construction Ltd.",
    startDate: "2024-03-15",
    submissions: 12,
    reportStatus: "Update Required",
    description: "Complete renovation of elementary school facilities including classroom upgrades and safety improvements",
    phase: "Construction",
    region: "Calgary",
    location: "123 School Street, Calgary, AB T2P 1A1",
    deliveryMethod: "Design-Build",
    projectManager: "Sarah Johnson",
    seniorProjectManager: "Michael Brown",
    director: "Lisa Wilson",
    additionalTeam: ["John Doe - Engineer", "Jane Smith - Architect"],
    totalBudget: 2450000,
    amountSpent: 1680000,
    taf: 2450000,
    eac: 2520000,
    currentYearCashflow: 1200000,
    targetCashflow: 1150000,
    lastPfmtUpdate: null,
    scheduleStatus: "Green",
    budgetStatus: "Yellow",
    scheduleReasonCode: "",
    budgetReasonCode: "Material Supply Delays",
    monthlyComments: "Foundation work completed ahead of schedule but material delays affecting budget",
    previousHighlights: "Completed foundation work 2 weeks early",
    nextSteps: "Proceed with framing and electrical rough-in",
    budgetVarianceExplanation: "Steel prices increased by 15% due to supply chain issues",
    cashflowVarianceExplanation: "Additional payments required for expedited material delivery",
    submittedBy: null,
    submittedDate: null,
    approvedBy: null,
    approvedDate: null,
    directorApproved: false,
    seniorPmReviewed: false,
    milestones: [
      {
        id: 1,
        name: "Project Initiation",
        status: "completed",
        plannedDate: "2024-03-01",
        actualDate: "2024-02-28",
        baselineDate: "2024-03-01",
        description: "Project kickoff and team mobilization",
        notes: "Completed ahead of schedule",
        isNA: false,
        isRequired: true
      },
      {
        id: 2,
        name: "Design Completion",
        status: "completed",
        plannedDate: "2024-04-15",
        actualDate: "2024-04-12",
        baselineDate: "2024-04-15",
        description: "Final design approval and documentation",
        notes: "Minor revisions completed quickly",
        isNA: false,
        isRequired: true
      },
      {
        id: 3,
        name: "Construction Start",
        status: "completed",
        plannedDate: "2024-05-01",
        actualDate: "2024-05-03",
        baselineDate: "2024-05-01",
        description: "Begin construction activities",
        notes: "Slight delay due to permit processing",
        isNA: false,
        isRequired: true
      },
      {
        id: 4,
        name: "Structural Completion",
        status: "in-progress",
        plannedDate: "2024-07-15",
        actualDate: null,
        baselineDate: "2024-07-15",
        description: "Complete structural work",
        notes: "On track for completion",
        isNA: false,
        isRequired: true
      },
      {
        id: 5,
        name: "MEP Rough-in",
        status: "pending",
        plannedDate: "2024-08-30",
        actualDate: null,
        baselineDate: "2024-08-30",
        description: "Mechanical, electrical, and plumbing rough-in",
        notes: "",
        isNA: false,
        isRequired: true
      },
      {
        id: 6,
        name: "Final Inspection",
        status: "pending",
        plannedDate: "2024-11-15",
        actualDate: null,
        baselineDate: "2024-11-15",
        description: "Final building inspection and certification",
        notes: "",
        isNA: false,
        isRequired: true
      }
    ],
    vendors: [
      {
        id: 1,
        name: "ABC Construction Ltd.",
        type: "General Contractor",
        contact: "John Smith",
        email: "john@abcconstruction.com",
        phone: "(403) 555-0123",
        status: "Active"
      },
      {
        id: 2,
        name: "Steel Supply Co.",
        type: "Material Supplier",
        contact: "Jane Doe",
        email: "jane@steelsupply.com",
        phone: "(403) 555-0456",
        status: "Active"
      }
    ],
    closeoutData: {
      finalInspectionDate: null,
      certificateOfOccupancy: null,
      warrantyPeriod: "12 months",
      deficiencyList: [],
      finalCost: null,
      lessonsLearned: "",
      projectRating: null
    },
    monthlyArchive: []
  },
  {
    id: "p1002",
    name: "Edmonton Hospital Wing Addition",
    ownerId: "u2",
    userIds: ["u2", "u3"],
    vendorIds: ["v3"],
    status: "Active",
    files: ["file_003"],
    fundingTotal: 5200000,
    spentTotal: 1560000,
    fundingSources: [
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
    costs: [
      {
        id: "exp3",
        vendorId: "v3",
        description: "Design phase payment",
        amount: 780000,
        date: "2024-04-15"
      },
      {
        id: "exp4",
        vendorId: "v3",
        description: "Equipment procurement",
        amount: 780000,
        date: "2024-05-15"
      }
    ],
    active: true,
    createdAt: "2024-01-01T08:00:00.000Z",
    updatedAt: "2024-05-21T09:15:00.000Z",
    
    // Legacy fields for backward compatibility
    contractor: "MediConstruct Inc.",
    startDate: "2024-01-10",
    submissions: 8,
    reportStatus: "Current",
    description: "New wing addition to Edmonton General Hospital with specialized medical equipment installation",
    phase: "Design Development",
    region: "Edmonton",
    location: "456 Health Avenue, Edmonton, AB T5K 2M3",
    deliveryMethod: "Traditional",
    projectManager: "Michael Brown",
    seniorProjectManager: "Lisa Wilson",
    director: "David Chen",
    additionalTeam: ["Dr. Sarah Lee - Medical Consultant", "Tom Wilson - MEP Engineer"],
    totalBudget: 5200000,
    amountSpent: 1560000,
    taf: 5200000,
    eac: 5100000,
    currentYearCashflow: 2100000,
    targetCashflow: 2200000,
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
    submittedBy: "Michael Brown",
    submittedDate: "2024-05-20T14:00:00Z",
    approvedBy: "Lisa Wilson",
    approvedDate: "2024-05-21T09:15:00Z",
    directorApproved: true,
    seniorPmReviewed: true,
    pfmtFileName: "Edmonton-Hospital-PFMT-May2024.xlsx",
    pfmtExtractedAt: "2024-05-15T10:30:00Z"
  }
]

// Enhanced users with new structure
export const mockUsers = [
  {
    id: "u1",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Project Manager",
    department: "IT Projects",
    title: "Project Manager",
    externalIds: {
      hrSystemId: "EMP00123"
    }
  },
  {
    id: "u2",
    name: "Michael Brown",
    email: "michael.brown@company.com",
    role: "Senior Project Manager",
    department: "Infrastructure",
    title: "Senior Project Manager",
    externalIds: {
      hrSystemId: "EMP00124"
    }
  },
  {
    id: "u3",
    name: "Lisa Wilson",
    email: "lisa.wilson@company.com",
    role: "Director",
    department: "Project Management Office",
    title: "Director of Projects",
    externalIds: {
      hrSystemId: "EMP00125"
    }
  },
  {
    id: "u4",
    name: "David Chen",
    email: "david.chen@company.com",
    role: "Director",
    department: "Healthcare Projects",
    title: "Director of Healthcare Infrastructure",
    externalIds: {
      hrSystemId: "EMP00126"
    }
  }
]

// New vendors entity
export const mockVendors = [
  {
    id: "v1",
    name: "ABC Construction Ltd.",
    contact: {
      name: "John Smith",
      email: "john@abcconstruction.com",
      phone: "(403) 555-0123"
    },
    address: "100 Construction Ave, Calgary, AB T2P 1A1",
    crmId: "ABC-001"
  },
  {
    id: "v2",
    name: "Steel Supply Co.",
    contact: {
      name: "Jane Doe",
      email: "jane@steelsupply.com",
      phone: "(403) 555-0456"
    },
    address: "200 Industrial Blvd, Calgary, AB T2P 2B2",
    crmId: "STEEL-001"
  },
  {
    id: "v3",
    name: "MediConstruct Inc.",
    contact: {
      name: "Dr. Robert Wilson",
      email: "robert@mediconstruct.com",
      phone: "(780) 555-0789"
    },
    address: "300 Healthcare Way, Edmonton, AB T5K 3C3",
    crmId: "MEDI-001"
  }
]

// New files entity
export const mockFiles = [
  {
    id: "file_001",
    projectId: "p1001",
    name: "Calgary_School_Plans.pdf",
    type: "application/pdf",
    url: "https://storage.example.com/files/calgary_school_plans.pdf",
    uploadedBy: "u1",
    uploadedAt: "2024-03-15T10:00:00Z",
    externalStorage: "AWS_S3"
  },
  {
    id: "file_002",
    projectId: "p1001",
    name: "Material_Specifications.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    url: "https://storage.example.com/files/material_specs.xlsx",
    uploadedBy: "u1",
    uploadedAt: "2024-04-01T14:30:00Z",
    externalStorage: "AWS_S3"
  },
  {
    id: "file_003",
    projectId: "p1002",
    name: "Edmonton-Hospital-PFMT-May2024.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    url: "https://storage.example.com/files/edmonton_hospital_pfmt.xlsx",
    uploadedBy: "u2",
    uploadedAt: "2024-05-15T10:30:00Z",
    externalStorage: "AWS_S3"
  }
]

export const mockSubmissions = [
  {
    id: 1,
    purposeType: "Progress Payment",
    submissionDate: "2024-05-15",
    contractStartDate: "2024-03-15",
    expectedPaymentDate: "2024-06-01",
    status: "Approved",
    flagged: false,
    comments: "Foundation work completed as scheduled",
    constructionItems: ["Foundation", "Excavation", "Site Preparation"]
  },
  {
    id: 2,
    purposeType: "Change Order",
    submissionDate: "2024-05-20",
    contractStartDate: "2024-03-15",
    expectedPaymentDate: "2024-06-05",
    status: "Under Review",
    flagged: true,
    comments: "Additional electrical work required",
    constructionItems: ["Electrical", "HVAC Modifications"]
  }
]

export const mockMilestones = [
  {
    id: 1,
    name: "Project Initiation",
    status: "completed",
    plannedDate: "2024-03-01",
    actualDate: "2024-02-28",
    baselineDate: "2024-03-01",
    description: "Project kickoff and team mobilization",
    notes: "Completed ahead of schedule",
    isNA: false,
    isRequired: true
  },
  {
    id: 2,
    name: "Design Completion",
    status: "completed",
    plannedDate: "2024-04-15",
    actualDate: "2024-04-12",
    baselineDate: "2024-04-15",
    description: "Final design approval and documentation",
    notes: "Minor revisions completed quickly",
    isNA: false,
    isRequired: true
  },
  {
    id: 3,
    name: "Construction Start",
    status: "completed",
    plannedDate: "2024-05-01",
    actualDate: "2024-05-03",
    baselineDate: "2024-05-01",
    description: "Begin construction activities",
    notes: "Slight delay due to permit processing",
    isNA: false,
    isRequired: true
  },
  {
    id: 4,
    name: "Structural Completion",
    status: "in-progress",
    plannedDate: "2024-07-15",
    actualDate: null,
    baselineDate: "2024-07-15",
    description: "Complete structural work",
    notes: "On track for completion",
    isNA: false,
    isRequired: true
  },
  {
    id: 5,
    name: "MEP Rough-in",
    status: "pending",
    plannedDate: "2024-08-30",
    actualDate: null,
    baselineDate: "2024-08-30",
    description: "Mechanical, electrical, and plumbing rough-in",
    notes: "",
    isNA: false,
    isRequired: true
  },
  {
    id: 6,
    name: "Final Inspection",
    status: "pending",
    plannedDate: "2024-11-15",
    actualDate: null,
    baselineDate: "2024-11-15",
    description: "Final building inspection and certification",
    notes: "",
    isNA: false,
    isRequired: true
  }
]

// Enhanced API simulation functions with new data model support
export const getProjects = async (filter = 'all') => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (filter === 'all') {
    return mockProjects
  }
  
  return mockProjects.filter(project => {
    switch (filter) {
      case 'active':
        return project.status === 'Active'
      case 'completed':
        return project.status === 'Completed'
      case 'pending':
        return project.reportStatus === 'Update Required'
      default:
        return true
    }
  })
}

export const getProject = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockProjects.find(project => project.id === id)
}

export const updateProject = async (id, updates) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  const projectIndex = mockProjects.findIndex(project => project.id === id)
  if (projectIndex !== -1) {
    mockProjects[projectIndex] = { 
      ...mockProjects[projectIndex], 
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return mockProjects[projectIndex]
  }
  throw new Error('Project not found')
}

// Enhanced create new project function with improved data model
export const createNewProject = async (projectData) => {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  const newProjectId = `p${Date.now()}`
  const currentDate = new Date().toISOString()
  
  // Find the creating user
  const creatingUser = mockUsers.find(user => user.name === projectData.createdBy)
  const ownerId = creatingUser ? creatingUser.id : "u1"
  
  const newProject = {
    // New data model fields
    id: newProjectId,
    name: projectData.name,
    ownerId: ownerId,
    userIds: [ownerId], // Owner is automatically included
    vendorIds: [],
    status: projectData.status || "Active",
    files: [],
    fundingTotal: 0,
    spentTotal: 0,
    fundingSources: [],
    costs: [],
    active: true,
    createdAt: currentDate,
    updatedAt: currentDate,
    
    // Legacy fields for backward compatibility
    contractor: "",
    startDate: currentDate.split('T')[0],
    submissions: 0,
    reportStatus: "Update Required",
    description: projectData.description,
    phase: projectData.phase || "Initiation",
    region: "",
    location: "",
    deliveryMethod: "",
    projectManager: projectData.createdBy,
    seniorProjectManager: "",
    director: "",
    additionalTeam: [],
    totalBudget: 0,
    amountSpent: 0,
    taf: 0,
    eac: 0,
    currentYearCashflow: 0,
    targetCashflow: 0,
    lastPfmtUpdate: null,
    scheduleStatus: "Green",
    budgetStatus: "Green",
    scheduleReasonCode: "",
    budgetReasonCode: "",
    monthlyComments: "",
    previousHighlights: "",
    nextSteps: "",
    budgetVarianceExplanation: "",
    cashflowVarianceExplanation: "",
    submittedBy: null,
    submittedDate: null,
    approvedBy: null,
    approvedDate: null,
    directorApproved: false,
    seniorPmReviewed: false,
    
    // Additional project data
    preliminaryResourceRequirements: projectData.preliminaryResourceRequirements || "",
    programAssignment: projectData.programAssignment || "",
    clientMinistry: projectData.clientMinistry || "",
    projectType: projectData.projectType || "",
    
    // Initialize with template data
    ...projectTemplate
  }
  
  mockProjects.push(newProject)
  return newProject
}

// Enhanced PFMT data import function
export const importPFMTData = async (projectId, pfmtData) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const projectIndex = mockProjects.findIndex(project => project.id === projectId)
  if (projectIndex === -1) {
    throw new Error('Project not found')
  }
  
  const currentDate = new Date().toISOString()
  
  // Create file record for PFMT file
  const fileId = `file_${Date.now()}`
  const newFile = {
    id: fileId,
    projectId: projectId,
    name: pfmtData.fileName,
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    url: `https://storage.example.com/files/${pfmtData.fileName}`,
    uploadedBy: mockProjects[projectIndex].ownerId,
    uploadedAt: currentDate,
    externalStorage: "AWS_S3"
  }
  
  mockFiles.push(newFile)
  
  // Update project with PFMT data
  const updates = {
    // New data model fields
    fundingTotal: pfmtData.taf || 0,
    spentTotal: pfmtData.currentYearCashflow || 0,
    files: [...(mockProjects[projectIndex].files || []), fileId],
    updatedAt: currentDate,
    
    // Legacy fields for backward compatibility
    taf: pfmtData.taf || 0,
    eac: pfmtData.eac || 0,
    currentYearCashflow: pfmtData.currentYearCashflow || 0,
    targetCashflow: pfmtData.currentYearTarget || 0,
    lastPfmtUpdate: currentDate,
    pfmtFileName: pfmtData.fileName,
    pfmtExtractedAt: currentDate,
    pfmtData: {
      sheetsProcessed: pfmtData.availableSheets || [],
      extractedAt: currentDate,
      originalData: pfmtData
    }
  }
  
  // Update project name if extracted from PFMT
  if (pfmtData['Project Name'] && pfmtData['Project Name'].trim()) {
    updates.name = pfmtData['Project Name'].trim()
  }
  
  mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...updates }
  return mockProjects[projectIndex]
}

// User management functions
export const getUsers = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockUsers
}

export const getUser = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return mockUsers.find(user => user.id === id)
}

export const createUser = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  
  const newUserId = `u${Date.now()}`
  const newUser = {
    id: newUserId,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    department: userData.department || "",
    title: userData.title || userData.role,
    externalIds: userData.externalIds || {}
  }
  
  mockUsers.push(newUser)
  return newUser
}

// Vendor management functions
export const getVendors = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockVendors
}

export const getVendor = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return mockVendors.find(vendor => vendor.id === id)
}

export const createVendor = async (vendorData) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  
  const newVendorId = `v${Date.now()}`
  const newVendor = {
    id: newVendorId,
    name: vendorData.name,
    contact: vendorData.contact || {},
    address: vendorData.address || "",
    crmId: vendorData.crmId || ""
  }
  
  mockVendors.push(newVendor)
  return newVendor
}

// File management functions
export const getFiles = async (projectId = null) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  if (projectId) {
    return mockFiles.filter(file => file.projectId === projectId)
  }
  return mockFiles
}

export const getFile = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return mockFiles.find(file => file.id === id)
}

// Existing functions maintained for backward compatibility
export const getSubmissions = async (projectId) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockSubmissions
}

export const getMilestones = async (projectId) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockMilestones
}

export const updateMilestone = async (milestoneId, updates) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const milestoneIndex = mockMilestones.findIndex(m => m.id === milestoneId)
  if (milestoneIndex !== -1) {
    mockMilestones[milestoneIndex] = { ...mockMilestones[milestoneIndex], ...updates }
    return mockMilestones[milestoneIndex]
  }
  throw new Error('Milestone not found')
}

// Post-approval archiving and workflow reset functions
export const archiveMonthlyData = async (projectId) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const projectIndex = mockProjects.findIndex(project => project.id === projectId)
  if (projectIndex === -1) {
    throw new Error('Project not found')
  }

  const project = mockProjects[projectIndex]
  const currentDate = new Date().toISOString()
  
  const archiveEntry = {
    id: generateId(),
    archivedDate: currentDate,
    reportingPeriod: new Date().toISOString().slice(0, 7),
    data: {
      scheduleStatus: project.scheduleStatus,
      budgetStatus: project.budgetStatus,
      scheduleReasonCode: project.scheduleReasonCode,
      budgetReasonCode: project.budgetReasonCode,
      monthlyComments: project.monthlyComments,
      previousHighlights: project.previousHighlights,
      nextSteps: project.nextSteps,
      budgetVarianceExplanation: project.budgetVarianceExplanation,
      cashflowVarianceExplanation: project.cashflowVarianceExplanation,
      submittedBy: project.submittedBy,
      submittedDate: project.submittedDate,
      approvedBy: project.approvedBy,
      approvedDate: project.approvedDate,
      taf: project.taf,
      eac: project.eac,
      currentYearCashflow: project.currentYearCashflow,
      targetCashflow: project.targetCashflow,
      amountSpent: project.amountSpent
    }
  }

  project.monthlyArchive.push(archiveEntry)

  const updates = {
    reportStatus: "Update Required",
    scheduleReasonCode: "",
    budgetReasonCode: "",
    monthlyComments: "",
    previousHighlights: "",
    nextSteps: "",
    budgetVarianceExplanation: "",
    cashflowVarianceExplanation: "",
    submittedBy: null,
    submittedDate: null,
    approvedBy: null,
    approvedDate: null,
    directorApproved: false,
    seniorPmReviewed: false,
    updatedAt: currentDate
  }

  mockProjects[projectIndex] = { ...project, ...updates }
  return mockProjects[projectIndex]
}

export const resetProjectWorkflow = async (projectId) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const updates = {
    reportStatus: "Update Required",
    scheduleReasonCode: "",
    budgetReasonCode: "",
    monthlyComments: "",
    previousHighlights: "",
    nextSteps: "",
    budgetVarianceExplanation: "",
    cashflowVarianceExplanation: "",
    submittedBy: null,
    submittedDate: null,
    approvedBy: null,
    approvedDate: null,
    directorApproved: false,
    seniorPmReviewed: false,
    updatedAt: new Date().toISOString()
  }
  
  return updateProject(projectId, updates)
}

