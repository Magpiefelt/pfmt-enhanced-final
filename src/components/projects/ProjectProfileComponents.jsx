// Fixed Project Profile Components with Proper Data Display
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Building, 
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit
} from 'lucide-react'

// Enhanced Project Details Component with Proper Data Binding
export function ProjectDetails({ project, onUpdate, isEditing = false }) {
  const [formData, setFormData] = useState({})

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        category: project.category || '',
        clientMinistry: project.clientMinistry || '',
        projectType: project.projectType || '',
        deliveryType: project.deliveryType || '',
        deliveryMethod: project.deliveryMethod || '',
        branch: project.branch || '',
        geographicRegion: project.geographicRegion || '',
        squareMeters: project.squareMeters || '',
        numberOfStructures: project.numberOfStructures || '',
        numberOfJobs: project.numberOfJobs || '',
        taf: project.taf || '',
        eac: project.eac || '',
        currentYearCashflow: project.currentYearCashflow || '',
        currentYearTarget: project.currentYearTarget || '',
        totalBudget: project.totalBudget || '',
        amountSpent: project.amountSpent || ''
      })
    }
  }, [project])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (onUpdate) {
      onUpdate({ [field]: value })
    }
  }

  const projectDetailsFields = [
    { key: 'name', label: 'Project Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'category', label: 'Project Category', type: 'text' },
    { key: 'clientMinistry', label: 'Client Ministry', type: 'text' },
    { key: 'projectType', label: 'Project Type', type: 'text' },
    { key: 'deliveryType', label: 'Delivery Type', type: 'text' },
    { key: 'deliveryMethod', label: 'Delivery Method', type: 'text' },
    { key: 'branch', label: 'Branch', type: 'text' },
    { key: 'geographicRegion', label: 'Geographic Region', type: 'text' },
    { key: 'squareMeters', label: 'Square Meters', type: 'number' },
    { key: 'numberOfStructures', label: 'Number of Structures', type: 'number' },
    { key: 'numberOfJobs', label: 'Number of Jobs', type: 'number' }
  ]

  const financialFields = [
    { key: 'taf', label: 'Total Approved Funding (TAF)', type: 'number', prefix: '$' },
    { key: 'eac', label: 'Estimate at Completion (EAC)', type: 'number', prefix: '$' },
    { key: 'totalBudget', label: 'Total Budget', type: 'number', prefix: '$' },
    { key: 'amountSpent', label: 'Amount Spent', type: 'number', prefix: '$' },
    { key: 'currentYearCashflow', label: 'Current Year Cashflow', type: 'number', prefix: '$' },
    { key: 'currentYearTarget', label: 'Current Year Target', type: 'number', prefix: '$' }
  ]

  return (
    <div className="space-y-6">
      {/* Project Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Project Information
          </CardTitle>
          <CardDescription>
            Basic project information and specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectDetailsFields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <Label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    rows={3}
                    placeholder={isEditing ? `Enter ${field.label.toLowerCase()}` : 'No data available'}
                  />
                ) : (
                  <Input
                    id={field.key}
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder={isEditing ? `Enter ${field.label.toLowerCase()}` : 'No data available'}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Information
          </CardTitle>
          <CardDescription>
            Budget, funding, and financial targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financialFields.map((field) => (
              <div key={field.key}>
                <Label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                  {field.label}
                </Label>
                <div className="relative mt-1">
                  {field.prefix && (
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {field.prefix}
                    </span>
                  )}
                  <Input
                    id={field.key}
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    disabled={!isEditing}
                    className={`${field.prefix ? 'pl-8' : ''}`}
                    placeholder={isEditing ? `Enter ${field.label.toLowerCase()}` : 'No data available'}
                  />
                </div>
                {/* Display formatted value when not editing */}
                {!isEditing && formData[field.key] && field.prefix === '$' && (
                  <p className="text-sm text-gray-600 mt-1">
                    Formatted: ${Number(formData[field.key]).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced Project Location Component with Proper Data Binding
export function ProjectLocation({ project, onUpdate, isEditing = false }) {
  const [formData, setFormData] = useState({})

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        location: project.location || '',
        municipality: project.municipality || '',
        projectAddress: project.projectAddress || '',
        constituency: project.constituency || '',
        buildingName: project.buildingName || '',
        buildingType: project.buildingType || '',
        buildingId: project.buildingId || '',
        primaryOwner: project.primaryOwner || '',
        plan: project.plan || '',
        block: project.block || '',
        lot: project.lot || '',
        latitude: project.latitude || '',
        longitude: project.longitude || ''
      })
    }
  }, [project])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (onUpdate) {
      onUpdate({ [field]: value })
    }
  }

  const locationFields = [
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'municipality', label: 'Municipality', type: 'text' },
    { key: 'projectAddress', label: 'Project Address', type: 'text', fullWidth: true },
    { key: 'constituency', label: 'Constituency', type: 'text' },
    { key: 'buildingName', label: 'Building Name', type: 'text' },
    { key: 'buildingType', label: 'Building Type', type: 'text' },
    { key: 'buildingId', label: 'Building ID', type: 'text' },
    { key: 'primaryOwner', label: 'Primary Owner', type: 'text' },
    { key: 'plan', label: 'Plan', type: 'text' },
    { key: 'block', label: 'Block', type: 'text' },
    { key: 'lot', label: 'Lot', type: 'text' },
    { key: 'latitude', label: 'Latitude', type: 'number', step: 'any' },
    { key: 'longitude', label: 'Longitude', type: 'number', step: 'any' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Project Location
        </CardTitle>
        <CardDescription>
          Geographic and address information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locationFields.map((field) => (
            <div key={field.key} className={field.fullWidth ? 'md:col-span-2' : ''}>
              <Label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                {field.label}
              </Label>
              <Input
                id={field.key}
                type={field.type}
                step={field.step}
                value={formData[field.key] || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                disabled={!isEditing}
                className="mt-1"
                placeholder={isEditing ? `Enter ${field.label.toLowerCase()}` : 'No data available'}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Project Milestones with Phase-based Subtabs
export function ProjectMilestonesEnhanced({ project, onUpdate, isEditing = false }) {
  const [activePhase, setActivePhase] = useState('planning')

  const phases = [
    { id: 'planning', label: 'Planning', icon: Target },
    { id: 'design', label: 'Design', icon: Edit },
    { id: 'construction', label: 'Construction', icon: Building },
    { id: 'closeout', label: 'Closeout', icon: CheckCircle }
  ]

  const milestonesByPhase = {
    planning: [
      { key: 'projectInitiation', label: 'Project Initiation', required: true },
      { key: 'businessCaseApproval', label: 'Business Case Approval', required: true },
      { key: 'fundingApproval', label: 'Funding Approval', required: true },
      { key: 'projectCharterSigned', label: 'Project Charter Signed', required: false },
      { key: 'stakeholderEngagement', label: 'Stakeholder Engagement Complete', required: false }
    ],
    design: [
      { key: 'designKickoff', label: 'Design Kickoff', required: true },
      { key: 'schematicDesign', label: 'Schematic Design Complete', required: true },
      { key: 'designDevelopment', label: 'Design Development Complete', required: true },
      { key: 'constructionDocuments', label: 'Construction Documents Complete', required: true },
      { key: 'permitSubmission', label: 'Permit Submission', required: false },
      { key: 'permitApproval', label: 'Permit Approval', required: false }
    ],
    construction: [
      { key: 'siteMobilization', label: 'Site Mobilization', required: true, special: true },
      { key: 'constructionStart', label: 'Construction Start', required: true },
      { key: 'construction25', label: 'Construction 25% Complete', required: false },
      { key: 'construction50', label: 'Construction 50% Complete', required: false },
      { key: 'construction75', label: 'Construction 75% Complete', required: false },
      { key: 'construction100', label: 'Construction 100% Complete', required: true, special: true },
      { key: 'substantialCompletion', label: 'Substantial Completion', required: true }
    ],
    closeout: [
      { key: 'finalInspection', label: 'Final Inspection', required: true },
      { key: 'occupancyPermit', label: 'Occupancy Permit Issued', required: false },
      { key: 'projectHandover', label: 'Project Handover', required: true },
      { key: 'warrantyPeriodStart', label: 'Warranty Period Start', required: false },
      { key: 'financialCloseout', label: 'Financial Closeout', required: true, special: true },
      { key: 'projectClosure', label: 'Project Closure', required: true }
    ]
  }

  const MilestoneRow = ({ milestone, phase }) => {
    const milestoneData = project?.milestones?.[milestone.key] || {}
    
    return (
      <div className={`grid grid-cols-12 gap-2 py-2 px-3 rounded ${milestone.special ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
        <div className="col-span-3 flex items-center">
          <span className={`text-sm ${milestone.required ? 'font-medium' : ''}`}>
            {milestone.label}
            {milestone.required && <span className="text-red-500 ml-1">*</span>}
            {milestone.special && <span className="text-blue-500 ml-1">★</span>}
          </span>
        </div>
        
        <div className="col-span-2">
          <Input
            type="date"
            value={milestoneData.plannedDate || ''}
            onChange={(e) => onUpdate && onUpdate({
              milestones: {
                ...project?.milestones,
                [milestone.key]: { ...milestoneData, plannedDate: e.target.value }
              }
            })}
            disabled={!isEditing}
            className="text-xs h-8"
          />
        </div>
        
        <div className="col-span-2">
          <Input
            type="date"
            value={milestoneData.actualDate || ''}
            onChange={(e) => onUpdate && onUpdate({
              milestones: {
                ...project?.milestones,
                [milestone.key]: { ...milestoneData, actualDate: e.target.value }
              }
            })}
            disabled={!isEditing}
            className="text-xs h-8"
          />
        </div>
        
        <div className="col-span-2">
          <Input
            type="date"
            value={milestoneData.baselineDate || ''}
            onChange={(e) => onUpdate && onUpdate({
              milestones: {
                ...project?.milestones,
                [milestone.key]: { ...milestoneData, baselineDate: e.target.value }
              }
            })}
            disabled={!isEditing}
            className="text-xs h-8"
          />
        </div>
        
        <div className="col-span-2">
          <Input
            placeholder="Notes"
            value={milestoneData.notes || ''}
            onChange={(e) => onUpdate && onUpdate({
              milestones: {
                ...project?.milestones,
                [milestone.key]: { ...milestoneData, notes: e.target.value }
              }
            })}
            disabled={!isEditing}
            className="text-xs h-8"
          />
        </div>
        
        <div className="col-span-1 flex items-center justify-center">
          <input
            type="checkbox"
            checked={milestoneData.notApplicable || false}
            onChange={(e) => onUpdate && onUpdate({
              milestones: {
                ...project?.milestones,
                [milestone.key]: { ...milestoneData, notApplicable: e.target.checked }
              }
            })}
            disabled={!isEditing}
            className="h-4 w-4"
          />
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Project Milestones
        </CardTitle>
        <CardDescription>
          Track project milestones by phase with planned, actual, and baseline dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activePhase} onValueChange={setActivePhase}>
          <TabsList className="grid w-full grid-cols-4">
            {phases.map((phase) => {
              const Icon = phase.icon
              return (
                <TabsTrigger key={phase.id} value={phase.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {phase.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
          
          {phases.map((phase) => (
            <TabsContent key={phase.id} value={phase.id} className="mt-4">
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 py-2 px-3 bg-gray-100 rounded font-medium text-sm">
                  <div className="col-span-3">Milestone</div>
                  <div className="col-span-2">Planned Date</div>
                  <div className="col-span-2">Actual Date</div>
                  <div className="col-span-2">Baseline Date</div>
                  <div className="col-span-2">Notes</div>
                  <div className="col-span-1 text-center">N/A</div>
                </div>
                
                {/* Milestones */}
                {milestonesByPhase[phase.id].map((milestone) => (
                  <MilestoneRow 
                    key={milestone.key} 
                    milestone={milestone} 
                    phase={phase.id}
                  />
                ))}
              </div>
              
              {phase.id === 'construction' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Special Milestones (★):</strong> Site Mobilization and Construction 100% are key milestones 
                    that require special attention and reporting.
                  </p>
                </div>
              )}
              
              {phase.id === 'closeout' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    <strong>Financial Closeout (★):</strong> This milestone marks the completion of all financial 
                    reconciliation and final project cost reporting.
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Enhanced Project Overview Component that integrates all sections
export function ProjectOverview({ project, onUpdate, isEditing = false }) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Budget</p>
                    <p className="text-lg font-bold">${project?.totalBudget?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">TAF</p>
                    <p className="text-lg font-bold">${project?.taf?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phase</p>
                    <p className="text-lg font-bold">{project?.phase || 'Planning'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-lg font-bold">{project?.location || 'TBD'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Project Information Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information Summary</CardTitle>
              {project?.extractedFrom && (
                <CardDescription>
                  Data extracted from: {project.extractedFrom} | Last updated: {new Date(project.lastUpdated).toLocaleDateString()}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Project Name</Label>
                  <p className="mt-1 text-sm text-gray-900">{project?.name || 'Unnamed Project'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Category</Label>
                  <p className="mt-1 text-sm text-gray-900">{project?.category || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Client Ministry</Label>
                  <p className="mt-1 text-sm text-gray-900">{project?.clientMinistry || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Project Type</Label>
                  <p className="mt-1 text-sm text-gray-900">{project?.projectType || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Project Manager</Label>
                  <p className="mt-1 text-sm text-gray-900">{project?.projectManager || 'Not assigned'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created By</Label>
                  <p className="mt-1 text-sm text-gray-900">{project?.createdBy || 'Unknown'}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <p className="mt-1 text-sm text-gray-900">{project?.description || 'No description provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <ProjectDetails project={project} onUpdate={onUpdate} isEditing={isEditing} />
        </TabsContent>
        
        <TabsContent value="location">
          <ProjectLocation project={project} onUpdate={onUpdate} isEditing={isEditing} />
        </TabsContent>
        
        <TabsContent value="milestones">
          <ProjectMilestonesEnhanced project={project} onUpdate={onUpdate} isEditing={isEditing} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

