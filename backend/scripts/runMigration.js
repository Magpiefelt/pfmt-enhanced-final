#!/usr/bin/env node

// Standalone migration script for command line execution
import DataMigration from './dataMigration.js'

// Parse command line arguments
const args = process.argv.slice(2)
const command = args[0]

async function main() {
  console.log('🚀 PFMT Vendor Data Migration Tool')
  console.log('=====================================\n')
  
  try {
    switch (command) {
      case 'status':
        console.log('📊 Checking migration status...\n')
        const status = DataMigration.getMigrationStatus()
        
        console.log('Migration Status:')
        console.log(`  Total Projects: ${status.totalProjects}`)
        console.log(`  Migrated Projects: ${status.migratedProjects}`)
        console.log(`  Projects with Legacy Vendors: ${status.projectsWithLegacyVendors}`)
        console.log(`  Total Companies: ${status.totalCompanies}`)
        console.log(`  Total Vendor Contracts: ${status.totalVendorContracts}`)
        console.log(`  Migration Needed: ${status.migrationNeeded ? 'Yes' : 'No'}`)
        break
        
      case 'migrate':
        console.log('🔄 Starting migration...\n')
        const result = await DataMigration.migrateVendorData()
        
        console.log('\n✅ Migration Summary:')
        console.log(`  Companies Created: ${result.companiesCreated}`)
        console.log(`  Vendor Contracts Migrated: ${result.vendorsMigrated}`)
        console.log(`  Projects Processed: ${result.projectsProcessed}`)
        break
        
      case 'rollback':
        console.log('🔙 Starting rollback...\n')
        const rollbackResult = await DataMigration.rollbackMigration()
        
        console.log('\n✅ Rollback Summary:')
        console.log(`  Projects Rolled Back: ${rollbackResult.projectsRolledBack}`)
        break
        
      case 'validate':
        console.log('🔍 Validating migration...\n')
        const validation = DataMigration.validateMigration()
        
        if (validation.success) {
          console.log('\n✅ Validation Summary:')
          console.log(`  Issues Found: ${validation.issues.length}`)
          console.log(`  Unused Companies: ${validation.unusedCompanies.length}`)
          
          if (validation.issues.length > 0) {
            console.log('\n⚠️  Issues:')
            validation.issues.forEach(issue => console.log(`  - ${issue}`))
          }
          
          if (validation.unusedCompanies.length > 0) {
            console.log('\nℹ️  Unused Companies:')
            validation.unusedCompanies.forEach(company => console.log(`  - ${company.name} (${company.id})`))
          }
        } else {
          console.log(`❌ Validation failed: ${validation.error}`)
        }
        break
        
      case 'help':
      case '--help':
      case '-h':
        showHelp()
        break
        
      default:
        console.log('❌ Unknown command. Use --help for usage information.')
        process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

function showHelp() {
  console.log('Usage: node runMigration.js <command>')
  console.log('')
  console.log('Commands:')
  console.log('  status    - Check migration status')
  console.log('  migrate   - Run the migration')
  console.log('  rollback  - Rollback the migration')
  console.log('  validate  - Validate migration integrity')
  console.log('  help      - Show this help message')
  console.log('')
  console.log('Examples:')
  console.log('  node runMigration.js status')
  console.log('  node runMigration.js migrate')
  console.log('  node runMigration.js validate')
}

// Run the script
main().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})

