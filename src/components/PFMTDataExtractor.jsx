// Fixed PFMT Data Extractor - Handles Non-String Values
import React, { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'

// PFMT Data Extractor Component - Fixed Version with Better Error Handling
export function PFMTDataExtractor({ project, onDataExtracted, onClose }) {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [validationResults, setValidationResults] = useState(null)
  const [error, setError] = useState(null)

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

  // Process Excel file and extract PFMT data
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

      // Extract data from SP Fields sheet
      const spFieldsSheet = workbook.Sheets['SP Fields']
      
      // Enhanced extraction with proper string handling
      const extractedData = {
        // Primary financial fields from SP Fields sheet
        taf: safeGetNumber(getCellValue(spFieldsSheet, 'B2')), // Total Approved Funding
        eac: safeGetNumber(getCellValue(spFieldsSheet, 'B6')), // Estimate at Completion
        currentYearCashflow: safeGetNumber(getCellValue(spFieldsSheet, 'B4')), // Current Year Cashflow Total
        currentYearTarget: safeGetNumber(getCellValue(spFieldsSheet, 'B7')), // Current Year Target
        
        // Project information - try multiple locations with safe string handling
        'Project Name': safeGetString(getCellValue(spFieldsSheet, 'B8')) || 
                       getProjectNameFromSheets(workbook) || 
                       safeGetString(file.name.replace(/\.(xlsx|xlsm|xls)$/i, '')),
        
        // Additional fields for validation
        projectId: safeGetString(getCellValue(spFieldsSheet, 'B1')), // Project ID if available
        lastUpdated: new Date().toISOString(),
        
        // Metadata
        fileName: file.name,
        fileSize: file.size,
        extractedAt: new Date().toISOString(),
        availableSheets: availableSheets
      }

      // Calculate variances safely
      if (extractedData.taf && extractedData.eac) {
        extractedData.tafEacVariance = extractedData.taf - extractedData.eac
        extractedData.variancePercentage = ((extractedData.tafEacVariance / extractedData.taf) * 100).toFixed(2)
      }

      // Validate the extracted data
      const validation = validateExtractedData(extractedData, project)
      
      setExtractedData(extractedData)
      setValidationResults(validation)
      setIsProcessing(false)

    } catch (error) {
      console.error('Error processing Excel file:', error)
      setError(`Failed to process Excel file: ${error.message}`)
      setIsProcessing(false)
    }
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

  // Try to get project name from various sheet locations
  const getProjectNameFromSheets = (workbook) => {
    const locations = [
      { sheet: 'Validations', cell: 'C6' },
      { sheet: 'Target Tracking', cell: 'B3' },
      { sheet: 'Summary (Rpt)', cell: 'B2' }
    ]

    for (const location of locations) {
      if (workbook.SheetNames.includes(location.sheet)) {
        const sheet = workbook.Sheets[location.sheet]
        const value = getCellValue(sheet, location.cell)
        const stringValue = safeGetString(value)
        if (stringValue && stringValue.length > 0) {
          return stringValue
        }
      }
    }
    return null
  }

  // Validate extracted data
  const validateExtractedData = (data, project) => {
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
      warnings.push('Project name could not be extracted from Excel file')
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

  // Handle data import confirmation
  const handleImportData = () => {
    if (extractedData && validationResults?.isValid) {
      // Ensure all string fields are properly converted
      const cleanedData = {
        ...extractedData,
        'Project Name': safeGetString(extractedData['Project Name']),
        projectId: safeGetString(extractedData.projectId)
      }
      onDataExtracted(cleanedData)
      // Don't auto-close, let parent handle navigation
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
              Upload your PFMT Excel file to extract project data
            </p>
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
              <p className="text-gray-600 mt-2">Processing Excel file...</p>
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
                  Extracted {validationResults.extractedFieldCount} fields from Excel file
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

              {/* Extracted Data Preview */}
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-gray-900 mb-3">Extracted Data Preview</h3>
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
                    <span className="font-medium text-gray-700">TAF:</span>
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
                    <span className="font-medium text-gray-700">Available Sheets:</span>
                    <span className="ml-2 text-gray-900">{extractedData.availableSheets?.length || 0}</span>
                  </div>
                </div>
              </div>
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
              Import Data
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

