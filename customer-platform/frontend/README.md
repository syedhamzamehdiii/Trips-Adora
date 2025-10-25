# TripsAdora Customer Platform Frontend

A modern React-based customer landing page for TripsAdora travel platform.

## Features

- **Hero Section**: Stunning background with overlay text and call-to-action
- **Navigation**: Clean header with logo, menu items, and user actions
- **Search Section**: "Find Your Escape" search bar with destination, date, and guest filters
- **Top Picks**: Destination cards with ratings, reviews, and booking options
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- React Icons
- React Hook Form

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open [http://localhost:5174](http://localhost:5174) in your browser

## Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Navigation header
│   ├── HeroSection.jsx     # Hero section with background
│   ├── SearchSection.jsx   # Search form
│   └── TopPicksSection.jsx # Destination cards
├── pages/
│   └── LandingPage.jsx     # Main landing page
├── styles/
│   └── globals.css         # Global styles and Tailwind
├── App.jsx                 # Main app component
└── main.jsx               # Entry point
```

## Assets

- `public/assests/bg.jpg` - Hero background image
- `public/assests/logo1.png` - TripsAdora logo

## Customization

The design uses a custom color palette defined in `tailwind.config.js`:
- Primary Blue: `#364F6B`
- Yellow Accent: `#FFD700`
- Light Gray: `#F5F5F5`
