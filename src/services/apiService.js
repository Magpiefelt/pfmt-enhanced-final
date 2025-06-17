// Enhanced API service with user context support
const API_BASE_URL = 'http://localhost:3001/api'

class ApiService {
  // Helper method for making HTTP requests with user context
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    // Get current user from auth store
    const getCurrentUser = () => {
      try {
        // Import the store dynamically to avoid circular dependencies
        const { useAuthStore } = require('../stores/index.js')
        const authStore = useAuthStore.getState()
        return authStore.currentUser
      } catch (error) {
        console.warn('Could not get current user from store:', error)
        return null
      }
    }
    
    const currentUser = getCurrentUser()
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        // Add user context to headers
        ...(currentUser && {
          'X-User-Id': currentUser.id.toString(),
          'X-User-Role': currentUser.role,
          'X-User-Name': currentUser.name
        }),
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed')
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Helper method for file uploads with user context
  static async uploadFile(endpoint, file, additionalData = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const formData = new FormData()
    formData.append('file', file)
    
    // Get current user from auth store
    const getCurrentUser = () => {
      try {
        const { useAuthStore } = require('../stores/index.js')
        const authStore = useAuthStore.getState()
        return authStore.currentUser
      } catch (error) {
        console.warn('Could not get current user from store:', error)
        return null
      }
    }
    
    const currentUser = getCurrentUser()
    
    // Add any additional form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key])
    })

    const headers = {}
    // Add user context to headers
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

    return await ApiService.request(`/projects?${params}`)
  }

  // Get single project by ID
  static async getProject(id) {
    return await ApiService.request(`/projects/${id}`)
  }

  // Create new project with user context
  static async createProject(projectData) {
    return await ApiService.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    })
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

  // Upload Excel file for project
  static async uploadExcel(projectId, file) {
    return await ApiService.uploadFile(`/projects/${projectId}/excel`, file)
  }

  // Upload PFMT Excel file and extract data
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

  // Get user by ID
  static async getUser(id) {
    return await ApiService.request(`/users/${id}`)
  }

  // Get users by role
  static async getUsersByRole(role) {
    return await ApiService.request(`/users/role/${role}`)
  }
}

// Legacy compatibility layer - provides the same interface as mockData.js
export const getProjects = async (filter = 'all') => {
  try {
    const options = {}
    
    // Map filter to API parameters
    switch (filter) {
      case 'active':
        options.status = 'Active'
        break
      case 'completed':
        options.status = 'Completed'
        break
      case 'pending':
        options.reportStatus = 'Update Required'
        break
      default:
        // No filter for 'all'
        break
    }

    const response = await ProjectAPI.getProjects(options)
    return response.data || []
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return []
  }
}

export const getProject = async (id) => {
  try {
    const response = await ProjectAPI.getProject(id)
    return response.data
  } catch (error) {
    console.error('Failed to fetch project:', error)
    return null
  }
}

export const updateProject = async (id, updates) => {
  try {
    const response = await ProjectAPI.updateProject(id, updates)
    return response.data
  } catch (error) {
    console.error('Failed to update project:', error)
    throw error
  }
}

export const createNewProject = async (projectData) => {
  try {
    const response = await ProjectAPI.createProject(projectData)
    return response.data
  } catch (error) {
    console.error('Failed to create project:', error)
    throw error
  }
}

// Mock data for submissions and milestones (these would need separate API endpoints in a full implementation)
export const getSubmissions = async (projectId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  return []
}

export const getMilestones = async (projectId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  return []
}

export const updateMilestone = async (milestoneId, updates) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  return updates
}

export const archiveMonthlyData = async (projectId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return true
}

// Update project with extracted PFMT data using the new API endpoint
export const uploadPFMTExcelFile = async (projectId, file) => {
  try {
    const response = await ProjectAPI.uploadPFMTExcel(projectId, file)
    return response
  } catch (error) {
    console.error('Failed to upload PFMT Excel file:', error)
    throw error
  }
}

