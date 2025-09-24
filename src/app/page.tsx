import { ArtistCard } from "@/components/artist";
import { DiscoverTattoo, TattooCategories } from "@/components/discovery";

export default function Home() {
  return (
    <div className="h-full">
      {/* Mobile and tablet optimized layout */}
      <div className="max-w-7xl mx-auto pt-4 pb-16">
        <ArtistCard />
        <TattooCategories />
        <DiscoverTattoo />
      </div>
    </div>
  );
}
