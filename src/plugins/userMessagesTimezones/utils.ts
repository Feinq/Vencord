/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TIMEZONE_GROUPS } from "./constants";
import { settings, TimeFormat } from "./settings";
import { findByPropsLazy } from "@webpack";

const i18n = findByPropsLazy("getLocale");

export function formatTime(timezone: string): string {
    try {
        const currentTime = new Date();
        const { timeFormat } = settings.store;

        const hour12 = timeFormat === TimeFormat.Auto
            ? undefined
            : timeFormat === TimeFormat.TwelveHour;

        const formatter = new Intl.DateTimeFormat(i18n.getLocale(), {
            timeZone: timezone,
            hour: "numeric",
            minute: "2-digit",
            hour12: hour12
        });

        return formatter.format(currentTime);
    } catch {
        return "";
    }
}
