# SEI Tech International - Frontend

A modern, world-class Next.js 14 frontend for SEI Tech International's training and consultancy platform.

## Overview

This frontend provides a seamless user experience connecting to the Odoo 19.0 backend, offering:

- **Training Services**: E-learning, face-to-face, virtual classroom, and in-house training
- **Consultancy Services**: Fire risk assessments, H&S audits, ISO management, and more
- **Student Dashboard**: Course progress, certificates, and achievements
- **E-commerce**: Course purchases with integrated checkout

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: SWR / TanStack Query
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Running Odoo backend (see main project README)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (marketing)/        # Homepage, about, contact
│   ├── (training)/         # Course pages
│   ├── (consultancy)/      # Service pages
│   ├── (dashboard)/        # User dashboard
│   ├── (auth)/             # Authentication
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Base UI components
│   ├── layout/             # Header, footer, navigation
│   ├── sections/           # Page sections
│   └── features/           # Feature-specific components
├── lib/
│   ├── api/                # Odoo API client
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   └── stores/             # Zustand stores
├── types/                  # TypeScript definitions
├── config/                 # Site configuration
└── styles/                 # Global styles
```

## Key Features

### Mega Menu Navigation
Comprehensive navigation with categorized dropdowns for training and consultancy services.

### Responsive Design
Mobile-first approach with optimized layouts for all device sizes.

### SEO Optimized
- Dynamic metadata generation
- JSON-LD structured data
- Sitemap generation
- Open Graph tags

### Performance
- Server Components by default
- Image optimization with Next.js Image
- Static generation where possible
- ISR for dynamic content

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

```bash
# Or deploy manually
vercel --prod
```

### Environment Variables

Required for production:

```env
NEXT_PUBLIC_ODOO_URL=https://api.seitechinternational.org.uk
ODOO_DATABASE=seitech_prod
NEXTAUTH_URL=https://seitechinternational.org.uk
NEXTAUTH_SECRET=your_secret
```

## API Integration

The frontend connects to the Odoo backend via JSON-RPC:

```typescript
import { getOdooClient } from '@/lib/api';

const odoo = getOdooClient();
const courses = await odoo.searchRead('slide.channel', [['is_published', '=', true]], ['name', 'list_price']);
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Run type check: `npm run type-check`
5. Create a pull request

## License

Proprietary - SEI Tech International

## Documentation

- [Frontend Specifications](/docs/FRONTEND_SPECIFICATIONS.md)
- [Technical Architecture](/docs/TECHNICAL_ARCHITECTURE.md)
