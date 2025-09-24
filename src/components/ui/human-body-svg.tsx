"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface HumanBodySvgProps {
  className?: string;
  selectedBodyPart?: string;
  onBodyPartClick?: (bodyPart: string) => void;
  view?: "front" | "back";
}

// Define clickable body part areas with coordinates
const bodyParts = {
  front: [
    { name: "head", label: "Head", x: 45, y: 5, width: 35, height: 25 },
    { name: "neck", label: "Neck", x: 50, y: 30, width: 25, height: 15 },
    { name: "left-shoulder", label: "Left Shoulder", x: 25, y: 45, width: 25, height: 20 },
    { name: "right-shoulder", label: "Right Shoulder", x: 75, y: 45, width: 25, height: 20 },
    { name: "chest", label: "Chest", x: 40, y: 65, width: 45, height: 30 },
    { name: "left-upper-arm", label: "Left Upper Arm", x: 15, y: 55, width: 15, height: 25 },
    { name: "right-upper-arm", label: "Right Upper Arm", x: 95, y: 55, width: 15, height: 25 },
    { name: "abdomen", label: "Abdomen", x: 40, y: 95, width: 45, height: 25 },
    { name: "left-forearm", label: "Left Forearm", x: 10, y: 80, width: 15, height: 30 },
    { name: "right-forearm", label: "Right Forearm", x: 100, y: 80, width: 15, height: 30 },
    { name: "left-hand", label: "Left Hand", x: 5, y: 110, width: 15, height: 15 },
    { name: "right-hand", label: "Right Hand", x: 105, y: 110, width: 15, height: 15 },
    { name: "left-hip", label: "Left Hip", x: 35, y: 120, width: 20, height: 20 },
    { name: "right-hip", label: "Right Hip", x: 70, y: 120, width: 20, height: 20 },
    { name: "left-thigh", label: "Left Thigh", x: 35, y: 140, width: 20, height: 35 },
    { name: "right-thigh", label: "Right Thigh", x: 70, y: 140, width: 20, height: 35 },
    { name: "left-knee", label: "Left Knee", x: 35, y: 175, width: 20, height: 15 },
    { name: "right-knee", label: "Right Knee", x: 70, y: 175, width: 20, height: 15 },
    { name: "left-calf", label: "Left Calf", x: 35, y: 190, width: 20, height: 35 },
    { name: "right-calf", label: "Right Calf", x: 70, y: 190, width: 20, height: 35 },
    { name: "left-foot", label: "Left Foot", x: 30, y: 225, width: 25, height: 15 },
    { name: "right-foot", label: "Right Foot", x: 70, y: 225, width: 25, height: 15 }
  ],
  back: [
    { name: "head", label: "Head", x: 45, y: 5, width: 35, height: 25 },
    { name: "neck", label: "Neck", x: 50, y: 30, width: 25, height: 15 },
    { name: "left-shoulder", label: "Left Shoulder", x: 75, y: 45, width: 25, height: 20 },
    { name: "right-shoulder", label: "Right Shoulder", x: 25, y: 45, width: 25, height: 20 },
    { name: "back", label: "Back", x: 40, y: 65, width: 45, height: 55 },
    { name: "left-upper-arm", label: "Left Upper Arm", x: 95, y: 55, width: 15, height: 25 },
    { name: "right-upper-arm", label: "Right Upper Arm", x: 15, y: 55, width: 15, height: 25 },
    { name: "left-forearm", label: "Left Forearm", x: 100, y: 80, width: 15, height: 30 },
    { name: "right-forearm", label: "Right Forearm", x: 10, y: 80, width: 15, height: 30 },
    { name: "left-hand", label: "Left Hand", x: 105, y: 110, width: 15, height: 15 },
    { name: "right-hand", label: "Right Hand", x: 5, y: 110, width: 15, height: 15 },
    { name: "left-buttock", label: "Left Buttock", x: 35, y: 120, width: 20, height: 20 },
    { name: "right-buttock", label: "Right Buttock", x: 70, y: 120, width: 20, height: 20 },
    { name: "left-thigh", label: "Left Thigh", x: 35, y: 140, width: 20, height: 35 },
    { name: "right-thigh", label: "Right Thigh", x: 70, y: 140, width: 20, height: 35 },
    { name: "left-calf", label: "Left Calf", x: 35, y: 190, width: 20, height: 35 },
    { name: "right-calf", label: "Right Calf", x: 70, y: 190, width: 20, height: 35 },
    { name: "left-foot", label: "Left Foot", x: 30, y: 225, width: 25, height: 15 },
    { name: "right-foot", label: "Right Foot", x: 70, y: 225, width: 25, height: 15 }
  ]
};

export const HumanBodySvg = ({
  className,
  selectedBodyPart,
  onBodyPartClick,
  view = "front"
}: HumanBodySvgProps) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const handleBodyPartClick = (bodyPart: string) => {
    if (onBodyPartClick) {
      onBodyPartClick(bodyPart);
    }
  };

  const getBodyPartStyle = (bodyPart: string) => {
    const isSelected = selectedBodyPart === bodyPart;
    const isHovered = hoveredPart === bodyPart;

    return {
      backgroundColor: isSelected
        ? 'rgba(59, 130, 246, 0.6)' // blue-500 with opacity
        : isHovered
        ? 'rgba(59, 130, 246, 0.3)' // blue-500 with less opacity
        : 'rgba(156, 163, 175, 0.3)', // gray-400 with opacity
      border: isSelected ? '2px solid #3b82f6' : '1px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out'
    };
  };

  // Image sources - you can replace these with actual body diagram images
  const imageSrc = view === "front"
    ? "/images/human-body-front.png"
    : "/images/human-body-back.png";

  // Fallback to a simple outline if images aren't available
  const fallbackImageSrc = `data:image/svg+xml;base64,${Buffer.from(`
    <svg viewBox="0 0 125 250" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#d1d5db" stroke-width="2">
        <!-- Head -->
        <circle cx="62.5" cy="20" r="15"/>
        <!-- Neck -->
        <line x1="62.5" y1="35" x2="62.5" y2="45"/>
        <!-- Torso -->
        <rect x="45" y="45" width="35" height="60" rx="5"/>
        <!-- Arms -->
        <line x1="45" y1="55" x2="25" y2="75"/>
        <line x1="25" y1="75" x2="20" y2="95"/>
        <line x1="80" y1="55" x2="100" y2="75"/>
        <line x1="100" y1="75" x2="105" y2="95"/>
        <!-- Legs -->
        <line x1="50" y1="105" x2="45" y2="140"/>
        <line x1="45" y1="140" x2="40" y2="175"/>
        <line x1="75" y1="105" x2="80" y2="140"/>
        <line x1="80" y1="140" x2="85" y2="175"/>
        <!-- Feet -->
        <line x1="40" y1="175" x2="35" y2="180"/>
        <line x1="85" y1="175" x2="90" y2="180"/>
      </g>
    </svg>
  `).toString('base64')}`;

  return (
    <div role="presentation" className={cn("flex justify-center relative", className)}>
      <div className="relative w-48 h-80">
        {/* Body diagram image */}
        <Image
          src={imageSrc}
          alt={`Human body ${view} view`}
          fill
          className="object-contain"
          onError={(e) => {
            // Fallback to simple outline if main image fails
            e.currentTarget.src = fallbackImageSrc;
          }}
          priority
        />

        {/* Clickable overlay areas */}
        {bodyParts[view].map((part) => (
          <div
            key={part.name}
            className="absolute rounded-md"
            style={{
              left: `${part.x}%`,
              top: `${part.y}%`,
              width: `${part.width}%`,
              height: `${part.height}%`,
              ...getBodyPartStyle(part.name)
            }}
            onClick={() => handleBodyPartClick(part.name)}
            onMouseEnter={() => setHoveredPart(part.name)}
            onMouseLeave={() => setHoveredPart(null)}
            title={part.label}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBodyPartClick(part.name);
              }
            }}
          />
        ))}

        {/* Selected part indicator */}
        {selectedBodyPart && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 text-center rounded-b">
            {bodyParts[view].find(p => p.name === selectedBodyPart)?.label || selectedBodyPart}
          </div>
        )}
      </div>
    </div>
  );
};