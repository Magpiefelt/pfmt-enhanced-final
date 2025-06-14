// PFMT Extractor Page for creating new projects
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { ArrowLeft, Upload, FileSpreadsheet } from 'lucide-react'
import { PFMTDataExtractor } from '../components/PFMTDataExtractor.jsx'
import { useProjects, useNotifications } from '../hooks/index.js'

export default function PFMTExtractorPage() {
  const navigate = useNavigate()
  const [showExtractor, setShowExtractor] = useState(false)
  const { addProject } = useProjects()
  const { showSuccess, showError } = useNotifications()

  const handleDataExtracted = async (extractedData) => {
    try {
      // Map extracted data to project fields
      const newProject = {
        name: extractedData['Project Name'] || 'New Project',
        description: extractedData['Project Description'] || '',
        category: extractedData['Project Category'] || '',
        clientMinistry: extractedData['Client Ministry'] || '',
        projectType: extractedData['Project Type'] || '',
        deliveryType: extractedData['Delivery Type'] || '',
        deliveryMethod: extractedData['Delivery Method'] || '',
        branch: extractedData['Branch'] || '',
        geographicRegion: extractedData['Geographic Region'] || '',
        squareMeters: extractedData['Square Meters'] || '',
        numberOfStructures: extractedData['Number of Structures'] || '',
        numberOfJobs: extractedData['Number of Jobs'] || '',
        
        // Location fields
        location: extractedData['Location'] || '',
        municipality: extractedData['Municipality'] || '',
        projectAddress: extractedData['Project Address'] || '',
        constituency: extractedData['Constituency'] || '',
        buildingName: extractedData['Building Name'] || '',
        buildingType: extractedData['Building Type'] || '',
        buildingId: extractedData['Building ID'] || '',
        primaryOwner: extractedData['Primary Owner'] || '',
        plan: extractedData['Plan'] || '',
        block: extractedData['Block'] || '',
        lot: extractedData['Lot'] || '',
        latitude: extractedData['Latitude'] || '',
        longitude: extractedData['Longitude'] || '',
        
        // Financial data from PFMT
        taf: extractedData.taf || 0,
        eac: extractedData.eac || 0,
        currentYearCashflow: extractedData.currentYearCashflow || 0,
        targetCashflow: extractedData.currentYearTarget || 0,
        totalBudget: extractedData.taf || 0,
        amountSpent: 0,
        
        // Default values
        phase: 'Planning',
        status: 'Active',
        contractor: 'TBD',
        projectManager: 'TBD',
        region: extractedData['Geographic Region'] || 'TBD',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        scheduleStatus: 'On Track',
        budgetStatus: 'On Track',
        scopeStatus: 'On Track',
        reportStatus: 'Current',
        
        // Initialize empty arrays for related data
        team: [],
        vendors: [],
        milestones: {},
        
        // Metadata
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        createdFrom: 'PFMT Excel Upload',
        originalFileName: extractedData.fileName
      }

      // Create the project
      const createdProject = await addProject(newProject)
      
      showSuccess('Project created successfully from PFMT data!')
      
      // Navigate to projects page with the new project selected
      navigate(`/projects?newProjectId=${createdProject.id}`)
      
    } catch (error) {
      console.error('Error creating project from PFMT data:', error)
      showError('Failed to create project: ' + error.message)
    }
  }

  const handleClose = () => {
    setShowExtractor(false)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
        <p className="text-gray-600">
          Upload your PFMT Excel file to automatically create a new project with populated data.
        </p>
      </div>

      {!showExtractor ? (
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileSpreadsheet className="h-6 w-6" />
                <span>PFMT Excel Upload</span>
              </CardTitle>
              <CardDescription>
                Upload your PFMT Excel workbook to extract project data and create a new project automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">What happens next:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Upload your PFMT Excel file (.xlsx or .xlsm)</li>
                    <li>• System extracts project data automatically</li>
                    <li>• New project is created with populated fields</li>
                    <li>• You'll be taken to the project profile to review and edit</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => setShowExtractor(true)}
                  className="w-full"
                  size="lg"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Start Excel Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-4xl">
          <PFMTDataExtractor
            project={{}} // Empty project for new creation
            onDataExtracted={handleDataExtracted}
            onClose={handleClose}
          />
        </div>
      )}
    </div>
  )
}

