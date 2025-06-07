<div align="center">
<img src="public/images/icon-circle.png" alt="Metadachi Icon" style="width: 80px; height: auto;" />
<h1>Metadachi</h1>
<strong>AI Knowledge Management - Never Forget What You Never Read</strong>

Stop pretending you read that whole thing. Let AI give you the good parts so you can sound smart at meetings and actually find stuff you saved last week.

</div>

## 🌟 Features That Actually Work

### 📚 Source Management

_Because your digital hoarding habit deserves better organization_

- Upload and process various file types (yes, even that PDF you've been avoiding)
- View original source contents without the existential dread
- 🚧 Bulk file uploads and URL processing (for the overachievers)
- 🚧 Firecrawl integration for web page parsing (fancy!)

### 🤖 AI-Powered Insights

_Like having a research assistant who never judges your 3 AM reading habits_

- Generate summaries and insights from your sources
- Create embeddings for semantic search (it's like Google, but for your brain)
- Chat with your content using AI that actually remembers what you fed it
- Rate limiting to ensure fair usage and prevent you from breaking everything

### 📓 Notebooks

_Turn your digital chaos into something that looks intentional_

- Create and organize sources into notebooks
- Public and private notebook options (for when you're feeling social vs antisocial)
- Collaborative knowledge building (teamwork makes the dream work)

### 💬 Chat Interface

_Finally, a conversation partner who won't interrupt you_

- Interactive chat with your sources
- Tag and reference specific sources like a proper academic
- Semantic search for relevant content (no more ctrl+f desperation)

## 🎯 Use Cases

_AKA: What you'll actually use this for_

1. **Quick Understanding**

   - Generate summaries without admitting you didn't read the whole thing
   - Get key insights faster than you lose your car keys

2. **Knowledge Retention**

   - Create searchable summaries for future reference
   - Build a personal knowledge base that won't judge your random 2 AM research spirals

3. **Interactive Learning**

   - Chat with your sources to explore topics without getting distracted by cat videos
   - Create and share notebooks for collaborative learning (or showing off)

4. **Research Organization**
   - Group related sources into notebooks like a responsible adult
   - Share research findings without the awkward email attachments
   - Maintain a structured collection of insights (Marie Kondo would be proud)

## 🔒 Authentication

_We promise not to judge your browsing history_

- Guest access available for basic features (dip your toes in the water)
- Full access with user registration (dive into the deep end)
- Secure source management and sharing (your secrets are safe with us)

## 🛠️ Tech Stack

_The boring but necessary stuff that makes the magic happen_

| Technology    | Description                                                   |
| ------------- | ------------------------------------------------------------- |
| Next.js v15   | React framework for server and static rendering               |
| Vercel AI SDK | AI integration toolkit for TypeScript                         |
| Supabase      | Open source database, auth and storage (Firebase alternative) |
| Shadcn        | Reusable UI component library                                 |
| Magic UI      | Beautiful animated components and effects                     |
| Upstash       | Rate limiting (to keep you from breaking things)              |
| Vercel        | Deployment platform for Next.js applications                  |

## 🚀 Getting Started

_Let's get this digital organization party started_

### 1. Clone the repo

_First step to digital enlightenment_

```sh
git clone https://github.com/phanturne/metadachi.git
```

### 2. Install dependencies

_Feed the code monster_

```sh
pnpm install
```

### 3. Set up Supabase backend

_The foundation of your knowledge empire_

- Create a project on [Supabase](https://supabase.com/) (it's free, like the best things in life)
- Grab these values from your project:
  - Project ID (in General settings)
  - Project URL and API keys (in API settings)
- Connect your database (the moment of truth):
  ```sh
  supabase login
  supabase link --project-ref <your-project-id>
  supabase db push
  ```

### 4. Configure Upstash Redis

_Because even AI needs boundaries_

- Create a database on [Upstash](https://upstash.com/)
- Get your Redis URL and token from the Upstash dashboard
- Add these environment variables to your `.env` file:
  ```
  UPSTASH_REDIS_REST_URL=your_redis_url
  UPSTASH_REDIS_REST_TOKEN=your_redis_token
  ```

### 5. Deploy on Vercel

_The grand finale_

- Create a project on [Vercel](https://vercel.com/)
- Import your GitHub repo (drag and drop, basically)
- Add the environment variables from the `.env.example` file
- Deploy and enjoy your new Metadachi instance! 🎉

---

<div align="center">
<strong>Ready to transform your content chaos into organized brilliance?</strong><br>
<em>Warning: Side effects may include actually finishing things you start and looking smarter at meetings.</em>
</div>
