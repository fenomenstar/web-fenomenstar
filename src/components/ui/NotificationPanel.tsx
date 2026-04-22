import { useState } from "react";
import { Bell, Heart, MessageCircle, Trophy, User, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useGetNotifications,
  useGetUnreadNotificationCount,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@workspace/api-client-react";

function iconForType(type: string) {
  switch (type) {
    case "vote":
      return <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />;
    case "comment":
      return <MessageCircle className="w-4 h-4 text-cyan-400" />;
    case "competition":
      return <Trophy className="w-4 h-4 text-yellow-400" />;
    case "follow":
      return <User className="w-4 h-4 text-green-400" />;
    default:
      return <Star className="w-4 h-4 text-primary" />;
  }
}

function relativeTime(dateString: string) {
  const timestamp = new Date(dateString).getTime();
  const diff = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "şimdi";
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa`;
  const days = Math.floor(hours / 24);
  return `${days} gün`;
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const { data, refetch } = useGetNotifications({ query: { retry: false } });
  const { data: unreadData, refetch: refetchUnread } = useGetUnreadNotificationCount({
    query: { retry: false },
  });
  const markOne = useMarkNotificationRead({
    mutation: {
      onSuccess: () => {
        refetch();
        refetchUnread();
      },
    },
  });
  const markAll = useMarkAllNotificationsRead({
    mutation: {
      onSuccess: () => {
        refetch();
        refetchUnread();
      },
    },
  });

  const notifications = data?.notifications ?? [];
  const unread = unreadData?.count ?? notifications.filter((item: any) => !item.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative w-9 h-9 rounded-full flex items-center justify-center transition-all",
          open
            ? "bg-primary/20 text-primary"
            : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white",
        )}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-3 w-80 bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <h3 className="font-bold text-sm">Bildirimler</h3>
                {unread > 0 && (
                  <button
                    onClick={() => markAll.mutate()}
                    className="text-[11px] text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Tümünü okundu say
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
                    <p className="text-muted-foreground text-sm">Bildirim yok</p>
                  </div>
                ) : (
                  notifications.map((notification: any) => (
                    <motion.div
                      key={notification.id}
                      layout
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors relative group",
                        !notification.read && "bg-white/2",
                      )}
                    >
                      {!notification.read && (
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                      <button
                        onClick={() => {
                          if (!notification.read) {
                            markOne.mutate({ notificationId: notification.id });
                          }
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/5"
                      >
                        {iconForType(notification.type)}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-xs leading-snug",
                            !notification.read ? "font-semibold text-white" : "text-white/80",
                          )}
                        >
                          {notification.text}
                        </p>
                        {notification.sub && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {notification.sub}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {relativeTime(notification.createdAt)} önce
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!notification.read) {
                            markOne.mutate({ notificationId: notification.id });
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all shrink-0"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="px-4 py-3 border-t border-white/10">
                <button className="w-full text-center text-xs text-primary hover:text-primary/80 font-semibold transition-colors">
                  Tüm bildirimleri gör
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
