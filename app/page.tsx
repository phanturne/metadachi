'use client';

import { Marquee } from '@/components/magicui/marquee';
import { SummarizeTool, SummaryResponse } from '@/components/summarize-tool';
import { AnimatedCard } from '@/components/animated-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, FileText, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const reviews = [
  {
    name: 'William Shakespeare',
    username: 'Playwright & Drama Addict',
    body: "By my troth! No more misplaced quill-scratchings about Danish princes. Though it can't cure writing plays about people who won't just talk.",
    img: 'https://avatar.vercel.sh/shakespeare',
  },
  {
    name: 'Sherlock Holmes',
    username: 'Consulting Detective',
    body: 'Elementary! When you eliminate losing your notes, whatever remains must be perfectly catalogued. Watson, fetch my pipe!',
    img: 'https://avatar.vercel.sh/holmes',
  },
  {
    name: 'Bilbo Baggins',
    username: 'Hobbit & Reluctant Adventurer',
    body: "Bless my buttons! No more wandering the Shire for my second breakfast notes. Though it can't explain why adventures interrupt proper meals.",
    img: 'https://avatar.vercel.sh/bilbo',
  },
  {
    name: 'Spock',
    username: 'Vulcan & Eyebrow Expert',
    body: 'Fascinating. Logical efficiency that exceeds human capabilities. Though humans will still create chaos within order. Illogical, yet predictable.',
    img: 'https://avatar.vercel.sh/spock',
  },
  {
    name: 'Albert Einstein',
    username: 'Universe Explainer',
    body: 'Wunderbar! Time is relative, but lost notes are absolutely frustrating. More time for universe contemplation, less searching for calculations.',
    img: 'https://avatar.vercel.sh/einstein',
  },
  {
    name: 'Alexander the Great',
    username: 'Ancient Overachiever',
    body: 'I conquered Macedonia to India but never my scroll chaos! This shows more brilliance than my generals.',
    img: 'https://avatar.vercel.sh/alexander',
  },
  {
    name: 'Leonardo da Vinci',
    username: 'Renaissance Genius',
    body: 'Che cosa! No more scattering inventions like seeds! Though my backwards writing would still confuse any machine.',
    img: 'https://avatar.vercel.sh/davinci',
  },
  {
    name: 'Rhett Butler',
    username: 'Charming Scoundrel',
    body: "Frankly my dear, I don't give a damn about organizing... but this actually makes it effortless. Tomorrow is another day to procrastinate!",
    img: 'https://avatar.vercel.sh/rhett',
  },
  {
    name: 'Detective from 1920s Noir Film',
    username: 'Fictional Gumshoe',
    body: "Listen here, see! This system's the cat's pajamas! No more losing my investigation notes in some speakeasy. Now that's the bee's knees!",
    img: 'https://avatar.vercel.sh/noir',
  },
  {
    name: 'Batman',
    username: 'Dark Knight & Gadget Collector',
    body: "Holy knowledge management, Batman! This could organize the entire Batcave database. Even the Joker couldn't create chaos in this system.",
    img: 'https://avatar.vercel.sh/batman',
  },
  {
    name: 'Doctor Octopus',
    username: 'Mad Scientist & Multi-Tasker',
    body: 'Magnificent! Finally, a system worthy of my genius! Though it still cannot match the organizational prowess of my mechanical spider legs.',
    img: 'https://avatar.vercel.sh/octopus',
  },
  {
    name: 'Dr. Watson',
    username: 'Medical Doctor & Professional Note-Taker',
    body: 'This contraption is most agreeable! No longer shall my detective work be hindered by misplaced evidence. Mrs. Hudson would be most impressed.',
    img: 'https://avatar.vercel.sh/watson',
  },
  {
    name: 'Inigo Montoya',
    username: 'Swordsman & Revenge Seeker',
    body: 'Inconceivable! A system so organized, it makes my plots look simple. Though nothing can organize the chaos of true love and revenge.',
    img: 'https://avatar.vercel.sh/inigo',
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        'relative h-full w-56 cursor-pointer overflow-hidden rounded-xl border p-3 sm:w-64 sm:p-4',
        // light styles
        'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
        // dark styles
        'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]'
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <Image className="rounded-full" width={28} height={28} alt={`${name}'s avatar`} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-xs font-medium sm:text-sm dark:text-white">{name}</figcaption>
          <p className="text-[10px] font-medium sm:text-xs dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-xs sm:text-sm">{body}</blockquote>
    </figure>
  );
};

export default function Home() {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const handleSummaryGenerated = (newSummary: SummaryResponse) => {
    localStorage.setItem('pendingSummary', JSON.stringify(newSummary));
    setIsNavigating(true);
    router.push('/summarize');
  };

  if (isNavigating) {
    return null;
  }

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-b">
      {/* Progress Bar */}
      <motion.div
        className="bg-primary fixed top-0 right-0 left-0 z-50 h-1 origin-left"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Static background elements */}
        <div className="absolute inset-0">
          <div className="bg-primary/10 absolute top-1/4 -left-4 h-72 w-72 rounded-full blur-3xl" />
          <div className="bg-primary/5 absolute top-1/2 left-1/4 h-48 w-48 rounded-full blur-2xl" />
        </div>

        <div className="relative container mx-auto max-w-7xl px-4 py-12 sm:py-16 md:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <div className="border-primary/20 bg-primary/5 text-primary mb-4 inline-flex items-center rounded-full border px-3 py-1 text-sm">
                <span className="bg-primary mr-2 flex h-2 w-2 rounded-full" />
                AI-Powered Knowledge Management
              </div>
              <h1 className="from-primary to-primary/60 mb-4 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-3xl md:text-4xl lg:text-5xl">
                Never Forget What You Never Read
              </h1>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed sm:text-base md:text-lg lg:text-xl">
                Stop pretending you read that whole thing. Let AI give you the good parts so you can
                sound smart at meetings, impress your boss, and finally win that argument with your
                know-it-all coworker.
              </p>
              <p className="text-muted-foreground mb-6 text-base leading-relaxed italic sm:mb-8 sm:text-lg md:text-xl">
                Life&apos;s too short to read everything, but too long to sound stupid.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="gap-2" onClick={() => router.push('/register')}>
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="from-primary/20 via-primary/15 to-primary/20 absolute -inset-2 rounded-2xl bg-gradient-to-r blur-xl" />
              <div className="from-primary/10 to-primary/15 absolute -inset-2 rounded-2xl bg-gradient-to-b via-transparent blur-xl" />
              <div className="from-primary/15 via-primary/15 to-primary/20 absolute -inset-2 rounded-2xl bg-gradient-to-tr blur-2xl" />
              <div className="relative">
                <SummarizeTool onSummaryGenerated={handleSummaryGenerated} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features & Use Cases Section */}
      <div className="relative">
        <div className="from-background via-background to-muted/20 absolute inset-0 bg-gradient-to-b" />
        <div className="relative container mx-auto max-w-7xl px-4 py-12 sm:py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              Everything You Need to Manage Knowledge
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg md:text-xl">
              Powerful features to help you extract, organize, and leverage insights from your
              content (like a productivity guru, but with fewer crystals)
            </p>
          </motion.div>

          <div className="grid gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            <AnimatedCard animation="fadeUp" delay={0}>
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-card border-border/50 rounded-xl border p-6 transition-shadow hover:shadow-lg"
              >
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <FileText className="text-primary h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Quick Understanding</h3>
                <p className="text-muted-foreground">
                  Skip to the good parts without admitting you didn&apos;t read the whole thing.
                  We&apos;re basically CliffsNotes for your ADHD brain.
                </p>
              </motion.div>
            </AnimatedCard>

            <AnimatedCard animation="fadeUp" delay={100}>
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-card border-border/50 rounded-xl border p-6 transition-shadow hover:shadow-lg"
              >
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Brain className="text-primary h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Knowledge Retention</h3>
                <p className="text-muted-foreground">
                  Save insights before they disappear into the void with your car keys and your will
                  to live on Monday mornings.
                </p>
              </motion.div>
            </AnimatedCard>

            <AnimatedCard animation="fadeUp" delay={200}>
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-card border-border/50 rounded-xl border p-6 transition-shadow hover:shadow-lg"
              >
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Sparkles className="text-primary h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Interactive Learning</h3>
                <p className="text-muted-foreground">
                  Chat with AI that actually remembers what you fed it (unlike your goldfish, your
                  ex, or your brain after 3 PM on Friday).
                </p>
              </motion.div>
            </AnimatedCard>

            <AnimatedCard animation="fadeUp" delay={300}>
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-card border-border/50 rounded-xl border p-6 transition-shadow hover:shadow-lg"
              >
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Research Organization</h3>
                <p className="text-muted-foreground">
                  Turn your digital hoarding habit into organized genius. Like having a personal
                  assistant for your brain, but better.
                </p>
              </motion.div>
            </AnimatedCard>
          </div>
        </div>
      </div>

      {/* Before/After Section with Common Excuses */}
      <div className="relative overflow-hidden">
        <div className="from-muted/30 to-background absolute inset-0 bg-gradient-to-b" />
        <div className="relative container mx-auto max-w-7xl px-4 py-12 sm:py-16 md:py-20">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Protagonist Energy Only</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg md:text-xl">
              Stop being the villain in your own productivity story and start winning
            </p>
          </div>

          <div className="grid gap-4 sm:gap-8 md:grid-cols-2">
            <AnimatedCard animation="slideLeft" delay={0}>
              <div className="bg-card border-border/50 rounded-xl border p-6 transition-all hover:shadow-lg">
                <h3 className="mb-4 text-xl font-semibold text-red-500">
                  The Chaos Days (Before Metadachi)
                </h3>
                <ul className="text-muted-foreground space-y-3">
                  <li>• &ldquo;127 tabs open. My CPU is crying and filing for divorce.&rdquo;</li>
                  <li>
                    • &ldquo;My bookmarks hierarchy has more levels than a pyramid scheme.&rdquo;
                  </li>
                  <li>
                    • &ldquo;Saving links like a digital doomsday prepper hoarding canned
                    beans.&rdquo;
                  </li>
                  <li>
                    • &ldquo;Searching my notes: &apos;Did drunk me save this as &apos;Important
                    Thing #47&apos;?&apos;&rdquo;
                  </li>
                  <li>
                    • &ldquo;My brain&apos;s filing system was designed by a drunk intern.&rdquo;
                  </li>
                </ul>
              </div>
            </AnimatedCard>

            <AnimatedCard animation="slideRight" delay={100}>
              <div className="bg-card border-border/50 rounded-xl border p-6 transition-all hover:shadow-lg">
                <h3 className="mb-4 text-xl font-semibold text-green-500">
                  The Mastery Era (After Metadachi)
                </h3>
                <ul className="text-muted-foreground space-y-3">
                  <li>
                    • &ldquo;Finding stuff so fast, my FBI agent thinks I&apos;m using cheat
                    codes.&rdquo;
                  </li>
                  <li>
                    • &ldquo;My brain is now Google but without the sketchy privacy policy.&rdquo;
                  </li>
                  <li>
                    • &ldquo;Went from digital trash panda to knowledge ninja overnight.&rdquo;
                  </li>
                  <li>
                    • &ldquo;My thoughts are so organized, even my therapist is impressed.&rdquo;
                  </li>
                  <li>
                    • &ldquo;People think I&apos;m smart now. I just stopped losing my own
                    thoughts.&rdquo;
                  </li>
                </ul>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative">
        <div className="from-background via-background to-muted/20 absolute inset-0 bg-gradient-to-b" />
        <div className="relative container mx-auto max-w-7xl px-4 py-12 sm:py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              What History&apos;s Greatest Minds Would Say About Metadachi
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg md:text-xl">
              Time travelers, literary legends, and geniuses throughout history weigh in on our AI
              knowledge management tool
            </p>
          </motion.div>

          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            <Marquee pauseOnHover className="[--duration:40s]">
              {firstRow.map(review => (
                <div key={review.username} className="mx-1 sm:mx-2">
                  <ReviewCard {...review} />
                </div>
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:40s]">
              {secondRow.map(review => (
                <div key={review.username} className="mx-1 sm:mx-2">
                  <ReviewCard {...review} />
                </div>
              ))}
            </Marquee>
            <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
            <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative overflow-hidden">
        <div className="from-muted/30 to-background absolute inset-0 bg-gradient-to-b" />
        <div className="relative container mx-auto max-w-7xl px-4 py-12 sm:py-16 md:py-20">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              FAQ (Frequently Avoided Questions)
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg md:text-xl">
              Questions you were too afraid to ask, answered with brutal honesty and zero corporate
              BS
            </p>
          </div>

          <div className="grid gap-4 sm:gap-8 md:grid-cols-2">
            <AnimatedCard animation="scale" delay={0}>
              <div className="bg-card border-border/50 h-full rounded-xl border p-6 transition-all hover:shadow-lg">
                <h3 className="mb-3 text-xl font-semibold">Will this make me smarter?</h3>
                <p className="text-muted-foreground">
                  No, but it will make you look smarter, which is honestly more valuable in most
                  situations. We&apos;re in the business of strategic intelligence theater.
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard animation="scale" delay={100}>
              <div className="bg-card border-border/50 h-full rounded-xl border p-6 transition-all hover:shadow-lg">
                <h3 className="mb-3 text-xl font-semibold">
                  Will it organize my existing digital disaster zone?
                </h3>
                <p className="text-muted-foreground">
                  We&apos;re good, but we&apos;re not miracle workers with magic wands. You&apos;ll
                  need to put in some effort. Think of us as your organizing fairy godmother, but
                  you still have to show up to the ball.
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard animation="scale" delay={200}>
              <div className="bg-card border-border/50 h-full rounded-xl border p-6 transition-all hover:shadow-lg">
                <h3 className="mb-3 text-xl font-semibold">
                  Is it really worth the effort, or is this just another productivity trap?
                </h3>
                <p className="text-muted-foreground">
                  Well, do you enjoy spending 3 hours looking for that one brilliant article you
                  saved last month while questioning your life choices? Didn&apos;t think so.
                  We&apos;re basically therapy for your digital hoarding problem.
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard animation="scale" delay={300}>
              <div className="bg-card border-border/50 h-full rounded-xl border p-6 transition-all hover:shadow-lg">
                <h3 className="mb-3 text-xl font-semibold">
                  How does this magical knowledge wizardry actually work?
                </h3>
                <p className="text-muted-foreground">
                  Upload your content, let our AI analyze it like a caffeinated research assistant,
                  and get instant insights. It&apos;s like having a personal librarian who actually
                  remembers where they put things and never judges your 3 AM research binges.
                </p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="from-muted/30 to-background absolute inset-0 bg-gradient-to-b" />
        <div className="relative container mx-auto max-w-7xl px-4 py-12 sm:py-16 md:py-20">
          <div className="bg-card border-border/50 relative overflow-hidden rounded-2xl border p-6 text-center transition-all hover:shadow-lg sm:p-12">
            <div className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-r to-transparent opacity-50" />
            <div className="relative">
              <h2 className="mb-6 text-2xl font-bold sm:text-3xl md:text-4xl">
                Ready to Transform Your Content Chaos?
              </h2>
              <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-base sm:text-lg md:text-xl">
                Join our users who are saving time, gaining insights, and building their knowledge
                library with our AI-powered platform. Warning: Side effects may include actually
                finishing things you start.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" className="gap-2" onClick={() => router.push('/register')}>
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 py-8">
        <div className="text-muted-foreground text-center">
          © 2025 Metadachi. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
