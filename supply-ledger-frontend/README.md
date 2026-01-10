# SupplyLedger Frontend - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Structure](#architecture--structure)
4. [Setup & Installation](#setup--installation)
5. [Component Documentation](#component-documentation)
6. [Context & State Management](#context--state-management)
7. [API Integration](#api-integration)
8. [Routing & Navigation](#routing--navigation)
9. [Styling & Design](#styling--design)
10. [Build & Deployment](#build--deployment)
11. [Troubleshooting](#troubleshooting)

---

## Project Overview

**SupplyLedger Frontend** is a modern React-based single-page application (SPA) that provides:

- **User Authentication**: Secure login and signup with JWT tokens
- **Order Management**: Create, track, and manage supply chain orders
- **Real-Time Analytics**: Dashboard with KPIs and delivery insights
- **Shipment Tracking**: Monitor shipment status and delay predictions
- **User Profile Management**: Personal and company information
- **Theme Support**: Dark/Light mode toggle
- **Responsive Design**: Mobile-friendly, works on all devices

### Key Features
- **Interactive Dashboard**: Real-time metrics and status overview
- **Order Tracking**: Detailed order status with timeline
- **Delay Prediction**: AI-powered delivery time predictions
- **Analytics Page**: Charts and trends for supply chain insights
- **User Settings**: Customizable preferences and theme
- **Error Handling**: Comprehensive error notifications with toast alerts

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | React | 19.2.0 |
| **Build Tool** | Vite | 7.2.4 |
| **Routing** | React Router DOM | 7.12.0 |
| **HTTP Client** | Axios | 1.13.2 |
| **Styling** | Tailwind CSS | 4.1.18 |
| **UI Framework** | Bootstrap | 5.3.8 |
| **Icons** | Lucide React | 0.562.0 |
| **Charts** | Recharts | 3.6.0 |
| **Notifications** | React Hot Toast | 2.6.0 |
| **Linting** | ESLint | 9.39.1 |
| **Node Version** | 16.x+ | Required |

---

## Architecture & Structure

### Directory Structure
```
supply-ledger-frontend/
├── public/                          # Static assets
├── src/
│   ├── App.jsx                     # Root component with routing
│   ├── index.css                   # Global styles
│   ├── main.jsx                    # Entry point
│   ├── App.css                     # App-specific styles
│   │
│   ├── assets/                     # Images, fonts, media
│   │
│   ├── components/                 # Reusable components
│   │   ├── DeliveryPrediction.jsx  # Delay prediction widget
│   │   ├── Navigation.jsx          # Header/navbar
│   │   └── PageContainer.jsx       # Page layout wrapper
│   │
│   ├── context/                    # React Context for state management
│   │   ├── AuthContext.jsx         # Authentication state
│   │   ├── OrderContext.jsx        # Order management state
│   │   └── ThemeContext.jsx        # Dark/Light mode state
│   │
│   ├── pages/                      # Page components
│   │   ├── Analytics.jsx           # Analytics dashboard
│   │   ├── Createorder.jsx         # Order creation form
│   │   ├── Dashboard.jsx           # Main dashboard
│   │   ├── login.jsx               # Login page
│   │   ├── OrderDetails.jsx        # Order detail view
│   │   ├── OrdersList.jsx          # Orders list page
│   │   ├── Settings.jsx            # User settings
│   │   ├── Signup.jsx              # Registration page
│   │   └── UserProfile.jsx         # User profile page
│   │
│   └── services/                   # API service layer
│       └── api.js                  # Axios instance & API calls
│
├── index.html                      # HTML template
├── package.json                    # Dependencies & scripts
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS config
├── postcss.config.js               # PostCSS configuration
├── eslint.config.js                # ESLint rules
└── README.md                       # This file
```

---

## Setup & Installation

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Quick Start
```bash
cd supply-ledger-frontend
npm install
npm run dev
```

Frontend available at: `http://localhost:5173`

### Environment Setup
```env
# .env file (optional, defaults to localhost:8000)
VITE_API_BASE_URL=http://localhost:8000
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## Component Documentation

### Page Components

#### Dashboard
Main landing page showing overview metrics:
- Total orders count
- On-time delivery percentage
- In-transit shipments
- Average delivery time

#### CreateOrder
Form for creating new orders with fields:
- Origin & Destination cities
- Weight in kg
- Priority level (low, medium, high, urgent)
- Due date

#### OrdersList
Display all user orders with:
- Sortable columns
- Filter by status
- Click to view details

#### OrderDetails
Detailed view including:
- Complete order information
- Status timeline
- Associated shipments
- Delay prediction
- Blockchain verification

#### Analytics
Supply chain insights with:
- Order trends chart
- Status distribution
- Delivery performance
- Risk level analysis

#### UserProfile & Settings
- Personal/company information
- Theme toggle
- Notification preferences
- Account settings

#### Login/Signup
User authentication pages with validation

---

## Context & State Management

### AuthContext
Manages user authentication state:
```javascript
{ isAuthenticated, user, login, logout, loading }
```

### ThemeContext
Handles dark/light theme toggle:
```javascript
{ theme, toggleTheme }
```

### OrderContext
Manages orders state:
```javascript
{ orders, selectedOrder, loading, error }
```

---

## API Integration

### Service Layer (`services/api.js`)

```javascript
// Authentication
auth.login(email, password)
auth.logout()

// Users
users.register(userData)
users.getProfile(userId)
users.updateProfile(userId, data)

// Orders
orders.create(orderData)
orders.getById(orderId)
orders.listByUser(userId)
orders.updateStatus(orderId, data)

// Shipments
shipments.create(data)
shipments.getById(id)
shipments.updateStatus(id, data)
shipments.predictDelay(id)
shipments.verify(id)

// Analytics
analytics.getSummary()
analytics.getOrderAnalytics(userId)
analytics.getDelayAnalytics(userId)
```

---

## Routing & Navigation

### Routes
```
/ → Dashboard (authenticated)
/login → Login page
/signup → Signup page
/create-order → Create order form
/orders → Orders list
/orders/:orderId → Order details
/analytics → Analytics dashboard
/profile → User profile
/settings → User settings
```

---

## Styling & Design

### Tailwind CSS
- Utility-first CSS framework
- Dark mode support
- Responsive design (sm, md, lg breakpoints)

### Bootstrap Integration
- Additional UI components
- Grid system
- Responsive utilities

### Dark Mode
Toggle available in Settings page - applies `dark` class to root element

---

## Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Deployment Options
- **Vercel**: `vercel` command
- **Netlify**: Connect GitHub repo, build: `npm run build`, publish: `dist`
- **GitHub Pages**: Configure homepage in package.json
- **Docker**: Multi-stage build with Node

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Blank page after login | Check backend at localhost:8000, clear localStorage |
| CORS errors | Verify backend CORS config, check API_BASE_URL |
| Token unauthorized | Token expired (30 min), user needs to login again |
| API calls failing | Verify backend running, check network tab, verify token |
| Tailwind not working | Restart dev server: `npm run dev` |
| Charts not displaying | Check data loading from API, verify endpoint returns data |
| Node modules errors | `rm -rf node_modules && npm install && npm run dev` |
| Port 5173 in use | Use different port: `npm run dev -- --port 3000` |

---

## Additional Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Recharts](https://recharts.org)
- [Lucide Icons](https://lucide.dev)

---

**Last Updated**: January 2026 | **Version**: 1.0
