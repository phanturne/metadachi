import { motion } from 'framer-motion';
import { MessageIcon } from './icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-8 flex flex-col gap-8 leading-relaxed text-center max-w-xl mx-auto backdrop-blur-sm bg-gradient-to-b from-background/80 to-background/40 border border-muted/30 shadow-lg">
        <motion.p
          className="flex flex-row justify-center gap-4 items-center"
          animate={{
            scale: [1, 1.02, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        >
          <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
            <MessageIcon size={32} />
          </div>
        </motion.p>
        <div className="space-y-4">
          <p className="text-2xl font-medium tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome! I&apos;m your AI assistant.
          </p>
          <p className="text-lg font-light text-muted-foreground">
            How can I help you today?
          </p>
        </div>
      </div>
    </motion.div>
  );
};
