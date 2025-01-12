<div align="center">
<img src="public/images/icon-circle.png" alt="Metadachi Icon" style="width: 80px; height: auto;" />
<h1>Metadachi AI - Evolving Intelligence, Together</h1>
Metadachi is a modular platform that empowers users to build personalized knowledge bases and AI assistants. With seamless integration of shared knowledge from the community, users can create dynamic, context-rich AI tools tailored to their needs. By fostering collaboration and accessibility, Metadachi transforms individual expertise into collective intelligence, driving innovation through shared insights.
</div>


## Features
- **AI Chat**: Seamless integration with Vercel AI SDK for real-time AI interactions
- **AI Canvas Editing**: Intuitive canvas for editing  AI-generated content
- **Share Chats**: Easily share your chat sessions with others
- **Secure Storage**: Chats and files are securely stored using Supabase
- **Beautiful UI Components**: Utilizes shadcn/ui, TailwindCSS, and v0 for stunning user interfaces
- **Dark/Light Theme**: Switch between dark and light themes for a personalized experience
- [Soon] RAG with Langchain
- [Soon]: Custom AI Assistants tailored to your needs

## Technology Stack

| Technology    | Description                                                                |
| ------------- | -------------------------------------------------------------------------- |
| Next.js v15   | React framework for server-rendered, statically-generated, & hybrid sites  |
| Vercel        | Streamlined deployment & scaling platform for Next.js apps                 |
| Vercel AI SDK | The AI Toolkit for TypeScript                                              |
| Supabase      | Open source Firebase alternative (Postgres DB, Auth, Storage)              |
| Langchain | Framework for developing applications powered by language models |
| Shadcn        | Beautifully designed components that you can copy and paste into your apps |
| Aceternity UI | Beautiful Tailwind CSS and Framer Motion components                        |
| Resend        | Email for developers                                                       |

## Deployment Guide

Follow these steps to get your own Metadachi instance running in the cloud with Vercel and Supabase.

### 1. Clone or fork the repo

- Fork: Click the fork button in the upper right corner of the GitHub page.
- Clone: `git clone https://github.com/phanturne/metadachi.git`

### 2. Install dependencies

Open a terminal in the root directory of your local repository and run:

```sh
pnpm install
```

### 3. Set up backend with Supabase

#### a. Create a new project on [Supabase](https://supabase.com/).

#### b. Get project values (save these for later)

1. In the project dashboard, click on the "Project Settings" icon tab on the bottom left.
   - `REFERENCE ID`: found in the "General settings"
2. Click on the "API" tab on the left.
   - `URL`: found in "Project URL"
   - `anon public`: found in "Project API keys"
   - `service_role`: found in "Project API keys"

#### d. Connect database

Open a terminal in the root directory of your local repository and run the following commands. Replace `<project-id>` with the `REFERENCE ID` value.

```sh
supabase login
supabase link --project-ref <project-id>
supabase db push
```

### 4. Deploy with Vercel

1. Create a new project oon [Vercel](https://vercel.com/)
2. On the setup page, import your GitHub repository for your instance.
3. In the **Environment Variables** section, add entries for the values listed in the [.env.example](.env.example) file.
4. Click "Deploy" and wait for your frontend to deploy.

Once it's up and running, you’ll be able to use your hosted instance of Metadachi via the URL provided by Vercel. Enjoy your new setup!