'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Artist {
  id: string;
  name: string;
  bio: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  hourlyRate: number;
  portfolioCount: number;
  featuredImage: string;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  const allSpecialties = [
    'Japanese Traditional',
    'Geometric',
    'Black & Grey',
    'Neo Traditional',
    'Realism',
    'Watercolor',
    'Minimalist',
    'Tribal',
    'American Traditional',
    'Portrait'
  ];

  useEffect(() => {
    fetchArtists();
  }, []);

  const filterArtists = useCallback(() => {
    let filtered = artists;

    // Filter by search query (name or bio)
    if (searchQuery.trim()) {
      filtered = filtered.filter(artist =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(artist =>
        artist.specialties.includes(selectedSpecialty)
      );
    }

    setFilteredArtists(filtered);
  }, [artists, searchQuery, selectedSpecialty]);

  useEffect(() => {
    filterArtists();
  }, [filterArtists]);

  const fetchArtists = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockArtists: Artist[] = [
        {
          id: 'artist-1',
          name: 'Alex Rivera',
          bio: 'Passionate tattoo artist specializing in traditional Japanese art and modern geometric designs.',
          location: 'Downtown Studio, NYC',
          rating: 4.9,
          reviewCount: 127,
          specialties: ['Japanese Traditional', 'Geometric', 'Black & Grey'],
          hourlyRate: 150,
          portfolioCount: 24,
          featuredImage: '/api/placeholder/300/300',
        },
        {
          id: 'artist-2',
          name: 'Maya Chen',
          bio: 'Award-winning artist known for intricate watercolor and neo-traditional pieces.',
          location: 'East Village, NYC',
          rating: 4.8,
          reviewCount: 89,
          specialties: ['Watercolor', 'Neo Traditional', 'Floral'],
          hourlyRate: 180,
          portfolioCount: 31,
          featuredImage: '/api/placeholder/300/300',
        },
        {
          id: 'artist-3',
          name: 'Jake Morrison',
          bio: 'Bold American traditional tattoos with a modern twist. 12 years of experience.',
          location: 'Brooklyn, NYC',
          rating: 4.7,
          reviewCount: 156,
          specialties: ['American Traditional', 'Neo Traditional', 'Bold Lines'],
          hourlyRate: 120,
          portfolioCount: 18,
          featuredImage: '/api/placeholder/300/300',
        },
        {
          id: 'artist-4',
          name: 'Sophie Davis',
          bio: 'Delicate minimalist designs and fine line work. Perfect for first-time clients.',
          location: 'Manhattan, NYC',
          rating: 4.9,
          reviewCount: 203,
          specialties: ['Minimalist', 'Fine Line', 'Script'],
          hourlyRate: 140,
          portfolioCount: 42,
          featuredImage: '/api/placeholder/300/300',
        },
        {
          id: 'artist-5',
          name: 'Carlos Mendez',
          bio: 'Photorealistic portraits and black & grey masterpieces. Featured in Inked Magazine.',
          location: 'Queens, NYC',
          rating: 4.8,
          reviewCount: 174,
          specialties: ['Realism', 'Portrait', 'Black & Grey'],
          hourlyRate: 200,
          portfolioCount: 27,
          featuredImage: '/api/placeholder/300/300',
        },
        {
          id: 'artist-6',
          name: 'Luna Thompson',
          bio: 'Vibrant geometric patterns and sacred geometry. Unique and spiritual designs.',
          location: 'Williamsburg, NYC',
          rating: 4.6,
          reviewCount: 95,
          specialties: ['Geometric', 'Sacred Geometry', 'Color Work'],
          hourlyRate: 160,
          portfolioCount: 33,
          featuredImage: '/api/placeholder/300/300',
        }
      ];

      setArtists(mockArtists);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading artists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Perfect Artist</h1>
            <p className="text-xl text-gray-600">Discover talented tattoo artists and book your next piece</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name, style, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                <option value="">All Styles</option>
                {allSpecialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredArtists.length} of {artists.length} artists
            </p>
          </div>
        </div>
      </div>

      {/* Artists Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredArtists.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <Link key={artist.id} href={`/artist/${artist.id}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-0">
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600 group-hover:scale-105 transition-transform">
                        Featured Work
                      </div>
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{artist.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{artist.rating}</span>
                            <span className="text-sm text-gray-500">({artist.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${artist.hourlyRate}/hr</div>
                        <div className="text-sm text-gray-500">starting</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2 mb-3">
                      {artist.bio}
                    </CardDescription>

                    <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{artist.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {artist.specialties.slice(0, 3).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {artist.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{artist.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {artist.portfolioCount} portfolio pieces
                      </span>
                      <Button size="sm" className="group-hover:bg-gray-800">
                        View Portfolio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}