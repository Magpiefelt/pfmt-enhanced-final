// Enhanced Database Schema for Relational Data Model
// This file defines the new normalized JSON schema structure

export const SCHEMA_VERSION = "2.0.0"

// Default data structure with normalized entities
export const defaultRelationalSchema = {
  // Schema metadata
  _metadata: {
    version: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    lastMigration: null,
    entities: [
      "users", "vendors", "projects", "projectAssignments", 
      "fundingLines", "projectVendors", "changeOrders", "files"
    ]
  },

  // Core entities
  users: [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      role: "Project Manager",
      department: "Infrastructure",
      isActive: true,
      permissions: {
        canCreateProjects: true,
        canViewAllProjects: false,
        canApproveReports: false,
        canManageUsers: false,
        canManageVendors: false
      },
      createdAt: "2024-03-01T08:00:00.000Z",
      updatedAt: "2024-06-12T10:30:00.000Z",
      lastLoginAt: "2024-06-12T09:15:00.000Z"
    },
    {
      id: 2,
      name: "Michael Brown",
      email: "michael.brown@company.com",
      role: "Senior Project Manager",
      department: "Infrastructure",
      isActive: true,
      permissions: {
        canCreateProjects: true,
        canViewAllProjects: true,
        canApproveReports: true,
        canManageUsers: false,
        canManageVendors: true
      },
      createdAt: "2024-01-15T08:00:00.000Z",
      updatedAt: "2024-06-10T14:20:00.000Z",
      lastLoginAt: "2024-06-12T08:30:00.000Z"
    },
    {
      id: 3,
      name: "Lisa Wilson",
      email: "lisa.wilson@company.com",
      role: "Director",
      department: "Infrastructure",
      isActive: true,
      permissions: {
        canCreateProjects: true,
        canViewAllProjects: true,
        canApproveReports: true,
        canManageUsers: true,
        canManageVendors: true
      },
      createdAt: "2024-01-01T08:00:00.000Z",
      updatedAt: "2024-06-05T16:45:00.000Z",
      lastLoginAt: "2024-06-11T15:20:00.000Z"
    }
  ],

  vendors: [
    {
      id: 1,
      name: "ABC Construction Ltd.",
      contactName: "John Smith",
      email: "john.smith@abcconstruction.com",
      phone: "+1-403-555-0123",
      address: {
        street: "123 Industrial Way",
        city: "Calgary",
        province: "AB",
        postalCode: "T2P 1A1",
        country: "Canada"
      },
      vendorType: "General Contractor",
      certifications: ["COR", "ISNetworld"],
      capabilities: ["Construction", "Renovation", "Project Management"],
      isActive: true,
      metadata: {
        totalProjects: 15,
        activeProjects: 3,
        averageRating: 4.2,
        lastContractDate: "2024-05-15T00:00:00.000Z",
        totalContractValue: 25000000
      },
      createdAt: "2024-01-15T08:00:00.000Z",
      updatedAt: "2024-06-01T14:30:00.000Z"
    },
    {
      id: 2,
      name: "MediConstruct Inc.",
      contactName: "Dr. Sarah Lee",
      email: "sarah.lee@mediconstruct.com",
      phone: "+1-780-555-0456",
      address: {
        street: "456 Healthcare Blvd",
        city: "Edmonton",
        province: "AB",
        postalCode: "T5K 2M3",
        country: "Canada"
      },
      vendorType: "Specialized Healthcare Contractor",
      certifications: ["Healthcare Construction", "Medical Equipment Installation"],
      capabilities: ["Healthcare Construction", "Medical Equipment", "Specialized Systems"],
      isActive: true,
      metadata: {
        totalProjects: 8,
        activeProjects: 2,
        averageRating: 4.5,
        lastContractDate: "2024-04-20T00:00:00.000Z",
        totalContractValue: 18000000
      },
      createdAt: "2024-01-10T08:00:00.000Z",
      updatedAt: "2024-05-15T12:15:00.000Z"
    }
  ],

  projects: [
    {
      id: "88:36:D3",
      name: "Calgary Elementary School Renovation",
      description: "Complete renovation of elementary school facilities including classroom upgrades and safety improvements",
      status: "Active",
      reportStatus: "Update Required",
      phase: "Construction",
      category: "Education",
      deliveryMethod: "Design-Build",
      startDate: "2024-03-15",
      endDate: "2024-12-15",
      
      // Foreign key relationships
      ownerId: 1,
      primaryVendorId: 1,
      
      // Project details
      clientMinistry: "Education",
      projectType: "Renovation",
      branch: "Infrastructure",
      
      // Location information
      location: {
        geographicRegion: "Calgary",
        municipality: "Calgary",
        address: "123 School Street, Calgary, AB T2P 1A1",
        constituency: "Calgary-Centre",
        coordinates: {
          latitude: 51.0447,
          longitude: -114.0719
        }
      },
      
      // Building information
      building: {
        name: "Calgary Elementary School",
        type: "Educational Facility",
        id: "EDU-001",
        primaryOwner: "Alberta Education",
        squareMeters: 2500,
        numberOfStructures: 1,
        numberOfJobs: 15
      },
      
      // Financial data
      financial: {
        approvedTPC: 2450000,
        totalBudget: 2450000,
        amountSpent: 1680000,
        taf: 2450000,
        eac: 2520000,
        currentYearCashflow: 1200000,
        futureYearCashflow: 1250000,
        currentYearBudgetTarget: 1150000,
        currentYearApprovedTarget: 1200000,
        variance: 70000,
        lastFinancialUpdate: "2024-06-01T00:00:00.000Z"
      },
      
      // Status tracking
      statusTracking: {
        schedule: "Green",
        budget: "Yellow",
        scope: "Green",
        scheduleReasonCode: "",
        budgetReasonCode: "Material Supply Delays",
        lastStatusUpdate: "2024-06-12T10:30:00.000Z"
      },
      
      // Workflow and approvals
      workflow: {
        submittedBy: null,
        submittedDate: null,
        approvedBy: null,
        approvedDate: null,
        directorApproved: false,
        seniorPmReviewed: false,
        currentStage: "In Progress",
        nextApprovalRequired: "Senior PM Review"
      },
      
      // PFMT integration
      pfmt: {
        lastUpdate: "2024-06-12T10:30:00.000Z",
        fileName: null,
        extractedAt: null,
        sheetsProcessed: [],
        dataQuality: "Good"
      },
      
      // Comments and notes
      comments: {
        monthlyComments: "Foundation work completed ahead of schedule but material delays affecting budget",
        previousHighlights: "Completed foundation work 2 weeks early",
        nextSteps: "Proceed with framing and electrical rough-in",
        budgetVarianceExplanation: "Steel prices increased by 15% due to supply chain issues",
        cashflowVarianceExplanation: "Additional payments required for expedited material delivery"
      },
      
      // Milestones (kept as nested structure for compatibility)
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
      createdAt: "2024-03-01T08:00:00.000Z",
      updatedAt: "2024-06-12T10:30:00.000Z",
      createdFrom: "Manual",
      lastUpdated: "2024-06-12T10:30:00.000Z"
    }
  ],

  // Relationship entities
  projectAssignments: [
    {
      id: 1,
      projectId: "88:36:D3",
      userId: 2,
      accessLevel: "Editor",
      grantedBy: 3,
      grantedAt: "2024-04-15T10:00:00.000Z",
      expiresAt: null,
      isActive: true,
      permissions: {
        canEdit: true,
        canViewFinancials: true,
        canViewReports: true,
        canComment: true,
        canApprove: false
      },
      reason: "Senior PM oversight for complex renovation project",
      createdAt: "2024-04-15T10:00:00.000Z",
      updatedAt: "2024-04-15T10:00:00.000Z"
    }
  ],

  fundingLines: [
    {
      id: 1,
      projectId: "88:36:D3",
      source: "P-002360",
      description: "General Facilities Infrastructure",
      capitalPlanLine: "Calgary Elementary School Renovation",
      wbs: "P-002360",
      projectCode: "B0536D-0010",
      approvedValue: 2450000,
      currentYearBudget: 1150000,
      currentYearApproved: 1200000,
      spentToDate: 1680000,
      remainingBudget: 770000,
      fiscalYear: "2024-25",
      fundingType: "Capital",
      isActive: true,
      createdAt: "2024-03-01T08:00:00.000Z",
      updatedAt: "2024-06-01T14:00:00.000Z"
    }
  ],

  projectVendors: [
    {
      id: 1,
      projectId: "88:36:D3",
      vendorId: 1,
      contractId: "CON-001",
      vendorRole: "Primary Contractor",
      contractValue: 2200000,
      currentCommitment: 2200000,
      billedToDate: 1680000,
      holdback: 168000,
      percentComplete: 76.4,
      contractStartDate: "2024-03-15",
      contractEndDate: "2024-12-15",
      status: "Active",
      lastBillingDate: "2024-06-01",
      cmsValue: 2200000,
      cmsAsOfDate: "2024-06-01",
      variance: 50000,
      performanceRating: 4.0,
      isActive: true,
      createdAt: "2024-03-15T08:00:00.000Z",
      updatedAt: "2024-06-01T16:30:00.000Z"
    }
  ],

  changeOrders: [
    {
      id: 1,
      projectId: "88:36:D3",
      vendorId: 1,
      contractId: "CON-001",
      referenceNumber: "CO-001",
      status: "Approved",
      requestDate: "2024-05-10",
      approvedDate: "2024-05-15",
      value: 70000,
      reasonCode: "Material Supply Delays",
      description: "Additional steel reinforcement due to supply chain issues",
      justification: "Market conditions have increased steel prices by 15%, requiring additional budget allocation",
      approvedBy: 1,
      requestedBy: 2,
      impactAnalysis: {
        scheduleImpact: "None",
        budgetImpact: "Increase",
        scopeImpact: "Enhancement",
        riskAssessment: "Low"
      },
      attachments: [],
      isActive: true,
      createdAt: "2024-05-10T09:00:00.000Z",
      updatedAt: "2024-05-15T14:30:00.000Z"
    }
  ],

  files: [
    {
      id: 1,
      projectId: "88:36:D3",
      fileName: "Design_Specifications_v2.pdf",
      originalName: "Calgary Elementary - Design Specifications v2.pdf",
      filePath: "/uploads/projects/88-36-D3/design_specs_v2.pdf",
      fileSize: 2048576,
      mimeType: "application/pdf",
      category: "Design Documents",
      uploadedBy: 1,
      uploadedAt: "2024-04-20T10:15:00.000Z",
      version: "2.0",
      isLatest: true,
      accessLevel: "Project Team",
      checksum: "sha256:abc123def456...",
      metadata: {
        pageCount: 45,
        lastModified: "2024-04-19T16:30:00.000Z",
        tags: ["design", "specifications", "architecture"]
      },
      isActive: true
    }
  ],

  // Additional lookup tables
  roles: [
    {
      id: 1,
      name: "Project Manager",
      description: "Manages individual projects",
      permissions: ["create_projects", "edit_own_projects", "view_own_projects"],
      isActive: true
    },
    {
      id: 2,
      name: "Senior Project Manager",
      description: "Manages multiple projects and oversees project managers",
      permissions: ["create_projects", "edit_all_projects", "view_all_projects", "approve_reports"],
      isActive: true
    },
    {
      id: 3,
      name: "Director",
      description: "Executive oversight of all projects",
      permissions: ["create_projects", "edit_all_projects", "view_all_projects", "approve_reports", "manage_users"],
      isActive: true
    }
  ],

  // System configuration
  systemConfig: {
    accessControlEnabled: true,
    auditLoggingEnabled: true,
    defaultProjectStatus: "Active",
    defaultReportStatus: "Update Required",
    maxFileUploadSize: 10485760, // 10MB
    supportedFileTypes: [".pdf", ".docx", ".xlsx", ".jpg", ".png"],
    dataRetentionDays: 2555, // 7 years
    backupFrequency: "daily"
  }
}

// Entity validation schemas
export const entitySchemas = {
  user: {
    required: ["name", "email", "role"],
    fields: {
      id: { type: "number", autoGenerate: true },
      name: { type: "string", maxLength: 100 },
      email: { type: "string", format: "email" },
      role: { type: "string", enum: ["Project Manager", "Senior Project Manager", "Director", "Admin"] },
      department: { type: "string", maxLength: 50 },
      isActive: { type: "boolean", default: true },
      permissions: { type: "object" },
      createdAt: { type: "string", format: "date-time", autoGenerate: true },
      updatedAt: { type: "string", format: "date-time", autoUpdate: true }
    }
  },

  vendor: {
    required: ["name", "vendorType"],
    fields: {
      id: { type: "number", autoGenerate: true },
      name: { type: "string", maxLength: 200 },
      contactName: { type: "string", maxLength: 100 },
      email: { type: "string", format: "email" },
      phone: { type: "string", maxLength: 20 },
      vendorType: { type: "string", maxLength: 50 },
      isActive: { type: "boolean", default: true },
      createdAt: { type: "string", format: "date-time", autoGenerate: true },
      updatedAt: { type: "string", format: "date-time", autoUpdate: true }
    }
  },

  project: {
    required: ["name", "ownerId"],
    fields: {
      id: { type: "string", autoGenerate: true },
      name: { type: "string", maxLength: 200 },
      description: { type: "string", maxLength: 1000 },
      status: { type: "string", enum: ["Active", "Completed", "On Hold", "Cancelled"] },
      ownerId: { type: "number", foreignKey: "users.id" },
      primaryVendorId: { type: "number", foreignKey: "vendors.id", nullable: true },
      createdAt: { type: "string", format: "date-time", autoGenerate: true },
      updatedAt: { type: "string", format: "date-time", autoUpdate: true }
    }
  },

  projectAssignment: {
    required: ["projectId", "userId", "grantedBy"],
    fields: {
      id: { type: "number", autoGenerate: true },
      projectId: { type: "string", foreignKey: "projects.id" },
      userId: { type: "number", foreignKey: "users.id" },
      grantedBy: { type: "number", foreignKey: "users.id" },
      accessLevel: { type: "string", enum: ["Viewer", "Editor", "Admin"] },
      isActive: { type: "boolean", default: true },
      createdAt: { type: "string", format: "date-time", autoGenerate: true }
    }
  }
}

// Relationship definitions
export const relationships = {
  projects: {
    owner: { type: "belongsTo", entity: "users", foreignKey: "ownerId" },
    primaryVendor: { type: "belongsTo", entity: "vendors", foreignKey: "primaryVendorId" },
    assignments: { type: "hasMany", entity: "projectAssignments", foreignKey: "projectId" },
    fundingLines: { type: "hasMany", entity: "fundingLines", foreignKey: "projectId" },
    vendors: { type: "hasMany", entity: "projectVendors", foreignKey: "projectId" },
    changeOrders: { type: "hasMany", entity: "changeOrders", foreignKey: "projectId" },
    files: { type: "hasMany", entity: "files", foreignKey: "projectId" }
  },
  
  users: {
    ownedProjects: { type: "hasMany", entity: "projects", foreignKey: "ownerId" },
    projectAssignments: { type: "hasMany", entity: "projectAssignments", foreignKey: "userId" }
  },
  
  vendors: {
    primaryProjects: { type: "hasMany", entity: "projects", foreignKey: "primaryVendorId" },
    projectVendors: { type: "hasMany", entity: "projectVendors", foreignKey: "vendorId" }
  }
}

