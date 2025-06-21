// Enhanced Vendors Tab Component for Project Profile with Company Integration
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { CompanyAPI, VendorAPI } from '../../services/apiService.js'
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
  ChevronRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'

// Individual Vendor Card Component with Company Information
function VendorCard({ vendor, index, onUpdate, onDelete, isEditing, project }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const percentSpent = vendor.percentSpent || 0
  const getStatusColor = (percent) => {
    if (percent < 25) return 'bg-green-500'
    if (percent < 75) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const company = vendor.company || {}

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">{company.name || 'Unknown Company'}</h3>
              </div>
              <Badge variant="outline">{vendor.contractId || 'No Contract ID'}</Badge>
              {vendor.role && (
                <Badge variant="secondary">{vendor.role}</Badge>
              )}
              {vendor.status && (
                <Badge variant={vendor.status === 'Active' ? 'default' : 'secondary'}>
                  {vendor.status}
                </Badge>
              )}
            </div>
            
            {/* Company Contact Information */}
            {(company.contactPerson || company.contactEmail || company.contactPhone) && (
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                {company.contactPerson && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{company.contactPerson}</span>
                  </div>
                )}
                {company.contactEmail && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{company.contactEmail}</span>
                  </div>
                )}
                {company.contactPhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{company.contactPhone}</span>
                  </div>
                )}
              </div>
            )}
            
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
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onDelete && onDelete(vendor.id)}
                >
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
                <p className="text-sm text-gray-600">Remaining Commitment</p>
                <p className="font-medium">${(vendor.remainingCommitment || 0).toLocaleString()}</p>
              </div>
              {company.address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Company Address</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">
                      {company.address}
                      {company.city && `, ${company.city}`}
                      {company.province && `, ${company.province}`}
                      {company.postalCode && ` ${company.postalCode}`}
                    </p>
                  </div>
                </div>
              )}
              {vendor.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="text-sm">{vendor.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Add/Edit Vendor Modal Component
function VendorModal({ isOpen, onClose, onSave, vendor, project, companies }) {
  const [formData, setFormData] = useState({
    companyId: '',
    contractId: '',
    role: '',
    currentCommitment: 0,
    billedToDate: 0,
    holdback: 0,
    status: 'Active',
    notes: ''
  })
  const [newCompany, setNewCompany] = useState({
    name: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  })
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (vendor) {
      setFormData({
        companyId: vendor.companyId || '',
        contractId: vendor.contractId || '',
        role: vendor.role || '',
        currentCommitment: vendor.currentCommitment || 0,
        billedToDate: vendor.billedToDate || 0,
        holdback: vendor.holdback || 0,
        status: vendor.status || 'Active',
        notes: vendor.notes || ''
      })
    } else {
      setFormData({
        companyId: '',
        contractId: '',
        role: '',
        currentCommitment: 0,
        billedToDate: 0,
        holdback: 0,
        status: 'Active',
        notes: ''
      })
    }
    setShowNewCompanyForm(false)
    setNewCompany({ name: '', contactPerson: '', contactEmail: '', contactPhone: '' })
  }, [vendor, isOpen])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      let vendorData = { ...formData }
      
      // If creating a new company, include company data
      if (showNewCompanyForm && newCompany.name) {
        vendorData.companyData = newCompany
      }
      
      await onSave(vendorData)
      onClose()
    } catch (error) {
      console.error('Error saving vendor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {vendor ? 'Edit Vendor Contract' : 'Add New Vendor Contract'}
          </DialogTitle>
          <DialogDescription>
            {vendor ? 'Update the vendor contract details.' : 'Create a new vendor contract for this project.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Company Selection */}
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            {!showNewCompanyForm ? (
              <div className="flex gap-2">
                <Select 
                  value={formData.companyId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewCompanyForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Add New Company</h4>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowNewCompanyForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={newCompany.contactPerson}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, contactPerson: e.target.value }))}
                      placeholder="Contact person name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={newCompany.contactEmail}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={newCompany.contactPhone}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="(403) 555-0123"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contract Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractId">Contract ID</Label>
              <Input
                id="contractId"
                value={formData.contractId}
                onChange={(e) => setFormData(prev => ({ ...prev, contractId: e.target.value }))}
                placeholder="CON-001"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="General Contractor, Electrical, etc."
              />
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currentCommitment">Current Commitment ($)</Label>
              <Input
                id="currentCommitment"
                type="number"
                value={formData.currentCommitment}
                onChange={(e) => setFormData(prev => ({ ...prev, currentCommitment: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="billedToDate">Billed to Date ($)</Label>
              <Input
                id="billedToDate"
                type="number"
                value={formData.billedToDate}
                onChange={(e) => setFormData(prev => ({ ...prev, billedToDate: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="holdback">Holdback ($)</Label>
              <Input
                id="holdback"
                type="number"
                value={formData.holdback}
                onChange={(e) => setFormData(prev => ({ ...prev, holdback: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Status and Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this vendor contract..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || (!formData.companyId && !newCompany.name)}
          >
            {isLoading ? 'Saving...' : (vendor ? 'Update' : 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Change Order Item Component (unchanged)
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

// Funding Line Item Component (unchanged)
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

// Main Vendors Tab Component with Company Integration
export function VendorsTab({ project, onUpdate, isEditing = false }) {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    vendors: true,
    changeOrders: false,
    fundingLines: false
  })
  const [vendors, setVendors] = useState([])
  const [companies, setCompanies] = useState([])
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const changeOrders = project?.changeOrders || []
  const fundingLines = project?.fundingLines || []

  // Load vendors and companies
  useEffect(() => {
    if (project?.id) {
      loadVendors()
      loadCompanies()
    }
  }, [project?.id])

  const loadVendors = async () => {
    try {
      setIsLoading(true)
      const response = await VendorAPI.getProjectVendors(project.id)
      setVendors(response.data || [])
    } catch (error) {
      console.error('Error loading vendors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      const response = await CompanyAPI.getCompanies()
      setCompanies(response.data || [])
    } catch (error) {
      console.error('Error loading companies:', error)
    }
  }

  const handleSaveVendor = async (vendorData) => {
    try {
      if (editingVendor) {
        await VendorAPI.updateVendor(editingVendor.id, vendorData)
      } else {
        await VendorAPI.createVendor(project.id, vendorData)
      }
      
      await loadVendors()
      await loadCompanies() // Reload companies in case a new one was created
      setEditingVendor(null)
    } catch (error) {
      console.error('Error saving vendor:', error)
      throw error
    }
  }

  const handleDeleteVendor = async (vendorId) => {
    if (!confirm('Are you sure you want to delete this vendor contract?')) {
      return
    }

    try {
      await VendorAPI.deleteVendor(vendorId)
      await loadVendors()
    } catch (error) {
      console.error('Error deleting vendor:', error)
      alert('Failed to delete vendor: ' + error.message)
    }
  }

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
              Vendor Contracts ({vendors.length})
            </span>
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingVendor(null)
                    setIsVendorModalOpen(true)
                  }}
                >
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
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading vendors...</p>
              </div>
            ) : vendors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No vendor contracts available</p>
                <p className="text-sm">Add vendor contracts or upload a PFMT Excel file to populate vendor information</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendors.map((vendor, index) => (
                  <VendorCard 
                    key={vendor.id || index} 
                    vendor={vendor} 
                    index={index}
                    onUpdate={onUpdate}
                    onDelete={handleDeleteVendor}
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

      {/* Vendor Modal */}
      <VendorModal
        isOpen={isVendorModalOpen}
        onClose={() => {
          setIsVendorModalOpen(false)
          setEditingVendor(null)
        }}
        onSave={handleSaveVendor}
        vendor={editingVendor}
        project={project}
        companies={companies}
      />
    </div>
  )
}

