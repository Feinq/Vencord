/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";

import { TIMEZONE_DATA_KEY } from "./constants";
import { TimezoneDataManager, TimezoneStorage } from "./types";
import { sanitizeTimezone } from "./utils";

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
        if (!userId || typeof userId !== "string") {
            throw new Error("Invalid user ID");
        }

        const sanitizedTimezone = sanitizeTimezone(timezone);
        if (!sanitizedTimezone) {
            throw new Error("Invalid timezone identifier");
        }

        try {
            const data = await this.getTimezoneData();
            const updatedData = {
                ...data,
                [userId]: sanitizedTimezone
            };

            await this.saveTimezoneData(updatedData);

            this.notifyListeners(userId, sanitizedTimezone);
        } catch (error) {
            console.error("[UserMessagesTimezones] Failed to set user timezone:", error);
            throw error;
        }
    }

    async getUserTimezone(userId: string): Promise<string | undefined> {
        if (!userId || typeof userId !== "string") {
            return undefined;
        }

        try {
            const data = await this.getTimezoneData();
            return data[userId];
        } catch (error) {
            console.error("[UserMessagesTimezones] Failed to get user timezone:", error);
            return undefined;
        }
    }

    getUserTimezoneSync(userId: string): string | undefined {
        if (!userId || typeof userId !== "string" || this.cache === null) {
            return undefined;
        }

        return this.cache[userId];
    }

    async removeUserTimezone(userId: string): Promise<void> {
        if (!userId || typeof userId !== "string") {
            throw new Error("Invalid user ID");
        }

        try {
            const data = await this.getTimezoneData();

            if (!(userId in data)) {
                return;
            }

            const updatedData = { ...data };
            delete updatedData[userId];

            await this.saveTimezoneData(updatedData);

            this.notifyListeners(userId, undefined);
        } catch (error) {
            console.error("[UserMessagesTimezones] Failed to remove user timezone:", error);
            throw error;
        }
    }

    async getAllUserTimezones(): Promise<TimezoneStorage> {
        try {
            const data = await this.getTimezoneData();
            return { ...data };
        } catch (error) {
            console.error("[UserMessagesTimezones] Failed to get all user timezones:", error);
            return {};
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

    async hasUserTimezone(userId: string): Promise<boolean> {
        if (!userId || typeof userId !== "string") {
            return false;
        }

        try {
            const timezone = await this.getUserTimezone(userId);
            return timezone !== undefined;
        } catch {
            return false;
        }
    }

    async getUserTimezoneCount(): Promise<number> {
        try {
            const data = await this.getTimezoneData();
            return Object.keys(data).length;
        } catch {
            return 0;
        }
    }

    async setMultipleUserTimezones(updates: Record<string, string>): Promise<void> {
        if (!updates || typeof updates !== "object") {
            throw new Error("Invalid updates object");
        }

        try {
            const data = await this.getTimezoneData();
            const updatedData = { ...data };

            const sanitizedUpdates: Record<string, string> = {};
            for (const [userId, timezone] of Object.entries(updates)) {
                if (!userId || typeof userId !== "string") {
                    throw new Error(`Invalid user ID: ${userId}`);
                }

                const sanitizedTimezone = sanitizeTimezone(timezone);
                if (!sanitizedTimezone) {
                    throw new Error(`Invalid timezone for user ${userId}: ${timezone}`);
                }

                sanitizedUpdates[userId] = sanitizedTimezone;
            }

            Object.assign(updatedData, sanitizedUpdates);

            await this.saveTimezoneData(updatedData);
        } catch (error) {
            console.error("[UserMessagesTimezones] Failed to set multiple user timezones:", error);
            throw error;
        }
    }

    async removeMultipleUserTimezones(userIds: string[]): Promise<void> {
        if (!Array.isArray(userIds)) {
            throw new Error("Invalid user IDs array");
        }

        try {
            const data = await this.getTimezoneData();
            const updatedData = { ...data };

            for (const userId of userIds) {
                if (userId && typeof userId === "string") {
                    delete updatedData[userId];
                }
            }

            await this.saveTimezoneData(updatedData);
        } catch (error) {
            console.error("[UserMessagesTimezones] Failed to remove multiple user timezones:", error);
            throw error;
        }
    }
}

export const timezoneDataManager = new TimezoneDataManagerImpl();
