import { TattooistProfile } from "@/components/artist";

interface TattooistProfilePageProps {
  params: {
    tattooistName: string;
  };
}

export default function TattooistProfilePage({ params }: TattooistProfilePageProps) {
  return <TattooistProfile tattooistName={params.tattooistName} />;
}