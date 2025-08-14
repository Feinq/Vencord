/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TIMEZONE_GROUPS } from "./constants";
import { settings, TimeFormat } from "./settings";
import { TimezoneUtils } from "./types";

export function isValidTimezone(timezone: string): boolean {
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: timezone });
        return true;
    } catch {
        return false;
    }
}

export function formatTime(timezone: string): string {
    try {
        if (!isValidTimezone(timezone)) {
            return "";
        }

        const currentTime = new Date();
        const { timeFormat } = settings.store;

        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: timeFormat === TimeFormat.TwelveHour
        });

        return formatter.format(currentTime);
    } catch {
        return "";
    }
}

export function getCurrentTimeInTimezone(timezone: string): Date {
    try {
        if (!isValidTimezone(timezone)) {
            return new Date();
        }

        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);

        const tempDate = new Date(utc);
        const targetTime = new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(tempDate);

        const [datePart, timePart] = targetTime.split(", ");
        const [year, month, day] = datePart.split("-");
        const [hour, minute, second] = timePart.split(":");

        return new Date(
            parseInt(year),
            parseInt(month) - 1, // Month is 0-indexed
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
        );
    } catch {
        return new Date();
    }
}

export function getTimezoneGroups(): Record<string, string[]> {
    return { ...TIMEZONE_GROUPS };
}

export function sanitizeTimezone(timezone: string): string | null {
    if (!timezone || typeof timezone !== "string") {
        return null;
    }

    const trimmed = timezone.trim();
    return isValidTimezone(trimmed) ? trimmed : null;
}

export function getAllTimezones(): string[] {
    const allTimezones: string[] = [];

    Object.values(TIMEZONE_GROUPS).forEach(timezones => {
        allTimezones.push(...timezones);
    });

    return allTimezones.sort();
}

export function getTimezoneGroup(timezone: string): string | null {
    for (const [groupName, timezones] of Object.entries(TIMEZONE_GROUPS)) {
        if (timezones.includes(timezone)) {
            return groupName;
        }
    }
    return null;
}

export function formatCurrentTime(timezone: string): string {
    return formatTime(timezone);
}

export function createUserFriendlyErrorMessage(operation: string, error: any): string {
    const baseMessage = `Failed to ${operation}`;

    if (error?.message) {
        if (error.message.includes("Invalid timezone")) {
            return `${baseMessage}: The selected timezone is not valid.`;
        }
        if (error.message.includes("Invalid user ID")) {
            return `${baseMessage}: User information is not available.`;
        }
        if (error.message.includes("DataStore")) {
            return `${baseMessage}: Unable to save settings. Changes may not persist.`;
        }
    }

    return `${baseMessage}. Please try again.`;
}

export async function safeAsyncOperation<T>(
    operation: () => Promise<T>,
    errorContext: string
): Promise<T | undefined> {
    try {
        return await operation();
    } catch (error) {
        console.error(`[UserMessagesTimezones] ${errorContext}:`, error);
        return undefined;
    }
}

export function validateTimezoneInput(userId: string, timezone?: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
        errors.push("User ID is required and must be a valid string");
    }

    if (timezone !== undefined) {
        if (typeof timezone !== "string") {
            errors.push("Timezone must be a string");
        } else if (timezone.trim().length === 0) {
            errors.push("Timezone cannot be empty");
        } else if (!isValidTimezone(timezone.trim())) {
            errors.push("Invalid timezone identifier");
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export const timezoneUtils: TimezoneUtils = {
    formatTime,
    isValidTimezone,
    getTimezoneGroups,
    getCurrentTimeInTimezone
};
