"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share, ArrowRight } from "lucide-react";
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
}

export function DiscoverTattoo() {
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
      placement: "Arm"
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
      placement: "Back"
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
      placement: "Wrist"
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
      placement: "Chest"
    }
  ]);

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

  return (
    <div className="px-4 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover Designs</h2>
          <p className="text-gray-600">Get inspired by amazing tattoo designs from talented artists</p>
        </div>
        <Link href="/tattoos">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {designs.map((design) => (
          <Card key={design.id} className="overflow-hidden group">
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
                    <div className="flex items-center gap-1 text-xs mb-1">
                      <Heart className="w-3 h-3" />
                      <span>{design.likes}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-1">
                  {design.title}
                </h3>
                <Link
                  href={`/artist/${design.artistId}`}
                  className="text-xs text-gray-600 hover:text-gray-900 mb-2 block"
                >
                  by {design.artist}
                </Link>

                <div className="flex flex-wrap gap-1 mb-2">
                  {design.style.slice(0, 2).map((style) => (
                    <Badge key={style} variant="outline" className="text-xs px-1 py-0">
                      {style}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{design.size}</span>
                  <span>{design.placement}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}