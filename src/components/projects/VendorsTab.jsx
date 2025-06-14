// Vendors Tab Component for Project Profile
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
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
  Trash2
} from 'lucide-react'

// Vendors Overview Component
export function VendorsOverview({ project, onUpdate, isEditing = false }) {
  const vendors = project?.vendors || []
  const changeOrders = project?.changeOrders || []
  
  // Calculate summary statistics
  const totalCommitment = vendors.reduce((sum, vendor) => sum + (vendor.currentCommitment || 0), 0)
  const totalBilled = vendors.reduce((sum, vendor) => sum + (vendor.billedToDate || 0), 0)
  const totalHoldback = vendors.reduce((sum, vendor) => sum + (vendor.holdback || 0), 0)
  const totalChangeOrderValue = changeOrders.reduce((sum, co) => sum + (co.value || 0), 0)
  
  const averagePercentSpent = vendors.length > 0 
    ? vendors.reduce((sum, vendor) => sum + (vendor.percentSpent || 0), 0) / vendors.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commitment</p>
                <p className="text-lg font-bold">${totalCommitment.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Billed</p>
                <p className="text-lg font-bold">${totalBilled.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Holdback</p>
                <p className="text-lg font-bold">${totalHoldback.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Change Orders</p>
                <p className="text-lg font-bold">${totalChangeOrderValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendors & Contractors ({vendors.length})
            </span>
            {isEditing && (
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Vendor
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Current vendor commitments and billing status
          </CardDescription>
        </CardHeader>
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
      </Card>
    </div>
  )
}

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
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Latest Cost Date</Label>
                <p className="mt-1 text-sm">{vendor.latestCostDate || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">CMS Value</Label>
                <p className="mt-1 text-sm">${(vendor.cmsValue || 0).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Variance</Label>
                <p className={`mt-1 text-sm font-medium ${(vendor.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(vendor.variance || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Change Orders Component
export function ChangeOrders({ project, onUpdate, isEditing = false }) {
  const changeOrders = project?.changeOrders || []
  
  const getStatusBadge = (status) => {
    const statusColors = {
      'Approved': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Draft': 'bg-gray-100 text-gray-800'
    }
    
    return statusColors[status] || statusColors['Draft']
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Change Orders ({changeOrders.length})
          </span>
          {isEditing && (
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Change Order
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Track change orders and amendments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {changeOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No change orders data available</p>
            <p className="text-sm">Upload a PFMT Excel file to populate change order information</p>
          </div>
        ) : (
          <div className="space-y-4">
            {changeOrders.map((changeOrder, index) => (
              <Card key={index} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{changeOrder.referenceNumber || `CO-${index + 1}`}</h4>
                        <Badge className={getStatusBadge(changeOrder.status)}>
                          {changeOrder.status || 'Draft'}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {changeOrder.vendor || 'Unknown Vendor'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">
                        {changeOrder.description || 'No description provided'}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Value</p>
                          <p className="font-semibold text-lg">
                            ${(changeOrder.value || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Approved Date</p>
                          <p className="text-sm">
                            {changeOrder.approvedDate ? 
                              new Date(changeOrder.approvedDate).toLocaleDateString() : 
                              'Not approved'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Reason Code</p>
                          <p className="text-sm">{changeOrder.reasonCode || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Contract ID</p>
                          <p className="text-sm">{changeOrder.contractId || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      {changeOrder.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {changeOrder.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <div className="flex items-center gap-2 ml-4">
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Funding Lines Component
export function FundingLines({ project, onUpdate, isEditing = false }) {
  const fundingLines = project?.fundingLines || []
  
  const totalApprovedValue = fundingLines.reduce((sum, line) => sum + (line.approvedValue || 0), 0)
  const totalCurrentYearBudget = fundingLines.reduce((sum, line) => sum + (line.currentYearBudget || 0), 0)
  const totalCurrentYearApproved = fundingLines.reduce((sum, line) => sum + (line.currentYearApproved || 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Funding Lines ({fundingLines.length})
          </span>
          {isEditing && (
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Funding Line
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Project funding sources and budget allocations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Approved Value</p>
              <p className="text-xl font-bold">${totalApprovedValue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Current Year Budget</p>
              <p className="text-xl font-bold">${totalCurrentYearBudget.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Current Year Approved</p>
              <p className="text-xl font-bold">${totalCurrentYearApproved.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {fundingLines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No funding lines data available</p>
            <p className="text-sm">Upload a PFMT Excel file to populate funding information</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fundingLines.map((fundingLine, index) => (
              <Card key={index} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{fundingLine.source || 'Unknown Source'}</h4>
                        {fundingLine.wbs && (
                          <Badge variant="outline">{fundingLine.wbs}</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">
                        {fundingLine.description || fundingLine.capitalPlanLine || 'No description provided'}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Approved Value</p>
                          <p className="font-semibold text-lg">
                            ${(fundingLine.approvedValue || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Current Year Budget</p>
                          <p className="font-semibold">
                            ${(fundingLine.currentYearBudget || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Current Year Approved</p>
                          <p className="font-semibold">
                            ${(fundingLine.currentYearApproved || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Project ID</p>
                          <p className="text-sm">{fundingLine.projectId || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="flex items-center gap-2 ml-4">
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Main Vendors Tab Component
export function VendorsTab({ project, onUpdate, isEditing = false }) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="changes">Change Orders</TabsTrigger>
          <TabsTrigger value="funding">Funding Lines</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <VendorsOverview project={project} onUpdate={onUpdate} isEditing={isEditing} />
        </TabsContent>
        
        <TabsContent value="vendors">
          <VendorsOverview project={project} onUpdate={onUpdate} isEditing={isEditing} />
        </TabsContent>
        
        <TabsContent value="changes">
          <ChangeOrders project={project} onUpdate={onUpdate} isEditing={isEditing} />
        </TabsContent>
        
        <TabsContent value="funding">
          <FundingLines project={project} onUpdate={onUpdate} isEditing={isEditing} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

