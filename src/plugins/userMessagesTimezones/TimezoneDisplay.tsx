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
import { React, UserStore } from "@webpack/common";

import { timezoneDataManager } from "./dataManager";
import { settings } from "./settings";
import { formatTime } from "./utils";

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
    const [currentTime, setCurrentTime] = React.useState<string | null>(null);
    const [timezone, setTimezone] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
        let mounted = true;

        const loadTimezone = async () => {
            try {
                const userTimezone = await timezoneDataManager.getUserTimezone(message.author.id);
                if (mounted) {
                    setTimezone(userTimezone);
                }
            } catch (error) {
                console.error("[UserMessagesTimezones] Failed to load timezone:", error);
                if (mounted) {
                    setTimezone(undefined);
                }
            }
        };

        loadTimezone();

        const handleTimezoneChange = (userId: string, newTimezone?: string) => {
            if (userId === message.author.id && mounted) {
                setTimezone(newTimezone);
            }
        };

        timezoneDataManager.addListener(handleTimezoneChange);

        return () => {
            mounted = false;
            timezoneDataManager.removeListener(handleTimezoneChange);
        };
    }, [message.author.id]);

    React.useEffect(() => {
        if (!timezone) {
            setCurrentTime(null);
            return;
        }

        let mounted = true;
        let interval: NodeJS.Timeout;

        const updateTime = () => {
            if (!mounted) return;

            try {
                const time = formatTime(timezone);
                if (time) {
                    setCurrentTime(time);
                } else {
                    setCurrentTime(null);
                }
            } catch (error) {
                console.error("[UserMessagesTimezones] Failed to format time:", error);
                setCurrentTime(null);
            }
        };

        updateTime();

        const updateIntervalMs = settings.store.updateInterval;
        interval = setInterval(updateTime, updateIntervalMs);

        return () => {
            mounted = false;
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [timezone]);

    return currentTime && (
        <span
            className={classes(styles.timestampInline, styles.timestamp)}
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