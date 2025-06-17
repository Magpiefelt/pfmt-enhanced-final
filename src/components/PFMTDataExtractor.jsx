// Enhanced PFMT Data Extractor with create new project support and improved data model integration
import React, { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'

// Enhanced PFMT Data Extractor Component with create new project support
export function PFMTDataExtractor({ project, onDataExtracted, onClose }) {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [validationResults, setValidationResults] = useState(null)
  const [error, setError] = useState(null)

  // Determine if this is for creating a new project or updating existing
  const isNewProject = !project || !project.id

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const selectedFile = event.target.files?.[0]
    
    if (!selectedFile) {
      return
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
      'application/vnd.ms-excel' // .xls
    ]

    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.match(/\.(xlsx|xlsm|xls)$/i)) {
      setError('Please select a valid Excel file (.xlsx, .xlsm, or .xls)')
      return
    }

    setFile(selectedFile)
    setError(null)
    processExcelFile(selectedFile)
  }, [])

  // Enhanced Excel file processing with improved data extraction
  const processExcelFile = async (file) => {
    setIsProcessing(true)
    setError(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      // Check if required sheets exist
      const requiredSheets = ['SP Fields']
      const availableSheets = workbook.SheetNames
      const missingSheets = requiredSheets.filter(sheet => !availableSheets.includes(sheet))

      if (missingSheets.length > 0) {
        throw new Error(`Missing required sheets: ${missingSheets.join(', ')}. Available sheets: ${availableSheets.join(', ')}`)
      }

      // Extract data from SP Fields sheet with enhanced mapping
      const spFieldsSheet = workbook.Sheets['SP Fields']
      
      // Enhanced extraction with proper string handling and improved data model mapping
      const extractedData = {
        // Core financial fields from SP Fields sheet - updated based on real file structure
        taf: safeGetNumber(getCellValue(spFieldsSheet, 'B2')), // SPOApprovedTPC
        eac: safeGetNumber(getCellValue(spFieldsSheet, 'B6')), // SPOEAC
        currentYearCashflow: safeGetNumber(getCellValue(spFieldsSheet, 'B4')), // SPOCashflowCurrentYearTotal
        currentYearTarget: safeGetNumber(getCellValue(spFieldsSheet, 'B7')), // SPOCurrentYearTargetTotal
        futureYearCashflow: safeGetNumber(getCellValue(spFieldsSheet, 'B5')), // SPOCashflowFutureYearTotal
        budgetTotal: safeGetNumber(getCellValue(spFieldsSheet, 'B3')), // SPOBudgetTotal
        
        // Enhanced project information extraction - updated based on real file structure
        'Project Name': getProjectNameFromSheets(workbook) || 
                       safeGetString(file.name.replace(/\.(xlsx|xlsm|xls)$/i, '')),
        
        // Additional financial data for improved data model
        fundingTotal: safeGetNumber(getCellValue(spFieldsSheet, 'B2')), // Maps to new fundingTotal field
        spentTotal: safeGetNumber(getCellValue(spFieldsSheet, 'B4')), // Maps to new spentTotal field
        
        // Project identification
        projectId: safeGetString(getCellValue(spFieldsSheet, 'B1')), // Project ID if available
        
        // Enhanced funding sources extraction
        fundingSources: extractFundingSources(workbook),
        
        // Enhanced cost tracking
        costs: extractCosts(workbook),
        
        // Metadata for file management
        fileName: file.name,
        fileSize: file.size,
        extractedAt: new Date().toISOString(),
        availableSheets: availableSheets,
        
        // Additional extracted fields
        lastUpdated: new Date().toISOString()
      }

      // Calculate variances safely
      if (extractedData.taf && extractedData.eac) {
        extractedData.tafEacVariance = extractedData.taf - extractedData.eac
        extractedData.variancePercentage = ((extractedData.tafEacVariance / extractedData.taf) * 100).toFixed(2)
      }

      // Enhanced validation with improved data model considerations
      const validation = validateExtractedData(extractedData, project, isNewProject)
      
      setExtractedData(extractedData)
      setValidationResults(validation)
      setIsProcessing(false)

    } catch (error) {
      console.error('Error processing Excel file:', error)
      setError(`Failed to process Excel file: ${error.message}`)
      setIsProcessing(false)
    }
  }

  // Enhanced funding sources extraction
  const extractFundingSources = (workbook) => {
    const fundingSources = []
    
    // Try to extract from SP Fund Src sheet if available
    if (workbook.SheetNames.includes('SP Fund Src')) {
      const fundSrcSheet = workbook.Sheets['SP Fund Src']
      
      // Extract funding source data (this would need to be customized based on actual sheet structure)
      for (let row = 2; row <= 10; row++) { // Assuming data starts at row 2
        const source = safeGetString(getCellValue(fundSrcSheet, `A${row}`))
        const amount = safeGetNumber(getCellValue(fundSrcSheet, `B${row}`))
        
        if (source && amount > 0) {
          fundingSources.push({
            source: source,
            description: source,
            approvedValue: amount,
            currentYearBudget: amount,
            currentYearApproved: amount
          })
        }
      }
    }
    
    return fundingSources
  }

  // Enhanced cost extraction
  const extractCosts = (workbook) => {
    const costs = []
    
    // Try to extract from Cost Tracking sheet if available
    if (workbook.SheetNames.includes('Cost Tracking')) {
      const costSheet = workbook.Sheets['Cost Tracking']
      
      // Extract cost data (this would need to be customized based on actual sheet structure)
      for (let row = 2; row <= 20; row++) { // Assuming data starts at row 2
        const description = safeGetString(getCellValue(costSheet, `A${row}`))
        const amount = safeGetNumber(getCellValue(costSheet, `B${row}`))
        const date = safeGetString(getCellValue(costSheet, `C${row}`))
        
        if (description && amount > 0) {
          costs.push({
            id: `exp_${Date.now()}_${row}`,
            vendorId: null, // Would need to be mapped from vendor data
            description: description,
            amount: amount,
            date: date || new Date().toISOString().split('T')[0]
          })
        }
      }
    }
    
    return costs
  }

  // Helper function to extract cell value safely
  const getCellValue = (sheet, cellAddress) => {
    const cell = sheet[cellAddress]
    if (!cell) return null
    
    // Handle different cell types
    if (cell.t === 'n') return cell.v // number
    if (cell.t === 's') return cell.v // string
    if (cell.t === 'b') return cell.v // boolean
    if (cell.t === 'd') return cell.v // date
    
    return cell.v
  }

  // Safe string conversion - handles null, undefined, numbers
  const safeGetString = (value) => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') return value.trim()
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'boolean') return value.toString()
    return String(value).trim()
  }

  // Safe number conversion
  const safeGetNumber = (value) => {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[,$]/g, ''))
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  // Enhanced project name extraction based on real file structure
  const getProjectNameFromSheets = (workbook) => {
    // Updated locations based on the real Excel file structure
    const locations = [
      { sheet: 'Validations', cell: 'C6' },      // Found "Justice Centre" here
      { sheet: 'Target Tracking', cell: 'B3' },  // Found "Justice Centre" here
      { sheet: 'Summary (Rpt)', cell: 'B2' },
      { sheet: 'Summary (Rpt)', cell: 'A1' },
      { sheet: 'Budget Details (Rpt)', cell: 'B1' },
      { sheet: 'Budget Details (Rpt)', cell: 'A1' }
    ]

    for (const location of locations) {
      if (workbook.SheetNames.includes(location.sheet)) {
        const sheet = workbook.Sheets[location.sheet]
        const value = getCellValue(sheet, location.cell)
        const stringValue = safeGetString(value)
        if (stringValue && stringValue.length > 0 && stringValue !== 'Field' && stringValue !== 'Value') {
          return stringValue
        }
      }
    }
    
    // If not found in specific locations, search for project name patterns
    const searchSheets = ['Validations', 'Target Tracking', 'Summary (Rpt)', 'Budget Details (Rpt)']
    for (const sheetName of searchSheets) {
      if (workbook.SheetNames.includes(sheetName)) {
        const sheet = workbook.Sheets[sheetName]
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z100')
        
        for (let row = range.s.r; row <= Math.min(range.e.r, 20); row++) {
          for (let col = range.s.c; col <= Math.min(range.e.c, 10); col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
            const value = getCellValue(sheet, cellAddress)
            const stringValue = safeGetString(value)
            
            // Look for patterns that might be project names
            if (stringValue && 
                stringValue.length > 3 && 
                stringValue.length < 100 &&
                !stringValue.match(/^[A-Z]{1,3}\d+$/) && // Not like "A1", "B2"
                !stringValue.toLowerCase().includes('field') &&
                !stringValue.toLowerCase().includes('value') &&
                !stringValue.toLowerCase().includes('total') &&
                (stringValue.toLowerCase().includes('centre') || 
                 stringValue.toLowerCase().includes('center') ||
                 stringValue.toLowerCase().includes('justice') ||
                 stringValue.toLowerCase().includes('project'))) {
              return stringValue
            }
          }
        }
      }
    }
    
    return null
  }

  // Enhanced validation with improved data model considerations
  const validateExtractedData = (data, project, isNewProject) => {
    const issues = []
    const warnings = []

    // Check for required financial data
    if (!data.taf || data.taf <= 0) {
      issues.push('Total Approved Funding (TAF) is missing or invalid')
    }

    if (!data.eac || data.eac <= 0) {
      warnings.push('Estimate at Completion (EAC) is missing or invalid')
    }

    // Check for project name with safe string handling
    const projectName = safeGetString(data['Project Name'])
    if (!projectName || projectName.length === 0) {
      if (isNewProject) {
        issues.push('Project name could not be extracted from Excel file and is required for new projects')
      } else {
        warnings.push('Project name could not be extracted from Excel file')
      }
    }

    // Enhanced validation for new data model fields
    if (data.fundingSources && data.fundingSources.length === 0) {
      warnings.push('No funding sources were extracted from the PFMT file')
    }

    if (data.costs && data.costs.length === 0) {
      warnings.push('No cost data was extracted from the PFMT file')
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      extractedFieldCount: Object.keys(data).filter(key => {
        const value = data[key]
        return value !== null && value !== undefined && value !== '' && value !== 0
      }).length
    }
  }

  // Enhanced data import with improved error handling for both new and existing projects
  const handleImportData = async () => {
    if (!extractedData || !validationResults?.isValid) {
      setError('No valid data to import')
      return
    }

    // For new projects, we don't need a project to be selected
    if (!isNewProject && (!project || !project.id)) {
      setError('No project selected for PFMT data import')
      return
    }

    try {
      // Ensure all string fields are properly converted
      const cleanedData = {
        ...extractedData,
        'Project Name': safeGetString(extractedData['Project Name']),
        projectId: safeGetString(extractedData.projectId)
      }
      
      // Call the parent component's data extracted handler with the cleaned data
      // This allows the parent to handle the actual import logic
      onDataExtracted(cleanedData)
      
    } catch (error) {
      console.error('Error importing PFMT data:', error)
      setError(`Failed to import PFMT data: ${error.message}`)
    }
  }

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    const excelFile = files.find(file => 
      file.name.match(/\.(xlsx|xlsm|xls)$/i)
    )
    
    if (excelFile) {
      setFile(excelFile)
      setError(null)
      processExcelFile(excelFile)
    } else {
      setError('Please drop a valid Excel file (.xlsx, .xlsm, or .xls)')
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Import PFMT Data</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload your PFMT Excel file to extract project data with enhanced data model integration
            </p>
            {!isNewProject && project && (
              <p className="text-xs text-blue-600 mt-1">
                Importing data for: {project.name || 'Selected Project'}
              </p>
            )}
            {isNewProject && (
              <p className="text-xs text-green-600 mt-1">
                Creating new project from PFMT data
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!file && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload PFMT Excel File</h3>
                <p className="text-gray-600 mb-4">Drag and drop your file here, or click to browse</p>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept=".xlsx,.xlsm,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Supports .xlsx, .xlsm, and .xls files</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Processing Excel file with enhanced data extraction...</p>
            </div>
          )}

          {extractedData && validationResults && (
            <div className="space-y-4">
              {/* Validation Results */}
              <div className={`border rounded-md p-4 ${validationResults.isValid ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                <div className="flex items-center">
                  <svg className={`w-5 h-5 mr-2 ${validationResults.isValid ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={validationResults.isValid ? "M5 13l4 4L19 7" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                  </svg>
                  <h3 className={`font-medium ${validationResults.isValid ? 'text-green-800' : 'text-yellow-800'}`}>
                    {validationResults.isValid ? 'Data Validation Passed' : 'Data Validation Warnings'}
                  </h3>
                </div>
                <p className={`text-sm mt-1 ${validationResults.isValid ? 'text-green-700' : 'text-yellow-700'}`}>
                  Extracted {validationResults.extractedFieldCount} fields from Excel file with enhanced data model support
                </p>
                
                {validationResults.issues.length > 0 && (
                  <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                    {validationResults.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                )}
                
                {validationResults.warnings.length > 0 && (
                  <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                    {validationResults.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Enhanced Extracted Data Preview */}
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-gray-900 mb-3">Enhanced Data Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Project Name:</span>
                    <span className="ml-2 text-gray-900">{safeGetString(extractedData['Project Name']) || 'Not found'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">File Name:</span>
                    <span className="ml-2 text-gray-900">{extractedData.fileName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">TAF (Approved TPC):</span>
                    <span className="ml-2 text-gray-900">${extractedData.taf?.toLocaleString() || 'Not found'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">EAC:</span>
                    <span className="ml-2 text-gray-900">${extractedData.eac?.toLocaleString() || 'Not found'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Current Year Cashflow:</span>
                    <span className="ml-2 text-gray-900">${extractedData.currentYearCashflow?.toLocaleString() || 'Not found'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Budget Total:</span>
                    <span className="ml-2 text-gray-900">${extractedData.budgetTotal?.toLocaleString() || 'Not found'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Available Sheets:</span>
                    <span className="ml-2 text-gray-900">{extractedData.availableSheets?.length || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Funding Sources:</span>
                    <span className="ml-2 text-gray-900">{extractedData.fundingSources?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Data Model Features */}
              {(extractedData.fundingSources?.length > 0 || extractedData.costs?.length > 0) && (
                <div className="border rounded-md p-4 bg-blue-50">
                  <h4 className="font-medium text-blue-900 mb-2">Enhanced Data Model Features</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {extractedData.fundingSources?.length > 0 && (
                      <li>• {extractedData.fundingSources.length} funding source(s) will be properly structured</li>
                    )}
                    {extractedData.costs?.length > 0 && (
                      <li>• {extractedData.costs.length} cost entrie(s) will be integrated into the project</li>
                    )}
                    <li>• File metadata will be stored in the enhanced file management system</li>
                    <li>• Project financial data will be updated with improved tracking</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {extractedData && (
            <button
              onClick={handleImportData}
              disabled={!validationResults?.isValid}
              className={`px-4 py-2 rounded-md transition-colors ${
                validationResults?.isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isNewProject ? 'Create Project' : 'Import Enhanced Data'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

