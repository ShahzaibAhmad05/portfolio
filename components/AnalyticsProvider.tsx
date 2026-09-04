"use client";

import { useEffect } from "react";
import { startAnalytics } from "@/lib/analytics";

/** Mounts the behaviour tracker once, for the whole app. Renders nothing. */
export default function AnalyticsProvider() {
  useEffect(() => startAnalytics(), []);
  return null;
}
