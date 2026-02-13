# Gyan-Edge JEE Full Exam UI

A full-fledged mock exam UI that replicates the NTA JEE Main environment, styled with Gyan-Edge branding.

## 🎯 Features

### Authentication & User Management
- **Magic Link Login**: Passwordless authentication via email
- **Student Profiles**: Automatic profile creation with name persistence
- **Secure Sessions**: Supabase Auth integration with Row Level Security
- **Data Privacy**: Students can only access their own exam results

### Core Functionality
- **NTA-Exact Layout**: Pixel-perfect replica of the official NTA exam interface
- **Question Navigation**: Seamless movement between questions with state preservation
- **Answer Management**: Auto-save on selection, clear responses, mark for review
- **Timer System**: Real-time countdown with auto-submit functionality
- **Full-Screen Mode**: Toggle for distraction-free exam experience

### Question Palette
- **Color-Coded Status**: 
  - 🔘 Gray = Not Visited
  - 🔴 Red = Visited but Not Answered  
  - 🟢 Green = Answered
  - 🟣 Purple = Marked for Review
  - 🟣🟢 Purple with Green Border = Answered + Marked
- **Quick Navigation**: Click any question number to jump instantly
- **Real-time Updates**: Live status tracking and progress indicators

### GTA Branding
- **Gyan-edge Logo**: Custom phoenix-inspired logo in header
- **Brand Colors**: Blue-based color scheme matching the logo
- **Professional UI**: Clean, modern interface with smooth transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/vigneshbs33/GTA GTA-Cloned-Web-App
cd GTA-Cloned-Web-App

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production
```bash
npm run build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/           # Vue components
│   ├── ExamLayout.vue   # Main layout orchestrator
│   ├── HeaderBar.vue    # Logo, timer, controls
│   ├── QuestionArea.vue # Question display & options
│   ├── QuestionPalette.vue # Question navigation grid
│   └── FooterNav.vue    # Action buttons & progress
├── stores/              # Pinia state management
│   └── examStore.js     # Exam state & logic
├── App.vue              # Root component
├── main.js              # App entry point
└── style.css            # TailwindCSS + custom styles
```

## 🔧 Configuration

### TailwindCSS Custom Colors
The project uses a custom GTA color palette defined in `tailwind.config.js`:

```javascript
colors: {
  'gta': {
    'primary': '#3B82F6',    // Bright blue
    'secondary': '#1E40AF',  // Darker blue
    'accent': '#60A5FA',     // Light blue
    'success': '#10B981',    // Green
    'danger': '#EF4444',     // Red
    'purple': '#8B5CF6',     // Purple
    // ... more colors
  }
}
```

### Supabase Setup

**Important**: Before running the app, you must set up the database schema:

1. Create a Supabase project at https://supabase.com
2. Run the migration script in SQL Editor:
   ```bash
   # Copy contents of supabase-migration.sql and run in Supabase SQL Editor
   ```
3. Configure environment variables:
   ```bash
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Update Auth redirect URL in Supabase Dashboard:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

For detailed setup instructions, see `SETUP-GUIDE.md`.

## 🔌 API Integration

### Database Tables
- `students` - Student profiles linked to Supabase Auth
- `subjects` - Subject definitions (Physics, Chemistry, Mathematics)
- `topics` - Topic classifications
- `questions` - Question bank with content and metadata
- `choices` - Multiple choice options and correct answers
- `results` - Exam submissions with answers and scores

### Exam Structure
- Per subject: 20 MCQs + 5 Numericals
- Total: 75 questions across 3 subjects
- Scoring: +4 for correct, -1 for incorrect, 0 for unanswered

## 🎨 Customization

### Adding New Question Types
Extend the question schema in `examStore.js`:

```javascript
{
  id: 6,
  text: "Your question text here",
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    // ... more options
  ],
  subject: 'Subject Name',
  topic: 'Topic Name',
  type: 'multiple-choice', // Add question types
  media: 'image-url'       // Add media support
}
```

### Styling Modifications
- **Colors**: Update `tailwind.config.js`
- **Layout**: Modify component templates
- **Animations**: Adjust CSS transitions in `style.css`

## 📱 Responsive Design

The UI is optimized for desktop exam environments but includes responsive considerations:
- Flexible question area
- Scrollable palette for many questions
- Touch-friendly button sizes

## 🧪 Testing

The app includes comprehensive mock functionality:
- 5 sample JEE-level questions
- Real-time state management
- Simulated API delays
- Error handling examples

## 🚀 Deployment

### Vercel
```bash
npm run build
# Deploy dist/ folder
```

### Netlify
```bash
npm run build
# Deploy dist/ folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📚 Documentation

- **QUICK-REFERENCE.md** - Quick start guide and common commands
- **SETUP-GUIDE.md** - Detailed setup instructions with troubleshooting
- **IMPLEMENTATION-NOTES.md** - Technical implementation details
- **ARCHITECTURE-DIAGRAM.md** - System architecture and data flow
- **DEPLOYMENT-CHECKLIST.md** - Production deployment checklist
- **CHANGES-SUMMARY.md** - Recent changes and updates

## 🆘 Support

For questions or issues:
- Check `SETUP-GUIDE.md` for troubleshooting
- Review browser console for error messages
- Verify Supabase configuration
- Check database migration was applied
- Ensure Node.js version compatibility

## 🔄 Recent Updates

### Student Authentication System (Latest)
- Implemented passwordless magic link authentication
- Added automatic student profile creation
- Integrated student name persistence across sessions
- Added Row Level Security for data privacy
- Linked exam results to student profiles

See `CHANGES-SUMMARY.md` for complete details.

---

**Built with ❤️ for Gyan-edge Testing Agency** 
