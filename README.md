# PFMT Application - Enhanced Final Version

## 🚀 Overview

The **Project Financial Management Tool (PFMT)** is a comprehensive web application designed for managing infrastructure projects with advanced financial tracking, role-based access control, and real-time dashboard functionality.

This enhanced final version includes **complete dashboard fixes** that resolve project visibility issues and ensure proper user-based filtering.

## ✨ Key Features

### 🎯 **Dashboard & Project Management**
- **Role-based project visibility** - Users see only relevant projects
- **Real-time project creation** - Projects appear immediately after creation
- **User switching functionality** - Toggle between different user roles
- **Accurate project counts** - Dashboard counts match displayed projects
- **Advanced filtering** - Filter by ownership, status, and role permissions

### 🔐 **User Roles & Access Control**
- **Project Manager** - View and manage own projects
- **Senior Project Manager** - View projects they own or manage
- **Director** - Full access to all projects
- **Vendor** - Limited access to relevant project information
- **Admin** - Complete system administration

### 📊 **Data Management**
- **Persistent JSON database** with lowdb
- **Excel file upload** for PFMT data extraction
- **Real-time data synchronization** between frontend and backend
- **Comprehensive project tracking** with financial data
- **Change order management** and vendor tracking

### 🛠️ **Technical Stack**
- **Frontend**: React 19 + Vite + Tailwind CSS + Shadcn/ui
- **Backend**: Node.js + Express.js + REST API
- **Database**: JSON-based persistent storage
- **State Management**: Zustand
- **File Processing**: Excel (.xlsx/.xlsm) support

## 🏗️ Architecture

```
pfmt-enhanced-final/
├── src/                          # Frontend React application
│   ├── components/
│   │   ├── projects/            # Project management components
│   │   ├── shared/              # Shared UI components
│   │   └── ui/                  # Base UI components (Shadcn)
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API service layer
│   ├── stores/                  # Zustand state management
│   └── App.jsx                  # Main application
├── backend/                     # Node.js Express backend
│   ├── controllers/             # Request handlers
│   ├── services/                # Business logic
│   ├── middleware/              # Custom middleware
│   ├── routes/                  # API route definitions
│   ├── uploads/                 # File upload directory
│   └── db.json                  # JSON database
└── README.md                    # This file
```

## 🔧 Installation & Setup

### Prerequisites
- **Node.js 18+**
- **npm** or **yarn** or **pnpm**

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Magpiefelt/pfmt-enhanced-final.git
   cd pfmt-enhanced-final
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Start Backend Server**
   ```bash
   cd backend
   node server.js
   ```
   🌐 Backend runs on: http://localhost:3001

5. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```
   🌐 Frontend runs on: http://localhost:5173

6. **Access Application**
   Open http://localhost:5173 in your browser

## 📊 API Endpoints

### Projects
- `GET /api/projects` - Get projects with role-based filtering
- `GET /api/projects/:id` - Get specific project details
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/excel` - Upload Excel file
- `POST /api/projects/:id/pfmt-excel` - Upload PFMT Excel with data extraction

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user

### System
- `GET /api/health` - Health check endpoint

## 👥 User Roles & Permissions

| Role | Project Visibility | Can Create Projects | Can Manage All Projects |
|------|-------------------|-------------------|------------------------|
| **Project Manager** | Own projects only | ✅ Yes | ❌ No |
| **Senior Project Manager** | Own + managed projects | ✅ Yes | ⚠️ Limited |
| **Director** | All projects | ✅ Yes | ✅ Yes |
| **Vendor** | Assigned projects only | ❌ No | ❌ No |
| **Admin** | All projects | ✅ Yes | ✅ Yes |

## 🔄 Recent Dashboard Fixes (Latest Update)

### ✅ **Issues Resolved**
1. **Project Visibility Bug** - Projects now appear immediately for their owners
2. **Create New Project Button** - Now fully functional with real API integration
3. **Dashboard Count Accuracy** - Counts match displayed projects
4. **User Context Processing** - Proper authentication and role-based filtering
5. **Data Type Consistency** - Fixed integer vs string comparison issues

### 🛠️ **Technical Fixes Applied**
- **Backend**: Fixed data type handling in project filtering logic
- **Middleware**: Added user context extraction from frontend headers
- **API Service**: Fixed circular dependency and proper header sending
- **Frontend**: Replaced mock data usage with real backend API calls
- **Database**: Enhanced filtering logic with consistent data types

### 📁 **Files Modified**
- `backend/controllers/projectController.js` - Enhanced user context processing
- `backend/services/database.js` - Fixed filtering and data type issues
- `backend/middleware/userContext.js` - **NEW**: User authentication middleware
- `backend/routes/projects.js` - Added middleware integration
- `src/services/apiService.js` - Fixed user context header sending
- `src/components/projects/AddNewProject.jsx` - Real API integration

## 🧪 Testing the Dashboard

### Test User Accounts
The application includes 5 test users for testing role-based functionality:

1. **Sarah Johnson** (Project Manager) - ID: 1
2. **Michael Brown** (Senior Project Manager) - ID: 2  
3. **Lisa Wilson** (Director) - ID: 3
4. **David Chen** (Admin) - ID: 4
5. **Jennifer Davis** (Vendor) - ID: 5

### Testing Steps
1. **User Switching**: Use the dropdown in the top-right to switch between users
2. **Project Creation**: Create a project as Sarah Johnson (Project Manager)
3. **Visibility Check**: Verify the project appears immediately in the dashboard
4. **Role Testing**: Switch to different users to see role-based filtering
5. **Count Verification**: Ensure "All Projects" and "My Projects" counts are accurate

## 📁 File Upload & PFMT Data Extraction

### Supported Formats
- **.xlsx** (Excel 2007+)
- **.xlsm** (Excel with macros)
- **File size limit**: 50MB

### PFMT Data Extraction Features
- **Automatic sheet detection** (SP Fields, SP Fund Src, Cost Tracking)
- **Financial data extraction** (budgets, cashflow, vendors)
- **Project metadata parsing** (location, contractor, milestones)
- **Change order processing**
- **Validation and error reporting**

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

**Backend (backend/.env)**
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## 🚀 Production Deployment

### Build for Production
```bash
# Build frontend
npm run build

# Start backend in production mode
cd backend
NODE_ENV=production node server.js
```

### Production Checklist
- [ ] Set production environment variables
- [ ] Configure proper CORS origins
- [ ] Set up file upload directory with proper permissions
- [ ] Configure database backup strategy
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx/Apache)

## 🛠️ Development

### Available Scripts

**Frontend**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test            # Run tests
```

**Backend**
```bash
node server.js       # Start backend server
npm test            # Run backend tests (if available)
```

### Development Workflow
1. **Backend First**: Start backend server for API endpoints
2. **Frontend Development**: Use Vite dev server with hot reload
3. **Testing**: Test both user roles and API endpoints
4. **File Uploads**: Test Excel file processing functionality

## 📋 Troubleshooting

### Common Issues

**Projects Not Appearing**
- Verify backend is running on port 3001
- Check browser console for API errors
- Ensure user context headers are being sent
- Restart both frontend and backend servers

**Create New Project Button Not Working**
- Verify user has Project Manager role or higher
- Check API service is sending user context headers
- Review backend logs for project creation errors

**User Switching Not Working**
- Ensure frontend is properly sending user headers
- Check that user context middleware is active
- Verify user data exists in database

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For technical support or questions:
- **Issues**: Use GitHub Issues for bug reports
- **Documentation**: Refer to this README and inline code comments
- **API Testing**: Use the health endpoint `/api/health` to verify backend status

---

**Version**: Enhanced Final with Dashboard Fixes  
**Last Updated**: December 2024  
**Status**: ✅ Production Ready

