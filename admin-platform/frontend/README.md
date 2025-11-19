# Admin Dashboard - Trip Adora

React + Vite + Tailwind CSS se banaya gaya admin dashboard.

## 🚀 Quick Start

### Step 1: Dependencies Install Karein

```bash
npm install
```

### Step 2: Development Server Start Karein

```bash
npm run dev
```

Browser mein automatically open ho jayega `http://localhost:5175`

### Step 3: Production Build
```bash
npm run build
```

## 📁 Project Structure

```
admin-platform/
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx          # Main dashboard component
│   │   ├── KPICards.jsx                # KPI cards component
│   │   ├── BookingsRevenueChart.jsx    # Chart component
│   │   ├── SupplierPerformanceTable.jsx # Table component
│   │   └── index.js                    # Export file
│   ├── App.jsx                         # Main App component
│   ├── main.jsx                        # React entry point
│   └── index.css                       # Tailwind CSS imports
├── index.html                          # HTML template
├── package.json                        # Dependencies
├── vite.config.js                      # Vite configuration
├── tailwind.config.js                  # Tailwind configuration
└── postcss.config.js                   # PostCSS configuration
```

## ✨ Features

- ✅ Sidebar navigation with menu items
- ✅ Header with welcome message and icons
- ✅ KPI Cards (Total Bookings, Earnings, Cancellation Rate)
- ✅ Bookings & Revenue Chart with interactive elements
- ✅ Top Supplier Performance Table with progress bars
- ✅ Fully responsive design
- ✅ Modern UI with Tailwind CSS

## 🛠️ Tech Stack

- **React 18** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **PostCSS** - CSS Processing

## 📝 Usage

Dashboard already `App.jsx` mein import ho chuka hai. Directly use kar sakte hain:

```jsx
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <div className="App">
      <AdminDashboard />
    </div>
  );
}
```

## 🎨 Customization

Components ko customize karne ke liye:
- **Colors**: Tailwind classes change karein (`src/components/` mein)
- **Data**: Components mein hardcoded data ko replace karein
- **Layout**: Tailwind classes modify karein

## 📦 Available Scripts

- `npm run dev` - Development server start karein
- `npm run build` - Production build banayein
- `npm run preview` - Production build preview karein

