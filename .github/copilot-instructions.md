We use Next.js v15 When working in this codebase:

- Follow Next.js 15 App Router patterns and conventions
  - Use Server Components by default
  - Use 'use client' directive only when needed for client interactivity
  - Follow the App Router folder structure and file conventions

- Use TailwindCSS for styling
  - Follow the project's existing color schemes and design tokens
  - Use the utility-first workflow
  - Leverage the shadcn/ui component patterns
  - Apply responsive design using Tailwind breakpoint prefixes

- Vercel AI SDK Integration 
  - Use streaming responses with AI SDK
  - Follow edge runtime patterns where applicable
  - Handle AI responses with proper loading and error states
  - Implement AI features using streaming patterns

- General Practices
  - Use TypeScript types and interfaces
  - Follow the existing project structure and patterns
  - Keep components modular and reusable
  - Implement proper error handling and loading states
  - Use React Server Components for static content
  - Follow the schema in `supabase/types.ts`