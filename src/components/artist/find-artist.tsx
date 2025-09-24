"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Star, Filter, Calendar } from "lucide-react";
import Link from "next/link";

interface Artist {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  hourlyRate: number;
  availableSlots: number;
  portfolio: string[];
}

export function FindArtist() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  // Mock data
  const artists: Artist[] = [
    {
      id: "1",
      name: "Alex Rivera",
      location: "Downtown Studio, NYC",
      rating: 4.9,
      reviewCount: 127,
      specialties: ["Japanese Traditional", "Geometric", "Black & Grey"],
      hourlyRate: 150,
      availableSlots: 5,
      portfolio: ["/api/placeholder/300/300", "/api/placeholder/300/300", "/api/placeholder/300/300"]
    },
    {
      id: "2",
      name: "Maya Chen",
      location: "Brooklyn Heights, NYC",
      rating: 4.8,
      reviewCount: 89,
      specialties: ["Watercolor", "Floral", "Fine Line"],
      hourlyRate: 120,
      availableSlots: 3,
      portfolio: ["/api/placeholder/300/300", "/api/placeholder/300/300", "/api/placeholder/300/300"]
    },
    {
      id: "3",
      name: "Marcus Johnson",
      location: "East Village, NYC",
      rating: 4.7,
      reviewCount: 156,
      specialties: ["Traditional", "Neo Traditional", "Color Realism"],
      hourlyRate: 180,
      availableSlots: 8,
      portfolio: ["/api/placeholder/300/300", "/api/placeholder/300/300", "/api/placeholder/300/300"]
    }
  ];

  const locations = ["All Locations", "Downtown Studio, NYC", "Brooklyn Heights, NYC", "East Village, NYC"];
  const styles = ["All Styles", "Japanese Traditional", "Geometric", "Black & Grey", "Watercolor", "Floral", "Fine Line", "Traditional", "Neo Traditional", "Color Realism"];

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = !locationFilter || locationFilter === "All Locations" || artist.location === locationFilter;
    const matchesStyle = !styleFilter || styleFilter === "All Styles" || artist.specialties.includes(styleFilter);

    return matchesSearch && matchesLocation && matchesStyle;
  });

  const sortedArtists = [...filteredArtists].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "price-low":
        return a.hourlyRate - b.hourlyRate;
      case "price-high":
        return b.hourlyRate - a.hourlyRate;
      case "availability":
        return b.availableSlots - a.availableSlots;
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Tattoo Artist</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover talented artists, explore their portfolios, and book your next tattoo session with confidence.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search artists or styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Location Filter */}
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Style Filter */}
              <Select value={styleFilter} onValueChange={setStyleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tattoo Style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
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
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="availability">Most Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {sortedArtists.length} Artist{sortedArtists.length !== 1 ? 's' : ''} Found
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            Showing filtered results
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedArtists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Artist Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{artist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{artist.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{artist.rating}</span>
                            <span>({artist.reviewCount} reviews)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{artist.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {artist.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Starting at </span>
                        <span className="text-lg font-bold text-gray-900">${artist.hourlyRate}/hr</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <Calendar className="w-4 h-4" />
                        <span>{artist.availableSlots} slots available</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link href={`/artist/${artist.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Portfolio
                        </Button>
                      </Link>
                      <Link href={`/artist/${artist.id}/direct-book`} className="flex-1">
                        <Button className="w-full">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Portfolio Preview */}
                  <div className="w-32 bg-gray-100">
                    <div className="grid grid-cols-1 h-full">
                      {artist.portfolio.slice(0, 3).map((piece, index) => (
                        <div key={index} className="aspect-square bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          Portfolio {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}