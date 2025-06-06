"use client"

import { SummarizeTool, SummaryResponse } from "@/components/summarize-tool"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useSpring } from "framer-motion"
import { ArrowRight, BookOpen, Brain, FileText, Sparkles, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

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
              Get Smart Without the Heavy Lifting
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Stop pretending you read that whole thing. Let AI give you the good parts so you can sound smart at meetings.
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

      {/* Features Grid with Enhanced Transitions */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        <div className="container mx-auto max-w-7xl py-20 px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Manage Knowledge</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you extract, organize, and leverage insights from your content
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quick Understanding</h3>
              <p className="text-muted-foreground">
              Skip to the good parts without admitting you didn&apos;t read the whole thing
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Knowledge Retention</h3>
              <p className="text-muted-foreground">
              Save insights before they disappear into the void with your car keys
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Interactive Learning</h3>
              <p className="text-muted-foreground">
              Chat with AI that actually remembers what you fed it (unlike your goldfish)
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Research Organization</h3>
              <p className="text-muted-foreground">
              Turn your digital hoarding habit into something that looks intentional
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Use Cases Section with Parallax Effect */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
        <div className="container mx-auto max-w-7xl py-20 px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Perfect For</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you&apos;re researching, learning, or organizing information, Metadachi has you covered.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Students</h3>
              <p className="text-muted-foreground">
              Cram a semester&apos;s worth of reading into your last brain cell
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Researchers</h3>
              <p className="text-muted-foreground">
              Because nobody has time to read 200 papers to find one useful quote
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Content Creators</h3>
              <p className="text-muted-foreground">
              Turn other people&apos;s thoughts into your content (legally, of course)
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Curious Minds</h3>
              <p className="text-muted-foreground">
              For people who collect PDFs like Pokemon cards but never actually read them
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Before/After Section with Enhanced Transitions */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        <div className="container mx-auto max-w-7xl py-20 px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">The Metadachi Effect</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real transformations from our users (names changed to protect the guilty)
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold mb-4 text-red-500">Before Metadachi</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• &ldquo;I have 47 browser tabs open and I&apos;m not sure what any of them are for&rdquo;</li>
                <li>• &ldquo;My bookmarks folder is basically a digital graveyard&rdquo;</li>
                <li>• &ldquo;I start reading something interesting, then forget where I found it&rdquo;</li>
                <li>• &ldquo;My brain is like a browser with 500 tabs open&rdquo;</li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold mb-4 text-green-500">After Metadachi</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• &ldquo;I can actually find things I saved last week&rdquo;</li>
                <li>• &ldquo;My bookmarks folder is now a well-organized library&rdquo;</li>
                <li>• &ldquo;I remember what I read because it&apos;s all connected&rdquo;</li>
                <li>• &ldquo;My brain is now a browser with only 50 tabs open (baby steps!)&rdquo;</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Common Excuses Section with Enhanced Transitions */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
        <div className="container mx-auto max-w-7xl py-20 px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Common Excuses (And Why They&apos;re Wrong)</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We&apos;ve heard them all. Here&apos;s why they don&apos;t hold up
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold mb-3">&ldquo;I&apos;ll remember where I saved it&rdquo;</h3>
              <p className="text-muted-foreground">
                Spoiler: You won&apos;t. Your brain is already busy forgetting where you left your keys.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold mb-3">&ldquo;I&apos;ll organize it later&rdquo;</h3>
              <p className="text-muted-foreground">
                Later is a mythical place, like Narnia but with more browser tabs.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold mb-3">&ldquo;I know exactly where everything is&rdquo;</h3>
              <p className="text-muted-foreground">
                In your dreams. Your bookmarks folder is basically a digital Bermuda Triangle.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Warning Labels Section with Enhanced Transitions */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        <div className="container mx-auto max-w-7xl py-20 px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Warning Labels</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Read carefully. Side effects may include increased productivity and organization.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-yellow-400/10 flex items-center justify-center mb-4">
                <span className="text-yellow-400 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Side Effects</h3>
              <p className="text-muted-foreground">
                May cause sudden bursts of productivity and the ability to find things you saved last week.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-yellow-400/10 flex items-center justify-center mb-4">
                <span className="text-yellow-400 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Social Impact</h3>
              <p className="text-muted-foreground">
                Friends may mistake you for an organized person. Please use responsibly.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-yellow-400/10 flex items-center justify-center mb-4">
                <span className="text-yellow-400 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Addiction Warning</h3>
              <p className="text-muted-foreground">
                May lead to excessive organization of other aspects of your life. We&apos;re not sorry.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAQ Section with Enhanced Transitions */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
        <div className="container mx-auto max-w-7xl py-20 px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">FAQ (Frequently Avoided Questions)</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Questions you were too afraid to ask, answered with brutal honesty
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold mb-3">Will this make me smarter?</h3>
              <p className="text-muted-foreground">
                No, but it will make you look smarter. Sometimes that&apos;s even better.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold mb-3">Is there a limit to how much I can save?</h3>
              <p className="text-muted-foreground">
                Yes, your dignity. But that&apos;s about it.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold mb-3">Will it organize my existing mess?</h3>
              <p className="text-muted-foreground">
                We&apos;re good, but we&apos;re not miracle workers. You&apos;ll need to put in some effort.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold mb-3">Is it really worth the effort?</h3>
              <p className="text-muted-foreground">
                Well, do you enjoy spending hours looking for that one article you saved last month? Didn&apos;t think so.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Testimonials Section with Enhanced Transitions */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        <div className="container mx-auto max-w-7xl py-20 px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">What I Say About My Own Product</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              As the creator, I&apos;m pretty biased but also very honest
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                &ldquo;I made this because my brain was basically a browser with 500 tabs open. Now it&apos;s down to like 50. Baby steps.&rdquo;
              </p>
              <div className="font-semibold">Me, The Creator</div>
              <div className="text-sm text-muted-foreground">Also The First User</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                &ldquo;The AI never gets distracted by cat videos halfway through reading. Unlike literally everyone I know, including myself.&rdquo;
              </p>
              <div className="font-semibold">Me Again</div>
              <div className="text-sm text-muted-foreground">Still The Creator</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all"
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
      </div>

      {/* CTA Section with Enhanced Transitions */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
        <div className="container mx-auto max-w-7xl py-20 px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-12 border border-border/50 text-center relative overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-50" />
            <div className="relative">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Content?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our users who are saving time, gaining insights, and building their knowledge library with our AI-powered platform. Warning: Side effects may include actually finishing things you start.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2" onClick={() => router.push("/register")}>
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 py-8">
        <div className="text-center text-muted-foreground">
            © 2025 Metadachi. All rights reserved.
          </div>
      </footer>
    </div>
  )
}
