// User context middleware to extract user information from headers
export const userContextMiddleware = (req, res, next) => {
  // Extract user information from headers sent by frontend
  const userId = req.headers['x-user-id']
  const userRole = req.headers['x-user-role']
  const userName = req.headers['x-user-name']
  
  // If user headers are present, create user context
  if (userId && userRole && userName) {
    req.user = {
      id: parseInt(userId),
      role: userRole,
      name: userName
    }
    console.log('✅ User context set:', req.user)
  } else {
    console.log('⚠️ No user context headers found')
    req.user = null
  }
  
  next()
}

// Enhanced error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  
  // Handle multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large',
      message: 'File size must be less than 50MB'
    })
  }
  
  if (err.message && err.message.includes('Only Excel files')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: 'Only Excel files (.xlsx, .xlsm) are allowed'
    })
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
}

