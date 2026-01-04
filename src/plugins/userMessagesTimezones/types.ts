/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { User } from "@vencord/discord-types";

export interface TimezoneStorage {
    [userId: string]: string; // IANA timezone identifier
}

export interface TimezoneDataManager {
    setUserTimezone(userId: string, timezone: string): Promise<void>;
    getUserTimezone(userId: string): Promise<string | undefined>;
    getUserTimezoneSync(userId: string): string | undefined;
    removeUserTimezone(userId: string): Promise<void>;
    addListener(listener: (userId: string, timezone?: string) => void): void;
    removeListener(listener: (userId: string, timezone?: string) => void): void;
}

export interface TimezoneContextMenuProps {
    user: User;
    onClose: () => void;
}

export interface TimezoneSubmenuProps {
    user: User;
    currentTimezone?: string;
    onTimezoneSelect: (timezone: string) => void;
    onTimezoneRemove: () => void;
}

export interface TimezoneDisplayProps {
    message: any; // Discord message object
    userId: string;
    timezone: string;
}

export interface TimeDisplayState {
    currentTime: string | null;
    timezone: string | undefined;
}

export type TimezoneGroups = {
    [region: string]: string[];
};