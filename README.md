<div align="center">
<img src="public/images/icon-circle.png" alt="Metadachi Icon" style="width: 80px; height: auto;" />
<h1>Metadachi</h1>
Metadachi is an AI-powered knowledge management platform that helps you extract insights from your sources and build a searchable knowledge base. Whether you're researching, learning, or organizing information, Metadachi makes it easy to generate summaries, create notebooks, and chat with your content.
</div>

## 🌟 Features

### 📚 Source Management

- Upload and process various file types
- View original source contents
- 🚧 Bulk file uploads and URL processing
- 🚧 Firecrawl integration for web page parsing

### 🤖 AI-Powered Insights

- Generate summaries and insights from your sources
- Create embeddings for semantic search
- Chat with your content using AI
- Rate limiting to ensure fair usage and prevent abuse

### 📓 Notebooks

- Create and organize sources into notebooks
- Public and private notebook options
- Collaborative knowledge building

### 💬 Chat Interface

- Interactive chat with your sources
- Tag and reference specific sources
- Semantic search for relevant content

## 🎯 Use Cases

1. **Quick Understanding**

   - Generate summaries of sources without reading the entire content
   - Get key insights and main points at a glance

2. **Knowledge Retention**

   - Create searchable summaries for future reference
   - Build a personal knowledge base of important information

3. **Interactive Learning**

   - Chat with your sources to explore topics in depth
   - Create and share notebooks for collaborative learning

4. **Research Organization**
   - Group related sources into notebooks
   - Share research findings with others
   - Maintain a structured collection of insights

## 🔒 Authentication

- Guest access available for basic features
- Full access with user registration
- Secure source management and sharing

## 🛠️ Tech Stack

| Technology    | Description                                                   |
| ------------- | ------------------------------------------------------------- |
| Next.js v15   | React framework for server and static rendering               |
| Vercel AI SDK | AI integration toolkit for TypeScript                         |
| Supabase      | Open source database, auth and storage (Firebase alternative) |
| Shadcn        | Reusable UI component library                                 |
| Upstash       | Rate limiting                                                 |
| Vercel        | Deployment platform for Next.js applications                  |

## 🚀 Getting Started

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

### 4. Configure Upstash Redis

- Create a database on [Upstash](https://upstash.com/)
- Get your Redis URL and token from the Upstash dashboard
- Add these environment variables to your `.env` file:
  ```
  UPSTASH_REDIS_REST_URL=your_redis_url
  UPSTASH_REDIS_REST_TOKEN=your_redis_token
  ```

### 5. Deploy on Vercel

- Create a project on [Vercel](https://vercel.com/)
- Import your GitHub repo
- Add the environment variables from the `.env.example` file
- Deploy and enjoy your new Metadachi instance!
