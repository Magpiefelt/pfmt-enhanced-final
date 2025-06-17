// Enhanced Add New Project functionality with proper PFMT integration and error fixes
import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Plus, Building2, FileText, Users, MapPin, AlertCircle } from 'lucide-react'
import { useNotifications, useAuth, useProjects } from '../../hooks/index.js'
import { ProjectAPI, UserAPI } from '../../services/apiService.js'
import { PFMTDataExtractor } from '../PFMTDataExtractor.jsx'

export function AddNewProjectDialog({ onProjectCreated }) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [users, setUsers] = useState([])
  const [projectData, setProjectData] = useState({
    projectName: '',
    scopeDescription: '',
    preliminaryResourceRequirements: '',
    programAssignment: '',
    clientMinistry: '',
    projectType: '',
    assignedUsers: []
  })
  const { showSuccess, showError } = useNotifications()
  const { currentUser } = useAuth()
  const { refetch } = useProjects()

  // Load users when dialog opens
  React.useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open])

  const loadUsers = async () => {
    try {
      const response = await UserAPI.getUsers()
      setUsers(response.data || [])
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  // Only allow project managers and above to create projects
  const canCreateProjects = ['pm', 'spm', 'director', 'admin'].includes(currentUser.role)

  const handleInputChange = (field, value) => {
    setProjectData(prev => ({ ...prev, [field]: value }))
  }

  const handleUserAssignment = (userId) => {
    setProjectData(prev => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(userId)
        ? prev.assignedUsers.filter(id => id !== userId)
        : [...prev.assignedUsers, userId]
    }))
  }

  const handleCreateProject = async () => {
    setCreating(true)
    try {
      // Validate required fields
      const requiredFields = ['projectName', 'scopeDescription', 'programAssignment', 'clientMinistry', 'projectType']
      const missingFields = requiredFields.filter(field => !projectData[field]?.trim())
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      }

      // Create the new project with enhanced data model using real API
      const newProject = await ProjectAPI.createProject({
        name: projectData.projectName,
        description: projectData.scopeDescription,
        preliminaryResourceRequirements: projectData.preliminaryResourceRequirements,
        programAssignment: projectData.programAssignment,
        clientMinistry: projectData.clientMinistry,
        projectType: projectData.projectType,
        status: 'Active',
        phase: 'Initiation',
        // The backend will automatically set ownerId and createdBy from user context
      })

      // Refresh the projects list to show the new project
      if (refetch) {
        await refetch()
      }

      if (onProjectCreated) {
        onProjectCreated(newProject.data)
      }
      
      showSuccess('Project created successfully!')
      
      // Reset form
      setProjectData({
        projectName: '',
        scopeDescription: '',
        preliminaryResourceRequirements: '',
        programAssignment: '',
        clientMinistry: '',
        projectType: '',
        assignedUsers: []
      })
      setOpen(false)
    } catch (error) {
      showError('Failed to create project: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const isFormValid = () => {
    return projectData.projectName?.trim() && 
           projectData.scopeDescription?.trim() && 
           projectData.programAssignment?.trim() && 
           projectData.clientMinistry?.trim() && 
           projectData.projectType?.trim()
  }

  if (!canCreateProjects) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Only Project Managers and above can create new projects.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Create New Project</span>
          </DialogTitle>
          <DialogDescription>
            Initialize a new project with basic information and requirements. This will create a project entry that can be further developed and assigned to teams.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Name */}
          <div>
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              value={projectData.projectName}
              onChange={(e) => handleInputChange('projectName', e.target.value)}
              placeholder="Enter the official project name"
              className="mt-1"
            />
          </div>

          {/* General Scope Description */}
          <div>
            <Label htmlFor="scope-description">General Scope Description *</Label>
            <Textarea
              id="scope-description"
              value={projectData.scopeDescription}
              onChange={(e) => handleInputChange('scopeDescription', e.target.value)}
              placeholder="Provide a comprehensive description of the project scope, objectives, and expected outcomes"
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Preliminary Resource Requirements */}
          <div>
            <Label htmlFor="resource-requirements">Preliminary Resource Requirements</Label>
            <Textarea
              id="resource-requirements"
              value={projectData.preliminaryResourceRequirements}
              onChange={(e) => handleInputChange('preliminaryResourceRequirements', e.target.value)}
              placeholder="Describe initial resource needs including personnel, equipment, materials, and estimated budget ranges"
              rows={3}
              className="mt-1"
            />
            <p className="text-sm text-gray-600 mt-1">
              Include any known constraints, special requirements, or dependencies
            </p>
          </div>

          {/* Program Assignment */}
          <div>
            <Label htmlFor="program-assignment">Program Assignment *</Label>
            <Select value={projectData.programAssignment} onValueChange={(value) => handleInputChange('programAssignment', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select the program this project belongs to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="infrastructure">Infrastructure Development</SelectItem>
                <SelectItem value="education">Education Facilities</SelectItem>
                <SelectItem value="healthcare">Healthcare Infrastructure</SelectItem>
                <SelectItem value="transportation">Transportation Systems</SelectItem>
                <SelectItem value="housing">Housing & Community Development</SelectItem>
                <SelectItem value="environment">Environmental Projects</SelectItem>
                <SelectItem value="technology">Technology Infrastructure</SelectItem>
                <SelectItem value="emergency">Emergency Services</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Ministry Identification */}
          <div>
            <Label htmlFor="client-ministry">Client Ministry Identification *</Label>
            <Select value={projectData.clientMinistry} onValueChange={(value) => handleInputChange('clientMinistry', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select the responsible ministry or department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="education">Ministry of Education</SelectItem>
                <SelectItem value="health">Ministry of Health</SelectItem>
                <SelectItem value="transportation">Ministry of Transportation</SelectItem>
                <SelectItem value="infrastructure">Ministry of Infrastructure</SelectItem>
                <SelectItem value="environment">Ministry of Environment</SelectItem>
                <SelectItem value="justice">Ministry of Justice</SelectItem>
                <SelectItem value="municipal">Municipal Affairs</SelectItem>
                <SelectItem value="agriculture">Ministry of Agriculture</SelectItem>
                <SelectItem value="energy">Ministry of Energy</SelectItem>
                <SelectItem value="finance">Ministry of Finance</SelectItem>
                <SelectItem value="other">Other Ministry/Department</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project Type */}
          <div>
            <Label htmlFor="project-type">Project Type *</Label>
            <Select value={projectData.projectType} onValueChange={(value) => handleInputChange('projectType', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select the type of project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-construction">New Construction</SelectItem>
                <SelectItem value="renovation">Renovation/Modernization</SelectItem>
                <SelectItem value="expansion">Facility Expansion</SelectItem>
                <SelectItem value="maintenance">Major Maintenance</SelectItem>
                <SelectItem value="demolition">Demolition</SelectItem>
                <SelectItem value="infrastructure">Infrastructure Development</SelectItem>
                <SelectItem value="technology">Technology Implementation</SelectItem>
                <SelectItem value="planning">Planning/Design Study</SelectItem>
                <SelectItem value="emergency">Emergency Response</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Assignment */}
          <div>
            <Label>Initial Team Assignment (Optional)</Label>
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
              {users.length > 0 ? (
                users
                  .filter(user => user.id !== currentUser.id) // Exclude current user as they're automatically the owner
                  .map(user => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={projectData.assignedUsers.includes(user.id)}
                        onChange={() => handleUserAssignment(user.id)}
                        className="rounded"
                      />
                      <label htmlFor={`user-${user.id}`} className="text-sm flex-1">
                        {user.name} - {user.role}
                      </label>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500">Loading users...</p>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              You will be automatically assigned as the project owner. Select additional team members to give them access to this project.
            </p>
          </div>

          {/* Information Box */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Next Steps After Creation
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Project will be assigned a unique identifier</li>
              <li>• You will be set as the project owner with full access</li>
              <li>• Selected team members will have project access</li>
              <li>• Detailed planning and budgeting can begin</li>
              <li>• PFMT workbook can be uploaded for financial tracking</li>
              <li>• Project milestones and timeline can be established</li>
              <li>• Vendors can be associated with the project</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateProject} 
            disabled={creating || !isFormValid()}
          >
            {creating ? 'Creating Project...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProjectManagerDashboard({ projects, onProjectCreated }) {
  const { currentUser } = useAuth()
  
  // Only show for project managers and above
  if (!['pm', 'spm', 'director', 'admin'].includes(currentUser.role)) {
    return null
  }

  // Enhanced project filtering with new data model
  const userProjects = projects.filter(p => {
    // Check if user is owner
    if (p.ownerId === currentUser.id) return true
    
    // Check if user is in userIds array
    if (p.userIds && p.userIds.includes(currentUser.id)) return true
    
    // Legacy compatibility - check by name
    if (p.projectManager === currentUser.name || 
        p.seniorProjectManager === currentUser.name) return true
    
    // Directors and admins see all projects
    if (currentUser.role === 'director' || currentUser.role === 'admin') return true
    
    return false
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Project Management</span>
        </CardTitle>
        <CardDescription>
          Create and manage projects in your portfolio. Enhanced with improved data model for better team collaboration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userProjects.length}</div>
              <div className="text-sm text-blue-800">Your Projects</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {userProjects.filter(p => p.status === 'Active').length}
              </div>
              <div className="text-sm text-green-800">Active</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {userProjects.filter(p => p.reportStatus === 'Update Required').length}
              </div>
              <div className="text-sm text-yellow-800">Need Updates</div>
            </div>
          </div>
          
          <AddNewProjectDialog onProjectCreated={onProjectCreated} />
          
          <div className="text-sm text-gray-600">
            <p><strong>Enhanced Project Creation Process:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Provide basic project information and scope</li>
              <li>Identify client ministry and program assignment</li>
              <li>Specify preliminary resource requirements</li>
              <li>Assign initial team members with proper access control</li>
              <li>System generates project ID with improved data structure</li>
              <li>Enhanced file management and vendor association capabilities</li>
              <li>Better integration with PFMT data extraction</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

