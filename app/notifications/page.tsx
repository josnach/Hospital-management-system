import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoDataFound } from "@/components/no-data-found";
import { NotificationItem } from "@/components/notification-item";

const NotificationsPage = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const notifications = await db.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="bg-white rounded-xl p-4 2xl:p-6">
      <h1 className="text-xl font-semibold mb-4">Notifications</h1>

      {notifications.length === 0 ? (
        <NoDataFound note="No notifications yet" />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              id={n.id}
              title={n.title}
              message={n.message}
              createdAt={n.created_at}
              isRead={n.is_read}
              link={n.link}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;