<div align="center">
<img src="public/images/icon-circle.png" alt="Metadachi Icon" style="width: 80px; height: auto;" />
<h1>Metadachi - Create & Explore AI Knowledge Libraries</h1>
Metadachi is a platform where you can build and share AI-powered knowledge libraries. Create personalized AI assistants that learn from your documents, notes, and data. Access community-shared knowledge to enhance your AI's capabilities or contribute your own expertise to help others. It's designed for both individual use and collaborative work, making specialized AI tools more accessible to everyone.
</div>

## Features

- **AI Chat**: Chat with AI models via Vercel AI SDK
- **AI Canvas**: Edit and format AI-generated content
- **Share Chats**: Create shareable links to conversations
- **Storage**: Store chats and files in Supabase
- **Theme Toggle**: Switch between dark and light modes

## Technology Stack

| Technology    | Description                                                   |
| ------------- | ------------------------------------------------------------- |
| Next.js v15   | React framework for server and static rendering               |
| Vercel        | Deployment platform for Next.js applications                  |
| Vercel AI SDK | AI integration toolkit for TypeScript                         |
| Supabase      | Open source database, auth and storage (Firebase alternative) |
| Shadcn        | Reusable UI component library                                 |

## Get Started

Want your own Metadachi? Here's how to set it up:

### 1. Clone the repo

```sh
git clone https://github.com/phanturne/metadachi.git
```

### 2. Install dependencies

```sh
pnpm install
```

### 3. Set up Supabase backend

- Create a project on [Supabase](https://supabase.com/)
- Grab these values from your project:
  - Project ID (in General settings)
  - Project URL and API keys (in API settings)
- Connect your database:
  ```sh
  supabase login
  supabase link --project-ref <your-project-id>
  supabase db push
  ```

### 4. Deploy on Vercel

- Create a project on [Vercel](https://vercel.com/)
- Import your GitHub repo
- Add the environment variables from the `.env.example` file
- Deploy and enjoy your new Metadachi instance!

## Kudos to

- [Vercel AI Chatbot Template](https://github.com/vercel/ai-chatbot)
- [Chatbot UI](https://github.com/mckaywrigley/chatbot-ui)
