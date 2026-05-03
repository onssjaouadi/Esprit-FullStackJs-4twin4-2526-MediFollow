"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import { Bell, AlertCircle, UserPlus } from "lucide-react";

type NotificationPayload = {
  title?: string;
  desc?: string;
  userId?: string;
  alertId?: string;
};

type NotificationItem = {
  id: string;
  event: "new-alert" | "new-signup";
  entityId: string;
  title: string;
  desc: string;
  createdAt: string;
  target: string;
  read: boolean;
};

type PollingNotification = {
  id: string;
  title: string;
  desc: string;
  createdAt: string;
  target: string;
};

type NotificationSummary = {
  alerts: PollingNotification[];
  signups: PollingNotification[];
};

const STORAGE_ITEMS = "admin_notifications_items";
const STORAGE_UNREAD = "admin_notifications_unread";
const STORAGE_CLEARED_AT = "admin_notifications_cleared_at";

export default function AdminNotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [clearedAt, setClearedAt] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const knownAlertIdsRef = useRef<Set<string>>(new Set());
  const knownSignupIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(STORAGE_ITEMS);
      const savedClearedAt = localStorage.getItem(STORAGE_CLEARED_AT);

      if (savedItems) setItems(JSON.parse(savedItems));
      if (savedClearedAt) setClearedAt(savedClearedAt);
    } catch {
      // Ignore malformed storage
    }
  }, []);

  useEffect(() => {
    const unreadCount = items.filter((item) => !item.read).length;

    try {
      localStorage.setItem(STORAGE_ITEMS, JSON.stringify(items.slice(0, 20)));
      localStorage.setItem(STORAGE_UNREAD, String(unreadCount));
      if (clearedAt) {
        localStorage.setItem(STORAGE_CLEARED_AT, clearedAt);
      } else {
        localStorage.removeItem(STORAGE_CLEARED_AT);
      }
    } catch {
      // Ignore local storage write issues
    }
  }, [items, clearedAt]);

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const upsertNotification = (
    event: "new-alert" | "new-signup",
    entityId: string,
    title: string,
    desc: string,
    target: string,
    createdAt?: string
  ) => {
    setItems((prev) => {
      if (clearedAt && createdAt && new Date(createdAt) <= new Date(clearedAt)) {
        return prev;
      }

      if (prev.some((item) => item.event === event && item.entityId === entityId)) {
        return prev;
      }

      const notification: NotificationItem = {
        id: `${event}-${entityId}`,
        event,
        entityId,
        title,
        desc,
        createdAt: createdAt || new Date().toISOString(),
        target,
        read: isOpen,
      };

      return [notification, ...prev].slice(0, 20);
    });
  };

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await fetch("/api/admin/notifications", { cache: "no-store" });
        const result = await response.json();

        if (!result?.success) {
          return;
        }

        const summary = result as { success: true } & NotificationSummary;
        const initialItems: NotificationItem[] = [];
        const alertIds = new Set(summary.alerts.map((item) => item.id));
        const signupIds = new Set(summary.signups.map((item) => item.id));

        if (!initializedRef.current) {
          summary.alerts.forEach((item) => {
            if (!clearedAt || new Date(item.createdAt) > new Date(clearedAt)) {
              initialItems.push({
                id: `new-alert-${item.id}`,
                event: "new-alert",
                entityId: item.id,
                title: item.title,
                desc: item.desc,
                createdAt: item.createdAt,
                target: item.target,
                read: true,
              });
            }
          });

          summary.signups.forEach((item) => {
            if (!clearedAt || new Date(item.createdAt) > new Date(clearedAt)) {
              initialItems.push({
                id: `new-signup-${item.id}`,
                event: "new-signup",
                entityId: item.id,
                title: item.title,
                desc: item.desc,
                createdAt: item.createdAt,
                target: item.target,
                read: true,
              });
            }
          });

          if (initialItems.length > 0) {
            initialItems.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
            setItems((prev) => (prev.length > 0 ? prev : initialItems.slice(0, 20)));
          }

          knownAlertIdsRef.current = alertIds;
          knownSignupIdsRef.current = signupIds;
          initializedRef.current = true;
          return;
        }

        summary.alerts
          .slice()
          .reverse()
          .forEach((item) => {
            if (!knownAlertIdsRef.current.has(item.id)) {
              upsertNotification("new-alert", item.id, item.title, item.desc, item.target, item.createdAt);
            }
          });

        summary.signups
          .slice()
          .reverse()
          .forEach((item) => {
            if (!knownSignupIdsRef.current.has(item.id)) {
              upsertNotification("new-signup", item.id, item.title, item.desc, item.target, item.createdAt);
            }
          });

        knownAlertIdsRef.current = alertIds;
        knownSignupIdsRef.current = signupIds;
      } catch {
        // Ignore polling errors and keep realtime path
      }
    };

    void loadSummary();
    const intervalId = window.setInterval(() => {
      void loadSummary();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [clearedAt]);

  useEffect(() => {
    const pusher = new Pusher("ba707a9085e391ba151b", {
      cluster: "eu",
    });

    const channel = pusher.subscribe("admin-updates");

    const pushItem = (event: "new-alert" | "new-signup", payload: NotificationPayload) => {
      const target = event === "new-signup"
        ? payload.userId
          ? `/dashboard/admin/users/${payload.userId}`
          : "/dashboard/admin/users"
        : payload.alertId
          ? `/dashboard/admin/alerts/${payload.alertId}`
          : "/dashboard/admin/alerts";

      const entityId = event === "new-signup" ? payload.userId || `${Date.now()}` : payload.alertId || `${Date.now()}`;
      upsertNotification(
        event,
        entityId,
        payload.title || (event === "new-alert" ? "New alert" : "New sign up"),
        payload.desc || (event === "new-alert" ? "A new alert was created." : "A new user signed up."),
        target
      );
      router.refresh();
    };

    const onNewAlert = (payload: NotificationPayload) => pushItem("new-alert", payload);
    const onNewSignup = (payload: NotificationPayload) => pushItem("new-signup", payload);

    channel.bind("new-alert", onNewAlert);
    channel.bind("new-signup", onNewSignup);

    return () => {
      channel.unbind("new-alert", onNewAlert);
      channel.unbind("new-signup", onNewSignup);
      pusher.unsubscribe("admin-updates");
      pusher.disconnect();
    };
  }, [router]);

  const badgeLabel = useMemo(() => (unreadCount > 99 ? "99+" : String(unreadCount)), [unreadCount]);

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setItems((current) => current.map((item) => ({ ...item, read: true })));
      }
      return next;
    });
  };

  const markAllAsRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const clearHistory = () => {
    const now = new Date().toISOString();
    setItems([]);
    setClearedAt(now);
    try {
      localStorage.removeItem(STORAGE_ITEMS);
      localStorage.removeItem(STORAGE_UNREAD);
      localStorage.setItem(STORAGE_CLEARED_AT, now);
    } catch {
      // Ignore local storage cleanup issues
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
    setIsOpen(false);
    router.push(item.target);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-black leading-none text-white">
            {badgeLabel}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications admin</p>
            {items.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
                >
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[11px] font-semibold text-red-600 transition-colors hover:text-red-500"
                >
                  Clear history
                </button>
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Aucune notification pour le moment.
              </div>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={item.id} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${item.read ? "opacity-75" : "bg-indigo-50/40 dark:bg-indigo-950/10"}`}
                    >
                    <div className="mb-1 flex items-start gap-2">
                      {item.event === "new-alert" ? (
                        <AlertCircle size={14} className="mt-0.5 shrink-0 text-indigo-500" />
                      ) : (
                        <UserPlus size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                      )}
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{item.desc}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString("fr-FR")}
                    </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}