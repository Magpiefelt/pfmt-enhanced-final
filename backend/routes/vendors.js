// Enhanced Vendor routes - includes essential extraction functionality
import express from 'express'
import VendorController from '../controllers/vendorController.js'

const router = express.Router()

// Standalone vendor routes (EXISTING - preserved)
router.get('/:id', VendorController.getVendorById)
router.put('/:id', VendorController.updateVendor)
router.delete('/:id', VendorController.deleteVendor)

export default router

// Project-specific vendor routes (EXISTING + ESSENTIAL ENHANCED)
export const projectVendorRouter = express.Router({ mergeParams: true })

// EXISTING functionality - preserved exactly as before
projectVendorRouter.get('/', VendorController.getVendorsByProject)
projectVendorRouter.post('/', VendorController.createVendor)

// ESSENTIAL ENHANCED functionality - needed for extraction to work
// These routes are required by the frontend VendorsTab component
projectVendorRouter.get('/dashboard', VendorController.getVendorDashboard)
projectVendorRouter.get('/extraction-history', VendorController.getExtractionHistory)
projectVendorRouter.post('/extract', VendorController.extractVendorsFromSpreadsheet)
projectVendorRouter.post('/preview', VendorController.previewVendorExtraction)

// Company-specific vendor routes (EXISTING - preserved)
export const companyVendorRouter = express.Router({ mergeParams: true })

// Note: Only uncomment if getVendorsByCompany method exists in your VendorController
// companyVendorRouter.get('/', VendorController.getVendorsByCompany)

