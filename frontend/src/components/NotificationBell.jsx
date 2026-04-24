import { useEffect, useState } from "react";
import API from "../services/api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await API.fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleDismiss = async (id) => {
    try {
      await API.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Delete failed");
    }
  };

  const handleRead = async (id) => {
    try {
      await API.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Mark as read failed");
    }
  };

  return (
    <div className="relative">

      {/*  Bell */}
      <button onClick={() => setOpen(!open)} className="relative">
        <span className="text-2xl">🔔</span>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/*  Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-xl shadow-lg p-3 z-50">

          <h3 className="font-semibold mb-2">Notifications</h3>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications</p>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleRead(n.id)}
                className={`flex justify-between items-start border-b py-2 cursor-pointer ${
                  !n.isRead ? "bg-gray-100" : ""
                }`}
              >
                <p className="text-sm">{n.message}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(n.id);
                  }}
                  className="text-red-500 text-xs"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}