// Vendor routes
import express from 'express'
import VendorController from '../controllers/vendorController.js'

const router = express.Router()

// Standalone vendor routes
router.get('/:id', VendorController.getVendorById)
router.put('/:id', VendorController.updateVendor)
router.delete('/:id', VendorController.deleteVendor)

export default router

// Project-specific vendor routes (to be mounted under projects)
export const projectVendorRouter = express.Router({ mergeParams: true })

projectVendorRouter.get('/', VendorController.getVendorsByProject)
projectVendorRouter.get('/summary', VendorController.getVendorSummaryForProject)
projectVendorRouter.post('/', VendorController.createVendor)

// Company-specific vendor routes (to be mounted under companies)
export const companyVendorRouter = express.Router({ mergeParams: true })

companyVendorRouter.get('/', VendorController.getVendorsByCompany)

