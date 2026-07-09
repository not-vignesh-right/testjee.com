# TestJEE Architecture Documentation

> [!NOTE]
> **Active Application Engines & Portals:**
> This document only covers the static marketing landing page layout. For the core mock testing engines, PostgreSQL RPC definitions, RLS rules, and live session monitors, please refer to:
> * Global Application Context & Schema: [codebase_context.md](file:///c:/Users/admin/Desktop/testjee/codebase_context.md)
> * Live Session Administrative Flows: [admin_architecture_and_flow.md](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/admin_architecture_and_flow.md)

## System Overview

TestJEE is a Single Page Application (SPA) built with Vue 3, designed to provide an authentic exam simulation experience for competitive exams in India. The architecture prioritizes performance, offline capability, and user experience.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Browser                                                     │
│  ├── Service Worker (Offline Support)                       │
│  ├── Vue 3 Application                                      │
│  │   ├── Router (Vue Router)                               │
│  │   ├── Components (Header, Footer, Cards, etc.)          │
│  │   └── Views (Home, Exams, Features, About, Contact)     │
│  └── Utilities (Lazy Loading, Validation, Storage)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Static Assets Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Vercel CDN                                                  │
│  ├── HTML Files (index.html, about.html)                   │
│  ├── CSS (styles.css, animations.css)                      │
│  ├── JavaScript (main.js, utils.js)                        │
│  └── Images (logos, posters, team photos)                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Header
│   ├── Logo
│   ├── Navigation
│   │   ├── Desktop Nav
│   │   └── Mobile Menu
│   └── Login Button
│
├── Router View
│   ├── Home
│   │   ├── Hero Section
│   │   ├── Stats (Grid of Stat components)
│   │   ├── Available Tests (Grid of Card components)
│   │   ├── Features Grid
│   │   ├── Online Services
│   │   ├── Results Section
│   │   │   └── Testimonials (Grid of Testimonial components)
│   │   ├── FAQ
│   │   └── CTA Section
│   │
│   ├── Exams
│   │   └── Exam Cards Grid
│   │
│   ├── Features
│   │   ├── Palette Codes
│   │   ├── Controls
│   │   ├── Analytics
│   │   └── CTA
│   │
│   ├── About
│   │   ├── Hero
│   │   ├── Mission Section
│   │   ├── Founder Section
│   │   ├── Tech Team Grid
│   │   ├── Parent Company
│   │   └── CTA
│   │
│   ├── Contact
│   │   ├── Hero
│   │   ├── Contact Cards
│   │   └── Contact Form
│   │
│   └── Login
│       └── Login Form
│
└── Footer
    ├── Brand Info
    ├── Quick Links
    └── Contact Info
```

## Data Flow

### 1. Application Initialization

```
User visits site
    ↓
Browser loads index.html
    ↓
Vue 3 initializes
    ↓
Router sets up routes
    ↓
Service Worker registers (if supported)
    ↓
Initial route component renders
```

### 2. Navigation Flow

```
User clicks navigation link
    ↓
Vue Router intercepts click
    ↓
Route guard checks (if any)
    ↓
Component unmounts
    ↓
New component mounts
    ↓
Scroll to top
    ↓
Page renders
```

### 3. Form Submission Flow

```
User fills form
    ↓
Client-side validation
    ↓
Form submit event
    ↓
Prevent default
    ↓
Show success message
    ↓
Reset form (after delay)
```

## State Management

Currently, TestJEE uses component-local state with Vue 3's Composition API:

- **Reactive References**: `ref()` for simple values
- **Computed Properties**: Derived state
- **Lifecycle Hooks**: `onMounted`, `onUnmounted` for side effects

### Example State Pattern

```javascript
const Header = {
  setup() {
    const menuOpen = ref(false);
    const isScrolled = ref(false);
    
    const toggleMenu = () => menuOpen.value = !menuOpen.value;
    
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 10;
    };
    
    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });
    
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });
    
    return { menuOpen, isScrolled, toggleMenu };
  }
};
```

## Routing Strategy

### Hash-based Routing

TestJEE uses hash-based routing (`createWebHashHistory`) for compatibility with static hosting:

```javascript
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/exams', component: Exams },
    { path: '/features', component: Features },
    { path: '/about', component: About },
    { path: '/contact', component: Contact },
    { path: '/login', component: Login },
    { path: '/:catchAll(.*)', redirect: '/' }
  ]
});
```

### Route Structure

- `/` - Home page
- `/#/exams` - Exams listing
- `/#/features` - Features overview
- `/#/about` - About page (also available as `/about.html`)
- `/#/contact` - Contact form
- `/#/login` - Login page

## Caching Strategy

### Service Worker Cache Layers

1. **Static Cache** (`testjee-v1.0.0-static`)
   - HTML files
   - CSS files
   - JavaScript files
   - Manifest
   - Essential images

2. **Dynamic Cache** (`testjee-v1.0.0-dynamic`)
   - Dynamically requested pages
   - API responses (future)

3. **Image Cache** (`testjee-v1.0.0-images`)
   - All image assets
   - Cache-first strategy

### Cache Strategies

- **HTML**: Network first, fallback to cache
- **CSS/JS**: Cache first, update in background
- **Images**: Cache first with long expiration
- **API** (future): Network first with cache fallback

## Performance Optimizations

### 1. Resource Loading

```html
<!-- Preload critical resources -->
<link rel="preload" href="/assets/css/styles.css" as="style" />
<link rel="preconnect" href="https://cdn.tailwindcss.com" />
```

### 2. Lazy Loading

```javascript
// Intersection Observer for images
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});
```

### 3. Code Splitting (Future)

When migrating to build tools:
- Route-based code splitting
- Component lazy loading
- Dynamic imports for heavy features

## Security Considerations

### 1. Content Security

- No inline scripts (except Vue initialization)
- External scripts from trusted CDNs
- HTTPS only in production

### 2. Form Validation

- Client-side validation for UX
- Server-side validation (when backend added)
- XSS prevention through Vue's template escaping

### 3. Data Privacy

- No sensitive data in localStorage
- No third-party analytics (currently)
- Minimal data collection

## Browser Compatibility

### Supported Browsers

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android

### Polyfills

Currently using native APIs. Future considerations:
- Intersection Observer polyfill for older browsers
- Service Worker polyfill if needed

## Scalability Considerations

### Current Architecture

- Static site: Scales horizontally via CDN
- No backend: No database bottlenecks
- Client-side rendering: Server load minimal

### Future Enhancements

1. **Backend Integration**
   - User authentication
   - Test submission and scoring
   - Progress tracking
   - Leaderboards

2. **Database**
   - User profiles
   - Test history
   - Analytics data

3. **API Layer**
   - RESTful or GraphQL API
   - Real-time updates via WebSockets
   - Caching layer (Redis)

## Deployment Architecture

```
GitHub Repository
    ↓
Vercel Build System
    ↓
Vercel CDN (Global)
    ├── Edge Locations (Asia)
    ├── Edge Locations (Europe)
    └── Edge Locations (Americas)
    ↓
End Users
```

### Deployment Process

1. Push to GitHub
2. Vercel webhook triggers build
3. Build process runs
4. Assets deployed to CDN
5. Cache invalidation
6. New version live

## Monitoring & Analytics

### Current Setup

- Browser console logging
- Service Worker lifecycle events
- Error tracking (console)

### Future Enhancements

- Google Analytics integration
- Error tracking (Sentry)
- Performance monitoring (Web Vitals)
- User behavior analytics

## Testing Strategy

### Manual Testing

- Cross-browser testing
- Mobile responsiveness
- Accessibility testing
- Performance audits (Lighthouse)

### Future Automated Testing

- Unit tests (Vitest)
- Component tests (Vue Test Utils)
- E2E tests (Playwright)
- Visual regression tests

## Accessibility Architecture

### WCAG 2.1 Compliance

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation
- Focus management
- Color contrast ratios
- Screen reader support

### Implementation

```css
/* Focus visible for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}

/* Skip to main content */
.skip-to-main {
  position: absolute;
  top: -40px;
  /* ... */
}
```

## Future Architecture Considerations

### 1. Micro-frontends

- Separate apps for different exam types
- Shared component library
- Independent deployment

### 2. Server-Side Rendering

- Improved SEO
- Faster initial load
- Better social sharing

### 3. Real-time Features

- Live test sessions
- Real-time leaderboards
- Collaborative features

---

**Last Updated**: February 2026
**Version**: 1.0.0
