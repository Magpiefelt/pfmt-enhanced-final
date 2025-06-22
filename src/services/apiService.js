// Enhanced API service with FIXED user context support
const API_BASE_URL = 'http://localhost:3001/api'

class ApiService {
  // Helper method for making HTTP requests with user context
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    // Get current user from auth store - FIXED to avoid circular dependency
    const getCurrentUser = () => {
      try {
        // Access the store directly from window if available (browser environment)
        if (typeof window !== 'undefined' && window.__ZUSTAND_STORES__) {
          const authStore = window.__ZUSTAND_STORES__.auth
          return authStore?.getState()?.currentUser
        }
        
        // Try localStorage/sessionStorage fallback
        const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser')
        if (userStr) {
          return JSON.parse(userStr)
        }
        
        // Return default user context for development
        return {
          id: 1,
          name: "Sarah Johnson",
          role: "Project Manager"
        }
      } catch (error) {
        console.warn('Could not get current user from store, using default:', error.message)
        return {
          id: 1,
          name: "Sarah Johnson",
          role: "Project Manager"
        }
      }
    }
    
    const currentUser = getCurrentUser()
    console.log('🔍 API Request - Current User:', currentUser)
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        // Add user context to headers - FIXED to ensure proper format
        ...(currentUser && {
          'X-User-Id': currentUser.id.toString(),
          'X-User-Role': currentUser.role,
          'X-User-Name': currentUser.name
        }),
        ...options.headers
      },
      ...options
    }

    console.log('🔍 API Request Headers:', config.headers)

    try {
      const response = await fetch(url, config)
      console.log('✅ API Response received:', response)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Route ${endpoint} not found`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('❌ API request failed:', error)
      throw error
    }
  }

  // Helper method for file uploads with user context
  static async uploadFile(endpoint, file, additionalData = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const formData = new FormData()
    formData.append('file', file)
    
    // Get current user from auth store - FIXED
    const getCurrentUser = () => {
      try {
        if (typeof window !== 'undefined' && window.__ZUSTAND_STORES__) {
          const authStore = window.__ZUSTAND_STORES__.auth
          return authStore?.getState()?.currentUser
        }
        
        // Try localStorage/sessionStorage fallback
        const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser')
        if (userStr) {
          return JSON.parse(userStr)
        }
        
        return {
          id: 1,
          name: "Sarah Johnson", 
          role: "Project Manager"
        }
      } catch (error) {
        console.warn('Could not get current user from store for upload:', error.message)
        return {
          id: 1,
          name: "Sarah Johnson", 
          role: "Project Manager"
        }
      }
    }
    
    const currentUser = getCurrentUser()
    
    // Add any additional form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key])
    })

    const headers = {}
    // Add user context to headers - FIXED
    if (currentUser) {
      headers['X-User-Id'] = currentUser.id.toString()
      headers['X-User-Role'] = currentUser.role
      headers['X-User-Name'] = currentUser.name
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'File upload failed')
      }

      return data
    } catch (error) {
      console.error('File upload failed:', error)
      throw error
    }
  }
}

// Project API methods
export class ProjectAPI {
  // Get all projects with pagination and filtering
  static async getProjects(options = {}) {
    const {
      page = 1,
      limit = 10,
      ownerId,
      status,
      reportStatus
    } = options

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (ownerId) params.append('ownerId', ownerId.toString())
    if (status) params.append('status', status)
    if (reportStatus) params.append('reportStatus', reportStatus)

    console.log('🔍 ProjectAPI.getProjects called with options:', options)
    const result = await ApiService.request(`/projects?${params}`)
    console.log('✅ ProjectAPI.getProjects result:', { 
      projectCount: result.data?.length, 
      userContext: result.userContext 
    })
    return result
  }

  // Get single project by ID
  static async getProject(id) {
    return await ApiService.request(`/projects/${id}`)
  }

  // Create new project with user context
  static async createProject(projectData) {
    console.log('🔍 ProjectAPI.createProject called with:', projectData)
    const result = await ApiService.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    })
    console.log('✅ ProjectAPI.createProject result:', result)
    return result
  }

  // Update project
  static async updateProject(id, updates) {
    return await ApiService.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  // Delete project
  static async deleteProject(id) {
    return await ApiService.request(`/projects/${id}`, {
      method: 'DELETE'
    })
  }

  // Upload Excel file to project
  static async uploadExcel(projectId, file) {
    return await ApiService.uploadFile(`/projects/${projectId}/excel`, file)
  }

  // Upload PFMT Excel file to project
  static async uploadPFMTExcel(projectId, file) {
    return await ApiService.uploadFile(`/projects/${projectId}/pfmt-excel`, file)
  }
}

// User API methods
export class UserAPI {
  // Get all users
  static async getUsers() {
    return await ApiService.request('/users')
  }

  // Get single user by ID
  static async getUser(id) {
    return await ApiService.request(`/users/${id}`)
  }

  // Create new user
  static async createUser(userData) {
    return await ApiService.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  // Update user
  static async updateUser(id, updates) {
    return await ApiService.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  // Delete user
  static async deleteUser(id) {
    return await ApiService.request(`/users/${id}`, {
      method: 'DELETE'
    })
  }
}


// Company API methods
export class CompanyAPI {
  // Get all companies
  static async getCompanies(searchTerm = '') {
    const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''
    return await ApiService.request(`/companies${params}`)
  }

  // Get single company by ID
  static async getCompany(id) {
    return await ApiService.request(`/companies/${id}`)
  }

  // Create new company
  static async createCompany(companyData) {
    return await ApiService.request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData)
    })
  }

  // Update company
  static async updateCompany(id, updates) {
    return await ApiService.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  // Delete company
  static async deleteCompany(id) {
    return await ApiService.request(`/companies/${id}`, {
      method: 'DELETE'
    })
  }

  // Get companies with vendor count
  static async getCompaniesWithVendorCount() {
    return await ApiService.request('/companies/with-vendor-count')
  }

  // Get vendors for a company
  static async getCompanyVendors(companyId) {
    return await ApiService.request(`/companies/${companyId}/vendors`)
  }
}

// Vendor API methods
export class VendorAPI {
  // Get vendors for a project
  static async getProjectVendors(projectId) {
    return await ApiService.request(`/projects/${projectId}/vendors`)
  }

  // Get vendor summary for a project
  static async getProjectVendorSummary(projectId) {
    return await ApiService.request(`/projects/${projectId}/vendors/summary`)
  }

  // Get single vendor by ID
  static async getVendor(id) {
    return await ApiService.request(`/vendors/${id}`)
  }

  // Create new vendor contract
  static async createVendor(projectId, vendorData) {
    return await ApiService.request(`/projects/${projectId}/vendors`, {
      method: 'POST',
      body: JSON.stringify(vendorData)
    })
  }

  // Update vendor contract
  static async updateVendor(id, updates) {
    return await ApiService.request(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  // Delete vendor contract
  static async deleteVendor(id) {
    return await ApiService.request(`/vendors/${id}`, {
      method: 'DELETE'
    })
  }

  // Get vendor dashboard summary
  static async getVendorDashboard(projectId) {
    return await ApiService.request(`/projects/${projectId}/vendors/dashboard`)
  }

  // Get extraction history
  static async getExtractionHistory(projectId) {
    return await ApiService.request(`/projects/${projectId}/vendors/extraction-history`)
  }

  // Extract vendors from spreadsheet
  static async extractVendorsFromSpreadsheet(projectId, formData) {
    return await ApiService.request(`/projects/${projectId}/vendors/extract`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData
    })
  }

  // Preview vendor extraction
  static async previewVendorExtraction(projectId, formData) {
    return await ApiService.request(`/projects/${projectId}/vendors/preview`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData
    })
  }

  // Main method for getting vendors (uses regular route, not enhanced)
  static async getVendorsByProject(projectId) {
    return await this.getProjectVendors(projectId)
  }
}


// Migration API methods
export class MigrationAPI {
  // Get migration status
  static async getMigrationStatus() {
    return await ApiService.request('/migration/status')
  }

  // Run migration
  static async runMigration() {
    return await ApiService.request('/migration/migrate', {
      method: 'POST'
    })
  }

  // Rollback migration
  static async rollbackMigration() {
    return await ApiService.request('/migration/rollback', {
      method: 'POST'
    })
  }

  // Validate migration
  static async validateMigration() {
    return await ApiService.request('/migration/validate')
  }
}

