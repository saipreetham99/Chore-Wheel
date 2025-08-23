"use client"

import * as icons from "lucide-react"

type IconProps = {
  name: keyof typeof icons;
  className?: string;
  size?: number;
}

export const Icon = ({ name, className, size }: IconProps) => {
  const LucideIcon = icons[name] as React.ComponentType<{ className?: string, size?: number }>;

  if (!LucideIcon) {
    return null;
  }

  return <LucideIcon className={className} size={size} />;
}
