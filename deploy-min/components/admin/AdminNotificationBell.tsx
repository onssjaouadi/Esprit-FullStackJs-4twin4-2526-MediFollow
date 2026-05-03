"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, AlertCircle, Info } from "lucide-react";

interface Notification {
  id: string;
  type: "alert" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Simulated notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "alert",
        title: "Alerte Système",
        message: "5 alertes critiques détectées",
        timestamp: new Date(Date.now() - 5 * 60000),
        read: false,
      },
      {
        id: "2",
        type: "info",
        title: "Nouveaux Patients",
        message: "3 nouveaux patients en attente d'approbation",
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
      },
      {
        id: "3",
        type: "info",
        title: "Sauvegarde Système",
        message: "Sauvegarde quotidienne complétée avec succès",
        timestamp: new Date(Date.now() - 2 * 3600000),
        read: true,
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <Bell size={20} className="text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-40">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                    !notification.read ? "bg-blue-50 dark:bg-slate-700/30" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {notification.type === "alert" ? (
                      <AlertCircle
                        size={18}
                        className="text-red-500 flex-shrink-0 mt-1"
                      />
                    ) : (
                      <Info
                        size={18}
                        className="text-blue-500 flex-shrink-0 mt-1"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {notification.title}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                Aucune notification
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
