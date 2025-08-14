/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const enum TimeFormat {
    TwentyFourHour = "24h",
    TwelveHour = "12h"
}

export const enum UpdateInterval {
    Realtime = 1000,
    FiveSeconds = 5000,
    TenSeconds = 10000,
    ThirtySeconds = 30000,
    OneMinute = 60000
}

export const settings = definePluginSettings({
    timeFormat: {
        type: OptionType.SELECT,
        description: "Time format to display",
        options: [
            {
                label: "24-hour (HH:MM)",
                value: TimeFormat.TwentyFourHour,
                default: true
            },
            {
                label: "12-hour (h:MM AM/PM)",
                value: TimeFormat.TwelveHour
            }
        ]
    },
    updateInterval: {
        type: OptionType.SELECT,
        description: "How often to update displayed times",
        options: [
            {
                label: "Real-time (1 second)",
                value: UpdateInterval.Realtime,
                default: true
            },
            {
                label: "Every 5 seconds",
                value: UpdateInterval.FiveSeconds
            },
            {
                label: "Every 10 seconds",
                value: UpdateInterval.TenSeconds
            },
            {
                label: "Every 30 seconds",
                value: UpdateInterval.ThirtySeconds
            },
            {
                label: "Every minute",
                value: UpdateInterval.OneMinute
            }
        ]
    }
});
