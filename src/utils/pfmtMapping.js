// Enhanced PFMT Excel Template Mapping Guide
// Based on analysis of real PFMT file: RDJC-AI-FIN-XX-TRK-PFMTv3.0.xlsm

export const PFMT_FIELD_MAPPING = {
  // Financial Data from SP Fields sheet (Column B contains values)
  'B2': 'taf', // SPOApprovedTPC (Total Approved Funding)
  'B3': 'totalBudget', // SPOBudgetTotal  
  'B4': 'currentYearCashflow', // SPOCashflowCurrentYearTotal
  'B5': 'futureYearCashflow', // SPOCashflowFutureYearTotal
  'B6': 'eac', // SPOEAC (Estimate at Completion)
  'B7': 'currentYearTarget', // SPOCurrentYearTargetTotal
  'B8': 'currentYearProposedTarget', // SPOCurrentYearProposedTargetTotal
  'B9': 'previousYearsTargets', // SPOPreviousYearsApprovedTargets
  'B10': 'futureYearsTargets', // SPOFutureYearsApprovedTargets
  'B11': 'percentCompleteTAF', // SPOPercentCompleteTAFBudget
  'B12': 'percentCompleteEAC', // SPOPercentCompleteEACBudget
  'B13': 'totalCashflow', // SPOTotalCashflow
  'B15': 'totalExpenditures', // SPOTotalExpenditurestoDate
  'B16': 'currentFiscalYearActuals', // SPOCurrentFiscalYearActuals
  'B17': 'previousYearsCashflow', // SPOCashflowPreviousYearsTotal
  'B18': 'currentYearBudgetTarget', // SPOCurrentYearBudgetTarget
}

// Project Information from other sheets
export const PROJECT_INFO_MAPPING = {
  // From Validations sheet
  'Validations!C6': 'Project Name', // Project Title
  
  // From Target Tracking sheet  
  'Target Tracking!B3': 'Project Name', // Alternative location
  'Target Tracking!B4': 'lastUpdated', // "As of" date
}

// Budget Categories from Summary sheet
export const BUDGET_CATEGORIES_MAPPING = {
  // Category names
  'Summary (Rpt)!C6': 'administrationCategory',
  'Summary (Rpt)!C7': 'professionalServicesCategory',
  'Summary (Rpt)!C8': 'constructionCategory', 
  'Summary (Rpt)!C9': 'feItCategory',
  'Summary (Rpt)!C10': 'landCategory',
  'Summary (Rpt)!C11': 'managementReserveCategory',
  
  // Budget amounts
  'Summary (Rpt)!D6': 'administrationBudget',
  'Summary (Rpt)!D7': 'professionalServicesBudget',
  'Summary (Rpt)!D8': 'constructionBudget',
  'Summary (Rpt)!D9': 'feItBudget', 
  'Summary (Rpt)!D10': 'landBudget',
  'Summary (Rpt)!D11': 'managementReserveBudget',
  
  // Budget amendments
  'Summary (Rpt)!E6': 'administrationAmendments',
  'Summary (Rpt)!E7': 'professionalServicesAmendments',
  'Summary (Rpt)!E8': 'constructionAmendments',
  'Summary (Rpt)!E9': 'feItAmendments',
  'Summary (Rpt)!E10': 'landAmendments', 
  'Summary (Rpt)!E11': 'managementReserveAmendments',
}

// Alternative cell locations to check if primary location is empty
export const ALTERNATIVE_MAPPINGS = {
  'Project Name': ['Validations!C6', 'Target Tracking!B3', 'A1', 'C1'], 
  'Project Description': ['B33', 'C9', 'D9'],
  'Geographic Region': ['C16', 'D16']
}

// Field validation rules
export const FIELD_VALIDATION = {
  'Square Meters': 'number',
  'Number of Structures': 'number',
  'Number of Jobs': 'number', 
  'Latitude': 'number',
  'Longitude': 'number',
  'taf': 'currency',
  'eac': 'currency',
  'totalBudget': 'currency',
  'currentYearCashflow': 'currency',
  'futureYearCashflow': 'currency',
  'currentYearTarget': 'currency',
  'currentYearProposedTarget': 'currency',
  'previousYearsTargets': 'currency',
  'futureYearsTargets': 'currency',
  'totalCashflow': 'currency',
  'totalExpenditures': 'currency',
  'currentFiscalYearActuals': 'currency',
  'previousYearsCashflow': 'currency',
  'currentYearBudgetTarget': 'currency',
  'percentCompleteTAF': 'percentage',
  'percentCompleteEAC': 'percentage',
  'administrationBudget': 'currency',
  'professionalServicesBudget': 'currency',
  'constructionBudget': 'currency',
  'feItBudget': 'currency',
  'landBudget': 'currency',
  'managementReserveBudget': 'currency'
}

// Default values for missing fields
export const DEFAULT_VALUES = {
  'Project Category': 'Infrastructure',
  'Client Ministry': 'Infrastructure', 
  'Project Type': 'New Construction',
  'Delivery Type': 'Design-Bid-Build',
  'Delivery Method': 'Traditional',
  'Building Type': 'Office'
}

