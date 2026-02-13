# TestJEE - Exam Simulation Platform

![TestJEE Logo](assets/img/logo_test_jee.png)

## 🎯 Overview

TestJEE is a premier exam simulation platform designed to help students prepare for competitive exams like JEE Main, JEE Advanced, NEET, NDA, and KCET. Built by [Gyan Edge Education](https://gyanedge.co), TestJEE provides an authentic NTA-style testing experience with instant analytics and comprehensive performance tracking.

## ✨ Features

- **NTA Replica Interface**: Exact layout, color codes, and controls matching real exams
- **180+ Mock Tests**: Shift-wise PYQs and curated practice tests
- **Instant Analytics**: Real-time scoring with +4/-1 marking, accuracy tracking, and subject-wise breakdown
- **24×7 Access**: Practice anytime on mobile, tablet, or desktop
- **Secure & Fast**: Magic link authentication with row-level security
- **Progressive Web App**: Installable app with offline support

## 🚀 Technology Stack

### Frontend
- **Vue 3**: Progressive JavaScript framework
- **Vue Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla CSS**: Custom animations and styling

### Infrastructure
- **Vercel**: Hosting and deployment
- **Service Worker**: Offline support and caching
- **PWA**: Progressive Web App capabilities

### Tools & Libraries
- Custom utility functions for common operations
- Intersection Observer for lazy loading and animations
- Local storage for client-side data persistence

## 📁 Project Structure

```
TestJeeWbsite/
├── index.html              # Main SPA entry point
├── about.html              # About page
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline support
├── vercel.json            # Vercel configuration
├── assets/
│   ├── css/
│   │   ├── styles.css     # Main stylesheet with custom properties
│   │   └── animations.css # Animation library
│   ├── js/
│   │   ├── main.js        # Main JavaScript file
│   │   ├── utils.js       # Utility functions
│   │   └── components/    # Vue components (future)
│   └── img/               # Images and logos
```

## 🛠️ Setup & Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (optional, for local development server)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TestJeeWbsite
   ```

2. **Serve locally**
   
   Using Python:
   ```bash
   python -m http.server 8000
   ```
   
   Using Node.js:
   ```bash
   npx serve
   ```
   
   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Production Deployment

The site is configured for Vercel deployment:

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

Or simply push to GitHub and connect to Vercel for automatic deployments.

## 🎨 Customization

### Colors & Theming

Edit CSS custom properties in `assets/css/styles.css`:

```css
:root {
    --brand: #2563eb;        /* Primary brand color */
    --brand2: #0891b2;       /* Secondary brand color */
    --ink: #0f172a;          /* Text color */
    /* ... more variables */
}
```

### Content Updates

- **Home Page**: Edit Vue components in `index.html`
- **About Page**: Edit `about.html`
- **Contact Info**: Update Footer component in `index.html`

### Adding New Pages

1. Create new HTML file (e.g., `new-page.html`)
2. Copy header and footer from existing pages
3. Add route in Vue Router configuration
4. Update navigation links

## 📱 Progressive Web App

TestJEE is installable as a PWA:

1. Visit the site on mobile or desktop
2. Look for "Install" or "Add to Home Screen" prompt
3. Install for offline access and app-like experience

### PWA Features
- Offline support via service worker
- App icons and splash screens
- Standalone display mode
- Background sync (future)
- Push notifications (future)

## 🔧 Development Workflow

### Making Changes

1. Edit files in `assets/` directory
2. Test locally using a development server
3. Commit changes to Git
4. Push to trigger automatic deployment

### Best Practices

- Use CSS custom properties for consistent theming
- Follow existing naming conventions
- Test on multiple devices and browsers
- Optimize images before adding
- Keep animations performant

## 📊 Performance

### Optimization Techniques
- Lazy loading for images
- Resource preloading for critical assets
- Service worker caching
- Minified CSS and JavaScript (in production)
- Responsive images

### Monitoring
- Use Lighthouse for performance audits
- Check Core Web Vitals
- Monitor service worker cache hit rates

## ♿ Accessibility

TestJEE follows WCAG 2.1 guidelines:

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus visible indicators
- High contrast mode support
- Screen reader compatible
- Reduced motion support

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use 2 spaces for indentation
- Follow existing code patterns
- Add comments for complex logic
- Test thoroughly before submitting

## 📞 Contact

**Gyan Edge Education**
- Address: Gangamma Cir Church Rd, above RK JWELLERS, Kalathur Layout, Jalahalli East, Bengaluru – 560013
- Phone: +91 73535 60013
- Email: gyanedgegangamma@gmail.com
- Website: [gyanedge.co](https://gyanedge.co)

## 👥 Team

- **Purnendu Mishra** - Founder & CEO
- **Vignesh B S** - Tech Lead ([vigneshbs.xyz](https://vigneshbs.xyz))
- **Chinmay Panghri** - Cloud Engineer
- **Karthik B V** - Frontend Developer

## 📄 License

© 2024 TestJEE by Gyan Edge Education. All rights reserved.

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Tailwind CSS for the utility-first approach
- All students using TestJEE for their preparation

---

**Made with ❤️ by Gyan Edge Education**
