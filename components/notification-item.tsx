"use client";

import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { markNotificationRead } from "@/app/actions/notifications";
import { Card, CardContent } from "./ui/card";

interface NotificationItemProps {
  id: number;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  link?: string | null;
}

export const NotificationItem = ({
  id,
  title,
  message,
  createdAt,
  isRead,
  link,
}: NotificationItemProps) => {
  const [read, setRead] = useState(isRead);
  const router = useRouter();

  const handleClick = async () => {
    if (!read) {
      setRead(true); // optimistic — updates instantly, no waiting on the server round trip
      await markNotificationRead(id);
    }
    if (link) {
      router.push(link);
    }
  };

  return (
    <Card
      onClick={handleClick}
      className={`shadow-none cursor-pointer transition-colors ${
        !read ? "border-blue-200 bg-blue-50/40" : ""
      }`}
    >
      <CardContent className="py-4">
        <div className="flex justify-between items-start gap-4">
          <p className="font-medium">{title}</p>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{message}</p>
      </CardContent>
    </Card>
  );
};