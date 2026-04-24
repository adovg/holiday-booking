"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkAuth, signOut as signOutAuth, supabaseClient } from "@/lib/auth-client";
import type { Subscription } from '@supabase/supabase-js';

interface NavLink {
  href: string;
  label: string;
}

interface NavbarProps {
  navLinks?: NavLink[];
  logo?: React.ReactNode;
}

export default function Navbar({
  navLinks = [
    { href: "/", label: "Home" },
    { href: "/calendar", label: "Calendar" },
  ],
  logo = <span className="text-xl font-bold">Holiday</span>,
}: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await checkAuth();
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const authSub: any = supabaseClient.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      (authSub as any).unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutAuth();
      setUser(null);
      router.refresh();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-50">
      <div className="mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            {logo}
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium">
                {link.label}
              </Link>
            ))}

            {loading ? (
              <span className="text-zinc-400">Загрузка...</span>
            ) : user ? (
              <>
                  <button onClick={handleSignOut} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors font-medium">
                  Выход
                  </button>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400 ml-2">{user.email}</span>
              </>
            ) : (
                  <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium">
                    Вход
                  </Link>
            )}
          </div>

          <button className="md:hidden text-zinc-600 dark:text-zinc-300 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            <svg className={`w-6 h-6 ${isMenuOpen ? "hidden" : "block"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg className={`w-6 h-6 ${isMenuOpen ? "block" : "hidden"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-4 shadow-lg">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}

              {loading ? (
                <span className="text-zinc-400 py-2">Загрузка...</span>
              ) : user ? (
                <>
                    <button onClick={handleSignOut} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors font-medium py-2">
                    Выход
                    </button>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 py-2">{user.email}</span>
                </>
              ) : (
                    <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium py-2">
                      Вход
                    </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
