/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

import { UserContextMenuPatch } from "./contextMenu";
import { timezoneDataManager } from "./dataManager";
import { settings } from "./settings";
import { CompactTimezoneChatComponentWrapper, TimezoneChatComponentWrapper } from "./TimezoneDisplay";

export default definePlugin({
    name: "UserMessagesTimezones",
    description: "Show timezone information for users in messages",
    authors: [Devs.Yuuki],
    settings,
    contextMenus: {
        "user-context": UserContextMenuPatch
    },

    patches: [
        {
            find: "showCommunicationDisabledStyles",
            replacement: {
                // Add next to timestamp (normal mode)
                match: /(?<=return\s*\(0,\i\.jsxs?\)\(.+!\i&&)(\(0,\i.jsxs?\)\(.+?\{.+?\}\))/,
                replace: "[$1, $self.TimezoneChatComponentWrapper(arguments[0])]"
            }
        },
        /**
         * This below is a second patch in case it has already been patched by the userMessagePronouns plugin and is now an array
         * Will have to rework this and come up with one single patch that would work independently and alongside the userMessagePronouns plugin
         */
        {
            find: "showCommunicationDisabledStyles",
            replacement: {
                // Add next to timestamp (normal mode)
                match: /(\i&&\!\i&&\[)(\(0,\i\.jsxs?\)\(.+?timestamp:\i\.timestamp.+?\}\)),?/,
                replace: "$1$2, $self.TimezoneChatComponentWrapper(arguments[0]), "
            }
        },
        {
            find: '="SYSTEM_TAG"',
            replacement: [
                {
                    // Add next to username (compact mode)
                    match: /className:\i\(\)\(\i\.className(?:,\i\.clickable)?,\i\)}\)\),(?=\i)/g,
                    replace: "$&$self.CompactTimezoneChatComponentWrapper(arguments[0]),",
                },
            ]
        },
        /**
         * Further patches will be required to display timezones on user profiles and have the live display be an optional choice (both on the modals and the sidebars)
         */
    ],

    TimezoneChatComponentWrapper,
    CompactTimezoneChatComponentWrapper,

    stop() {
        timezoneDataManager.clearCache();
    }
});