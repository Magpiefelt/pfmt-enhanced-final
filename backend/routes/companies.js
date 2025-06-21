// Company routes
import express from 'express'
import CompanyController from '../controllers/companyController.js'

const router = express.Router()

// Company CRUD routes
router.get('/', CompanyController.getAllCompanies)
router.get('/with-vendor-count', CompanyController.getCompaniesWithVendorCount)
router.get('/:id', CompanyController.getCompanyById)
router.post('/', CompanyController.createCompany)
router.put('/:id', CompanyController.updateCompany)
router.delete('/:id', CompanyController.deleteCompany)

export default router

