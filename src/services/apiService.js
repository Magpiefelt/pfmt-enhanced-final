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
        
        // Fallback: try to import store (this might cause circular dependency)
        const { useAuthStore } = require('../stores/index.js')
        const authStore = useAuthStore.getState()
        return authStore.currentUser
      } catch (error) {
        console.warn('Could not get current user from store, using default:', error)
        // Return default user context for development
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
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed')
      }

      console.log('✅ API Response received:', { 
        endpoint, 
        dataLength: data.data?.length, 
        userContext: data.userContext 
      })
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
        
        const { useAuthStore } = require('../stores/index.js')
        const authStore = useAuthStore.getState()
        return authStore.currentUser
      } catch (error) {
        console.warn('Could not get current user from store for upload:', error)
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

