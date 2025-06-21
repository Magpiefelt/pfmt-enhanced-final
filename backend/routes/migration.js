// Migration routes
import express from 'express'
import MigrationController from '../controllers/migrationController.js'

const router = express.Router()

// Migration management routes
router.get('/status', MigrationController.getMigrationStatus)
router.post('/migrate', MigrationController.runMigration)
router.post('/rollback', MigrationController.rollbackMigration)
router.get('/validate', MigrationController.validateMigration)

export default router

