// Simplified refactored App.jsx using modular components and centralized state
import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { PFMTDataExtractor } from './components/PFMTDataExtractor.jsx'
import { Header, Layout } from './components/shared/Layout.jsx'
import { ErrorBoundary } from './components/shared/ErrorBoundary.jsx'
import { ProjectList } from './components/projects/ProjectList.jsx'
import { ProjectManagerDashboard } from './components/projects/AddNewProject.jsx'
import { useAuth, usePFMTExtractor } from './hooks/index.js'
import ProjectsPage from './pages/ProjectsPage.jsx'
import PFMTExtractorPage from './pages/PFMTExtractorPage.jsx'
import './App.css'

// Home page with navigation tiles
function HomePage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  const navigationTiles = [
    { 
      title: 'My Projects', 
      description: 'View and manage your assigned projects', 
      path: '/projects',
      filter: 'my',
      roles: ['pm', 'spm', 'director', 'admin']
    },
    { 
      title: 'All Projects', 
      description: 'Browse all projects in the system', 
      path: '/projects',
      filter: 'all',
      roles: ['spm', 'director', 'admin']
    },
    // { 
    //   title: 'Gate Meetings', 
    //   description: 'Schedule and manage gate meetings', 
    //   path: '/meetings',
    //   roles: ['pm', 'spm', 'director', 'admin']
    // },
    { 
      title: 'Create New Project', 
      description: 'Upload PFMT Excel to create a project', 
      path: '/library',
      roles: ['pm', 'spm', 'director', 'admin', 'vendor']
    },
    { 
      title: 'Reporting', 
      description: 'Generate and view project reports', 
      path: '/reports',
      roles: ['pm', 'spm', 'director', 'admin']
    },
    { 
      title: 'Settings', 
      description: 'Manage your account and preferences', 
      path: '/settings',
      roles: ['pm', 'spm', 'director', 'admin', 'vendor']
    }
  ]

  const handleTileClick = (path, filter = null) => {
    if (filter) {
      navigate(`${path}?filter=${filter}`)
    } else {
      navigate(path)
    }
  }

  // Filter tiles based on user role
  const roleMap = {
    'Project Manager': 'pm',
    'Senior Project Manager': 'spm',
    'Director': 'director',
    'Vendor': 'vendor'
  }
  
  const userRoleKey = roleMap[currentUser.role] || 'vendor'
  const visibleTiles = navigationTiles.filter(tile => 
    tile.roles.includes(userRoleKey)
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {currentUser.name}
        </h1>
        <p className="text-gray-600">
          {currentUser.role === 'vendor' ? 
            'Manage your project submissions and track progress.' :
            'Access your project management tools and resources.'
          }
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleTiles.map((tile) => (
          <div 
            key={tile.title} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleTileClick(tile.path, tile.filter)}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{tile.title}</h3>
            <p className="text-gray-600 text-sm">{tile.description}</p>
          </div>
        ))}
      </div>

      {/* Project Manager Dashboard - only show for PMs and above */}
      {['Project Manager', 'Senior Project Manager', 'Director'].includes(currentUser.role) && (
        <div className="mt-8">
          <ProjectManagerDashboard projects={[]} onProjectCreated={() => {}} />
        </div>
      )}
    </div>
  )
}

// Vendor portal component
function VendorPortal() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Vendor Submission Portal</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">
          Submit your project information and track submission status.
        </p>
      </div>
    </div>
  )
}

// Staff portal component
function StaffPortal() {
  const { currentUser } = useAuth()
  
  if (currentUser.role === 'vendor') {
    return <Navigate to="/vendor" replace />
  }
  
  return <HomePage />
}

// Main app content component
function AppContent() {
  const navigate = useNavigate()
  const { currentUser, changeRole } = useAuth()
  const { 
    showPFMTExtractor, 
    selectedProjectForPFMT, 
    closePFMTExtractor, 
    handlePFMTDataExtracted 
  } = usePFMTExtractor()

  const handleRoleChange = (newRole) => {
    changeRole(newRole)
    
    // Navigate based on role
    if (newRole === 'vendor') {
      navigate('/vendor', { replace: true })
    } else {
      navigate('/staff', { replace: true })
    }
  }

  return (
    <Layout>
      <Header onRoleChange={handleRoleChange} />
      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              currentUser.role === 'vendor' ? 
              <Navigate to="/vendor" replace /> : 
              <Navigate to="/staff" replace />
            } 
          />
          <Route path="/vendor" element={<VendorPortal />} />
          <Route path="/staff" element={<StaffPortal />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/all" element={<ProjectsPage />} />
          <Route path="/meetings" element={<div className="p-6">Gate Meetings - Coming Soon</div>} />
          <Route path="/library" element={<PFMTExtractorPage />} />
          <Route path="/extractor" element={<PFMTExtractorPage />} />
          <Route path="/reports" element={<div className="p-6">Reporting - Coming Soon</div>} />
          <Route path="/settings" element={<div className="p-6">Settings - Coming Soon</div>} />
        </Routes>
      </main>
      
      {/* PFMT Data Extractor Dialog */}
      {showPFMTExtractor && selectedProjectForPFMT && (
        <PFMTDataExtractor
          project={selectedProjectForPFMT}
          onDataExtracted={handlePFMTDataExtracted}
          onClose={closePFMTExtractor}
        />
      )}
    </Layout>
  )
}

// Main App component with error boundary
function App() {
  return (
    <ErrorBoundary fallbackMessage="The PFMT application encountered an unexpected error. Please refresh the page to continue.">
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  )
}

export default App

