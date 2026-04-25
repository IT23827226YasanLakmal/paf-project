import { useEffect, useRef, useState } from "react";
import { Bell, X, CheckCheck, Inbox } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import API from "../services/api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await API.fetchNotifications();
      setNotifications(data);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    try {
      await API.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // silently fail
    }
  };

  const handleRead = async (id) => {
    try {
      await API.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-8 h-8 rounded-full text-secondary hover:text-primary hover:bg-raised transition-all duration-200 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 bg-accent text-white text-[10px] font-bold rounded-full leading-none shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 bg-overlay rounded-2xl shadow-xl z-50 overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-raised" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" strokeWidth={1.8} />
                <span className="text-sm font-semibold text-primary">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-accent-subtle text-accent text-[10px] font-bold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-muted-fill transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto bg-overlay">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Inbox className="w-8 h-8 text-muted mb-2" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-muted">All caught up</p>
                  <p className="text-xs text-muted mt-0.5">No notifications right now</p>
                </div>
              ) : (
                <div className="divide-y" style={{ divideColor: 'var(--border-subtle)' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-raised transition-colors ${
                        !n.read && !n.isRead ? "bg-accent-subtle" : ""
                      }`}
                    >
                      {/* Unread dot */}
                      <div className="flex-shrink-0 mt-1.5">
                        <span className={`block w-1.5 h-1.5 rounded-full ${!n.read && !n.isRead ? "bg-accent" : "bg-transparent"}`} />
                      </div>
                      <p className={`text-sm flex-1 leading-snug ${!n.read && !n.isRead ? "text-primary font-medium" : "text-secondary"}`}>
                        {n.message}
                      </p>
                      <button
                        onClick={(e) => handleDismiss(e, n.id)}
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-md text-muted hover:text-primary hover:bg-muted-fill transition-colors cursor-pointer mt-0.5"
                      >
                        <X className="w-3 h-3" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 bg-raised flex items-center justify-end" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={async () => {
                    for (const n of notifications.filter(n => !n.read)) {
                      await API.markAsRead(n.id).catch(() => {});
                    }
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" strokeWidth={2} />
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}