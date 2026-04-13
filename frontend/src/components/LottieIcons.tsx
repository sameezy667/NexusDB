"use client";

import { Activity, CheckCircle2 } from "lucide-react";

interface IconProps {
  className?: string;
}

export function ActivityLottie({ className = "w-8 h-8 opacity-70" }: IconProps) {
  return <Activity className={className} />;
}

export function SuccessCheckLottie({ className = "w-12 h-12" }: IconProps) {
  return <CheckCircle2 className={className} />;
}
