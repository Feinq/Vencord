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

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { BaseText } from "@components/BaseText";
import { closeModal, ModalCloseButton, ModalContent, ModalHeader, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { useTimer } from "@utils/react";
import { User } from "@vencord/discord-types";
import { findByPropsLazy } from "@webpack";
import { Menu, React, SearchableSelect, Timestamp, useEffect, UserStore,useState } from "@webpack/common";

import { settings } from "./settings";
import { getUserTimezone, GMT_ALL_SORTED, setUserTimezone, update } from "./utils";

const cl = findByPropsLazy("dotSpacer", "userTag");

export const TimezoneTriggerInline = (props: { userId: string;[key: string]: any; }) => {
    const { userId } = props;
    settings.use(["timezonesByUser"]);
    const [selectedTz, setSelectedTz] = useState(getUserTimezone(userId));
    const [currentTime, setCurrentTime] = useState<Date>(new Date(Date.now()));

    const elapsed = useTimer({
        interval: 60_000 - (Date.now() % 60_000),
        deps: [selectedTz]
    });

    useEffect(() => {
        const tz = getUserTimezone(userId);
        if (tz !== selectedTz) setSelectedTz(tz);
    }, [userId]);

    useEffect(() => {
        if (!selectedTz) return;
        setCurrentTime(update(selectedTz));
    }, [elapsed, selectedTz]);

    if (!selectedTz) return null;

    return (
        <>
            <div className="vc-tzonprofile-container">
                <div className="vc-tzonprofile-selector">
                    <span style={{ fontSize: settings.store.timeFontSize }} className="vc-tzonprofile-time">
                        <Timestamp timestamp={currentTime} />
                    </span>
                </div>
            </div>
            <div className={cl.dotSpacer}></div>
        </>
    );
};

export function createTimezoneMenuItems(user: User, currentTimezone: string) {
    const hasTimezone = !!currentTimezone;
    const gmtMap = new Map(GMT_ALL_SORTED.map(g => [g.tz, g.label]));
    const intlTzs = Intl.supportedValuesOf("timeZone");
    const remaining = intlTzs.filter(tz => tz !== "UTC" && !gmtMap.has(tz));
    const orderedTimezones = ["None", "UTC", ...GMT_ALL_SORTED.map(g => g.tz), ...remaining];

    function formatTimezoneLabel(tz: string) {
        if (tz === "None" || !tz) return "None";
        if (tz === "UTC") return "UTC (UTC)";
        try {
            const abbrPart = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
                .formatToParts(new Date())
                .find(p => p.type === "timeZoneName")?.value ?? "";
            return `${tz.replace(/_/g, " ")}${abbrPart ? ` (${abbrPart})` : ""}`;
        } catch {
            return tz.replace(/_/g, " ");
        }
    }

    const openSelectModal = () => {
        const modalKey = openModal(props => (
            <ModalRoot {...props} size={ModalSize.SMALL}>
                <ModalHeader>
                    <BaseText tag="h3" size="lg" weight="semibold" style={{ flexGrow: 1 }}>Select Timezone</BaseText>
                    <ModalCloseButton onClick={() => closeModal(modalKey)} />
                </ModalHeader>
                <ModalContent>
                    <div style={{ padding: "4px 0" }}>
                        {(() => {
                            const options = orderedTimezones.map(tz => {
                                if (tz === "None") return { label: "None", value: "" };
                                if (tz === "UTC") return { label: "UTC (UTC)", value: "UTC" };
                                const gmtLabel = gmtMap.get(tz);
                                return { label: gmtLabel || formatTimezoneLabel(tz), value: tz };
                            });
                            const selected = options.find(o => o.value === currentTimezone);
                            return (
                                <SearchableSelect
                                    options={options}
                                    value={selected}
                                    placeholder="Select a timezone"
                                    maxVisibleItems={8}
                                    closeOnSelect={true}
                                    onChange={(optOrValue: any) => {
                                        const v = typeof optOrValue === "string" ? optOrValue : optOrValue?.value ?? "";
                                        try {
                                            setUserTimezone(user.id, v);
                                        } catch (error) {
                                            console.error("[TimezoneOnProfile] Failed to update timezone:", error);
                                        }
                                        closeModal(modalKey);
                                    }}
                                />
                            );
                        })()}
                    </div>
                </ModalContent>
            </ModalRoot>
        ));
    };

    const result = [
        <Menu.MenuItem
            key="set-timezone"
            id={hasTimezone ? "change-timezone" : "set-timezone"}
            label={hasTimezone ? "Change Timezone" : "Set Timezone"}
            action={openSelectModal}
        />
    ];

    if (hasTimezone) {
        result.push(
            <Menu.MenuSeparator key="timezone-separator" />,
            <Menu.MenuItem
                key="remove-timezone"
                id="remove-timezone"
                label="Remove Timezone"
                color="danger"
                action={async () => {
                    try { setUserTimezone(user.id, ""); }
                    catch (e) { console.error("[TimezoneOnProfile] Failed to remove timezone:", e); }
                }}
            />
        );
    }
    return result;
}

export const UserContextMenuPatch: NavContextMenuPatchCallback = (children, { user }: { user: User; }) => {
    if (!user || user.bot) return;
    // don't add context menu entries for the current user
    const self = UserStore.getCurrentUser()?.id;
    if (self && user.id === self) return;

    const group = findGroupChildrenByChildId("close-dm", children) || findGroupChildrenByChildId("block", children) || children;
    if (group) {
        const currentTimezone = getUserTimezone(user.id);
        const timezoneMenuItems = createTimezoneMenuItems(user, currentTimezone);
        group.push(...timezoneMenuItems as any);
    }
};
