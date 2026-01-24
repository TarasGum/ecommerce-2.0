# Ecommerce Platform Frontend

Modern web interface for EBMS ecommerce monitoring and management.

## Project Status

### ✅ Implemented
- Project structure and configuration
- PrimeVue UI library setup
- TypeScript with strict mode
- Pinia state management
- Basic routing structure

### 🚧 In Progress
- Design system
- Authentication
- API client with interceptors

### 📋 Planned
- Users management (full CRUD)
- Orders, Customers, Products views
- Dashboard with metrics
- Navigation sidebar

## Tech Stack
- **Framework:** Nuxt 3
- **Language:** TypeScript (strict mode)
- **UI Library:** PrimeVue
- **State Management:** Pinia
- **HTTP Client:** Nuxt $fetch

## Development
```bash
# Install dependencies
npm install

# Start dev server (required to generate .nuxt/ types)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture Conventions

- **Composables:** Logic and side effects (API calls, business logic)
- **Stores:** State management only (no API calls)
- **Components:** Feature-specific in domain folders, reusable in ui/
- **API Access:** Always use `useRuntimeConfig().public.apiBase`

## Environment Variables
```bash
NUXT_PUBLIC_API_BASE=https://api.store.rivne.app
```
