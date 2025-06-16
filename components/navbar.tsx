'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/auth-context';
import { Github, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="max-w-screen-3xl mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="mt-8 flex flex-col gap-4">
                <Link
                  href="/home"
                  className={`relative px-4 py-2 text-lg font-medium transition-colors ${
                    isActive('/home')
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/summarize"
                  className={`relative px-4 py-2 text-lg font-medium transition-colors ${
                    isActive('/summarize')
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Summarize
                </Link>
                <Link
                  href="/library"
                  className={`relative px-4 py-2 text-lg font-medium transition-colors ${
                    isActive('/library')
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Library
                </Link>
                <Link
                  href="/notebooks"
                  className={`relative px-4 py-2 text-lg font-medium transition-colors ${
                    isActive('/notebooks')
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Notebooks
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              Meta<span className="text-foreground">dachi</span>
            </span>
          </Link>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/home"
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              isActive('/home') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/summarize"
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              isActive('/summarize')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Summarize
          </Link>
          <Link
            href="/library"
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              isActive('/library') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Library
          </Link>
          <Link
            href="/notebooks"
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              isActive('/notebooks')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Notebooks
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <a
              href="https://github.com/phanturne/metadachi"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub Repository</span>
            </a>
          </Button>
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">{user.email || 'Guest User'}</p>
                    {!user.email && (
                      <p className="text-muted-foreground text-xs">Anonymous Account</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!user.email && (
                  <DropdownMenuItem asChild>
                    <Link href="/login">Create Account</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={signOut}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
