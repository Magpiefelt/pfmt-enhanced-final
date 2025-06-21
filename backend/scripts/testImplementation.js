// Test script for Company Model implementation
import * as db from '../services/database.js'
import CompanyService from '../services/companyService.js'
import VendorService from '../services/vendorService.js'
import DataMigration from './dataMigration.js'

async function runTests() {
  console.log('🧪 Running Company Model Implementation Tests')
  console.log('=============================================\n')
  
  try {
    // Initialize database
    console.log('📊 Initializing database...')
    db.initializeDatabase()
    console.log('✅ Database initialized\n')
    
    // Test 1: Company CRUD Operations
    console.log('🏢 Testing Company CRUD Operations...')
    
    // Create company
    const testCompany = {
      name: 'Test Construction Ltd.',
      contactPerson: 'Jane Doe',
      contactEmail: 'jane@testconstruction.com',
      contactPhone: '(403) 555-1234',
      address: '456 Test Street',
      city: 'Calgary',
      province: 'AB',
      postalCode: 'T2E 2B2'
    }
    
    const createdCompany = CompanyService.createCompany(testCompany)
    console.log(`✅ Created company: ${createdCompany.name} (ID: ${createdCompany.id})`)
    
    // Read company
    const retrievedCompany = CompanyService.getCompanyById(createdCompany.id)
    console.log(`✅ Retrieved company: ${retrievedCompany.name}`)
    
    // Update company
    const updatedCompany = CompanyService.updateCompany(createdCompany.id, {
      contactPhone: '(403) 555-5678'
    })
    console.log(`✅ Updated company phone: ${updatedCompany.contactPhone}`)
    
    // Test 2: Vendor Contract Operations
    console.log('\n🔗 Testing Vendor Contract Operations...')
    
    // Get a test project (use first available project)
    const projects = db.getAllProjects()
    if (projects.length === 0) {
      throw new Error('No projects available for testing')
    }
    const testProject = projects[0]
    console.log(`📋 Using test project: ${testProject.name} (ID: ${testProject.id})`)
    
    // Create vendor contract
    const vendorData = {
      projectId: testProject.id,
      companyId: createdCompany.id,
      contractId: 'TEST-001',
      role: 'Test Contractor',
      currentCommitment: 100000,
      billedToDate: 25000,
      status: 'Active'
    }
    
    const createdVendor = VendorService.createVendor(vendorData)
    console.log(`✅ Created vendor contract: ${createdVendor.id} for ${createdCompany.name}`)
    
    // Retrieve vendor with company info
    const vendorWithCompany = VendorService.getVendorById(createdVendor.id)
    console.log(`✅ Retrieved vendor with company: ${vendorWithCompany.company.name}`)
    
    // Get vendors for project
    const projectVendors = VendorService.getVendorsByProject(testProject.id)
    console.log(`✅ Found ${projectVendors.length} vendor(s) for project`)
    
    // Test 3: Migration Status
    console.log('\n🔄 Testing Migration Status...')
    const migrationStatus = DataMigration.getMigrationStatus()
    console.log(`📊 Migration Status:`)
    console.log(`   Total Projects: ${migrationStatus.totalProjects}`)
    console.log(`   Migrated Projects: ${migrationStatus.migratedProjects}`)
    console.log(`   Projects with Legacy Vendors: ${migrationStatus.projectsWithLegacyVendors}`)
    console.log(`   Total Companies: ${migrationStatus.totalCompanies}`)
    console.log(`   Total Vendor Contracts: ${migrationStatus.totalVendorContracts}`)
    console.log(`   Migration Needed: ${migrationStatus.migrationNeeded}`)
    
    // Test 4: Company Search
    console.log('\n🔍 Testing Company Search...')
    const searchResults = CompanyService.searchCompaniesByName('Test')
    console.log(`✅ Found ${searchResults.length} companies matching 'Test'`)
    
    // Test 5: Vendor Summary
    console.log('\n📈 Testing Vendor Summary...')
    const vendorSummary = VendorService.getVendorSummaryForProject(testProject.id)
    console.log(`✅ Vendor Summary:`)
    console.log(`   Total Vendors: ${vendorSummary.totalVendors}`)
    console.log(`   Total Commitment: $${vendorSummary.totalCommitment.toLocaleString()}`)
    console.log(`   Total Billed: $${vendorSummary.totalBilled.toLocaleString()}`)
    console.log(`   Unique Companies: ${vendorSummary.uniqueCompanies}`)
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    VendorService.deleteVendor(createdVendor.id)
    console.log('✅ Deleted test vendor contract')
    
    CompanyService.deleteCompany(createdCompany.id)
    console.log('✅ Deleted test company')
    
    console.log('\n🎉 All tests passed successfully!')
    
    return {
      success: true,
      testsRun: 5,
      message: 'All Company Model implementation tests passed'
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error('Stack trace:', error.stack)
    
    return {
      success: false,
      error: error.message,
      message: 'Company Model implementation tests failed'
    }
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Test suite completed successfully')
        process.exit(0)
      } else {
        console.log('\n❌ Test suite failed')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('\n💥 Test suite crashed:', error)
      process.exit(1)
    })
}

export default runTests

