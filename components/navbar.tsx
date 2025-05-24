"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { Home, Library, Menu, Scroll, User } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-xl mx-auto px-6 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/home" className="text-lg font-medium transition-colors hover:text-primary flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                <Link href="/summarize" className="text-lg font-medium transition-colors hover:text-primary flex items-center gap-2">
                  <Scroll className="h-5 w-5" />
                  Summarize
                </Link>
                <Link href="/library" className="text-lg font-medium transition-colors hover:text-primary flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  Library
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Meta<span className="text-foreground">dachi</span>
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/home" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link href="/summarize" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2">
            <Scroll className="h-4 w-4" />
            Summarize
          </Link>
          <Link href="/library" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2">
            <Library className="h-4 w-4" />
            Library
          </Link>
        </nav>
        <div className="flex items-center gap-2">
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
                    <p className="text-sm font-medium leading-none">
                      {user.email || "Guest User"}
                    </p>
                    {!user.email && (
                      <p className="text-xs text-muted-foreground">
                        Anonymous Account
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!user.email && (
                  <DropdownMenuItem asChild>
                    <Link href="/login">Create Account</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={signOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 