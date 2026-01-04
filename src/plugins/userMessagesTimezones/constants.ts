/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TimezoneGroups } from "./types";

export const TIMEZONE_DATA_KEY = "userMessagesTimezonesData";

const allTimezones = [
    "UTC",
    ...Intl.supportedValuesOf("timeZone")
];

const groups: Record<string, string[]> = {};

for (const tz of allTimezones) {
    const parts = tz.split("/");
    const region = parts[0];

    if (!groups[region]) groups[region] = [];

    groups[region].push(tz);
}

export const TIMEZONE_GROUPS: TimezoneGroups = groups;
