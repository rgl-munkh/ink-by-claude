"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Calendar, ArrowRight } from "lucide-react";
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

export function ArtistCard() {
  const [featuredArtist] = useState<Artist>({
    id: "1",
    name: "Alex Rivera",
    location: "Downtown Studio, NYC",
    rating: 4.9,
    reviewCount: 127,
    specialties: ["Japanese Traditional", "Geometric", "Black & Grey"],
    hourlyRate: 150,
    availableSlots: 5,
    portfolio: [
      "/api/placeholder/300/300",
      "/api/placeholder/300/300",
      "/api/placeholder/300/300"
    ]
  });

  return (
    <div className="px-4 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Featured Artist</h2>
        <Link href="/find-artist">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Portfolio Images */}
            <div className="md:w-1/3 bg-gray-100">
              <div className="grid grid-cols-3 md:grid-cols-1 h-48 md:h-full">
                {featuredArtist.portfolio.map((image, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 flex items-center justify-center text-sm text-gray-500"
                  >
                    Portfolio {index + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Artist Info */}
            <div className="flex-1 p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg">
                    {featuredArtist.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {featuredArtist.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{featuredArtist.rating}</span>
                      <span>({featuredArtist.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{featuredArtist.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredArtist.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-gray-600 text-sm">Starting at </span>
                  <span className="text-xl font-bold text-gray-900">
                    ${featuredArtist.hourlyRate}/hr
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Calendar className="w-4 h-4" />
                  <span>{featuredArtist.availableSlots} slots available</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href={`/artist/${featuredArtist.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Portfolio
                  </Button>
                </Link>
                <Link href={`/artist/${featuredArtist.id}/direct-book`} className="flex-1">
                  <Button className="w-full">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}