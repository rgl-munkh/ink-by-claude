"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Heart, Share, Grid, List } from "lucide-react";
import Link from "next/link";

interface TattooDesign {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  style: string[];
  imageUrl: string;
  likes: number;
  isLiked: boolean;
  size: string;
  placement: string;
  description: string;
}

export function TattoosExplore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [placementFilter, setPlacementFilter] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [designs, setDesigns] = useState<TattooDesign[]>([
    {
      id: "1",
      title: "Dragon Sleeve Design",
      artist: "Alex Rivera",
      artistId: "1",
      style: ["Japanese", "Traditional"],
      imageUrl: "/api/placeholder/300/400",
      likes: 234,
      isLiked: false,
      size: "Large",
      placement: "Arm",
      description: "A powerful Japanese dragon sleeve featuring traditional elements and bold linework."
    },
    {
      id: "2",
      title: "Geometric Mandala",
      artist: "Maya Chen",
      artistId: "2",
      style: ["Geometric", "Dotwork"],
      imageUrl: "/api/placeholder/300/400",
      likes: 156,
      isLiked: true,
      size: "Medium",
      placement: "Back",
      description: "Intricate geometric mandala with precise dotwork and symmetrical patterns."
    },
    {
      id: "3",
      title: "Watercolor Rose",
      artist: "Sofia Martinez",
      artistId: "3",
      style: ["Watercolor", "Floral"],
      imageUrl: "/api/placeholder/300/400",
      likes: 89,
      isLiked: false,
      size: "Small",
      placement: "Wrist",
      description: "Delicate watercolor rose with flowing color transitions and soft edges."
    },
    {
      id: "4",
      title: "Realistic Portrait",
      artist: "Marcus Johnson",
      artistId: "4",
      style: ["Realism", "Portrait"],
      imageUrl: "/api/placeholder/300/400",
      likes: 312,
      isLiked: false,
      size: "Large",
      placement: "Chest",
      description: "Photo-realistic portrait with incredible detail and shading techniques."
    },
    {
      id: "5",
      title: "Minimalist Line Art",
      artist: "Emma Wilson",
      artistId: "5",
      style: ["Minimalist", "Line Art"],
      imageUrl: "/api/placeholder/300/400",
      likes: 178,
      isLiked: true,
      size: "Small",
      placement: "Ankle",
      description: "Clean minimalist design with simple lines and subtle beauty."
    },
    {
      id: "6",
      title: "Neo Traditional Tiger",
      artist: "David Kim",
      artistId: "6",
      style: ["Neo Traditional", "Animal"],
      imageUrl: "/api/placeholder/300/400",
      likes: 267,
      isLiked: false,
      size: "Large",
      placement: "Thigh",
      description: "Bold neo traditional tiger with vibrant colors and modern styling."
    }
  ]);

  const styles = ["All Styles", "Japanese", "Traditional", "Geometric", "Watercolor", "Realism", "Minimalist", "Neo Traditional"];
  const sizes = ["All Sizes", "Small", "Medium", "Large"];
  const placements = ["All Placements", "Arm", "Back", "Chest", "Wrist", "Ankle", "Thigh"];

  const toggleLike = (designId: string) => {
    setDesigns(prev => prev.map(design =>
      design.id === designId
        ? {
            ...design,
            isLiked: !design.isLiked,
            likes: design.isLiked ? design.likes - 1 : design.likes + 1
          }
        : design
    ));
  };

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.style.some(style => style.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStyle = !styleFilter || styleFilter === "All Styles" || design.style.includes(styleFilter);
    const matchesSize = !sizeFilter || sizeFilter === "All Sizes" || design.size === sizeFilter;
    const matchesPlacement = !placementFilter || placementFilter === "All Placements" || design.placement === placementFilter;

    return matchesSearch && matchesStyle && matchesSize && matchesPlacement;
  });

  const sortedDesigns = [...filteredDesigns].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.likes - a.likes;
      case "newest":
        return parseInt(b.id) - parseInt(a.id);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Tattoo Designs</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse thousands of tattoo designs from talented artists worldwide
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search designs, artists, or styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Style Filter */}
              <Select value={styleFilter} onValueChange={setStyleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Size Filter */}
              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="title">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="w-4 h-4" />
                {sortedDesigns.length} designs found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedDesigns.map((design) => (
              <Card key={design.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="aspect-[3/4] bg-gray-200 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600 group-hover:scale-105 transition-transform">
                        {design.title}
                      </div>
                    </div>

                    {/* Overlay Actions */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                        onClick={() => toggleLike(design.id)}
                      >
                        <Heart
                          className={`h-4 w-4 ${design.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      >
                        <Share className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <div className="text-white">
                        <div className="flex items-center gap-1 text-xs">
                          <Heart className="w-3 h-3" />
                          <span>{design.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{design.title}</h3>
                    <Link
                      href={`/artist/${design.artistId}`}
                      className="text-sm text-gray-600 hover:text-gray-900 mb-2 block"
                    >
                      by {design.artist}
                    </Link>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {design.style.slice(0, 2).map((style) => (
                        <Badge key={style} variant="outline" className="text-xs">
                          {style}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{design.size}</span>
                      <span>{design.placement}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDesigns.map((design) => (
              <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-48 bg-gray-200 flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600">
                        {design.title}
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{design.title}</h3>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleLike(design.id)}
                          >
                            <Heart
                              className={`h-4 w-4 ${design.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                            />
                            <span className="ml-1">{design.likes}</span>
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Link
                        href={`/artist/${design.artistId}`}
                        className="text-gray-600 hover:text-gray-900 mb-3 block"
                      >
                        by {design.artist}
                      </Link>

                      <p className="text-gray-700 mb-4">{design.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {design.style.map((style) => (
                            <Badge key={style} variant="secondary">
                              {style}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>{design.size}</span>
                          <span>{design.placement}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {sortedDesigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No designs found</h3>
            <p className="text-gray-600">Try adjusting your search filters to find more designs.</p>
          </div>
        )}
      </div>
    </div>
  );
}