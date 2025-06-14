// Enhanced Project Details and Location Components
import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Building, MapPin, Save, Edit, CheckCircle, Calendar, Target } from 'lucide-react'
import { useNotifications } from '../../hooks/index.js'

// Project Details Component with all required fields
export function ProjectDetails({ project, onProjectUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    // Project Details
    name: project.name || '',
    category: project.category || '',
    clientMinistry: project.clientMinistry || '',
    projectType: project.projectType || '',
    deliveryType: project.deliveryType || '',
    deliveryMethod: project.deliveryMethod || '',
    branch: project.branch || '',
    geographicRegion: project.geographicRegion || '',
    description: project.description || '',
    squareMeters: project.squareMeters || '',
    numberOfStructures: project.numberOfStructures || '',
    numberOfJobs: project.numberOfJobs || ''
  })
  const { showSuccess, showError } = useNotifications()

  const handleSave = async () => {
    try {
      await onProjectUpdate(project.id, formData)
      setIsEditing(false)
      showSuccess('Project details updated successfully')
    } catch (error) {
      showError('Failed to update project details: ' + error.message)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: project.name || '',
      category: project.category || '',
      clientMinistry: project.clientMinistry || '',
      projectType: project.projectType || '',
      deliveryType: project.deliveryType || '',
      deliveryMethod: project.deliveryMethod || '',
      branch: project.branch || '',
      geographicRegion: project.geographicRegion || '',
      description: project.description || '',
      squareMeters: project.squareMeters || '',
      numberOfStructures: project.numberOfStructures || '',
      numberOfJobs: project.numberOfJobs || ''
    })
    setIsEditing(false)
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Project Details</span>
            </CardTitle>
            <CardDescription>Basic project information and specifications</CardDescription>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name *</Label>
              {isEditing ? (
                <Input
                  id="project-name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Enter project name"
                />
              ) : (
                <div className="text-lg font-semibold">{formData.name || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="project-category">Project Category</Label>
              {isEditing ? (
                <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Building">Building</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>{formData.category || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="client-ministry">Client Ministry</Label>
              {isEditing ? (
                <Select value={formData.clientMinistry} onValueChange={(value) => updateField('clientMinistry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ministry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Justice">Justice</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Environment">Environment</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>{formData.clientMinistry || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="project-type">Project Type</Label>
              {isEditing ? (
                <Select value={formData.projectType} onValueChange={(value) => updateField('projectType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Construction">New Construction</SelectItem>
                    <SelectItem value="Renovation">Renovation</SelectItem>
                    <SelectItem value="Expansion">Expansion</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Demolition">Demolition</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>{formData.projectType || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="delivery-type">Delivery Type</Label>
              {isEditing ? (
                <Select value={formData.deliveryType} onValueChange={(value) => updateField('deliveryType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Design-Bid-Build">Design-Bid-Build</SelectItem>
                    <SelectItem value="Design-Build">Design-Build</SelectItem>
                    <SelectItem value="Construction Management">Construction Management</SelectItem>
                    <SelectItem value="Public-Private Partnership">Public-Private Partnership</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>{formData.deliveryType || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="delivery-method">Delivery Method</Label>
              {isEditing ? (
                <Select value={formData.deliveryMethod} onValueChange={(value) => updateField('deliveryMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Traditional">Traditional</SelectItem>
                    <SelectItem value="Fast Track">Fast Track</SelectItem>
                    <SelectItem value="Phased">Phased</SelectItem>
                    <SelectItem value="Turnkey">Turnkey</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>{formData.deliveryMethod || 'Not specified'}</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="branch">Branch</Label>
              {isEditing ? (
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => updateField('branch', e.target.value)}
                  placeholder="Enter branch"
                />
              ) : (
                <div>{formData.branch || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="geographic-region">Geographic Region</Label>
              {isEditing ? (
                <Select value={formData.geographicRegion} onValueChange={(value) => updateField('geographicRegion', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Calgary">Calgary</SelectItem>
                    <SelectItem value="Edmonton">Edmonton</SelectItem>
                    <SelectItem value="Red Deer">Red Deer</SelectItem>
                    <SelectItem value="Lethbridge">Lethbridge</SelectItem>
                    <SelectItem value="Fort McMurray">Fort McMurray</SelectItem>
                    <SelectItem value="Grande Prairie">Grande Prairie</SelectItem>
                    <SelectItem value="Medicine Hat">Medicine Hat</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>{formData.geographicRegion || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="square-meters">Square Meters</Label>
              {isEditing ? (
                <Input
                  id="square-meters"
                  type="number"
                  value={formData.squareMeters}
                  onChange={(e) => updateField('squareMeters', e.target.value)}
                  placeholder="Enter square meters"
                />
              ) : (
                <div>{formData.squareMeters ? `${formData.squareMeters} m²` : 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="number-structures">Number of Structures</Label>
              {isEditing ? (
                <Input
                  id="number-structures"
                  type="number"
                  value={formData.numberOfStructures}
                  onChange={(e) => updateField('numberOfStructures', e.target.value)}
                  placeholder="Enter number of structures"
                />
              ) : (
                <div>{formData.numberOfStructures || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="number-jobs">Number of Jobs</Label>
              {isEditing ? (
                <Input
                  id="number-jobs"
                  type="number"
                  value={formData.numberOfJobs}
                  onChange={(e) => updateField('numberOfJobs', e.target.value)}
                  placeholder="Enter number of jobs"
                />
              ) : (
                <div>{formData.numberOfJobs || 'Not specified'}</div>
              )}
            </div>
          </div>

          <div className="col-span-full">
            <Label htmlFor="project-description">Project Description</Label>
            {isEditing ? (
              <Textarea
                id="project-description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Enter project description"
                rows={4}
              />
            ) : (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                {formData.description || 'No description provided'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Project Location Component with all required fields
export function ProjectLocation({ project, onProjectUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    // Project Location
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
  const { showSuccess, showError } = useNotifications()

  const handleSave = async () => {
    try {
      await onProjectUpdate(project.id, formData)
      setIsEditing(false)
      showSuccess('Project location updated successfully')
    } catch (error) {
      showError('Failed to update project location: ' + error.message)
    }
  }

  const handleCancel = () => {
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
    setIsEditing(false)
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Project Location</span>
            </CardTitle>
            <CardDescription>Location details and geographic information</CardDescription>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Location
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="Enter location"
                />
              ) : (
                <div>{formData.location || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="municipality">Municipality</Label>
              {isEditing ? (
                <Input
                  id="municipality"
                  value={formData.municipality}
                  onChange={(e) => updateField('municipality', e.target.value)}
                  placeholder="Enter municipality"
                />
              ) : (
                <div>{formData.municipality || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="project-address">Project Address</Label>
              {isEditing ? (
                <Textarea
                  id="project-address"
                  value={formData.projectAddress}
                  onChange={(e) => updateField('projectAddress', e.target.value)}
                  placeholder="Enter project address"
                  rows={3}
                />
              ) : (
                <div>{formData.projectAddress || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="constituency">Constituency</Label>
              {isEditing ? (
                <Input
                  id="constituency"
                  value={formData.constituency}
                  onChange={(e) => updateField('constituency', e.target.value)}
                  placeholder="Enter constituency"
                />
              ) : (
                <div>{formData.constituency || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="building-name">Building Name</Label>
              {isEditing ? (
                <Input
                  id="building-name"
                  value={formData.buildingName}
                  onChange={(e) => updateField('buildingName', e.target.value)}
                  placeholder="Enter building name"
                />
              ) : (
                <div>{formData.buildingName || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="building-type">Building Type</Label>
              {isEditing ? (
                <Select value={formData.buildingType} onValueChange={(value) => updateField('buildingType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select building type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="School">School</SelectItem>
                    <SelectItem value="Hospital">Hospital</SelectItem>
                    <SelectItem value="Courthouse">Courthouse</SelectItem>
                    <SelectItem value="Laboratory">Laboratory</SelectItem>
                    <SelectItem value="Warehouse">Warehouse</SelectItem>
                    <SelectItem value="Recreation Center">Recreation Center</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>{formData.buildingType || 'Not specified'}</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="building-id">Building ID</Label>
              {isEditing ? (
                <Input
                  id="building-id"
                  value={formData.buildingId}
                  onChange={(e) => updateField('buildingId', e.target.value)}
                  placeholder="Enter building ID"
                />
              ) : (
                <div>{formData.buildingId || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label htmlFor="primary-owner">Primary Owner</Label>
              {isEditing ? (
                <Input
                  id="primary-owner"
                  value={formData.primaryOwner}
                  onChange={(e) => updateField('primaryOwner', e.target.value)}
                  placeholder="Enter primary owner"
                />
              ) : (
                <div>{formData.primaryOwner || 'Not specified'}</div>
              )}
            </div>

            <div>
              <Label>Plan Block Lot</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="plan" className="text-sm">Plan</Label>
                  {isEditing ? (
                    <Input
                      id="plan"
                      value={formData.plan}
                      onChange={(e) => updateField('plan', e.target.value)}
                      placeholder="Plan"
                    />
                  ) : (
                    <div className="text-sm">{formData.plan || 'N/A'}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="block" className="text-sm">Block</Label>
                  {isEditing ? (
                    <Input
                      id="block"
                      value={formData.block}
                      onChange={(e) => updateField('block', e.target.value)}
                      placeholder="Block"
                    />
                  ) : (
                    <div className="text-sm">{formData.block || 'N/A'}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="lot" className="text-sm">Lot</Label>
                  {isEditing ? (
                    <Input
                      id="lot"
                      value={formData.lot}
                      onChange={(e) => updateField('lot', e.target.value)}
                      placeholder="Lot"
                    />
                  ) : (
                    <div className="text-sm">{formData.lot || 'N/A'}</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label>GPS Coordinates</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="latitude" className="text-sm">Latitude</Label>
                  {isEditing ? (
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => updateField('latitude', e.target.value)}
                      placeholder="Latitude"
                    />
                  ) : (
                    <div className="text-sm">{formData.latitude || 'Not specified'}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-sm">Longitude</Label>
                  {isEditing ? (
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => updateField('longitude', e.target.value)}
                      placeholder="Longitude"
                    />
                  ) : (
                    <div className="text-sm">{formData.longitude || 'Not specified'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Project Milestones with Phase-based Display
export function ProjectMilestonesEnhanced({ project, onProjectUpdate }) {
  const [selectedPhase, setSelectedPhase] = useState(project.phase || 'Planning')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(project.milestones || {})
  const { showSuccess, showError } = useNotifications()

  // Define milestones for each phase
  const phasesMilestones = {
    Planning: [
      { key: 'businessCaseApproval', name: 'Business Case Approval' },
      { key: 'projectAnnounced', name: 'Project Announced' },
      { key: 'par', name: 'PAR' },
      { key: 'siteSelection', name: 'Site Selection' },
      { key: 'functionalProgramingApproval', name: 'Functional Programing Approval' }
    ],
    Design: [
      { key: 'primeConsultantAward', name: 'Prime Consultant / Designer Contract Award' },
      { key: 'schematicDesignCompletion', name: 'Schematic Design Completion' },
      { key: 'designDevelopmentCompletion', name: 'Design Development Completion' },
      { key: 'contractDocumentsCompletion', name: 'Contract Documents / Pre Tender Estimate Completion' }
    ],
    Construction: [
      { key: 'siteMobilization', name: 'Site / Construction Mobilization' },
      { key: 'construction25', name: '25% Construction' },
      { key: 'construction50', name: '50% Construction' },
      { key: 'construction85', name: '85% Construction' },
      { key: 'construction100', name: '100% Construction' }
    ],
    Closeout: [
      { key: 'turnoverOccupancy', name: 'Turnover / Occupancy' },
      { key: 'grandOpening', name: 'Grand Opening' },
      { key: 'totalPerformanceCompletion', name: 'Total Performance / Completion' },
      { key: 'financialCloseout', name: 'Financial Closeout' }
    ]
  }

  const handleSave = async () => {
    try {
      await onProjectUpdate(project.id, { milestones: formData })
      setIsEditing(false)
      showSuccess('Project milestones updated successfully')
    } catch (error) {
      showError('Failed to update project milestones: ' + error.message)
    }
  }

  const handleCancel = () => {
    setFormData(project.milestones || {})
    setIsEditing(false)
  }

  const updateMilestone = (phase, milestoneKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      [phase]: {
        ...prev[phase],
        [milestoneKey]: {
          ...prev[phase]?.[milestoneKey],
          [field]: value
        }
      }
    }))
  }

  const renderMilestoneFields = (phase, milestone) => {
    const milestoneData = formData[phase]?.[milestone.key] || {}
    
    return (
      <div key={milestone.key} className="border rounded-lg p-4 space-y-3">
        <h4 className="font-medium">{milestone.name}</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-sm">N/A</Label>
            {isEditing ? (
              <input
                type="checkbox"
                checked={milestoneData.isNA || false}
                onChange={(e) => updateMilestone(phase, milestone.key, 'isNA', e.target.checked)}
                className="mt-1"
              />
            ) : (
              <div className="text-sm">{milestoneData.isNA ? 'Yes' : 'No'}</div>
            )}
          </div>
          <div>
            <Label className="text-sm">Planned Current Date</Label>
            {isEditing ? (
              <Input
                type="date"
                value={milestoneData.plannedDate || ''}
                onChange={(e) => updateMilestone(phase, milestone.key, 'plannedDate', e.target.value)}
                disabled={milestoneData.isNA}
              />
            ) : (
              <div className="text-sm">{milestoneData.plannedDate || 'Not set'}</div>
            )}
          </div>
          <div>
            <Label className="text-sm">Actual Date</Label>
            {isEditing ? (
              <Input
                type="date"
                value={milestoneData.actualDate || ''}
                onChange={(e) => updateMilestone(phase, milestone.key, 'actualDate', e.target.value)}
                disabled={milestoneData.isNA}
              />
            ) : (
              <div className="text-sm">{milestoneData.actualDate || 'Not set'}</div>
            )}
          </div>
          {(milestone.key === 'siteMobilization' || milestone.key === 'construction100' || milestone.key === 'turnoverOccupancy') && (
            <div>
              <Label className="text-sm">Baseline Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={milestoneData.baselineDate || ''}
                  onChange={(e) => updateMilestone(phase, milestone.key, 'baselineDate', e.target.value)}
                  disabled={milestoneData.isNA}
                />
              ) : (
                <div className="text-sm">{milestoneData.baselineDate || 'Not set'}</div>
              )}
            </div>
          )}
        </div>
        <div>
          <Label className="text-sm">Notes</Label>
          {isEditing ? (
            <Textarea
              value={milestoneData.notes || ''}
              onChange={(e) => updateMilestone(phase, milestone.key, 'notes', e.target.value)}
              placeholder="Enter notes"
              rows={2}
            />
          ) : (
            <div className="text-sm bg-gray-50 p-2 rounded">
              {milestoneData.notes || 'No notes'}
            </div>
          )}
        </div>
        
        {milestone.key === 'financialCloseout' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-sm">Financial Closeout Start Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={milestoneData.startDate || ''}
                  onChange={(e) => updateMilestone(phase, milestone.key, 'startDate', e.target.value)}
                />
              ) : (
                <div className="text-sm">{milestoneData.startDate || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label className="text-sm">SFC Completed Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={milestoneData.sfcCompletedDate || ''}
                  onChange={(e) => updateMilestone(phase, milestone.key, 'sfcCompletedDate', e.target.value)}
                />
              ) : (
                <div className="text-sm">{milestoneData.sfcCompletedDate || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label className="text-sm">Financial Closeout End Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={milestoneData.endDate || ''}
                  onChange={(e) => updateMilestone(phase, milestone.key, 'endDate', e.target.value)}
                />
              ) : (
                <div className="text-sm">{milestoneData.endDate || 'Not set'}</div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Project Milestones</span>
            </CardTitle>
            <CardDescription>Track project milestones by phase</CardDescription>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Milestones
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedPhase} onValueChange={setSelectedPhase}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="Planning">Planning</TabsTrigger>
            <TabsTrigger value="Design">Design</TabsTrigger>
            <TabsTrigger value="Construction">Construction</TabsTrigger>
            <TabsTrigger value="Closeout">Closeout</TabsTrigger>
          </TabsList>
          
          {Object.keys(phasesMilestones).map(phase => (
            <TabsContent key={phase} value={phase} className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant={selectedPhase === phase ? 'default' : 'outline'}>
                  {phase} Phase
                </Badge>
                {project.phase === phase && (
                  <Badge variant="secondary">Current Phase</Badge>
                )}
              </div>
              
              <div className="space-y-4">
                {phasesMilestones[phase].map(milestone => 
                  renderMilestoneFields(phase, milestone)
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

