// Enhanced Analytics Dashboard
import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Building, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Download,
  RefreshCw
} from 'lucide-react'

// Color palette for charts
const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#6366f1',
  success: '#22c55e'
}

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
  COLORS.success,
  '#8b5cf6',
  '#f97316',
  '#06b6d4',
  '#84cc16'
]

// Main Analytics Dashboard Component
export function AnalyticsDashboard({ projects = [] }) {
  const [timeRange, setTimeRange] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // Filter projects based on selected criteria
  const filteredProjects = useMemo(() => {
    let filtered = [...projects]

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(p => p.geographicRegion === selectedRegion)
    }

    if (timeRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (timeRange) {
        case '30d':
          cutoffDate.setDate(now.getDate() - 30)
          break
        case '90d':
          cutoffDate.setDate(now.getDate() - 90)
          break
        case '1y':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(p => new Date(p.startDate) >= cutoffDate)
    }

    return filtered
  }, [projects, timeRange, selectedRegion])

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalProjects = filteredProjects.length
    const activeProjects = filteredProjects.filter(p => p.status === 'Active').length
    const completedProjects = filteredProjects.filter(p => p.status === 'Completed').length
    const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.totalBudget || 0), 0)
    const totalSpent = filteredProjects.reduce((sum, p) => sum + (p.amountSpent || 0), 0)
    const avgBudgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    
    const onTimeProjects = filteredProjects.filter(p => p.scheduleStatus === 'Green').length
    const onBudgetProjects = filteredProjects.filter(p => p.budgetStatus === 'Green').length
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      totalSpent,
      avgBudgetUtilization,
      onTimeProjects,
      onBudgetProjects,
      onTimePercentage: totalProjects > 0 ? (onTimeProjects / totalProjects) * 100 : 0,
      onBudgetPercentage: totalProjects > 0 ? (onBudgetProjects / totalProjects) * 100 : 0
    }
  }, [filteredProjects])

  // Prepare chart data
  const chartData = useMemo(() => {
    // Budget vs Spent by Region
    const regionData = filteredProjects.reduce((acc, project) => {
      const region = project.geographicRegion || 'Unknown'
      if (!acc[region]) {
        acc[region] = { region, budget: 0, spent: 0, projects: 0 }
      }
      acc[region].budget += project.totalBudget || 0
      acc[region].spent += project.amountSpent || 0
      acc[region].projects += 1
      return acc
    }, {})

    // Project Status Distribution
    const statusData = filteredProjects.reduce((acc, project) => {
      const status = project.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // Phase Distribution
    const phaseData = filteredProjects.reduce((acc, project) => {
      const phase = project.phase || 'Unknown'
      acc[phase] = (acc[phase] || 0) + 1
      return acc
    }, {})

    // Monthly Spending Trend (last 12 months)
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
      
      const monthlySpent = filteredProjects.reduce((sum, project) => {
        // This is simplified - in real implementation, you'd have monthly spending data
        const projectStart = new Date(project.startDate)
        if (projectStart.getFullYear() === date.getFullYear() && 
            projectStart.getMonth() === date.getMonth()) {
          return sum + (project.amountSpent || 0) / 12 // Simplified monthly distribution
        }
        return sum
      }, 0)

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        spent: monthlySpent,
        budget: monthlySpent * 1.2 // Simplified budget calculation
      })
    }

    return {
      regionData: Object.values(regionData),
      statusData: Object.entries(statusData).map(([name, value]) => ({ name, value })),
      phaseData: Object.entries(phaseData).map(([name, value]) => ({ name, value })),
      monthlyData
    }
  }, [filteredProjects])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const handleExport = () => {
    // Generate CSV export of analytics data
    const csvData = [
      ['Metric', 'Value'],
      ['Total Projects', metrics.totalProjects],
      ['Active Projects', metrics.activeProjects],
      ['Completed Projects', metrics.completedProjects],
      ['Total Budget', `$${metrics.totalBudget.toLocaleString()}`],
      ['Total Spent', `$${metrics.totalSpent.toLocaleString()}`],
      ['Budget Utilization', `${metrics.avgBudgetUtilization.toFixed(1)}%`],
      ['On-Time Projects', `${metrics.onTimePercentage.toFixed(1)}%`],
      ['On-Budget Projects', `${metrics.onBudgetPercentage.toFixed(1)}%`]
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-600">Project performance insights and trends</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="Calgary">Calgary</SelectItem>
              <SelectItem value="Edmonton">Edmonton</SelectItem>
              <SelectItem value="Central Alberta">Central Alberta</SelectItem>
              <SelectItem value="Northern Alberta">Northern Alberta</SelectItem>
              <SelectItem value="Southern Alberta">Southern Alberta</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Projects"
          value={metrics.totalProjects}
          icon={Building}
          color="blue"
        />
        <MetricCard
          title="Total Budget"
          value={`$${metrics.totalBudget.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Budget Utilization"
          value={`${metrics.avgBudgetUtilization.toFixed(1)}%`}
          icon={Target}
          color={metrics.avgBudgetUtilization > 90 ? "red" : metrics.avgBudgetUtilization > 75 ? "yellow" : "green"}
        />
        <MetricCard
          title="On-Time Performance"
          value={`${metrics.onTimePercentage.toFixed(1)}%`}
          icon={Clock}
          color={metrics.onTimePercentage > 80 ? "green" : metrics.onTimePercentage > 60 ? "yellow" : "red"}
        />
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Phase Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.phaseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Trend</CardTitle>
                <CardDescription>Budget vs Actual Spending Over Time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="budget"
                      stackId="1"
                      stroke={COLORS.secondary}
                      fill={COLORS.secondary}
                      fillOpacity={0.6}
                      name="Budget"
                    />
                    <Area
                      type="monotone"
                      dataKey="spent"
                      stackId="2"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.8}
                      name="Spent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PerformanceMetrics projects={filteredProjects} />
            <RiskAnalysis projects={filteredProjects} />
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
              <CardDescription>Budget and Spending by Geographic Region</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="budget" fill={COLORS.secondary} name="Budget" />
                  <Bar dataKey="spent" fill={COLORS.primary} name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Metric Card Component
function MetricCard({ title, value, icon: Icon, color = "blue", trend = null }) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    yellow: "text-yellow-600 bg-yellow-50",
    red: "text-red-600 bg-red-50"
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Performance Metrics Component
function PerformanceMetrics({ projects }) {
  const performanceData = useMemo(() => {
    const schedulePerformance = projects.reduce((acc, p) => {
      const status = p.scheduleStatus || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    const budgetPerformance = projects.reduce((acc, p) => {
      const status = p.budgetStatus || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return {
      schedule: Object.entries(schedulePerformance).map(([name, value]) => ({ name, value })),
      budget: Object.entries(budgetPerformance).map(([name, value]) => ({ name, value }))
    }
  }, [projects])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Schedule and Budget Performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Schedule Performance</h4>
          <div className="space-y-2">
            {performanceData.schedule.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index] }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <Badge variant="outline">{item.value}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Budget Performance</h4>
          <div className="space-y-2">
            {performanceData.budget.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index] }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <Badge variant="outline">{item.value}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Risk Analysis Component
function RiskAnalysis({ projects }) {
  const riskData = useMemo(() => {
    const highRisk = projects.filter(p => 
      p.budgetStatus === 'Red' || p.scheduleStatus === 'Red'
    ).length

    const mediumRisk = projects.filter(p => 
      (p.budgetStatus === 'Yellow' || p.scheduleStatus === 'Yellow') &&
      p.budgetStatus !== 'Red' && p.scheduleStatus !== 'Red'
    ).length

    const lowRisk = projects.length - highRisk - mediumRisk

    return [
      { name: 'High Risk', value: highRisk, color: COLORS.danger },
      { name: 'Medium Risk', value: mediumRisk, color: COLORS.warning },
      { name: 'Low Risk', value: lowRisk, color: COLORS.success }
    ]
  }, [projects])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Analysis</CardTitle>
        <CardDescription>Project Risk Distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {riskData.map((risk) => (
            <div key={risk.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: risk.color }}
                />
                <span className="text-sm font-medium">{risk.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{risk.value}</Badge>
                <span className="text-sm text-gray-600">
                  {projects.length > 0 ? ((risk.value / projects.length) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

