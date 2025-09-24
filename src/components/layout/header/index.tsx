"use client";

import Link from "next/link";
import { Menu, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MobileMenu } from "./mobile-menu";
import { SearchBar } from "./search-bar";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Ink By</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/find-artist"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Find Artists
            </Link>
            <Link
              href="/tattoos"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Explore
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Community
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Favorites */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Profile */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <User className="h-5 w-5" />
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && <MobileMenu onClose={toggleMenu} />}
    </header>
  );
};