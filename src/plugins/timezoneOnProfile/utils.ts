/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { settings } from "./settings";

export const GMT_WHOLE = Array.from({ length: 27 }, (_, i) => {
    const offset = i - 12;
    const label = offset === 0 ? "GMT" : `GMT${offset > 0 ? "+" : "−"}${Math.abs(offset)}`;
    const tz = offset === 0 ? "Etc/UTC" : `Etc/GMT${offset > 0 ? "-" : "+"}${Math.abs(offset)}`;
    return { type: "gmt" as const, label, tz };
});

export const GMT_FRACTION = [
    { label: "GMT+3:30", tz: "Asia/Tehran" },
    { label: "GMT+4:30", tz: "Asia/Kabul" },
    { label: "GMT+5:30", tz: "Asia/Kolkata" },
    { label: "GMT+5:45", tz: "Asia/Kathmandu" },
    { label: "GMT+6:30", tz: "Asia/Yangon" },
    { label: "GMT+8:45", tz: "Australia/Eucla" },
    { label: "GMT+9:30", tz: "Australia/Adelaide" },
    { label: "GMT+10:30", tz: "Australia/Lord_Howe" },
    { label: "GMT+12:45", tz: "Pacific/Chatham" },
].map(v => ({ type: "gmt" as const, ...v }));

function parseGmtOffset(label: string): number {
    if (label === "GMT") return 0;
    const match = label.match(/GMT([+\-−])(\d+)(?::(\d+))?/);
    if (!match) return 0;
    const sign = match[1] === "-" || match[1] === "−" ? -1 : 1;
    const hours = Number(match[2]);
    const minutes = Number(match[3] ?? 0);
    return sign * (hours * 60 + minutes);
}

export const GMT_ALL_SORTED = [...GMT_WHOLE, ...GMT_FRACTION].sort(
    (a, b) => parseGmtOffset(a.label) - parseGmtOffset(b.label)
);

export function setUserTimezone(userId: string, tz: string) {
    const store = { ...settings.store.timezonesByUser } as Record<string, string>;
    if (!tz) {
        delete store[userId];
    } else {
        store[userId] = tz;
    }
    // @ts-ignore
    settings.store.timezonesByUser = store;
}

export function update(tz: string): Date {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).formatToParts(now);

    const values: Record<string, number> = {};
    for (const part of parts) {
        if (part.type !== "literal") {
            values[part.type] = Number(part.value);
        }
    }

    const targetTime = new Date(
        values.year ?? now.getFullYear(),
        (values.month ?? now.getMonth() + 1) - 1,
        values.day ?? now.getDate(),
        values.hour ?? 0,
        values.minute ?? 0,
        values.second ?? 0
    );

    const offsetMs = targetTime.getTime() - now.getTime();
    return new Date(now.getTime() + offsetMs);
}

export function getUserTimezone(userId: string): string {
    return (settings.store.timezonesByUser as unknown as Record<string, string>)[userId] ?? "";
}
