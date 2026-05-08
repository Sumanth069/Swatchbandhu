"use client";

import React from "react";
import { useSwipeable } from "react-swipeable";
import { useRouter, usePathname } from "next/navigation";

const routes = ["/", "/feed", "/report", "/rewards", "/profile"];

export default function SwipeWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      // Swipe Left goes to the "next" tab (to the right in UI)
      if (pathname === "/") return router.push("/feed");
      if (pathname === "/feed") return router.push("/report");
      if (pathname === "/report") return router.push("/rewards");
      if (pathname === "/rewards") return router.push("/profile");
    },
    onSwipedRight: (eventData) => {
      // Swipe Right goes to the "prev" tab (to the left in UI)
      if (pathname === "/profile") return router.push("/rewards");
      if (pathname === "/rewards") return router.push("/report");
      if (pathname === "/report") return router.push("/feed");
      if (pathname === "/feed") return router.push("/");
    },
    trackMouse: false,
    preventScrollOnSwipe: false,
    delta: 50, // Require 50px swipe to trigger
  });

  // Do not attach swipe handlers if we are on the map root page to prevent breaking map panning.
  // We'll only enable it on other pages or if we are not touching the map component directly.
  // Alternatively, just disable on root entirely. Let's disable on root ("/") for now to be safe.
  const isMapRoute = pathname === "/";

  if (isMapRoute) {
    return <>{children}</>;
  }

  return (
    <div {...handlers} className="w-full h-full flex flex-col min-h-[100dvh]">
      {children}
    </div>
  );
}
