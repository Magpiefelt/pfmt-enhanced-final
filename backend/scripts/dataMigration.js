// Data migration script for converting legacy vendor data to Company/Vendor model
import * as db from '../services/database.js'
import CompanyService from '../services/companyService.js'
import VendorService from '../services/vendorService.js'

export class DataMigration {
  // Main migration function
  static async migrateVendorData() {
    console.log('🔄 Starting vendor data migration...')
    
    try {
      // Initialize database to ensure collections exist
      db.initializeDatabase()
      
      // Get all projects
      const projects = db.getAllProjects()
      console.log(`📊 Found ${projects.length} projects to migrate`)
      
      let totalVendorsMigrated = 0
      let totalCompaniesCreated = 0
      const companyMap = new Map() // Track created companies to avoid duplicates
      
      for (const project of projects) {
        if (project.vendors && Array.isArray(project.vendors) && project.vendors.length > 0) {
          console.log(`\n🏗️  Migrating project: ${project.name} (${project.vendors.length} vendors)`)
          
          const migratedVendors = []
          
          for (const legacyVendor of project.vendors) {
            try {
              // Extract company name from legacy vendor
              const companyName = legacyVendor.name || legacyVendor.vendor || 'Unknown Company'
              
              // Check if we already created this company
              let company = companyMap.get(companyName.toLowerCase())
              
              if (!company) {
                // Try to find existing company
                company = CompanyService.getCompanyByName(companyName)
                
                if (!company) {
                  // Create new company
                  console.log(`  📝 Creating company: ${companyName}`)
                  company = CompanyService.createCompanyFromVendorName(companyName)
                  totalCompaniesCreated++
                }
                
                // Cache the company
                companyMap.set(companyName.toLowerCase(), company)
              }
              
              // Create vendor contract using the new model
              console.log(`  🔗 Creating vendor contract for ${companyName}`)
              const vendorContract = VendorService.createVendorFromLegacy(legacyVendor, project.id)
              migratedVendors.push(vendorContract)
              totalVendorsMigrated++
              
            } catch (error) {
              console.error(`  ❌ Failed to migrate vendor: ${legacyVendor.name || 'Unknown'}`, error)
            }
          }
          
          // Update project to remove legacy vendor data (optional - keep for backup)
          // We'll keep the legacy data for now and just add a migration flag
          db.updateProject(project.id, {
            vendorsMigrated: true,
            vendorsMigratedAt: new Date().toISOString(),
            legacyVendors: project.vendors // Backup legacy data
          })
          
          console.log(`  ✅ Migrated ${migratedVendors.length} vendor contracts`)
        }
      }
      
      console.log(`\n🎉 Migration completed successfully!`)
      console.log(`📈 Summary:`)
      console.log(`   - Companies created: ${totalCompaniesCreated}`)
      console.log(`   - Vendor contracts migrated: ${totalVendorsMigrated}`)
      console.log(`   - Projects processed: ${projects.length}`)
      
      return {
        success: true,
        companiesCreated: totalCompaniesCreated,
        vendorsMigrated: totalVendorsMigrated,
        projectsProcessed: projects.length
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      throw error
    }
  }
  
  // Rollback migration (restore legacy vendor data)
  static async rollbackMigration() {
    console.log('🔄 Rolling back vendor data migration...')
    
    try {
      // Get all projects that were migrated
      const projects = db.getAllProjects()
      const migratedProjects = projects.filter(p => p.vendorsMigrated)
      
      console.log(`📊 Found ${migratedProjects.length} migrated projects to rollback`)
      
      for (const project of migratedProjects) {
        if (project.legacyVendors) {
          console.log(`🔙 Restoring legacy vendors for project: ${project.name}`)
          
          // Restore legacy vendor data
          db.updateProject(project.id, {
            vendors: project.legacyVendors,
            vendorsMigrated: false,
            vendorsMigratedAt: null,
            legacyVendors: null
          })
        }
        
        // Delete vendor contracts for this project
        const vendorContracts = db.getVendorsByProject(project.id)
        for (const vendor of vendorContracts) {
          db.deleteVendor(vendor.id)
        }
      }
      
      console.log('✅ Rollback completed successfully!')
      
      return {
        success: true,
        projectsRolledBack: migratedProjects.length
      }
      
    } catch (error) {
      console.error('❌ Rollback failed:', error)
      throw error
    }
  }
  
  // Check migration status
  static getMigrationStatus() {
    try {
      const projects = db.getAllProjects()
      const companies = db.getAllCompanies()
      const vendors = db.getAllVendors()
      
      const migratedProjects = projects.filter(p => p.vendorsMigrated)
      const projectsWithLegacyVendors = projects.filter(p => 
        p.vendors && Array.isArray(p.vendors) && p.vendors.length > 0 && !p.vendorsMigrated
      )
      
      return {
        totalProjects: projects.length,
        migratedProjects: migratedProjects.length,
        projectsWithLegacyVendors: projectsWithLegacyVendors.length,
        totalCompanies: companies.length,
        totalVendorContracts: vendors.length,
        migrationNeeded: projectsWithLegacyVendors.length > 0
      }
    } catch (error) {
      console.error('Error checking migration status:', error)
      return {
        error: error.message
      }
    }
  }
  
  // Validate migration integrity
  static validateMigration() {
    console.log('🔍 Validating migration integrity...')
    
    try {
      const projects = db.getAllProjects()
      const companies = db.getAllCompanies()
      const vendors = db.getAllVendors()
      
      const issues = []
      
      // Check for orphaned vendor contracts
      for (const vendor of vendors) {
        const project = projects.find(p => p.id === vendor.projectId)
        if (!project) {
          issues.push(`Orphaned vendor contract: ${vendor.id} (project ${vendor.projectId} not found)`)
        }
        
        const company = companies.find(c => c.id === vendor.companyId)
        if (!company) {
          issues.push(`Vendor contract ${vendor.id} references non-existent company: ${vendor.companyId}`)
        }
      }
      
      // Check for companies without vendor contracts
      const companiesWithVendors = new Set(vendors.map(v => v.companyId))
      const unusedCompanies = companies.filter(c => !companiesWithVendors.has(c.id))
      
      console.log(`✅ Validation completed`)
      console.log(`📊 Results:`)
      console.log(`   - Issues found: ${issues.length}`)
      console.log(`   - Unused companies: ${unusedCompanies.length}`)
      
      if (issues.length > 0) {
        console.log(`⚠️  Issues:`)
        issues.forEach(issue => console.log(`   - ${issue}`))
      }
      
      if (unusedCompanies.length > 0) {
        console.log(`ℹ️  Unused companies:`)
        unusedCompanies.forEach(company => console.log(`   - ${company.name} (${company.id})`))
      }
      
      return {
        success: true,
        issues,
        unusedCompanies: unusedCompanies.map(c => ({ id: c.id, name: c.name }))
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default DataMigration

