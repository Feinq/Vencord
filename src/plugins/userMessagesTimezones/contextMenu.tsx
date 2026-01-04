/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { User } from "@vencord/discord-types";
import { Menu, React } from "@webpack/common";

import { TIMEZONE_GROUPS } from "./constants";
import { timezoneDataManager } from "./dataManager";
import { ReactElement } from "react";

function CheckmarkIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
        >
            <path
                fill="currentColor"
                d="M9.0 16.2L4.8 12.0 3.4 13.4 9.0 19.0 21.6 6.4 20.2 5.0z"
            />
        </svg>
    );
}

interface UserContextProps {
    user: User;
    guildId?: string;
}

function createTimezoneMenuItems(user: User, currentTimezone?: string) {
    const hasTimezone = currentTimezone !== undefined;
    const menuItems: ReactElement[] = [];

    // Create timezone regions as submenus
    Object.entries(TIMEZONE_GROUPS).forEach(([region, timezones]) => {
        const regionItems = timezones.map(timezone => {
            const isSelected = currentTimezone === timezone;
            const displayName = timezone.split("/").pop()?.replace(/_/g, " ") || timezone;

            return (
                <Menu.MenuItem
                    key={`timezone-${timezone}`}
                    id={`timezone-${timezone}`}
                    label={displayName}
                    action={async () => {
                        try {
                            if (isSelected) {
                                await timezoneDataManager.removeUserTimezone(user.id);
                            } else {
                                await timezoneDataManager.setUserTimezone(user.id, timezone);
                            }
                        } catch (error) {
                            console.error("[UserMessagesTimezones] Failed to update timezone:", error);
                        }
                    }}
                    icon={isSelected ? CheckmarkIcon : undefined}
                />
            );
        });

        menuItems.push(
            <Menu.MenuItem
                key={`timezone-region-${region}`}
                id={`timezone-region-${region}`}
                label={region}
            >
                {regionItems}
            </Menu.MenuItem>
        );
    });

    const mainMenuItem = (
        <Menu.MenuItem
            key="set-timezone"
            id={hasTimezone ? "change-timezone" : "set-timezone"}
            label={hasTimezone ? "Change Timezone" : "Set Timezone"}
        >
            {menuItems}
        </Menu.MenuItem>
    );

    const result = [mainMenuItem];

    if (hasTimezone) {
        result.push(
            <Menu.MenuSeparator key="timezone-separator" />,
            <Menu.MenuItem
                key="remove-timezone"
                id="remove-timezone"
                label="Remove Timezone"
                color="danger"
                action={async () => {
                    try {
                        await timezoneDataManager.removeUserTimezone(user.id);
                    } catch (error) {
                        console.error("[UserMessagesTimezones] Failed to remove timezone:", error);
                    }
                }}
            />
        );
    }

    return result;
}

const UserContextMenuPatch: NavContextMenuPatchCallback = (children, { user }: UserContextProps) => {
    if (!user || user.bot) return;

    const group = findGroupChildrenByChildId("close-dm", children) ||
        findGroupChildrenByChildId("block", children) ||
        children;

    if (group) {
        let currentTimezone: string | undefined;
        try {
            currentTimezone = timezoneDataManager.getUserTimezoneSync(user.id);
        } catch (error) {
            currentTimezone = undefined;
        }

        const timezoneMenuItems = createTimezoneMenuItems(user, currentTimezone);
        group.push(...timezoneMenuItems);
    }
};

export { UserContextMenuPatch };
