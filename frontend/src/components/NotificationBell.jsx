import { useEffect, useRef, useState } from "react";
import { Bell, X, CheckCheck, Inbox } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import API from "../services/api";

export default function NotificationBell({ direction = 'down' }) {
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
  const isUp = direction === 'up';

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
        className="relative flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer group"
        aria-label="Notifications"
      >
        <Bell className={`w-4 h-4 transition-transform duration-300 ${open ? 'scale-110 text-blue-500' : 'group-hover:scale-110'}`} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]">
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: isUp ? -12 : 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isUp ? -12 : 12, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{ originX: isUp ? 0 : 1, originY: isUp ? 1 : 0 }}
            className={`absolute ${isUp ? 'left-0 bottom-full mb-3' : 'right-0 top-full mt-2'} w-80 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[999] overflow-hidden`}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Notifications</p>
                  {unreadCount > 0 && (
                    <p className="text-[9px] font-bold text-blue-500/80 uppercase tracking-tighter mt-0.5">
                      {unreadCount} UNREAD ALERTS
                    </p>
                  )}
                </div>
              </div>
              
              {notifications.length > 0 && (
                 <button
                  onClick={async () => {
                    for (const n of notifications.filter(n => !n.read)) {
                      await API.markAsRead(n.id).catch(() => {});
                    }
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-black/40">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-7 h-7 text-gray-700" strokeWidth={1.5} />
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">All caught up</p>
                  <p className="text-[10px] text-gray-600 mt-2 uppercase font-bold tracking-tighter">Your workspace is clear</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleRead(n.id)}
                      className={`group/notif flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-white/5 transition-all ${
                        !n.read ? "bg-blue-500/5" : ""
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-2 h-2 rounded-full ${!n.read ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "bg-gray-800"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] leading-relaxed transition-colors ${!n.read ? "text-white font-bold" : "text-gray-400 group-hover/notif:text-gray-300"}`}>
                          {n.message}
                        </p>
                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter mt-1.5">
                          {new Date().toLocaleDateString()} {/* Replace with real time if available */}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDismiss(e, n.id)}
                        className="opacity-0 group-hover/notif:opacity-100 p-1 rounded-md hover:bg-red-500/10 text-gray-700 hover:text-red-500 transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Optional: View all */}
            <div className="p-3 border-t border-white/5 bg-white/5">
               <button className="w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                 System Inbox
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}