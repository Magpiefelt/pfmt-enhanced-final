#!/usr/bin/env node

// Migration Script for PFMT Enhanced Application
// Converts existing JSON data to new relational data model

import { enhancedDatabaseService } from '../services/enhancedDatabase.js'
import { Low } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class MigrationScript {
  constructor() {
    this.backupPath = path.join(__dirname, '..', 'db_backup.json')
    this.dbPath = path.join(__dirname, '..', 'db.json')
  }

  async run() {
    console.log('🚀 Starting PFMT Enhanced Data Migration')
    console.log('=====================================')
    
    try {
      // Step 1: Create backup
      await this.createBackup()
      
      // Step 2: Check if migration is needed
      const needsMigration = await this.checkMigrationNeeded()
      
      if (!needsMigration) {
        console.log('✅ Database is already using the new relational model')
        return
      }
      
      // Step 3: Run migration
      await this.runMigration()
      
      // Step 4: Validate migration
      await this.validateMigration()
      
      console.log('✅ Migration completed successfully!')
      console.log('📊 Migration Summary:')
      await this.printMigrationSummary()
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message)
      console.log('🔄 Restoring from backup...')
      await this.restoreFromBackup()
      throw error
    }
  }

  async createBackup() {
    console.log('📦 Creating backup of current database...')
    
    if (fs.existsSync(this.dbPath)) {
      const currentData = fs.readFileSync(this.dbPath, 'utf8')
      fs.writeFileSync(this.backupPath, currentData)
      console.log(`✅ Backup created at: ${this.backupPath}`)
    } else {
      console.log('⚠️  No existing database found, creating new one')
    }
  }

  async checkMigrationNeeded() {
    console.log('🔍 Checking if migration is needed...')
    
    if (!fs.existsSync(this.dbPath)) {
      console.log('📝 No existing database found, will create new relational structure')
      return false
    }
    
    const adapter = new JSONFileSync(this.dbPath)
    const db = new Low(adapter, {})
    db.read()
    
    // Check for new relational structure
    const hasMetadata = db.data._metadata
    const hasNewEntities = db.data.projectAssignments || db.data.fundingLines || db.data.projectVendors
    
    // Check for old structure
    const hasOldProjects = db.data.projects && db.data.projects.length > 0
    const hasOldStructure = hasOldProjects && db.data.projects[0].vendors && Array.isArray(db.data.projects[0].vendors)
    
    const migrationNeeded = hasOldStructure && !hasNewEntities
    
    console.log(`📋 Migration assessment:`)
    console.log(`   - Has metadata: ${!!hasMetadata}`)
    console.log(`   - Has new entities: ${!!hasNewEntities}`)
    console.log(`   - Has old structure: ${!!hasOldStructure}`)
    console.log(`   - Migration needed: ${migrationNeeded}`)
    
    return migrationNeeded
  }

  async runMigration() {
    console.log('🔄 Running migration to relational data model...')
    
    // Initialize the enhanced database service, which will trigger migration
    await enhancedDatabaseService.initialize()
    
    console.log('✅ Migration completed')
  }

  async validateMigration() {
    console.log('🔍 Validating migration results...')
    
    const adapter = new JSONFileSync(this.dbPath)
    const db = new Low(adapter, {})
    db.read()
    
    // Check that all required entities exist
    const requiredEntities = [
      'users', 'vendors', 'projects', 'projectAssignments', 
      'fundingLines', 'projectVendors', 'changeOrders', 'files'
    ]
    
    const missingEntities = []
    for (const entity of requiredEntities) {
      if (!db.data[entity]) {
        missingEntities.push(entity)
      }
    }
    
    if (missingEntities.length > 0) {
      throw new Error(`Missing entities after migration: ${missingEntities.join(', ')}`)
    }
    
    // Check that metadata exists
    if (!db.data._metadata) {
      throw new Error('Missing metadata after migration')
    }
    
    // Check that projects have proper structure
    if (db.data.projects && db.data.projects.length > 0) {
      const sampleProject = db.data.projects[0]
      
      const requiredProjectFields = ['financial', 'location', 'building', 'statusTracking', 'workflow', 'pfmt']
      const missingFields = requiredProjectFields.filter(field => !sampleProject[field])
      
      if (missingFields.length > 0) {
        throw new Error(`Projects missing required fields: ${missingFields.join(', ')}`)
      }
    }
    
    console.log('✅ Migration validation passed')
  }

  async printMigrationSummary() {
    const adapter = new JSONFileSync(this.dbPath)
    const db = new Low(adapter, {})
    db.read()
    
    const summary = {
      users: db.data.users?.length || 0,
      vendors: db.data.vendors?.length || 0,
      projects: db.data.projects?.length || 0,
      projectAssignments: db.data.projectAssignments?.length || 0,
      fundingLines: db.data.fundingLines?.length || 0,
      projectVendors: db.data.projectVendors?.length || 0,
      changeOrders: db.data.changeOrders?.length || 0,
      files: db.data.files?.length || 0
    }
    
    console.log('   Entity Counts:')
    for (const [entity, count] of Object.entries(summary)) {
      console.log(`   - ${entity}: ${count}`)
    }
    
    console.log(`   Schema Version: ${db.data._metadata?.version || 'Unknown'}`)
    console.log(`   Last Migration: ${db.data._metadata?.lastMigration || 'Unknown'}`)
  }

  async restoreFromBackup() {
    if (fs.existsSync(this.backupPath)) {
      const backupData = fs.readFileSync(this.backupPath, 'utf8')
      fs.writeFileSync(this.dbPath, backupData)
      console.log('✅ Database restored from backup')
    } else {
      console.log('⚠️  No backup found to restore from')
    }
  }

  // Additional utility methods
  async dryRun() {
    console.log('🧪 Running migration dry run (no changes will be made)')
    console.log('================================================')
    
    const needsMigration = await this.checkMigrationNeeded()
    
    if (!needsMigration) {
      console.log('✅ No migration needed')
      return
    }
    
    // Simulate migration without actually changing data
    const adapter = new JSONFileSync(this.dbPath)
    const db = new Low(adapter, {})
    db.read()
    
    const backup = JSON.parse(JSON.stringify(db.data))
    
    console.log('📊 Current Data Analysis:')
    console.log(`   Projects: ${backup.projects?.length || 0}`)
    console.log(`   Users: ${backup.users?.length || 0}`)
    
    if (backup.projects && backup.projects.length > 0) {
      // Analyze vendor extraction
      const vendorNames = new Set()
      let totalFundingLines = 0
      let totalChangeOrders = 0
      
      for (const project of backup.projects) {
        if (project.vendors && Array.isArray(project.vendors)) {
          project.vendors.forEach(vendor => vendorNames.add(vendor.name))
        }
        if (project.contractor) {
          vendorNames.add(project.contractor)
        }
        if (project.fundingLines) {
          totalFundingLines += project.fundingLines.length
        }
        if (project.changeOrders) {
          totalChangeOrders += project.changeOrders.length
        }
      }
      
      console.log('📈 Migration Preview:')
      console.log(`   Vendors to be extracted: ${vendorNames.size}`)
      console.log(`   Funding lines to be created: ${totalFundingLines}`)
      console.log(`   Change orders to be created: ${totalChangeOrders}`)
      console.log(`   Project-vendor relationships to be created: ${Array.from(vendorNames).length}`)
    }
    
    console.log('✅ Dry run completed')
  }

  async rollback() {
    console.log('🔄 Rolling back to previous version...')
    
    if (!fs.existsSync(this.backupPath)) {
      throw new Error('No backup found to rollback to')
    }
    
    await this.restoreFromBackup()
    console.log('✅ Rollback completed')
  }

  async status() {
    console.log('📊 Migration Status')
    console.log('==================')
    
    if (!fs.existsSync(this.dbPath)) {
      console.log('❌ No database found')
      return
    }
    
    const adapter = new JSONFileSync(this.dbPath)
    const db = new Low(adapter, {})
    db.read()
    
    const hasMetadata = !!db.data._metadata
    const hasNewEntities = !!(db.data.projectAssignments || db.data.fundingLines)
    const hasOldStructure = !!(db.data.projects && db.data.projects.length > 0 && 
                              db.data.projects[0].vendors && Array.isArray(db.data.projects[0].vendors))
    
    console.log(`Schema Version: ${db.data._metadata?.version || 'Legacy'}`)
    console.log(`Has Metadata: ${hasMetadata}`)
    console.log(`Has New Entities: ${hasNewEntities}`)
    console.log(`Has Old Structure: ${hasOldStructure}`)
    
    if (hasMetadata && hasNewEntities && !hasOldStructure) {
      console.log('✅ Database is using new relational model')
    } else if (hasOldStructure && !hasNewEntities) {
      console.log('⚠️  Database is using legacy model - migration needed')
    } else {
      console.log('❓ Database is in mixed state - manual review needed')
    }
    
    if (db.data._metadata?.lastMigration) {
      console.log(`Last Migration: ${db.data._metadata.lastMigration}`)
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'run'
  
  const migration = new MigrationScript()
  
  try {
    switch (command) {
      case 'run':
        await migration.run()
        break
      case 'dry-run':
        await migration.dryRun()
        break
      case 'rollback':
        await migration.rollback()
        break
      case 'status':
        await migration.status()
        break
      case 'backup':
        await migration.createBackup()
        console.log('✅ Backup created')
        break
      default:
        console.log('Usage: node migrate.js [command]')
        console.log('Commands:')
        console.log('  run      - Run the migration (default)')
        console.log('  dry-run  - Preview migration without making changes')
        console.log('  rollback - Restore from backup')
        console.log('  status   - Check current migration status')
        console.log('  backup   - Create backup of current database')
        process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { MigrationScript }

