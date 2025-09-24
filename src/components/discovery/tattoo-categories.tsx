"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  count: number;
}

export function TattooCategories() {
  const categories: Category[] = [
    {
      id: "traditional",
      name: "Traditional",
      description: "Classic American traditional tattoos with bold lines and vibrant colors",
      imageUrl: "/api/placeholder/300/200",
      count: 156
    },
    {
      id: "japanese",
      name: "Japanese",
      description: "Traditional Japanese art featuring dragons, koi, and cherry blossoms",
      imageUrl: "/api/placeholder/300/200",
      count: 89
    },
    {
      id: "geometric",
      name: "Geometric",
      description: "Modern geometric designs with clean lines and symmetrical patterns",
      imageUrl: "/api/placeholder/300/200",
      count: 234
    },
    {
      id: "watercolor",
      name: "Watercolor",
      description: "Artistic watercolor-style tattoos with flowing colors and soft edges",
      imageUrl: "/api/placeholder/300/200",
      count: 67
    },
    {
      id: "realism",
      name: "Realism",
      description: "Photo-realistic portraits and detailed artwork",
      imageUrl: "/api/placeholder/300/200",
      count: 123
    },
    {
      id: "minimalist",
      name: "Minimalist",
      description: "Simple, clean designs with fine lines and subtle details",
      imageUrl: "/api/placeholder/300/200",
      count: 178
    }
  ];

  return (
    <div className="px-4 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Styles</h2>
          <p className="text-gray-600">Discover different tattoo styles and find your perfect match</p>
        </div>
        <Link href="/tattoos">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/tattoos?style=${category.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600 group-hover:scale-105 transition-transform">
                    {category.name}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    {category.count} designs
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}