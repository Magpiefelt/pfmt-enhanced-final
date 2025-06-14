// Advanced Search and Filtering System
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.jsx'
import { Calendar } from '@/components/ui/calendar.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  DollarSign,
  MapPin,
  Building,
  Users,
  Save,
  Star,
  RotateCcw
} from 'lucide-react'

// Search and Filter Context
const SearchContext = React.createContext()

export function SearchProvider({ children, data = [], onFilteredResults }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [savedSearches, setSavedSearches] = useState([])
  const [activeFilters, setActiveFilters] = useState([])

  // Advanced search configuration
  const searchConfig = {
    searchableFields: [
      'name', 'description', 'contractor', 'projectManager', 
      'location', 'municipality', 'clientMinistry', 'category',
      'projectType', 'buildingName', 'constituency'
    ],
    filterFields: {
      status: {
        type: 'select',
        label: 'Status',
        options: ['Active', 'Completed', 'On Hold', 'Cancelled']
      },
      phase: {
        type: 'select',
        label: 'Phase',
        options: ['Planning', 'Design', 'Construction', 'Closeout']
      },
      category: {
        type: 'select',
        label: 'Category',
        options: ['Education', 'Healthcare', 'Infrastructure', 'Community']
      },
      projectType: {
        type: 'select',
        label: 'Project Type',
        options: ['New Construction', 'Renovation', 'Maintenance', 'Upgrade']
      },
      geographicRegion: {
        type: 'select',
        label: 'Region',
        options: ['Calgary', 'Edmonton', 'Central Alberta', 'Northern Alberta', 'Southern Alberta']
      },
      totalBudget: {
        type: 'range',
        label: 'Total Budget',
        min: 0,
        max: 10000000,
        step: 100000,
        format: 'currency'
      },
      amountSpent: {
        type: 'range',
        label: 'Amount Spent',
        min: 0,
        max: 10000000,
        step: 100000,
        format: 'currency'
      },
      startDate: {
        type: 'dateRange',
        label: 'Start Date'
      },
      projectManager: {
        type: 'multiSelect',
        label: 'Project Manager',
        options: [] // Will be populated from data
      },
      contractor: {
        type: 'multiSelect',
        label: 'Contractor',
        options: [] // Will be populated from data
      }
    }
  }

  // Extract unique values for multi-select options
  const extractUniqueValues = useCallback((field) => {
    const values = data.map(item => item[field]).filter(Boolean)
    return [...new Set(values)].sort()
  }, [data])

  // Update multi-select options based on data
  useEffect(() => {
    searchConfig.filterFields.projectManager.options = extractUniqueValues('projectManager')
    searchConfig.filterFields.contractor.options = extractUniqueValues('contractor')
  }, [data, extractUniqueValues])

  // Perform advanced search and filtering
  const filteredResults = useMemo(() => {
    let results = [...data]

    // Text search across multiple fields
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      results = results.filter(item => 
        searchConfig.searchableFields.some(field => 
          item[field]?.toString().toLowerCase().includes(searchLower)
        )
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([field, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return

      const fieldConfig = searchConfig.filterFields[field]
      
      switch (fieldConfig?.type) {
        case 'select':
          results = results.filter(item => item[field] === value)
          break
        case 'multiSelect':
          if (Array.isArray(value) && value.length > 0) {
            results = results.filter(item => value.includes(item[field]))
          }
          break
        case 'range':
          if (value.min !== undefined || value.max !== undefined) {
            results = results.filter(item => {
              const itemValue = parseFloat(item[field]) || 0
              return itemValue >= (value.min || 0) && itemValue <= (value.max || fieldConfig.max)
            })
          }
          break
        case 'dateRange':
          if (value.from || value.to) {
            results = results.filter(item => {
              const itemDate = new Date(item[field])
              if (value.from && itemDate < value.from) return false
              if (value.to && itemDate > value.to) return false
              return true
            })
          }
          break
      }
    })

    return results
  }, [data, searchTerm, filters, searchConfig])

  // Update active filters for display
  useEffect(() => {
    const active = []
    
    if (searchTerm.trim()) {
      active.push({
        type: 'search',
        label: `Search: "${searchTerm}"`,
        value: searchTerm,
        onRemove: () => setSearchTerm('')
      })
    }

    Object.entries(filters).forEach(([field, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return

      const fieldConfig = searchConfig.filterFields[field]
      let label = fieldConfig.label

      switch (fieldConfig.type) {
        case 'select':
          active.push({
            type: 'filter',
            label: `${label}: ${value}`,
            field,
            value,
            onRemove: () => setFilters(prev => ({ ...prev, [field]: null }))
          })
          break
        case 'multiSelect':
          if (Array.isArray(value) && value.length > 0) {
            active.push({
              type: 'filter',
              label: `${label}: ${value.length} selected`,
              field,
              value,
              onRemove: () => setFilters(prev => ({ ...prev, [field]: [] }))
            })
          }
          break
        case 'range':
          if (value.min !== undefined || value.max !== undefined) {
            const min = value.min || fieldConfig.min
            const max = value.max || fieldConfig.max
            const formatValue = fieldConfig.format === 'currency' 
              ? (v) => `$${v.toLocaleString()}`
              : (v) => v.toString()
            active.push({
              type: 'filter',
              label: `${label}: ${formatValue(min)} - ${formatValue(max)}`,
              field,
              value,
              onRemove: () => setFilters(prev => ({ ...prev, [field]: null }))
            })
          }
          break
        case 'dateRange':
          if (value.from || value.to) {
            const fromStr = value.from ? value.from.toLocaleDateString() : 'Start'
            const toStr = value.to ? value.to.toLocaleDateString() : 'End'
            active.push({
              type: 'filter',
              label: `${label}: ${fromStr} - ${toStr}`,
              field,
              value,
              onRemove: () => setFilters(prev => ({ ...prev, [field]: null }))
            })
          }
          break
      }
    })

    setActiveFilters(active)
  }, [searchTerm, filters, searchConfig])

  // Notify parent of filtered results
  useEffect(() => {
    if (onFilteredResults) {
      onFilteredResults(filteredResults)
    }
  }, [filteredResults, onFilteredResults])

  const clearAllFilters = useCallback(() => {
    setSearchTerm('')
    setFilters({})
  }, [])

  const saveCurrentSearch = useCallback((name) => {
    const search = {
      id: Date.now(),
      name,
      searchTerm,
      filters,
      createdAt: new Date().toISOString()
    }
    setSavedSearches(prev => [...prev, search])
  }, [searchTerm, filters])

  const loadSavedSearch = useCallback((search) => {
    setSearchTerm(search.searchTerm)
    setFilters(search.filters)
  }, [])

  const value = {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredResults,
    activeFilters,
    clearAllFilters,
    saveCurrentSearch,
    loadSavedSearch,
    savedSearches,
    searchConfig
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = React.useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}

// Advanced Search Bar Component
export function AdvancedSearchBar() {
  const { searchTerm, setSearchTerm, activeFilters, clearAllFilters } = useSearch()
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-4">
      {/* Main Search Input */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects by name, description, location, contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilters.length > 0 && (
            <Badge variant="secondary">{activeFilters.length}</Badge>
          )}
        </Button>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
              <span>{filter.label}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={filter.onRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && <AdvancedFiltersPanel />}
    </div>
  )
}

// Advanced Filters Panel
function AdvancedFiltersPanel() {
  const { filters, setFilters, searchConfig, saveCurrentSearch, savedSearches, loadSavedSearch } = useSearch()
  const [saveSearchName, setSaveSearchName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const updateFilter = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Advanced Filters</span>
          <div className="flex space-x-2">
            {savedSearches.length > 0 && (
              <Select onValueChange={(value) => {
                const search = savedSearches.find(s => s.id.toString() === value)
                if (search) loadSavedSearch(search)
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Saved searches" />
                </SelectTrigger>
                <SelectContent>
                  {savedSearches.map(search => (
                    <SelectItem key={search.id} value={search.id.toString()}>
                      {search.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Search
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(searchConfig.filterFields).map(([field, config]) => (
            <FilterField
              key={field}
              field={field}
              config={config}
              value={filters[field]}
              onChange={(value) => updateFilter(field, value)}
            />
          ))}
        </div>

        {/* Save Search Dialog */}
        {showSaveDialog && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex space-x-2">
              <Input
                placeholder="Search name"
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (saveSearchName.trim()) {
                    saveCurrentSearch(saveSearchName.trim())
                    setSaveSearchName('')
                    setShowSaveDialog(false)
                  }
                }}
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Individual Filter Field Component
function FilterField({ field, config, value, onChange }) {
  switch (config.type) {
    case 'select':
      return (
        <div>
          <Label>{config.label}</Label>
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${config.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {config.options.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case 'multiSelect':
      return (
        <div>
          <Label>{config.label}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {value && value.length > 0 
                  ? `${value.length} selected`
                  : `Select ${config.label.toLowerCase()}`
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {config.options.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      checked={value?.includes(option) || false}
                      onCheckedChange={(checked) => {
                        const newValue = value || []
                        if (checked) {
                          onChange([...newValue, option])
                        } else {
                          onChange(newValue.filter(v => v !== option))
                        }
                      }}
                    />
                    <Label className="text-sm">{option}</Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )

    case 'range':
      const rangeValue = value || { min: config.min, max: config.max }
      return (
        <div>
          <Label>{config.label}</Label>
          <div className="space-y-2">
            <Slider
              value={[rangeValue.min || config.min, rangeValue.max || config.max]}
              min={config.min}
              max={config.max}
              step={config.step}
              onValueChange={([min, max]) => onChange({ min, max })}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {config.format === 'currency' 
                  ? `$${(rangeValue.min || config.min).toLocaleString()}`
                  : rangeValue.min || config.min
                }
              </span>
              <span>
                {config.format === 'currency' 
                  ? `$${(rangeValue.max || config.max).toLocaleString()}`
                  : rangeValue.max || config.max
                }
              </span>
            </div>
          </div>
        </div>
      )

    case 'dateRange':
      return (
        <div>
          <Label>{config.label}</Label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {value?.from ? value.from.toLocaleDateString() : 'From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={value?.from}
                  onSelect={(date) => onChange({ ...value, from: date })}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {value?.to ? value.to.toLocaleDateString() : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={value?.to}
                  onSelect={(date) => onChange({ ...value, to: date })}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )

    default:
      return null
  }
}

