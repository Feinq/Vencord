/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TimezoneGroups } from "./types";

export const TIMEZONE_DATA_KEY = "userMessagesTimezonesData";

export const TIMEZONE_GROUPS: TimezoneGroups = {
    "America": [
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "America/Toronto",
        "America/Vancouver",
        "America/Mexico_City",
        "America/Sao_Paulo",
        "America/Argentina/Buenos_Aires"
    ],
    "Europe": [
        "Europe/London",
        "Europe/Berlin",
        "Europe/Paris",
        "Europe/Rome",
        "Europe/Madrid",
        "Europe/Amsterdam",
        "Europe/Stockholm",
        "Europe/Moscow",
        "Europe/Istanbul"
    ],
    "Asia": [
        "Asia/Tokyo",
        "Asia/Shanghai",
        "Asia/Kolkata",
        "Asia/Dubai",
        "Asia/Singapore",
        "Asia/Seoul",
        "Asia/Bangkok",
        "Asia/Jakarta",
        "Asia/Manila"
    ],
    "Australia": [
        "Australia/Sydney",
        "Australia/Melbourne",
        "Australia/Perth",
        "Australia/Brisbane",
        "Australia/Adelaide"
    ],
    "Africa": [
        "Africa/Cairo",
        "Africa/Lagos",
        "Africa/Johannesburg",
        "Africa/Nairobi",
        "Africa/Casablanca"
    ],
    "Pacific": [
        "Pacific/Honolulu",
        "Pacific/Auckland",
        "Pacific/Fiji",
        "Pacific/Tahiti",
        "Pacific/Guam"
    ]
};
