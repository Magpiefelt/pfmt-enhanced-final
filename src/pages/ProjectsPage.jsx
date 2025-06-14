// COMPLETE FIXED ProjectsPage.jsx - Integrates with existing structure
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ProjectList } from '../components/projects/ProjectList.jsx'
import { ProjectOverview } from '../components/projects/ProjectProfileComponents.jsx'
import { PFMTDataExtractor } from '../components/PFMTDataExtractor.jsx'
import { Button } from '@/components/ui/button.jsx'
import { ArrowLeft, Upload, Edit, Save, X } from 'lucide-react'

// Mock current user - replace with actual auth
const getCurrentUser = () => ({
  id: 'user123',
  name: 'Sarah Johnson',
  role: 'pm' // pm, spm, director, admin, vendor
})

// Mock project data - replace with actual API calls
const mockProjects = [
  {
    id: 1,
    name: 'Calgary Elementary School Renovation',
    description: 'Complete renovation of elementary school facilities including classroom upgrades and safety improvements',
    contractor: 'ABC Construction Ltd.',
    projectManager: 'Sarah Johnson',
    createdBy: 'user123', // Added creator tracking
    location: 'Calgary',
    phase: 'Construction',
    status: 'Active',
    totalBudget: 2450000,
    amountSpent: 1680000,
    startDate: '2024-03-15',
    category: 'Education',
    clientMinistry: 'Education',
    projectType: 'Renovation',
    deliveryType: 'Design-Bid-Build',
    deliveryMethod: 'Traditional',
    branch: 'Infrastructure',
    geographicRegion: 'Calgary',
    squareMeters: 5000,
    numberOfStructures: 1,
    numberOfJobs: 25,
    municipality: 'Calgary',
    projectAddress: '123 School Street, Calgary, AB',
    constituency: 'Calgary-Centre',
    buildingName: 'Calgary Elementary School',
    buildingType: 'Educational',
    buildingId: 'EDU-001',
    primaryOwner: 'Calgary School Board',
    plan: 'Plan A',
    block: 'Block 1',
    lot: 'Lot 5',
    latitude: 51.0447,
    longitude: -114.0719,
    taf: 2450000,
    eac: 2400000,
    currentYearCashflow: 500000,
    milestones: {
      projectInitiation: { plannedDate: '2024-01-15', actualDate: '2024-01-15', baselineDate: '2024-01-15' },
      siteMobilization: { plannedDate: '2024-03-01', actualDate: '2024-03-05', baselineDate: '2024-03-01' },
      construction50: { plannedDate: '2024-06-15', actualDate: '', baselineDate: '2024-06-15' }
    }
  },
  {
    id: 2,
    name: 'Red Deer Community Center',
    description: 'New community center construction with recreational facilities',
    contractor: 'Community Builders Ltd.',
    projectManager: 'Sarah Johnson',
    createdBy: 'user123', // Added creator tracking
    location: 'Red Deer',
    phase: 'Design',
    status: 'Active',
    totalBudget: 3800000,
    amountSpent: 2280000,
    startDate: '2024-02-20',
    category: 'Community',
    clientMinistry: 'Municipal Affairs',
    projectType: 'New Construction',
    deliveryType: 'Design-Build',
    deliveryMethod: 'Integrated',
    branch: 'Community Services',
    geographicRegion: 'Central Alberta',
    squareMeters: 8000,
    numberOfStructures: 1,
    numberOfJobs: 40,
    municipality: 'Red Deer',
    projectAddress: '456 Community Drive, Red Deer, AB',
    constituency: 'Red Deer-North',
    buildingName: 'Red Deer Community Center',
    buildingType: 'Community',
    buildingId: 'COM-002',
    primaryOwner: 'City of Red Deer',
    plan: 'Plan B',
    block: 'Block 2',
    lot: 'Lot 10',
    latitude: 52.2681,
    longitude: -113.8112,
    taf: 3800000,
    eac: 3750000,
    currentYearCashflow: 800000,
    milestones: {
      projectInitiation: { plannedDate: '2024-01-01', actualDate: '2024-01-01', baselineDate: '2024-01-01' },
      designKickoff: { plannedDate: '2024-02-01', actualDate: '2024-02-05', baselineDate: '2024-02-01' },
      schematicDesign: { plannedDate: '2024-04-01', actualDate: '', baselineDate: '2024-04-01' }
    }
  }
]

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState(mockProjects)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showPFMTExtractor, setShowPFMTExtractor] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 10

  // Get current user
  const currentUser = getCurrentUser()
  
  // Get filter from URL params
  const filter = searchParams.get('filter') || 'all'

  useEffect(() => {
    // Check if there's a newly created project to select
    const newProjectId = searchParams.get('newProject')
    if (newProjectId) {
      const project = projects.find(p => p.id === parseInt(newProjectId))
      if (project) {
        setSelectedProject(project)
        // Remove the newProject param from URL
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('newProject')
        navigate(`/projects?${newSearchParams.toString()}`, { replace: true })
      }
    }
  }, [searchParams, projects, navigate])

  // Filter projects based on current user and filter type
  const filteredProjects = projects.filter(project => {
    if (filter === 'my') {
      // Show projects where user is PM or creator
      return project.projectManager === currentUser.name || project.createdBy === currentUser.id
    }
    
    // For 'all' filter, show based on user role
    if (currentUser.role === 'vendor') {
      // Vendors only see projects they created or are assigned to
      return project.createdBy === currentUser.id || project.projectManager === currentUser.name
    }
    
    return true // Directors, admins, SPMs see all projects
  })

  // Paginate projects
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage)

  const handleProjectSelect = (project) => {
    setSelectedProject(project)
    setIsEditing(false)
  }

  const handleBackToList = () => {
    setSelectedProject(null)
    setIsEditing(false)
  }

  // FIXED: Enhanced PFMT data extraction handler
  const handlePFMTDataExtracted = (data) => {
    console.log('PFMT Data extracted:', data)
    
    if (selectedProject) {
      // Update existing project with extracted data
      const updatedProject = {
        ...selectedProject,
        // Map Excel data to project fields with safe string handling
        name: data['Project Name'] || data.projectName || selectedProject.name,
        description: data.description || selectedProject.description,
        
        // Financial data mapping
        totalBudget: data.taf || data.totalBudget || selectedProject.totalBudget,
        taf: data.taf || selectedProject.taf,
        eac: data.eac || selectedProject.eac,
        amountSpent: data.totalExpenditures || data.amountSpent || selectedProject.amountSpent,
        currentYearCashflow: data.currentYearCashflow || selectedProject.currentYearCashflow,
        currentYearTarget: data.currentYearTarget || selectedProject.currentYearTarget,
        futureYearCashflow: data.futureYearCashflow || selectedProject.futureYearCashflow,
        previousYearsTargets: data.previousYearsTargets || selectedProject.previousYearsTargets,
        percentCompleteTAF: data.percentCompleteTAF || selectedProject.percentCompleteTAF,
        percentCompleteEAC: data.percentCompleteEAC || selectedProject.percentCompleteEAC,
        
        // Project details mapping
        category: data.category || data['Project Category'] || selectedProject.category,
        clientMinistry: data.clientMinistry || data['Client Ministry'] || selectedProject.clientMinistry,
        projectType: data.projectType || data['Project Type'] || selectedProject.projectType,
        deliveryType: data.deliveryType || data['Delivery Type'] || selectedProject.deliveryType,
        deliveryMethod: data.deliveryMethod || data['Delivery Method'] || selectedProject.deliveryMethod,
        branch: data.branch || data['Branch'] || selectedProject.branch,
        geographicRegion: data.geographicRegion || data['Geographic Region'] || selectedProject.geographicRegion,
        squareMeters: data.squareMeters || data['Square Meters'] || selectedProject.squareMeters,
        numberOfStructures: data.numberOfStructures || data['Number of Structures'] || selectedProject.numberOfStructures,
        numberOfJobs: data.numberOfJobs || data['Number of Jobs'] || selectedProject.numberOfJobs,
        
        // Location fields mapping
        municipality: data.municipality || data['Municipality'] || selectedProject.municipality,
        projectAddress: data.projectAddress || data['Project Address'] || selectedProject.projectAddress,
        constituency: data.constituency || data['Constituency'] || selectedProject.constituency,
        buildingName: data.buildingName || data['Building Name'] || selectedProject.buildingName,
        buildingType: data.buildingType || data['Building Type'] || selectedProject.buildingType,
        buildingId: data.buildingId || data['Building ID'] || selectedProject.buildingId,
        primaryOwner: data.primaryOwner || data['Primary Owner'] || selectedProject.primaryOwner,
        plan: data.plan || data['Plan'] || selectedProject.plan,
        block: data.block || data['Block'] || selectedProject.block,
        lot: data.lot || data['Lot'] || selectedProject.lot,
        latitude: data.latitude || data['Latitude'] || selectedProject.latitude,
        longitude: data.longitude || data['Longitude'] || selectedProject.longitude,
        
        // Metadata
        lastUpdated: new Date().toISOString(),
        extractedFrom: data.fileName || 'PFMT Excel Upload'
      }

      console.log('Updating existing project with Excel data:', updatedProject)

      // Update project in list
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p))
      setSelectedProject(updatedProject)
      
    } else {
      // Create new project with extracted data
      const newProject = {
        id: Date.now(), // Simple ID generation
        name: data['Project Name'] || data.projectName || `Project ${Date.now()}`,
        description: data.description || 'Project created from PFMT Excel upload',
        
        // Financial data
        totalBudget: data.taf || data.totalBudget || 0,
        taf: data.taf || 0,
        eac: data.eac || 0,
        amountSpent: data.totalExpenditures || data.amountSpent || 0,
        currentYearCashflow: data.currentYearCashflow || 0,
        currentYearTarget: data.currentYearTarget || 0,
        futureYearCashflow: data.futureYearCashflow || 0,
        previousYearsTargets: data.previousYearsTargets || 0,
        percentCompleteTAF: data.percentCompleteTAF || 0,
        percentCompleteEAC: data.percentCompleteEAC || 0,
        
        // Project details
        category: data.category || data['Project Category'] || 'Infrastructure',
        clientMinistry: data.clientMinistry || data['Client Ministry'] || 'Infrastructure',
        projectType: data.projectType || data['Project Type'] || 'New Construction',
        deliveryType: data.deliveryType || data['Delivery Type'] || 'Design-Bid-Build',
        deliveryMethod: data.deliveryMethod || data['Delivery Method'] || 'Traditional',
        branch: data.branch || data['Branch'] || '',
        geographicRegion: data.geographicRegion || data['Geographic Region'] || '',
        squareMeters: data.squareMeters || data['Square Meters'] || 0,
        numberOfStructures: data.numberOfStructures || data['Number of Structures'] || 0,
        numberOfJobs: data.numberOfJobs || data['Number of Jobs'] || 0,
        
        // Location fields
        location: data.location || data.municipality || 'TBD',
        municipality: data.municipality || data['Municipality'] || '',
        projectAddress: data.projectAddress || data['Project Address'] || '',
        constituency: data.constituency || data['Constituency'] || '',
        buildingName: data.buildingName || data['Building Name'] || '',
        buildingType: data.buildingType || data['Building Type'] || '',
        buildingId: data.buildingId || data['Building ID'] || '',
        primaryOwner: data.primaryOwner || data['Primary Owner'] || '',
        plan: data.plan || data['Plan'] || '',
        block: data.block || data['Block'] || '',
        lot: data.lot || data['Lot'] || '',
        latitude: data.latitude || data['Latitude'] || '',
        longitude: data.longitude || data['Longitude'] || '',
        
        // Standard project fields
        phase: 'Planning',
        status: 'Active',
        contractor: 'TBD',
        projectManager: currentUser.name, // FIXED: Assign to current user
        createdBy: currentUser.id, // FIXED: Track creator for visibility
        startDate: new Date().toISOString().split('T')[0],
        
        // Metadata
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        extractedFrom: data.fileName || 'PFMT Excel Upload',
        
        // Initialize empty milestones
        milestones: {}
      }

      console.log('Creating new project with Excel data:', newProject)

      // Add to projects list
      setProjects(prev => [newProject, ...prev])
      
      // FIXED: Navigate to new project profile immediately
      setSelectedProject(newProject)
      
      console.log('New project created and selected for viewing')
    }
    
    // Close extractor
    setShowPFMTExtractor(false)
  }

  const handleProjectUpdate = (updates) => {
    if (selectedProject) {
      const updatedProject = { ...selectedProject, ...updates, lastUpdated: new Date().toISOString() }
      setSelectedProject(updatedProject)
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p))
    }
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to backend
    console.log('Saving project:', selectedProject)
  }

  if (selectedProject) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Projects</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h1>
              <p className="text-gray-600">
                {selectedProject.contractor} • {selectedProject.phase} • {selectedProject.location}
                {selectedProject.extractedFrom && (
                  <span className="ml-2 text-blue-600">• Data from: {selectedProject.extractedFrom}</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowPFMTExtractor(true)}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload PFMT Data</span>
            </Button>
            
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={handleEditToggle}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Project</span>
              </Button>
            )}
          </div>
        </div>

        {/* FIXED: Project Overview with proper data binding */}
        <ProjectOverview 
          project={selectedProject}
          onUpdate={handleProjectUpdate}
          isEditing={isEditing}
        />

        {/* PFMT Data Extractor Modal */}
        {showPFMTExtractor && (
          <PFMTDataExtractor
            project={selectedProject}
            onDataExtracted={handlePFMTDataExtracted}
            onClose={() => setShowPFMTExtractor(false)}
          />
        )}
      </div>
    )
  }

  // Project list view
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your infrastructure projects
            {filter === 'my' && ` • Showing projects for ${currentUser.name}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowPFMTExtractor(true)}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Create New Project</span>
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-1 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => {
            const newSearchParams = new URLSearchParams(searchParams)
            newSearchParams.set('filter', 'all')
            navigate(`/projects?${newSearchParams.toString()}`)
          }}
          size="sm"
        >
          All Projects ({projects.length})
        </Button>
        <Button
          variant={filter === 'my' ? 'default' : 'outline'}
          onClick={() => {
            const newSearchParams = new URLSearchParams(searchParams)
            newSearchParams.set('filter', 'my')
            navigate(`/projects?${newSearchParams.toString()}`)
          }}
          size="sm"
        >
          My Projects ({filteredProjects.length})
        </Button>
      </div>

      {/* Project List */}
      <ProjectList 
        projects={paginatedProjects}
        onProjectSelect={handleProjectSelect}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* PFMT Data Extractor Modal for new projects */}
      {showPFMTExtractor && (
        <PFMTDataExtractor
          project={null} // null for new project creation
          onDataExtracted={handlePFMTDataExtracted}
          onClose={() => setShowPFMTExtractor(false)}
        />
      )}
    </div>
  )
}

