
'use client';

import { useState, useEffect } from 'react';
import { getAnnouncements, Announcement, getUserById } from './store';
import { useAuth } from '@/hooks/use-auth';
import { Role } from './types';

export type Notification = {
    id: string;
    title: string;
    description: string;
    read: boolean;
    href: string;
};

const READ_NOTIFICATIONS_KEY = 'campusconnect_read_notifications';

// --- State Management for Read Status ---
let readNotificationIds: Set<string> = new Set();

const loadReadStatus = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    readNotificationIds = stored ? new Set(JSON.parse(stored)) : new Set();
  }
};

const saveReadStatus = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(Array.from(readNotificationIds)));
  }
};

// Initial load
loadReadStatus();

// --- Listeners to notify components of changes ---
const listeners: Set<() => void> = new Set();

const notifyListeners = () => {
    listeners.forEach(listener => listener());
};

// --- Public API for Notifications ---

export const toggleNotificationRead = (id: string) => {
    if (readNotificationIds.has(id)) {
        readNotificationIds.delete(id);
    } else {
        readNotificationIds.add(id);
    }
    saveReadStatus();
    notifyListeners();
};

export const markAllAsRead = (notifications: Notification[]) => {
    notifications.forEach(n => readNotificationIds.add(n.id));
    saveReadStatus();
    notifyListeners();
};

const mapAnnouncementsToNotifications = (announcements: Announcement[], userRole?: Role): Notification[] => {
    return announcements
        .filter(ann => {
            if (!userRole) return false;
            switch (ann.audience) {
                case 'All School':
                    return true;
                case 'Teachers':
                    return userRole === 'Teacher' || userRole === 'Admin' || userRole === 'Headmaster';
                case 'Parents':
                    return userRole === 'Parent' || userRole === 'Admin';
                case 'Students':
                    return userRole === 'Student' || userRole === 'Admin';
                default:
                    return false;
            }
        })
        .map(ann => ({
            id: ann.id,
            title: ann.title,
            description: ann.content.substring(0, 50) + '...',
            read: readNotificationIds.has(ann.id),
            href: '/communications', 
        }));
};

// A React hook to subscribe to notification changes
export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const updateNotifications = () => {
        const announcements = getAnnouncements();
        const mapped = mapAnnouncementsToNotifications(announcements, user?.role);
        setNotifications(mapped);
    };

    useEffect(() => {
        // Initial update
        updateNotifications();

        // Subscribe to future changes
        listeners.add(updateNotifications);

        // Also need to listen for announcement changes if they don't use this system
        // A simple way is to use a custom event or poll, here we'll just update on user change
        // A better system would have a centralized store that notifies listeners.
        // For this app's structure, we can assume announcements might change and re-check.
        
        return () => {
            listeners.delete(updateNotifications);
        };
    }, [user]); // Re-run when user changes

    return notifications;
};
