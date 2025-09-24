"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Phone, Mail, Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TattooistProfileProps {
  tattooistName: string;
}

interface Portfolio {
  id: string;
  imageUrl: string;
  description: string;
  styleTags: string[];
}

interface Tattooist {
  id: string;
  name: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  rating: number;
  reviewCount: number;
  portfolios: Portfolio[];
  specialties: string[];
  experience: string;
  hourlyRate: number;
  availableSlots: number;
}

export function TattooistProfile({ tattooistName }: TattooistProfileProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Mock tattooist data - in real app, fetch based on tattooistName
  const tattooist: Tattooist = {
    id: "1",
    name: tattooistName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    bio: "Passionate tattoo artist specializing in traditional Japanese art and modern geometric designs. With over 8 years of experience, I bring your vision to life with precision and creativity.",
    email: "contact@studio.com",
    phone: "+1-555-0123",
    location: "Downtown Studio, NYC",
    rating: 4.9,
    reviewCount: 127,
    specialties: ["Japanese Traditional", "Geometric", "Black & Grey", "Neo Traditional"],
    experience: "8+ years",
    hourlyRate: 150,
    availableSlots: 5,
    portfolios: [
      {
        id: "1",
        imageUrl: "/api/placeholder/400/400",
        description: "Traditional Japanese dragon sleeve",
        styleTags: ["Japanese", "Traditional", "Dragon"]
      },
      {
        id: "2",
        imageUrl: "/api/placeholder/400/400",
        description: "Geometric mandala design",
        styleTags: ["Geometric", "Mandala", "Black & Grey"]
      },
      {
        id: "3",
        imageUrl: "/api/placeholder/400/400",
        description: "Neo-traditional rose",
        styleTags: ["Neo Traditional", "Floral", "Color"]
      },
      {
        id: "4",
        imageUrl: "/api/placeholder/400/400",
        description: "Japanese koi fish",
        styleTags: ["Japanese", "Koi", "Water"]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/find-artist">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Artists
              </Button>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-xl">
                  {tattooist.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{tattooist.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{tattooist.rating}</span>
                    <span>({tattooist.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{tattooist.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{tattooist.experience}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/artist/${tattooist.id}/direct-book`}>
                <Button size="lg" className="bg-black hover:bg-gray-800">
                  Book Appointment
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>About {tattooist.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">{tattooist.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {tattooist.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Recent work and featured pieces</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tattooist.portfolios.map((piece) => (
                    <div
                      key={piece.id}
                      className="group cursor-pointer"
                      onClick={() => setSelectedImage(piece.imageUrl)}
                    >
                      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3">
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600 group-hover:scale-105 transition-transform">
                          Portfolio Image {piece.id}
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{piece.description}</h4>
                      <div className="flex flex-wrap gap-1">
                        {piece.styleTags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book a Session</CardTitle>
                <CardDescription>Start your tattoo journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">${tattooist.hourlyRate}/hour</div>
                  <div className="text-sm text-gray-600">Starting rate</div>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600 justify-center">
                  <Calendar className="w-4 h-4" />
                  <span>{tattooist.availableSlots} slots available</span>
                </div>
                <Separator />
                <Link href={`/artist/${tattooist.id}/direct-book`}>
                  <Button className="w-full" size="lg">
                    Book Appointment
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 text-center">
                  Free consultation • No booking fees
                </p>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{tattooist.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{tattooist.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{tattooist.location}</span>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Artist Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Experience</span>
                  <span className="font-medium">{tattooist.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <span className="font-medium">{tattooist.rating}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reviews</span>
                  <span className="font-medium">{tattooist.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Portfolio Pieces</span>
                  <span className="font-medium">{tattooist.portfolios.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <div className="aspect-square bg-gray-300 rounded-lg flex items-center justify-center text-gray-600">
              Portfolio Image (Full Size)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}