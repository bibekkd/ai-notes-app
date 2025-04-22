# 📝 Smart Notes – AI-Powered Note-Taking App

Smart Notes is a modern, responsive web application designed to help users create, manage, and summarize their notes efficiently. It leverages the power of AI to provide instant note summarization and ensures a seamless experience across devices.

## 🚀 Tech Stack

### Frontend
- Next.js (App Router + TypeScript)
- Tailwind CSS
- Shadcn UI
- TanStack Query (React Query) – for data fetching and state management

### Backend
- Supabase – Authentication & Database
- Gemini API – AI Note Summarization

## ✨ Features

### ✅ User Authentication
Sign up and log in using:
- Google OAuth
- Email & Password

### 📝 Note Management
- Create, edit, and delete notes
- Real-time updates and auto-sync with Supabase

### 🧠 AI Summarization
- Summarize any note using Google Gemini API
- Great for quick recaps and idea digestion

### ⚡ State Management
Powered by TanStack Query (React Query) for optimized, scalable, and cache-efficient data fetching

## 📁 Project Structure

📂 **Root Directory**
├── 📂 **app** - Main application directory
│   ├── 📂 **api**
│   │   └── 📂 **summarize**
│   │       └── `route.ts` - AI summarization API endpoint
│   ├── 📂 **auth** - Authentication pages
│   ├── 📂 **dashboard** - User dashboard
│   │   ├── `page.tsx` - Notes dashboard
│   │   └── 📂 **[noteId]**
│   │       └── `page.tsx` - Individual note editor
│   ├── `layout.tsx` - Root layout
│   └── `page.tsx` - Landing page
│
├── 📂 **components** - Reusable UI components
│   ├── 📂 **ui** - Shadcn components
│   ├── 📂 **notes** - Note-related components
│   └── 📂 **auth** - Auth form components
│
├── 📂 **lib** - Core utilities and configurations
│   ├── `supabase.ts` - Supabase client
│   ├── `utils.ts` - Helper functions
│   ├── 📂 **hooks** - Custom React hooks
│   ├── `types.ts` - TypeScript type definitions
│   └── 📂 **providers**
│       └── `query-provider.tsx` - React Query setup
│
└── 📂 **public** - Static assets
    └── 📂 **images** - Logos, illustrations, etc.


## 🛠️ Getting Started

### 1. Clone the repo
    
    git clone https://github.com/your-username/smart-notes.git
    cd smart-notes
  
### 2. Install dependencies
     npm install
### 3. Set up environment variables
  Create a .env.local file in the root directory and add the following variables:
  
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
### 4. Start the development server
    npm run dev
## 🧪 Future Improvements
  - ✍️ Markdown support for notes
  - 🗂️ Folder and tag-based categorization
  - 👥 Real-time collaborative editing
  - 🎨 AI tone/style rewriting features
  - 📴 Offline access via PWA support

## 📄 License
MIT License


