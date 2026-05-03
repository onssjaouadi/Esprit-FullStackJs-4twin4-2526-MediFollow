"use client";

import { useEffect, useState } from "react";
import { Bell, AlertCircle, Loader2 } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getNurseNotifications,
  markNotificationAsRead,
} from "@/lib/actions/nurse.actions";
import { formatDateTime } from "@/lib/utils";

export default function NurseNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const response = await getNurseNotifications(currentUser.id);
      if (response.success) {
        setNotifications(response.data || []);
      } else {
        console.error("Erreur:", response.error);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      const response = await markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications((prevNotifs) =>
          prevNotifs.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif,
          ),
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Consultez les notifications du coordinateur
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Bell size={20} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-gray-400" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 py-12">
          <Bell className="size-12 text-gray-400 mb-3" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Pas de notifications
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Vous n'avez pas encore reçu de notifications du coordinateur
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border transition-all ${
                notification.isRead
                  ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
                  : "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md"
              }`}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {notification.type === "ALERT" && (
                        <AlertCircle
                          size={20}
                          className="text-red-500 dark:text-red-400 flex-shrink-0"
                        />
                      )}
                      {notification.type === "REMINDER" && (
                        <Bell
                          size={20}
                          className="text-blue-500 dark:text-blue-400 flex-shrink-0"
                        />
                      )}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="flex-shrink-0 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Marquer
                    </button>
                  )}
                </div>

                {/* Message */}
                <div className="mt-3 p-3 bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {notification.message}
                  </p>
                </div>

                {/* Badge */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      notification.type === "ALERT"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : notification.type === "REMINDER"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {notification.type === "ALERT" && "🔴 Alerte"}
                    {notification.type === "REMINDER" && "🔔 Rappel"}
                    {notification.type === "SYSTEM" && "⚙️ Système"}
                    {notification.type === "MESSAGE" && "💬 Message"}
                  </span>
                  {!notification.isRead && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      Non lue
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
