'use client';

import { useState, useEffect } from 'react';
import type { FileRow } from '@/supabase/queries/file';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, File, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { useChatStore } from '@/store/chatStore';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const FilePicker = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  const { selectedFiles, setSelectedFiles } = useChatStore();
  const {
    data: files,
    error,
    isLoading,
  } = useSWR<FileRow[]>('/api/files', fetcher);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileSelect = (file: FileRow) => {
    const updatedFiles = selectedFiles.includes(file.id)
      ? selectedFiles.filter((id) => id !== file.id)
      : [...selectedFiles, file.id];

    setSelectedFiles(updatedFiles);
  };

  if (!mounted) return null;

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden ">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-primary">
            Select Files
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full px-6 pb-6">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full text-red-500">
              Error loading files
            </div>
          )}
          {!files?.length && !isLoading && !error && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No files found
            </div>
          )}
          <AnimatePresence>
            {files?.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start h-auto py-3 px-4 mb-2 rounded-lg transition-all duration-200 ease-in-out ${
                    selectedFiles.includes(file.id)
                      ? 'bg-primary/10 dark:bg-primary/20 shadow-md'
                      : 'hover:bg-primary/5 dark:hover:bg-primary/10'
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="flex items-center w-full">
                    <div
                      className={`p-2 rounded-md mr-3 ${
                        selectedFiles.includes(file.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <File className="w-5 h-5" />
                    </div>
                    <span className="truncate flex-grow text-left font-medium">
                      {file.name}
                    </span>
                    <AnimatePresence>
                      {selectedFiles.includes(file.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className="w-5 h-5 text-primary ml-2 flex-shrink-0" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FilePicker;
