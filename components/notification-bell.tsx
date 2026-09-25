"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "@/app/actions/notifications";

export const NotificationBell = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchCount = async () => {
      const latest = await getUnreadNotificationCount();
      if (isMounted) setCount(latest);
    };

    fetchCount(); // initial load on mount
    const interval = setInterval(fetchCount, 30000); // poll every 30s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link href="/notifications" className="relative inline-flex">
      <Bell />
      {count > 0 && (
        <p className="absolute -top-3 right-1 size-4 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </p>
      )}
    </Link>
  );
};