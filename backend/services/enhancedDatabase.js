// Enhanced Database Service with Relational Data Model Support
import { Low } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { fileURLToPath } from 'url'
import { defaultRelationalSchema, entitySchemas, relationships } from '../schemas/relationalSchema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database file path
const dbFile = path.join(__dirname, '..', 'db.json')

// Database adapter
const adapter = new JSONFileSync(dbFile)
const db = new Low(adapter, {})

// Enhanced Database Service with Repository Pattern
class EnhancedDatabaseService {
  constructor() {
    this.db = db
    this.repositories = {}
    this.accessControlManager = new AccessControlManager(this)
    this.relationshipManager = new RelationshipManager(this)
    this.migrationManager = new MigrationManager(this)
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return

    try {
      this.db.read()
      
      // Check if migration is needed
      const needsMigration = await this.migrationManager.checkMigrationNeeded()
      
      if (needsMigration) {
        console.log('🔄 Starting migration to relational data model...')
        await this.migrationManager.migrateToRelationalModel()
        console.log('✅ Migration completed successfully')
      }
      
      // Initialize repositories
      this.initializeRepositories()
      
      this.initialized = true
      console.log('✅ Enhanced Database Service initialized')
      
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Database Service:', error)
      throw error
    }
  }

  initializeRepositories() {
    this.repositories = {
      users: new UserRepository(this.db),
      vendors: new VendorRepository(this.db),
      projects: new ProjectRepository(this.db),
      projectAssignments: new ProjectAssignmentRepository(this.db),
      fundingLines: new FundingLineRepository(this.db),
      projectVendors: new ProjectVendorRepository(this.db),
      changeOrders: new ChangeOrderRepository(this.db),
      files: new FileRepository(this.db)
    }
  }

  // Enhanced project access with proper relationship loading
  async getProjectsForUser(userId, userRole, filters = {}) {
    await this.initialize()
    
    const user = await this.repositories.users.findById(userId)
    if (!user) throw new Error('User not found')

    // Get accessible project IDs based on role and assignments
    const accessibleProjectIds = await this.accessControlManager
      .getAccessibleProjectIds(userId, userRole)
    
    // Apply filters
    const projectFilters = {
      id: { $in: accessibleProjectIds },
      ...filters
    }

    // Get projects with relationships
    const projects = await this.repositories.projects.findManyWithRelationships(projectFilters)
    
    return projects
  }

  async getProjectById(projectId, userId = null, userRole = null) {
    await this.initialize()
    
    // Check access if user context provided
    if (userId && userRole) {
      const hasAccess = await this.accessControlManager.canAccessProject(userId, projectId)
      if (!hasAccess) {
        throw new Error('Access denied to project')
      }
    }

    return this.repositories.projects.findByIdWithRelationships(projectId)
  }

  async createProject(projectData, userContext) {
    await this.initialize()
    
    if (!userContext?.id) {
      throw new Error('User context required for project creation')
    }

    const unitOfWork = new UnitOfWork(this.db)
    
    try {
      // Create project
      const project = await unitOfWork.projects.create({
        ...projectData,
        ownerId: userContext.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Create related entities
      if (projectData.fundingLines?.length > 0) {
        for (const fundingLine of projectData.fundingLines) {
          await unitOfWork.fundingLines.create({
            ...fundingLine,
            projectId: project.id
          })
        }
      }

      if (projectData.vendors?.length > 0) {
        for (const vendorData of projectData.vendors) {
          await unitOfWork.projectVendors.create({
            projectId: project.id,
            vendorId: vendorData.vendorId,
            ...vendorData
          })
        }
      }

      await unitOfWork.commit()
      
      // Return project with relationships
      return this.getProjectById(project.id)
      
    } catch (error) {
      await unitOfWork.rollback()
      throw error
    }
  }

  async updateProject(projectId, updates, userContext) {
    await this.initialize()
    
    // Check access
    if (userContext) {
      const hasAccess = await this.accessControlManager.canAccessProject(
        userContext.id, projectId, 'edit'
      )
      if (!hasAccess) {
        throw new Error('Access denied to edit project')
      }
    }

    const updatedProject = await this.repositories.projects.update(projectId, {
      ...updates,
      updatedAt: new Date().toISOString()
    })

    return this.getProjectById(projectId)
  }

  // Vendor management
  async getAllVendors() {
    await this.initialize()
    return this.repositories.vendors.findMany({ isActive: true })
  }

  async createVendor(vendorData) {
    await this.initialize()
    return this.repositories.vendors.create(vendorData)
  }

  // User management
  async getAllUsers() {
    await this.initialize()
    return this.repositories.users.findMany({ isActive: true })
  }

  async getUserById(userId) {
    await this.initialize()
    return this.repositories.users.findById(userId)
  }

  // Project assignments
  async assignUserToProject(projectId, userId, accessLevel, grantedBy) {
    await this.initialize()
    
    // Verify granter has permission
    const canGrant = await this.accessControlManager.canGrantAccess(grantedBy, projectId)
    if (!canGrant) {
      throw new Error('Insufficient permissions to grant project access')
    }

    return this.repositories.projectAssignments.create({
      projectId,
      userId,
      accessLevel,
      grantedBy,
      isActive: true,
      permissions: this.getDefaultPermissionsForAccessLevel(accessLevel)
    })
  }

  getDefaultPermissionsForAccessLevel(accessLevel) {
    const permissionSets = {
      'Viewer': {
        canEdit: false,
        canViewFinancials: true,
        canViewReports: true,
        canComment: false,
        canApprove: false
      },
      'Editor': {
        canEdit: true,
        canViewFinancials: true,
        canViewReports: true,
        canComment: true,
        canApprove: false
      },
      'Admin': {
        canEdit: true,
        canViewFinancials: true,
        canViewReports: true,
        canComment: true,
        canApprove: true
      }
    }
    
    return permissionSets[accessLevel] || permissionSets['Viewer']
  }
}

// Base Repository Class
class BaseRepository {
  constructor(db, entityName) {
    this.db = db
    this.entityName = entityName
    this.schema = entitySchemas[entityName.slice(0, -1)] // Remove 's' from plural
  }

  generateId() {
    if (this.entityName === 'projects') {
      // Generate project-style ID
      return `${Math.floor(Math.random() * 99)}:${Math.floor(Math.random() * 99)}:${Math.random().toString(36).substring(2, 4).toUpperCase()}`
    }
    
    // Generate numeric ID for other entities
    const existingIds = (this.db.data[this.entityName] || []).map(e => e.id)
    return Math.max(0, ...existingIds) + 1
  }

  async create(data) {
    this.db.read()
    
    const entity = {
      id: this.generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (!this.db.data[this.entityName]) {
      this.db.data[this.entityName] = []
    }

    this.db.data[this.entityName].push(entity)
    this.db.write()
    
    return entity
  }

  async findById(id) {
    this.db.read()
    return this.db.data[this.entityName]?.find(e => e.id === id) || null
  }

  async findOne(criteria) {
    this.db.read()
    const entities = this.db.data[this.entityName] || []
    return entities.find(entity => this.matchesCriteria(entity, criteria)) || null
  }

  async findMany(criteria = {}) {
    this.db.read()
    let entities = this.db.data[this.entityName] || []
    
    // Apply filters
    for (const [field, value] of Object.entries(criteria)) {
      entities = entities.filter(entity => this.matchesCriteria(entity, { [field]: value }))
    }
    
    return entities
  }

  async update(id, updates) {
    this.db.read()
    
    const index = this.db.data[this.entityName]?.findIndex(e => e.id === id)
    if (index === -1) throw new Error(`${this.entityName} not found`)
    
    const entity = {
      ...this.db.data[this.entityName][index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.db.data[this.entityName][index] = entity
    this.db.write()
    
    return entity
  }

  async delete(id) {
    this.db.read()
    
    const index = this.db.data[this.entityName]?.findIndex(e => e.id === id)
    if (index === -1) throw new Error(`${this.entityName} not found`)
    
    const deleted = this.db.data[this.entityName].splice(index, 1)[0]
    this.db.write()
    
    return deleted
  }

  matchesCriteria(entity, criteria) {
    for (const [field, value] of Object.entries(criteria)) {
      if (field.includes('.')) {
        // Handle nested field access
        const fieldPath = field.split('.')
        let entityValue = entity
        for (const pathPart of fieldPath) {
          entityValue = entityValue?.[pathPart]
        }
        if (entityValue !== value) return false
      } else if (typeof value === 'object' && value !== null) {
        // Handle special operators
        if (value.$in && Array.isArray(value.$in)) {
          if (!value.$in.includes(entity[field])) return false
        } else if (value.$ne) {
          if (entity[field] === value.$ne) return false
        } else if (value.$gt) {
          if (entity[field] <= value.$gt) return false
        } else if (value.$lt) {
          if (entity[field] >= value.$lt) return false
        }
      } else {
        if (entity[field] !== value) return false
      }
    }
    return true
  }
}

// Specialized Repository Classes
class ProjectRepository extends BaseRepository {
  constructor(db) {
    super(db, 'projects')
  }

  async findByIdWithRelationships(projectId) {
    const project = await this.findById(projectId)
    if (!project) return null

    return this.loadRelationships(project)
  }

  async findManyWithRelationships(criteria = {}) {
    const projects = await this.findMany(criteria)
    
    return Promise.all(projects.map(project => this.loadRelationships(project)))
  }

  async loadRelationships(project) {
    this.db.read()
    
    // Load owner
    const owner = this.db.data.users?.find(u => u.id === project.ownerId) || null
    
    // Load primary vendor
    const primaryVendor = project.primaryVendorId 
      ? this.db.data.vendors?.find(v => v.id === project.primaryVendorId) || null
      : null
    
    // Load funding lines
    const fundingLines = this.db.data.fundingLines?.filter(fl => 
      fl.projectId === project.id && fl.isActive !== false
    ) || []
    
    // Load project vendors with vendor details
    const projectVendors = this.db.data.projectVendors?.filter(pv => 
      pv.projectId === project.id && pv.isActive !== false
    ) || []
    
    const vendors = projectVendors.map(pv => ({
      ...pv,
      vendor: this.db.data.vendors?.find(v => v.id === pv.vendorId) || null
    }))
    
    // Load change orders
    const changeOrders = this.db.data.changeOrders?.filter(co => 
      co.projectId === project.id && co.isActive !== false
    ) || []
    
    // Load files
    const files = this.db.data.files?.filter(f => 
      f.projectId === project.id && f.isActive !== false
    ) || []
    
    // Load assignments
    const assignments = this.db.data.projectAssignments?.filter(pa => 
      pa.projectId === project.id && pa.isActive !== false
    ) || []
    
    const assignedUsers = assignments.map(assignment => ({
      ...assignment,
      user: this.db.data.users?.find(u => u.id === assignment.userId) || null
    }))

    return {
      ...project,
      owner,
      primaryVendor,
      fundingLines,
      vendors,
      changeOrders,
      files,
      assignments: assignedUsers
    }
  }
}

class UserRepository extends BaseRepository {
  constructor(db) {
    super(db, 'users')
  }

  async findByEmail(email) {
    return this.findOne({ email })
  }
}

class VendorRepository extends BaseRepository {
  constructor(db) {
    super(db, 'vendors')
  }

  async findByName(name) {
    return this.findOne({ name })
  }
}

class ProjectAssignmentRepository extends BaseRepository {
  constructor(db) {
    super(db, 'projectAssignments')
  }

  async findByUserAndProject(userId, projectId) {
    return this.findOne({ userId, projectId, isActive: true })
  }
}

class FundingLineRepository extends BaseRepository {
  constructor(db) {
    super(db, 'fundingLines')
  }
}

class ProjectVendorRepository extends BaseRepository {
  constructor(db) {
    super(db, 'projectVendors')
  }
}

class ChangeOrderRepository extends BaseRepository {
  constructor(db) {
    super(db, 'changeOrders')
  }
}

class FileRepository extends BaseRepository {
  constructor(db) {
    super(db, 'files')
  }
}

// Access Control Manager
class AccessControlManager {
  constructor(databaseService) {
    this.db = databaseService
  }

  async getAccessibleProjectIds(userId, userRole) {
    // Directors and Admins have access to all projects
    if (this.isUniversalRole(userRole)) {
      const allProjects = await this.db.repositories.projects.findMany()
      return allProjects.map(p => p.id)
    }

    // Get projects owned by user
    const ownedProjects = await this.db.repositories.projects.findMany({ ownerId: userId })
    const ownedProjectIds = ownedProjects.map(p => p.id)

    // Get projects assigned to user
    const assignments = await this.db.repositories.projectAssignments.findMany({
      userId,
      isActive: true
    })
    const assignedProjectIds = assignments.map(a => a.projectId)

    // Combine and deduplicate
    return [...new Set([...ownedProjectIds, ...assignedProjectIds])]
  }

  async canAccessProject(userId, projectId, requiredPermission = 'view') {
    const accessibleProjectIds = await this.getAccessibleProjectIds(userId)
    
    if (!accessibleProjectIds.includes(projectId)) {
      return false
    }

    // Check specific permission if required
    if (requiredPermission !== 'view') {
      return this.hasProjectPermission(userId, projectId, requiredPermission)
    }

    return true
  }

  async hasProjectPermission(userId, projectId, permission) {
    const project = await this.db.repositories.projects.findById(projectId)
    if (!project) return false

    // Project owner has all permissions
    if (project.ownerId === userId) return true

    // Check assignment permissions
    const assignment = await this.db.repositories.projectAssignments.findByUserAndProject(userId, projectId)
    if (!assignment) return false

    const permissionMap = {
      'edit': 'canEdit',
      'approve': 'canApprove',
      'comment': 'canComment',
      'viewFinancials': 'canViewFinancials'
    }

    const permissionKey = permissionMap[permission]
    return permissionKey ? assignment.permissions[permissionKey] === true : false
  }

  async canGrantAccess(granterId, projectId) {
    const granter = await this.db.repositories.users.findById(granterId)
    if (!granter) return false

    // Directors and Senior PMs can grant access
    if (this.isUniversalRole(granter.role)) return true

    // Project owners can grant access to their projects
    const project = await this.db.repositories.projects.findById(projectId)
    return project && project.ownerId === granterId
  }

  isUniversalRole(role) {
    return ['Director', 'Admin', 'Senior Project Manager'].includes(role)
  }
}

// Relationship Manager
class RelationshipManager {
  constructor(databaseService) {
    this.db = databaseService
  }

  async loadRelationships(entity, entityType, relationshipNames = []) {
    const entityRelationships = relationships[entityType]
    if (!entityRelationships) return entity

    const loadedEntity = { ...entity }

    for (const relationshipName of relationshipNames) {
      const relationship = entityRelationships[relationshipName]
      if (!relationship) continue

      if (relationship.type === 'belongsTo') {
        const relatedEntity = await this.db.repositories[relationship.entity]
          .findById(entity[relationship.foreignKey])
        loadedEntity[relationshipName] = relatedEntity
      } else if (relationship.type === 'hasMany') {
        const relatedEntities = await this.db.repositories[relationship.entity]
          .findMany({ [relationship.foreignKey]: entity.id })
        loadedEntity[relationshipName] = relatedEntities
      }
    }

    return loadedEntity
  }
}

// Unit of Work Pattern for Transaction-like Behavior
class UnitOfWork {
  constructor(db) {
    this.db = db
    this.operations = []
    this.repositories = {}
    
    // Create transaction-aware repositories
    for (const [name, repo] of Object.entries(db.repositories || {})) {
      this.repositories[name] = new TransactionRepository(repo, this)
    }
  }

  addOperation(operation) {
    this.operations.push(operation)
  }

  async commit() {
    // Execute all operations
    for (const operation of this.operations) {
      await operation.execute()
    }
    
    // Write to database
    this.db.db.write()
    this.operations = []
  }

  async rollback() {
    // Clear operations without executing
    this.operations = []
    // Reload database to discard any in-memory changes
    this.db.db.read()
  }
}

class TransactionRepository {
  constructor(baseRepository, unitOfWork) {
    this.baseRepository = baseRepository
    this.unitOfWork = unitOfWork
  }

  async create(data) {
    const operation = {
      type: 'create',
      repository: this.baseRepository,
      data,
      execute: async () => {
        return this.baseRepository.create(data)
      }
    }
    
    this.unitOfWork.addOperation(operation)
    
    // Return a promise that will resolve when the operation is executed
    return new Promise((resolve) => {
      operation.resolve = resolve
    })
  }

  // Delegate other methods to base repository
  async findById(id) {
    return this.baseRepository.findById(id)
  }

  async findMany(criteria) {
    return this.baseRepository.findMany(criteria)
  }

  async update(id, updates) {
    const operation = {
      type: 'update',
      repository: this.baseRepository,
      id,
      updates,
      execute: async () => {
        return this.baseRepository.update(id, updates)
      }
    }
    
    this.unitOfWork.addOperation(operation)
    return operation
  }
}

// Migration Manager
class MigrationManager {
  constructor(databaseService) {
    this.db = databaseService
  }

  async checkMigrationNeeded() {
    this.db.db.read()
    
    // Check if we have the new schema structure
    const hasMetadata = this.db.db.data._metadata
    const hasNewEntities = this.db.db.data.projectAssignments || this.db.db.data.fundingLines
    
    // If we have old structure but not new, migration is needed
    const hasOldProjects = this.db.db.data.projects && this.db.db.data.projects.length > 0
    const oldProjectStructure = hasOldProjects && this.db.db.data.projects[0].vendors && Array.isArray(this.db.db.data.projects[0].vendors)
    
    return oldProjectStructure && !hasNewEntities
  }

  async migrateToRelationalModel() {
    this.db.db.read()
    
    // Backup current data
    const backup = JSON.parse(JSON.stringify(this.db.db.data))
    
    try {
      // Initialize new schema structure
      const newData = { ...defaultRelationalSchema }
      
      // Migrate existing users (if any)
      if (backup.users) {
        newData.users = backup.users.map(user => ({
          ...user,
          permissions: this.getDefaultPermissionsForRole(user.role),
          isActive: true,
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString()
        }))
      }
      
      // Extract and migrate vendors from projects
      const vendorMap = new Map()
      let vendorIdCounter = 1
      
      if (backup.projects) {
        for (const project of backup.projects) {
          // Extract vendors from project.vendors array
          if (project.vendors && Array.isArray(project.vendors)) {
            for (const vendor of project.vendors) {
              if (vendor.name && !vendorMap.has(vendor.name)) {
                vendorMap.set(vendor.name, {
                  id: vendorIdCounter++,
                  name: vendor.name,
                  contactName: vendor.contactName || '',
                  email: vendor.email || '',
                  phone: vendor.phone || '',
                  vendorType: 'Contractor',
                  isActive: true,
                  metadata: {
                    totalProjects: 1,
                    activeProjects: 1,
                    averageRating: 4.0,
                    lastContractDate: new Date().toISOString(),
                    totalContractValue: vendor.currentCommitment || 0
                  },
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                })
              }
            }
          }
          
          // Extract primary contractor
          if (project.contractor && !vendorMap.has(project.contractor)) {
            vendorMap.set(project.contractor, {
              id: vendorIdCounter++,
              name: project.contractor,
              vendorType: 'Primary Contractor',
              isActive: true,
              metadata: {
                totalProjects: 1,
                activeProjects: 1,
                averageRating: 4.0,
                lastContractDate: new Date().toISOString(),
                totalContractValue: 0
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
          }
        }
      }
      
      newData.vendors = Array.from(vendorMap.values())
      
      // Migrate projects
      if (backup.projects) {
        newData.projects = backup.projects.map(project => {
          const primaryVendor = vendorMap.get(project.contractor)
          
          return {
            id: project.id,
            name: project.name,
            description: project.description || '',
            status: project.status || 'Active',
            reportStatus: project.reportStatus || 'Update Required',
            phase: project.phase || 'Planning',
            category: project.category || '',
            deliveryMethod: project.deliveryMethod || '',
            startDate: project.startDate,
            endDate: project.endDate,
            ownerId: project.ownerId || 1,
            primaryVendorId: primaryVendor?.id || null,
            clientMinistry: project.clientMinistry || '',
            projectType: project.projectType || '',
            branch: project.branch || '',
            location: {
              geographicRegion: project.geographicRegion || '',
              municipality: project.municipality || '',
              address: project.projectAddress || '',
              constituency: project.constituency || '',
              coordinates: {
                latitude: project.latitude || null,
                longitude: project.longitude || null
              }
            },
            building: {
              name: project.buildingName || '',
              type: project.buildingType || '',
              id: project.buildingId || '',
              primaryOwner: project.primaryOwner || '',
              squareMeters: project.squareMeters || 0,
              numberOfStructures: project.numberOfStructures || 0,
              numberOfJobs: project.numberOfJobs || 0
            },
            financial: {
              approvedTPC: project.approvedTPC || 0,
              totalBudget: project.totalBudget || 0,
              amountSpent: project.amountSpent || 0,
              taf: project.taf || 0,
              eac: project.eac || 0,
              currentYearCashflow: project.currentYearCashflow || 0,
              futureYearCashflow: project.futureYearCashflow || 0,
              currentYearBudgetTarget: project.currentYearBudgetTarget || 0,
              currentYearApprovedTarget: project.currentYearApprovedTarget || 0,
              variance: (project.eac || 0) - (project.approvedTPC || 0),
              lastFinancialUpdate: project.lastPfmtUpdate || new Date().toISOString()
            },
            statusTracking: {
              schedule: project.scheduleStatus || 'Green',
              budget: project.budgetStatus || 'Green',
              scope: project.scopeStatus || 'Green',
              scheduleReasonCode: project.scheduleReasonCode || '',
              budgetReasonCode: project.budgetReasonCode || '',
              lastStatusUpdate: new Date().toISOString()
            },
            workflow: {
              submittedBy: project.submittedBy,
              submittedDate: project.submittedDate,
              approvedBy: project.approvedBy,
              approvedDate: project.approvedDate,
              directorApproved: project.directorApproved || false,
              seniorPmReviewed: project.seniorPmReviewed || false,
              currentStage: 'In Progress',
              nextApprovalRequired: null
            },
            pfmt: {
              lastUpdate: project.lastPfmtUpdate,
              fileName: project.pfmtFileName,
              extractedAt: project.pfmtExtractedAt,
              sheetsProcessed: project.pfmtData?.sheetsProcessed || [],
              dataQuality: 'Good'
            },
            comments: {
              monthlyComments: project.monthlyComments || '',
              previousHighlights: project.previousHighlights || '',
              nextSteps: project.nextSteps || '',
              budgetVarianceExplanation: project.budgetVarianceExplanation || '',
              cashflowVarianceExplanation: project.cashflowVarianceExplanation || ''
            },
            milestones: project.milestones || {},
            createdAt: project.createdAt || new Date().toISOString(),
            updatedAt: project.updatedAt || new Date().toISOString(),
            createdFrom: project.createdFrom || 'Migration',
            lastUpdated: project.lastUpdated || new Date().toISOString()
          }
        })
      }
      
      // Create relationship entities
      this.createRelationshipEntities(newData, backup, vendorMap)
      
      // Update metadata
      newData._metadata.lastMigration = new Date().toISOString()
      
      // Write new data
      this.db.db.data = newData
      this.db.db.write()
      
      console.log('✅ Migration completed successfully')
      
    } catch (error) {
      console.error('❌ Migration failed, restoring backup:', error)
      this.db.db.data = backup
      this.db.db.write()
      throw error
    }
  }

  createRelationshipEntities(newData, backup, vendorMap) {
    let fundingLineId = 1
    let projectVendorId = 1
    let changeOrderId = 1
    
    if (backup.projects) {
      for (const project of backup.projects) {
        // Create funding lines
        if (project.fundingLines && Array.isArray(project.fundingLines)) {
          for (const fundingLine of project.fundingLines) {
            newData.fundingLines.push({
              id: fundingLineId++,
              projectId: project.id,
              source: fundingLine.source || '',
              description: fundingLine.description || '',
              capitalPlanLine: fundingLine.capitalPlanLine || '',
              wbs: fundingLine.wbs || '',
              projectCode: fundingLine.projectId || '',
              approvedValue: fundingLine.approvedValue || 0,
              currentYearBudget: fundingLine.currentYearBudget || 0,
              currentYearApproved: fundingLine.currentYearApproved || 0,
              spentToDate: 0,
              remainingBudget: (fundingLine.approvedValue || 0) - 0,
              fiscalYear: '2024-25',
              fundingType: 'Capital',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
          }
        }
        
        // Create project-vendor relationships
        if (project.vendors && Array.isArray(project.vendors)) {
          for (const vendor of project.vendors) {
            const vendorEntity = vendorMap.get(vendor.name)
            if (vendorEntity) {
              newData.projectVendors.push({
                id: projectVendorId++,
                projectId: project.id,
                vendorId: vendorEntity.id,
                contractId: vendor.contractId || '',
                vendorRole: vendor.name === project.contractor ? 'Primary Contractor' : 'Subcontractor',
                contractValue: vendor.currentCommitment || 0,
                currentCommitment: vendor.currentCommitment || 0,
                billedToDate: vendor.billedToDate || 0,
                holdback: vendor.holdback || 0,
                percentComplete: vendor.percentSpent || 0,
                contractStartDate: project.startDate,
                contractEndDate: project.endDate,
                status: 'Active',
                lastBillingDate: vendor.latestCostDate || null,
                cmsValue: vendor.cmsValue || 0,
                cmsAsOfDate: vendor.cmsAsOfDate || null,
                variance: vendor.variance || 0,
                performanceRating: 4.0,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              })
            }
          }
        }
        
        // Create change orders
        if (project.changeOrders && Array.isArray(project.changeOrders)) {
          for (const changeOrder of project.changeOrders) {
            const vendorEntity = vendorMap.get(changeOrder.vendor)
            newData.changeOrders.push({
              id: changeOrderId++,
              projectId: project.id,
              vendorId: vendorEntity?.id || null,
              contractId: changeOrder.contractId || '',
              referenceNumber: changeOrder.referenceNumber || '',
              status: changeOrder.status || 'Pending',
              requestDate: changeOrder.requestDate || new Date().toISOString(),
              approvedDate: changeOrder.approvedDate || null,
              value: changeOrder.value || 0,
              reasonCode: changeOrder.reasonCode || '',
              description: changeOrder.description || '',
              justification: changeOrder.notes || '',
              approvedBy: null,
              requestedBy: null,
              impactAnalysis: {
                scheduleImpact: 'None',
                budgetImpact: 'Increase',
                scopeImpact: 'Enhancement',
                riskAssessment: 'Low'
              },
              attachments: [],
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
          }
        }
      }
    }
  }

  getDefaultPermissionsForRole(role) {
    const permissionSets = {
      'Project Manager': {
        canCreateProjects: true,
        canViewAllProjects: false,
        canApproveReports: false,
        canManageUsers: false,
        canManageVendors: false
      },
      'Senior Project Manager': {
        canCreateProjects: true,
        canViewAllProjects: true,
        canApproveReports: true,
        canManageUsers: false,
        canManageVendors: true
      },
      'Director': {
        canCreateProjects: true,
        canViewAllProjects: true,
        canApproveReports: true,
        canManageUsers: true,
        canManageVendors: true
      }
    }
    
    return permissionSets[role] || permissionSets['Project Manager']
  }
}

// Create and export singleton instance
const enhancedDatabaseService = new EnhancedDatabaseService()

// Legacy compatibility functions
export function initializeDatabase() {
  return enhancedDatabaseService.initialize()
}

export function getDatabase() {
  return enhancedDatabaseService.db
}

export async function getAllProjects(filters = {}) {
  await enhancedDatabaseService.initialize()
  return enhancedDatabaseService.getProjectsForUser(
    filters.userId, 
    filters.userRole, 
    filters
  )
}

export async function getProjectById(id) {
  await enhancedDatabaseService.initialize()
  return enhancedDatabaseService.getProjectById(id)
}

export async function createProject(projectData, userContext = null) {
  await enhancedDatabaseService.initialize()
  return enhancedDatabaseService.createProject(projectData, userContext)
}

export async function updateProject(id, updates) {
  await enhancedDatabaseService.initialize()
  return enhancedDatabaseService.updateProject(id, updates)
}

export async function deleteProject(id) {
  await enhancedDatabaseService.initialize()
  return enhancedDatabaseService.repositories.projects.delete(id)
}

export async function getAllUsers() {
  await enhancedDatabaseService.initialize()
  return enhancedDatabaseService.getAllUsers()
}

export async function getUserById(id) {
  await enhancedDatabaseService.initialize()
  return enhancedDatabaseService.getUserById(id)
}

export async function createUser(userData) {
  await enhancedDatabaseService.initialize()
  return enhancedDatabaseService.repositories.users.create(userData)
}

export async function updateUser(id, updates) {
  await enhancedDatabaseService.initialize()
  return enhancedDatabaseService.repositories.users.update(id, updates)
}

export async function deleteUser(id) {
  await enhancedDatabaseService.initialize()
  return enhancedDatabaseService.repositories.users.delete(id)
}

// Export the enhanced service for direct access
export { enhancedDatabaseService }

// Initialize on module load
enhancedDatabaseService.initialize().catch(console.error)

