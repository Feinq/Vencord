/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getUserSettingLazy } from "@api/UserSettings";
import ErrorBoundary from "@components/ErrorBoundary";
import { classes } from "@utils/misc";
import { Message } from "@vencord/discord-types";
import { findByPropsLazy } from "@webpack";
import { useState, useEffect, UserStore } from "@webpack/common";

import { timezoneDataManager } from "./dataManager";
import { settings } from "./settings";
import { formatTime } from "./utils";
import { useTimer } from "@utils/react";

const styles: Record<string, string> = findByPropsLazy("timestampInline");
const MessageDisplayCompact = getUserSettingLazy("textAndImages", "messageDisplayCompact")!;

const AUTO_MODERATION_ACTION = 24;

function shouldShow(message: Message): boolean {
    if (message.author.bot || message.author.system || message.type === AUTO_MODERATION_ACTION)
        return false;
    if (message.author.id === UserStore.getCurrentUser().id)
        return false;

    return true;
}

function TimezoneChatComponent({ message }: { message: Message; }) {
    const [currentTime, setCurrentTime] = useState<string | null>(null);
    const [timezone, setTimezone] = useState<string | undefined>(undefined);
    const timer = useTimer({ interval: settings.store.updateInterval });

    useEffect(() => {
        let mounted = true;
        const userId = message.author.id;

        // Fetch initial timezone
        timezoneDataManager.getUserTimezone(userId)
            .then(tz => mounted && setTimezone(tz))
            .catch(() => mounted && setTimezone(undefined));

        // Listen for updates
        const listener = (id: string, tz?: string) => {
            if (id === userId && mounted) setTimezone(tz);
        };

        // Subscribe to timezone changes
        timezoneDataManager.addListener(listener);
        return () => {
            mounted = false;
            timezoneDataManager.removeListener(listener);
        };
    }, [message.author.id]);

    useEffect(() => {
        if (!timezone) {
            setCurrentTime(null);
            return;
        }

        try {
            setCurrentTime(formatTime(timezone));
        } catch {
            setCurrentTime(null);
        }
    }, [timezone, timer]);

    return currentTime && (
        <span
            className={classes(styles.timestampInline, styles.timestamp)}
            style={{ marginRight: 0 }} // We set the right margin to 0 for consistent spacing in case of other elements after this one
        >• {currentTime}</span>
    );
}

export const TimezoneChatComponentWrapper = ErrorBoundary.wrap(({ message }: { message: Message; }) => {
    return shouldShow(message)
        ? <TimezoneChatComponent message={message} />
        : null;
}, { noop: true });

export const CompactTimezoneChatComponentWrapper = ErrorBoundary.wrap(({ message }: { message: Message; }) => {
    const compact = MessageDisplayCompact.useSetting();

    if (!compact || !shouldShow(message)) {
        return null;
    }

    return <TimezoneChatComponent message={message} />;
}, { noop: true });