import data from './notifications.json';

export type Notification = {
    id: string;
    title: string;
    description: string;
    read: boolean;
    href: string;
};

export const notifications: Notification[] = data.notifications;
