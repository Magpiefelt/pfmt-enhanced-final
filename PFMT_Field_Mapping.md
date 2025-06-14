# PFMT Excel to JSON Field Mapping

Based on the analysis of the RDJC-AI-FIN-XX-TRK-PFMTv3.0.xlsm file, this document provides a comprehensive mapping of Excel columns to the project JSON structure.

## Excel File Structure Overview

The PFMT Excel file contains the following key sheets:
- **SP Fields**: SharePoint fields with key project values
- **SP Fund Src**: Funding source data for SharePoint
- **FundingLines Lookup**: Detailed funding line information
- **Change Tracking**: Vendor change orders and amendments
- **Cost Tracking**: Vendor costs and commitments
- **Prime Cont. Summary**: Prime contractor information
- **Target Tracking**: Budget targets and approvals
- **Budget Tracking**: Detailed budget breakdown
- **Validations**: Dropdown field sources and project setup

## Core Project Fields Mapping

### Basic Project Information
| Excel Source | Excel Field/Cell | JSON Field | Description |
|--------------|------------------|------------|-------------|
| Validations | Row 5, Col 1 | project.name | Project Title |
| SP Fields | SPOApprovedTPC | project.approvedTPC | Total Approved Project Cost |
| SP Fields | SPOBudgetTotal | project.totalBudget | Total Budget Amount |
| SP Fields | SPOCashflowCurrentYearTotal | project.currentYearCashflow | Current Year Cashflow Total |
| SP Fields | SPOCashflowFutureYearTotal | project.futureYearCashflow | Future Year Cashflow Total |
| Validations | Project Roles | project.projectManager | Project Manager Name |
| Prime Cont. Summary | Prime Contractor | project.primeContractor | Prime Contractor Name |
| Prime Cont. Summary | Delivery Method | project.deliveryMethod | Project Delivery Method |

### Project Details
| Excel Source | Excel Field/Cell | JSON Field | Description |
|--------------|------------------|------------|-------------|
| Validations | Primary Category | project.category | Project Category |
| Validations | Phase \| Subproject | project.phase | Current Project Phase |
| Target Tracking | Project Status | project.status | Project Status (Active/Inactive) |
| Target Tracking | Project Description | project.description | Project Description |
| Validations | Region | project.geographicRegion | Geographic Region |
| Target Tracking | Municipality | project.municipality | Municipality/Location |
| Target Tracking | Building Name | project.buildingName | Building Name |
| Target Tracking | Building Type | project.buildingType | Building Type |

### Financial Data
| Excel Source | Excel Field/Cell | JSON Field | Description |
|--------------|------------------|------------|-------------|
| Target Tracking | EAC | project.eac | Estimate at Completion |
| Target Tracking | Current Year Budget Target | project.currentYearBudgetTarget | Current Year Budget Target |
| Target Tracking | Current Year Approved Target | project.currentYearApprovedTarget | Current Year Approved Target |
| Cost Tracking | Billed to Date | project.amountSpent | Total Amount Spent |
| Target Tracking | TAF | project.taf | Total Approved Funding |

## Array Fields Mapping

### Funding Lines (project.fundingLines[])
Source: **SP Fund Src** and **FundingLines Lookup** sheets

| Excel Column | JSON Field | Description |
|--------------|------------|-------------|
| Funding Source | fundingLines[i].source | Funding Source ID (e.g., "P-002360") |
| Funding Source Description | fundingLines[i].description | Funding Source Description (e.g., "GFI") |
| Capital Plan Line | fundingLines[i].capitalPlanLine | Capital Plan Line Description |
| Approved Value | fundingLines[i].approvedValue | Approved Funding Value |
| Current Year Budget Target | fundingLines[i].currentYearBudget | Current Year Budget Target |
| Current Year Approved Target | fundingLines[i].currentYearApproved | Current Year Approved Target |
| Project ID | fundingLines[i].projectId | CMS Project ID |
| WBS | fundingLines[i].wbs | Work Breakdown Structure Code |

### Vendors/Contracts (project.vendors[])
Source: **Change Tracking** and **Cost Tracking** sheets

| Excel Column | JSON Field | Description |
|--------------|------------|-------------|
| Vendor / Org. | vendors[i].name | Vendor/Organization Name |
| Contract ID | vendors[i].contractId | Contract Identification Number |
| Current Commitment | vendors[i].currentCommitment | Current Contract Commitment |
| Billed to Date | vendors[i].billedToDate | Amount Billed to Date |
| % Spent | vendors[i].percentSpent | Percentage of Contract Spent |
| Holdback | vendors[i].holdback | Holdback Amount |
| Latest Cost Date | vendors[i].latestCostDate | Latest Cost Update Date |
| Vendor Status | vendors[i].status | Vendor Status |
| Change Status | vendors[i].changeStatus | Change Order Status |
| Change Value | vendors[i].changeValue | Change Order Value |

### Change Orders (project.changeOrders[])
Source: **Change Tracking** sheet

| Excel Column | JSON Field | Description |
|--------------|------------|-------------|
| Vendor / Org. | changeOrders[i].vendor | Vendor Name |
| Contract ID | changeOrders[i].contractId | Contract ID |
| Change Status | changeOrders[i].status | Change Order Status |
| Approved Date | changeOrders[i].approvedDate | Change Approval Date |
| Change Value | changeOrders[i].value | Change Order Value |
| Reference # | changeOrders[i].referenceNumber | Change Reference Number |
| Reason Code | changeOrders[i].reasonCode | Reason Code |
| Description | changeOrders[i].description | Change Description |
| Notes | changeOrders[i].notes | Additional Notes |

## JSON Schema Structure

```json
{
  "project": {
    // Basic Information
    "name": "string",
    "status": "string",
    "category": "string",
    "phase": "string",
    "deliveryMethod": "string",
    "description": "string",
    
    // Financial Data
    "approvedTPC": "number",
    "totalBudget": "number",
    "eac": "number",
    "taf": "number",
    "amountSpent": "number",
    "currentYearCashflow": "number",
    "futureYearCashflow": "number",
    "currentYearBudgetTarget": "number",
    "currentYearApprovedTarget": "number",
    
    // Project Details
    "projectManager": "string",
    "primeContractor": "string",
    "geographicRegion": "string",
    "municipality": "string",
    "buildingName": "string",
    "buildingType": "string",
    
    // Array Fields
    "fundingLines": [
      {
        "source": "string",
        "description": "string",
        "capitalPlanLine": "string",
        "approvedValue": "number",
        "currentYearBudget": "number",
        "currentYearApproved": "number",
        "projectId": "string",
        "wbs": "string"
      }
    ],
    
    "vendors": [
      {
        "name": "string",
        "contractId": "string",
        "currentCommitment": "number",
        "billedToDate": "number",
        "percentSpent": "number",
        "holdback": "number",
        "latestCostDate": "string",
        "status": "string",
        "changeStatus": "string",
        "changeValue": "number"
      }
    ],
    
    "changeOrders": [
      {
        "vendor": "string",
        "contractId": "string",
        "status": "string",
        "approvedDate": "string",
        "value": "number",
        "referenceNumber": "string",
        "reasonCode": "string",
        "description": "string",
        "notes": "string"
      }
    ],
    
    // Metadata
    "lastPfmtUpdate": "string",
    "pfmtFileName": "string",
    "pfmtExtractedAt": "string",
    "createdAt": "string",
    "lastUpdated": "string"
  }
}
```

## Implementation Notes

1. **Sheet Reading Strategy**: Use `XLSX.readFile()` with `{sheetStubs: true, defval: ""}` to ensure empty cells are included
2. **Multi-Sheet Processing**: Process multiple sheets to build complete project object
3. **Data Validation**: Convert string numbers to numeric values and validate data types
4. **Error Handling**: Handle missing sheets or columns gracefully with default values
5. **Cell References**: For SP Fields sheet, use specific cell references (e.g., B1, B2, etc.)
6. **Array Building**: Loop through rows in array-based sheets to build funding lines, vendors, and change orders
7. **Data Normalization**: Ensure consistent field naming and data formats across all sources

## Priority Implementation Order

1. **SP Fields** - Core financial data (highest priority)
2. **SP Fund Src** - Funding source information
3. **Target Tracking** - Project details and targets
4. **Cost Tracking** - Vendor and cost information
5. **Change Tracking** - Change orders and amendments
6. **Prime Cont. Summary** - Prime contractor details
7. **Validations** - Project setup and dropdown values

