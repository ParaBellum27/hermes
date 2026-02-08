"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks";
import { Pencil, User as UserIcon, Users, LogOut, Download, BookOpen, NotebookPen } from "lucide-react";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, supabase } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleSignIn() {
    router.push("/login");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    // Hard redirect to ensure server-side auth sync with middleware
    window.location.href = "/login";
  }

  // Don't render navbar on login page
  if (pathname === '/login') {
    return null;
  }

  const navItems = [
    { path: '/dashboard/create', label: 'Create', icon: Pencil },
    { path: '/dashboard/notebook', label: 'Notebook', icon: NotebookPen },
    { path: '/dashboard/creators', label: 'Creators', icon: Users },
    { path: '/dashboard/content', label: 'Content', icon: Download },
    { path: '/dashboard/personal-info', label: 'Profile', icon: UserIcon },
    { path: '/dashboard/documentation', label: 'Docs', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="px-6 py-3 flex items-center justify-between relative">
        {/* Left: brand */}
        <div
          onClick={() => router.push('/dashboard/create')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <Image
            src="/logo.png"
            alt="Muse logo"
            width={40}
            height={40}
            className="shrink-0 transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Center: Nav tabs */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110 text-blue-500' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center space-x-3">
          {!isLoading && (
            user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative w-9 h-9 rounded-xl bg-gray-900 text-white text-sm font-semibold flex items-center justify-center transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105"
                >
                  {user.email?.[0].toUpperCase() || 'U'}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-medium text-gray-700 truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all duration-300 cursor-pointer"
              >
                Sign in
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
