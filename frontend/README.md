# Flood Watch Admin Dashboard

Modern React-based admin dashboard for the Flood Watch flood monitoring system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
# Start development server
npm run dev

# The dashboard will be available at http://localhost:3000
```

### Production Build

```bash
npm run build
npm run preview
```

## 📋 Features

✅ **Authentication**
- JWT-based login
- Protected routes
- Auto-redirect on auth errors

✅ **Dashboard Overview**
- Real-time statistics
- Active incidents count
- Reports trend chart (30 days)
- Live incident map with Leaflet

✅ **Incident Map**
- Interactive markers
- Affected radius visualization
- Color-coded severity levels
- Popup details

✅ **Modern UI**
- Tailwind CSS
- Responsive design
- Dark mode ready
- Custom color scheme

## 🎨 Tech Stack

- **Framework**: React 18+ TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + React-Leaflet
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └──client.ts          # API client with all endpoints
│   ├── components/
│   │   ├── Layout.tsx          # Dashboard layout with sidebar
│   │   └── IncidentMap.tsx     # Leaflet map component
│   ├── pages/
│   │   ├── Login.tsx           # Login page
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Reports.tsx         # Reports management
│   │   ├── Incidents.tsx       # Incidents management
│   │   ├── Alerts.tsx          # Alerts management
│   │   └── Analytics.tsx       # Analytics & insights
│   ├── store/
│   │   └── authStore.ts        # Authentication state
│   ├── App.tsx                 # App with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🔧 Configuration

### API Proxy

Development server proxies `/api` to backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

### Environment Variables

Create `.env` file:

```bash
VITE_API_URL=http://localhost:8000
```

## 🎯 Usage

### Login

Default credentials for testing:
- **Username**: admin
- **Password**: admin123

(Create via backend admin registration endpoint)

### Navigation

- **Dashboard**: Overview with stats and map
- **Reports**: Pending reports for verification
- **Incidents**: Active flood incidents
- **Alerts**: Alert management
- **Analytics**: Charts and insights

## 🗺️ Map Features

The incident map shows:
- **Markers**: Incident locations
- **Circles**: Affected radius
- **Colors**:
  - 🔵 Blue: Low severity
  - 🟡 Yellow: Medium severity
  - 🟠 Orange: High severity
  - 🔴 Red: Critical severity

## 📊 Dashboard Widgets

1. **Total Reports**: All submitted flood reports
2. **Active Incidents**: Currently active flood incidents
3. **Alerts Sent**: Total alerts delivered
4. **Total Users**: Registered citizens

5. **Live Map**: Real-time incident visualization
6. **Trend Chart**: 30-day reports trend

## 🔐 Authentication Flow

```
1. User enters credentials
2. POST /api/auth/login
3. Receive JWT token
4. Store in localStorage
5. Add to all API requests
6. Redirect to dashboard
```

## 🚧 Future Enhancements

- [ ] Report verification UI
- [ ] Incident detail views
- [ ] Alert creation interface
- [ ] Advanced analytics charts
- [ ] User management
- [ ] Real-time WebSocket updates
- [ ] Export to PDF/CSV
- [ ] Mobile responsive improvements
- [ ] Dark mode toggle
- [ ] Notification center

## 🐛 Troubleshooting

### API Connection Issues

Check backend is running:
```bash
curl http://localhost:8000/health
```

### Build Errors

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Map Not Loading

Check Leaflet CSS is imported in `index.html`:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

## 📝 Development Notes

- API client auto-adds JWT token to requests
- 401 errors trigger auto-logout
- Protected routes require authentication
- Map uses OpenStreetMap tiles (free)

---

**Built with ❤️ for Flood Watch**
