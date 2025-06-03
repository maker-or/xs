# Sphere

[Sphere](https://www.sphereai.me/) - Your College AI Learning Platform

## 🌟 Vision

Sphere aims to empower every college student with their own AI learning assistant and educational repository.

## ✨ Features

- **Centralized Repository**: Access study materials like notes, question papers, and assignments uploaded by lecturers.
- **Rich-Text Note-Taking**: Block-based editor for creating structured and shareable notes.
- **Task Management**: Organize tasks with a built-in to-do list and calendar.
- **Whiteboard**: Interactive whiteboard for teachers to provide better explanations during online sessions.
- **Cloud Storage**: Securely store and organize your resources.
- **Intelligent Companion**: Analyze files in your space to answer questions and summarize content.
- **Custom LLMs for Institutions**: Transform your institution's repository into a knowledge powerhouse with AI tailored to your needs.

## 🧠 AI Capabilities

- Powered by Google Gemma 3 27B model via OpenRouter
- Voice mode for spoken interaction
- Retrieval-Augmented Generation (RAG) for educational content
- Contextual responses drawing from the educational repository
- Whiteboard integration for visualizing concepts

## 👨‍💻 Tech Stack

### Frontend
- React 19.1.0
- Next.js 15.3.1
- TailwindCSS
- Framer Motion
- tldraw (Whiteboard)

### Backend
- Next.js API Routes
- Drizzle ORM (PostgreSQL)
- Clerk (Authentication)
- Uploadthing (File uploads)
- Neon Serverless Postgres

### AI & Data
- AI SDK for model integration
- LangChain for LLM applications
- Pinecone for vector embeddings
- OpenRouter AI model provider (Google Gemma 3)

## 🚀 Getting Started

### Prerequisites
- Node.js
- npm 10.9.0 or compatible
- PostgreSQL database (or Neon account)
- API keys for services (Clerk, OpenRouter, Groq, etc.)

### Setup
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in required values
3. Run `npm install` to install dependencies
4. Run `npm run db:push` to set up the database schema
5. Run `npm run dev` to start the development server
6. Access the application at `http://localhost:3000`

### Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema changes to database

## 📩 Contact

For support or suggestions, reach out to us at:

- Email: harshith10295032@gmail.com
- Twitter: https://x.com/pasupuleti73628?t=VSASy8epZqcQQfSGVb4tLw&s=09

## 📝 License
This project is licensed under the MIT License. See the LICENSE file for details.

## 📚 Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (students)/   # Student role pages
│   ├── (teacher)/    # Teacher role pages
│   ├── ai/           # AI chat interface
│   ├── api/          # API endpoints
│   ├── repo/         # Repository pages
│   └── role-selection/ # Role selection page
├── components/       # Reusable UI components
│   └── ui/           # UI component library
├── server/           # Server-side code
│   └── db/           # Database schema and connections
├── styles/           # Global styles
└── utils/            # Utility functions
```

For more detailed documentation, including database schema, authentication flows, 
and development guidelines, see the [Developer Documentation](./docs/developer-guide.md).
