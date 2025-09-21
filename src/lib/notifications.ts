
import data from './notifications.json';
import { useState, useEffect } from 'react';

export type Notification = {
    id: string;
    title: string;
    description: string;
    read: boolean;
    href: string;
};

// This will act as our simple in-memory store
let memoryState: Notification[] = data.notifications;

// Listeners to notify components of changes
const listeners: Set<() => void> = new Set();

const notifyListeners = () => {
    listeners.forEach(listener => listener());
};

// Function to get the current state
export const getNotifications = (): Notification[] => {
    return memoryState;
};

// Function to toggle the read status of a single notification
export const toggleNotificationRead = (id: string) => {
    memoryState = memoryState.map(n =>
        n.id === id ? { ...n, read: !n.read } : n
    );
    notifyListeners();
};

// Function to mark all notifications as read
export const markAllAsRead = () => {
    memoryState = memoryState.map(n => ({ ...n, read: true }));
    notifyListeners();
};


// A React hook to subscribe to notification changes
export const useNotifications = () => {
    const [notifications, setNotifications] = useState(memoryState);

    useEffect(() => {
        const listener = () => {
            setNotifications([...memoryState]); // Create a new array to trigger re-render
        };
        
        listeners.add(listener);
        
        // Initial sync
        listener(); 

        return () => {
            listeners.delete(listener);
        };
    }, []);

    return notifications;
};


// This is the original export, we can deprecate it or leave it
// in case some components still use it non-reactively.
export const notifications: Notification[] = data.notifications;
