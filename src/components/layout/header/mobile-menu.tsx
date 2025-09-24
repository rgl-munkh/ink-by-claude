"use client";

import Link from "next/link";
import { X, User, Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface MobileMenuProps {
  onClose: () => void;
}

export const MobileMenu = ({ onClose }: MobileMenuProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    onClose();
  };

  return (
    <div className="md:hidden bg-white border-t border-gray-200">
      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search artists, styles, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200"
            />
          </div>
        </form>

        {/* Navigation Links */}
        <nav className="space-y-3">
          <Link
            href="/find-artist"
            className="block text-gray-700 hover:text-gray-900 font-medium py-2"
            onClick={onClose}
          >
            Find Artists
          </Link>
          <Link
            href="/tattoos"
            className="block text-gray-700 hover:text-gray-900 font-medium py-2"
            onClick={onClose}
          >
            Explore
          </Link>
          <Link
            href="#"
            className="block text-gray-700 hover:text-gray-900 font-medium py-2"
            onClick={onClose}
          >
            Community
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4 border-t border-gray-200">
          <Button variant="ghost" size="sm" className="flex-1 justify-start">
            <Heart className="h-5 w-5 mr-2" />
            Favorites
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 justify-start">
            <User className="h-5 w-5 mr-2" />
            Profile
          </Button>
        </div>
      </div>
    </div>
  );
};