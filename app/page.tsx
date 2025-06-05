"use client"

import { SummarizeTool, SummaryResponse } from "@/components/summarize-tool"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { motion, useScroll, useSpring } from "framer-motion"
import { ArrowRight, BookOpen, Brain, ChevronUp, FileText, Sparkles, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {
  const { user } = useAuth()
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Immediate redirect if user is authenticated
  if (user) {
    router.replace('/home')
    return null
  }

  const handleSummaryGenerated = (newSummary: SummaryResponse) => {
    localStorage.setItem('pendingSummary', JSON.stringify(newSummary))
    setIsNavigating(true)
    router.push('/summarize')
  }

  if (isNavigating) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent opacity-50" />
        <div className="container mx-auto max-w-7xl py-20 px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center"
            >
              <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Your AI-Powered Knowledge Companion
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Transform your research, learning, and content organization with AI-powered insights. Build a searchable knowledge base that grows with you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2" onClick={() => router.push("/register")}>
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SummarizeTool onSummaryGenerated={handleSummaryGenerated} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto max-w-7xl py-16 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-4xl font-bold text-primary mb-2">3+</div>
            <div className="text-muted-foreground">Active Users</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="text-4xl font-bold text-primary mb-2">10+</div>
            <div className="text-muted-foreground">Sources Processed</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="text-4xl font-bold text-primary mb-2">2+</div>
            <div className="text-muted-foreground">Notebooks Created</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="text-4xl font-bold text-primary mb-2">5+</div>
            <div className="text-muted-foreground">AI Chats</div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto max-w-7xl py-20 px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Manage Knowledge</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features to help you extract, organize, and leverage insights from your content
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-xl p-6 border border-border/50"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Quick Understanding</h3>
            <p className="text-muted-foreground">
              Generate summaries and get key insights without reading entire content
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 border border-border/50"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Knowledge Retention</h3>
            <p className="text-muted-foreground">
              Create searchable summaries for future reference and learning
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border/50"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Interactive Learning</h3>
            <p className="text-muted-foreground">
              Chat with your sources to explore topics in depth
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl p-6 border border-border/50"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Research Organization</h3>
            <p className="text-muted-foreground">
              Group related sources and maintain structured collections
            </p>
          </motion.div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Perfect For</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you&apos;re researching, learning, or organizing information, Metadachi has you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quick Understanding</h3>
              <p className="text-muted-foreground">
                Generate summaries and get key insights without reading entire content
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Knowledge Retention</h3>
              <p className="text-muted-foreground">
                Create searchable summaries for future reference and learning
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Interactive Learning</h3>
              <p className="text-muted-foreground">
                Chat with your sources to explore topics in depth
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Research Organization</h3>
              <p className="text-muted-foreground">
                Group related sources and maintain structured collections
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto max-w-7xl py-20 px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">What I Say About My Own Product</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            As the creator, I&apos;m pretty biased but also very honest
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              &ldquo;I built this because I was tired of forgetting what I read. Now I just forget where I saved the summary. Progress!&rdquo;
            </p>
            <div className="font-semibold">Me, The Creator</div>
            <div className="text-sm text-muted-foreground">Also The First User</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              &ldquo;The AI is so good at summarizing that sometimes I wonder if it&apos;s smarter than me. Don&apos;t tell it I said that.&rdquo;
            </p>
            <div className="font-semibold">Me Again</div>
            <div className="text-sm text-muted-foreground">Still The Creator</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              &ldquo;I&apos;m not saying it&apos;s perfect, but it&apos;s definitely better than my memory. And my memory is... what was I saying?&rdquo;
            </p>
            <div className="font-semibold">Me One More Time</div>
            <div className="text-sm text-muted-foreground">Yes, Still The Creator</div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto max-w-7xl py-20 px-4">
        <div className="bg-card rounded-2xl p-12 border border-border/50 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-50" />
          <div className="relative">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Content?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our users who are saving time, gaining insights, and building their knowledge library with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" onClick={() => router.push("/register")}>
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 pb-12">
        <div className="border-t border-border/50 pt-8 text-center text-muted-foreground">
            © 2025 Metadachi. All rights reserved.
          </div>
      </footer>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronUp className="h-6 w-6" />
      </motion.button>
    </div>
  )
}
