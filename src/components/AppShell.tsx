"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface NavItem {
  slug: string;
  title: string;
  category: string;
}

interface TagItem {
  tag: string;
  count: number;
}

interface Props {
  children: React.ReactNode;
  navItems: NavItem[];
  tags: TagItem[];
}

export default function AppShell({ children, navItems, tags }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isNotePage = pathname.startsWith("/notes/");

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          navItems={navItems}
          tags={tags}
          onClose={closeSidebar}
          className="fixed left-0 top-0 z-40 h-dvh w-[280px]"
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeSidebar}
          />
          <Sidebar
            navItems={navItems}
            tags={tags}
            onClose={closeSidebar}
            className="fixed left-0 top-0 z-50 h-dvh w-[300px] lg:hidden"
          />
        </>
      )}

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-[280px]">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2 glass-heavy lg:hidden">
          <button
            onClick={toggleSidebar}
            className="tap rounded-lg p-1 text-[var(--text-variant)] hover:text-[var(--text)]"
            aria-label="Toggle sidebar"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link
            href="/"
            className="font-sans text-lg font-semibold tracking-tight text-[var(--text)] hover:no-underline"
          >
            Sanctuary
          </Link>
          <Link
            href="/search/"
            className="tap rounded-lg p-1 text-[var(--text-variant)] hover:text-[var(--text)] hover:no-underline"
            aria-label="Search"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
        </header>

        {/* Page content */}
        <main className="min-w-0 flex-1 overflow-x-hidden">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <BottomNav className="lg:hidden" />
      </div>
    </div>
  );
}
