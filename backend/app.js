// Express app configuration
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes
import projectRoutes from './routes/projects.js'
import userRoutes from './routes/users.js'
import companyRoutes from './routes/companies.js'
import vendorRoutes, { projectVendorRouter, companyVendorRouter } from './routes/vendors.js'
import migrationRoutes from './routes/migration.js'

// Load environment variables
dotenv.config()

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create Express app
const app = express()

// Middleware
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Static file serving for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API Routes
app.use('/api/projects', projectRoutes)
app.use('/api/users', userRoutes)
app.use('/api/companies', companyRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/migration', migrationRoutes)

// Mount vendor sub-routes (enhanced functionality is now integrated into vendors.js)
app.use('/api/projects/:projectId/vendors', projectVendorRouter)
app.use('/api/companies/:companyId/vendors', companyVendorRouter)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'File size must be less than 50MB'
    })
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Invalid file',
      message: 'Only Excel files are allowed'
    })
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  })
})

export default app

