// Migration controller for handling data migration HTTP requests
import DataMigration from '../scripts/dataMigration.js'

export class MigrationController {
  // GET /api/migration/status
  static async getMigrationStatus(req, res) {
    try {
      const status = DataMigration.getMigrationStatus()
      
      res.json({
        success: true,
        data: status
      })
    } catch (error) {
      console.error('Error getting migration status:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get migration status',
        message: error.message
      })
    }
  }
  
  // POST /api/migration/migrate
  static async runMigration(req, res) {
    try {
      console.log('🚀 Migration requested via API')
      const result = await DataMigration.migrateVendorData()
      
      res.json({
        success: true,
        data: result,
        message: 'Migration completed successfully'
      })
    } catch (error) {
      console.error('Error running migration:', error)
      res.status(500).json({
        success: false,
        error: 'Migration failed',
        message: error.message
      })
    }
  }
  
  // POST /api/migration/rollback
  static async rollbackMigration(req, res) {
    try {
      console.log('🔙 Migration rollback requested via API')
      const result = await DataMigration.rollbackMigration()
      
      res.json({
        success: true,
        data: result,
        message: 'Migration rollback completed successfully'
      })
    } catch (error) {
      console.error('Error rolling back migration:', error)
      res.status(500).json({
        success: false,
        error: 'Migration rollback failed',
        message: error.message
      })
    }
  }
  
  // GET /api/migration/validate
  static async validateMigration(req, res) {
    try {
      const result = DataMigration.validateMigration()
      
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Error validating migration:', error)
      res.status(500).json({
        success: false,
        error: 'Migration validation failed',
        message: error.message
      })
    }
  }
}

export default MigrationController

