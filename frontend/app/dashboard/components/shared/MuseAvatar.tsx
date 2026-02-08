/**
 * hermesAvatar - Animated avatar for the hermes AI Assistant
 */
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface hermesAvatarProps {
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}

export function hermesAvatar({ isActive = false, size = "md" }: hermesAvatarProps) {
  const sizeClasses = {
    sm: "h-20 w-20",
    md: "h-28 w-28",
    lg: "h-32 w-32",
  };

  const logoSizes = {
    sm: 40,
    md: 56,
    lg: 64,
  };

  return (
    <div className={cn("relative shrink-0", sizeClasses[size])}>
      {/* Main circle */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-500 bg-gray-100",
          isActive && "shadow-md"
        )}
      />


      {/* hermes Logo */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Image
          src="/logo.png"
          alt="hermes"
          width={logoSizes[size]}
          height={logoSizes[size]}
          className="transition-all duration-300 rounded-xl"
        />
      </div>

    </div>
  );
}
