// Enhanced Vendors Tab Component for Project Profile
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Building2, 
  DollarSign, 
  Calendar, 
  Users, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

// Individual Vendor Card Component
function VendorCard({ vendor, index, onUpdate, isEditing, project }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const percentSpent = vendor.percentSpent || 0
  const getStatusColor = (percent) => {
    if (percent < 25) return 'bg-green-500'
    if (percent < 75) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleVendorUpdate = (field, value) => {
    if (onUpdate) {
      const updatedVendors = [...(project.vendors || [])]
      updatedVendors[index] = { ...vendor, [field]: value }
      onUpdate({ vendors: updatedVendors })
    }
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg">{vendor.name || 'Unnamed Vendor'}</h3>
              <Badge variant="outline">{vendor.contractId || 'No Contract ID'}</Badge>
              {vendor.status && (
                <Badge variant={vendor.status === 'Active' ? 'default' : 'secondary'}>
                  {vendor.status}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div>
                <p className="text-sm text-gray-600">Current Commitment</p>
                <p className="font-semibold">${(vendor.currentCommitment || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Billed to Date</p>
                <p className="font-semibold">${(vendor.billedToDate || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Percent Spent</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStatusColor(percentSpent)}`}
                      style={{ width: `${Math.min(percentSpent, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{percentSpent.toFixed(1)}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Holdback</p>
                <p className="font-semibold">${(vendor.holdback || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing && (
              <>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Latest Cost Date</p>
                <p className="font-medium">{vendor.latestCostDate || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Change Value</p>
                <p className="font-medium">${(vendor.changeValue || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Change Order Item Component
function ChangeOrderItem({ changeOrder, index, onUpdate, isEditing, project }) {
  const getStatusBadge = (status) => {
    const statusColors = {
      'Approved': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Draft': 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge className={statusColors[status] || statusColors['Draft']}>
        {status || 'Draft'}
      </Badge>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold">{changeOrder.vendor || 'Unknown Vendor'}</h4>
              {getStatusBadge(changeOrder.status)}
              <Badge variant="outline">{changeOrder.referenceNumber || 'No Ref #'}</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Contract ID</p>
                <p className="font-medium">{changeOrder.contractId || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Change Value</p>
                <p className="font-semibold text-lg">${(changeOrder.value || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved Date</p>
                <p className="font-medium">{changeOrder.approvedDate || 'Not approved'}</p>
              </div>
            </div>
            
            {changeOrder.description && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-sm">{changeOrder.description}</p>
              </div>
            )}
          </div>
          
          {isEditing && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Funding Line Item Component
function FundingLineItem({ fundingLine, index, onUpdate, isEditing, project }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold">{fundingLine.source || 'Unknown Source'}</h4>
              <Badge variant="outline">{fundingLine.projectId || 'No Project ID'}</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium">{fundingLine.description || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved Value</p>
                <p className="font-semibold text-lg">${(fundingLine.approvedValue || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Year Budget</p>
                <p className="font-medium">${(fundingLine.currentYearBudget || 0).toLocaleString()}</p>
              </div>
            </div>
            
            {fundingLine.capitalPlanLine && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Capital Plan Line</p>
                <p className="text-sm">{fundingLine.capitalPlanLine}</p>
              </div>
            )}
          </div>
          
          {isEditing && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Main Vendors Tab Component with Milestone-style sections
export function VendorsTab({ project, onUpdate, isEditing = false }) {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    vendors: true,
    changeOrders: false,
    fundingLines: false
  })

  const vendors = project?.vendors || []
  const changeOrders = project?.changeOrders || []
  const fundingLines = project?.fundingLines || []
  
  // Calculate summary statistics
  const totalCommitment = vendors.reduce((sum, vendor) => sum + (vendor.currentCommitment || 0), 0)
  const totalBilled = vendors.reduce((sum, vendor) => sum + (vendor.billedToDate || 0), 0)
  const totalHoldback = vendors.reduce((sum, vendor) => sum + (vendor.holdback || 0), 0)
  const totalChangeOrderValue = changeOrders.reduce((sum, co) => sum + (co.value || 0), 0)

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <Card>
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('summary')}
        >
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </span>
            {expandedSections.summary ? 
              <ChevronDown className="h-5 w-5" /> : 
              <ChevronRight className="h-5 w-5" />
            }
          </CardTitle>
        </CardHeader>
        {expandedSections.summary && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Total Commitment</p>
                <p className="text-xl font-bold text-blue-600">${totalCommitment.toLocaleString()}</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Total Billed</p>
                <p className="text-xl font-bold text-green-600">${totalBilled.toLocaleString()}</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Total Holdback</p>
                <p className="text-xl font-bold text-orange-600">${totalHoldback.toLocaleString()}</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Change Orders</p>
                <p className="text-xl font-bold text-purple-600">${totalChangeOrderValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Vendors Section */}
      <Card>
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('vendors')}
        >
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendors & Contractors ({vendors.length})
            </span>
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Vendor
                </Button>
              )}
              {expandedSections.vendors ? 
                <ChevronDown className="h-5 w-5" /> : 
                <ChevronRight className="h-5 w-5" />
              }
            </div>
          </CardTitle>
        </CardHeader>
        {expandedSections.vendors && (
          <CardContent>
            {vendors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No vendors data available</p>
                <p className="text-sm">Upload a PFMT Excel file to populate vendor information</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendors.map((vendor, index) => (
                  <VendorCard 
                    key={index} 
                    vendor={vendor} 
                    index={index}
                    onUpdate={onUpdate}
                    isEditing={isEditing}
                    project={project}
                  />
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Change Orders Section */}
      <Card>
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('changeOrders')}
        >
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Change Orders ({changeOrders.length})
            </span>
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Change Order
                </Button>
              )}
              {expandedSections.changeOrders ? 
                <ChevronDown className="h-5 w-5" /> : 
                <ChevronRight className="h-5 w-5" />
              }
            </div>
          </CardTitle>
        </CardHeader>
        {expandedSections.changeOrders && (
          <CardContent>
            {changeOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No change orders available</p>
                <p className="text-sm">Change orders will appear here when uploaded via PFMT Excel</p>
              </div>
            ) : (
              <div className="space-y-4">
                {changeOrders.map((changeOrder, index) => (
                  <ChangeOrderItem 
                    key={index} 
                    changeOrder={changeOrder} 
                    index={index}
                    onUpdate={onUpdate}
                    isEditing={isEditing}
                    project={project}
                  />
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Funding Lines Section */}
      <Card>
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('fundingLines')}
        >
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Funding Lines ({fundingLines.length})
            </span>
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Funding Line
                </Button>
              )}
              {expandedSections.fundingLines ? 
                <ChevronDown className="h-5 w-5" /> : 
                <ChevronRight className="h-5 w-5" />
              }
            </div>
          </CardTitle>
        </CardHeader>
        {expandedSections.fundingLines && (
          <CardContent>
            {fundingLines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No funding lines available</p>
                <p className="text-sm">Funding lines will appear here when uploaded via PFMT Excel</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fundingLines.map((fundingLine, index) => (
                  <FundingLineItem 
                    key={index} 
                    fundingLine={fundingLine} 
                    index={index}
                    onUpdate={onUpdate}
                    isEditing={isEditing}
                    project={project}
                  />
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

