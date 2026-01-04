/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";

import { TIMEZONE_DATA_KEY } from "./constants";
import { TimezoneDataManager, TimezoneStorage } from "./types";

export class TimezoneDataManagerImpl implements TimezoneDataManager {
    private cache: TimezoneStorage | null = null;
    private listeners: Set<(userId: string, timezone?: string) => void> = new Set();

    private async getTimezoneData(): Promise<TimezoneStorage> {
        if (this.cache !== null) {
            return this.cache;
        }

        const data = await DataStore.get<TimezoneStorage>(TIMEZONE_DATA_KEY);
        this.cache = data || {};
        return this.cache;
    }

    private async saveTimezoneData(data: TimezoneStorage): Promise<void> {
        await DataStore.set(TIMEZONE_DATA_KEY, data);
        this.cache = { ...data };
    }

    async setUserTimezone(userId: string, timezone: string): Promise<void> {
        try {
            const data = await this.getTimezoneData();
            const updatedData = {
                ...data,
                [userId]: timezone
            };

            await this.saveTimezoneData(updatedData);

            this.notifyListeners(userId, timezone);
        } catch (error) {
            console.error("[UserMessagesTimezones] Failed to set user timezone:", error);
            throw error;
        }
    }

    async getUserTimezone(userId: string): Promise<string | undefined> {
        try {
            const data = await this.getTimezoneData();
            return data[userId];
        } catch (error) {
            console.error("[UserMessagesTimezones] Failed to get user timezone:", error);
            return undefined;
        }
    }

    getUserTimezoneSync(userId: string): string | undefined {
        if (this.cache === null) return undefined;

        return this.cache[userId];
    }

    async removeUserTimezone(userId: string): Promise<void> {
        try {
            const data = await this.getTimezoneData();

            if (!(userId in data)) return;

            const updatedData = { ...data };
            delete updatedData[userId];

            await this.saveTimezoneData(updatedData);

            this.notifyListeners(userId, undefined);
        } catch (error) {
            console.error("[UserMessagesTimezones] Failed to remove user timezone:", error);
            throw error;
        }
    }

    clearCache(): void {
        this.cache = null;
    }

    addListener(listener: (userId: string, timezone?: string) => void): void {
        this.listeners.add(listener);
    }


    removeListener(listener: (userId: string, timezone?: string) => void): void {
        this.listeners.delete(listener);
    }

    private notifyListeners(userId: string, timezone?: string): void {
        this.listeners.forEach(listener => {
            try {
                listener(userId, timezone);
            } catch (error) {
                console.error("[UserMessagesTimezones] Error in timezone change listener:", error);
            }
        });
    }
}

export const timezoneDataManager = new TimezoneDataManagerImpl();
