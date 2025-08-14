# Requirements Document

## Introduction

The userMessagesTimezones plugin enhances Discord user interaction by allowing users to set and view timezone information for other users. This feature enables users to see the current local time for their contacts, making it easier to coordinate across different time zones. The plugin integrates seamlessly with Discord's existing user interface through context menus and displays timezone information alongside usernames in messages.

## Requirements

### Requirement 1

**User Story:** As a Discord user, I want to set a timezone for another user through a right-click context menu, so that I can track what time it is for them locally.

#### Acceptance Criteria

1. WHEN a user right-clicks on another user's name or avatar THEN the system SHALL display a context menu with a "Set Timezone" option
2. WHEN a user clicks "Set Timezone" THEN the system SHALL display a submenu with all IANA timezone ID options (e.g., "Europe/Berlin", "America/New_York", etc.)
3. WHEN a user selects a timezone from the submenu THEN the system SHALL store this timezone association locally for that specific user
4. IF a timezone is already set for a user THEN the system SHALL show the current timezone selection with a checkmark or indicator
5. WHEN a user selects a different timezone for the same user THEN the system SHALL update the stored timezone association

### Requirement 2

**User Story:** As a Discord user, I want to see the current local time for users who have timezone information set, so that I know what time it is for them without manual calculation.

#### Acceptance Criteria

1. WHEN viewing messages from a user with a set timezone THEN the system SHALL display their current local time next to their username
2. WHEN displaying the time THEN the system SHALL use 24-hour format (HH:MM)
3. WHEN the time changes THEN the system SHALL update the displayed time automatically
4. IF no timezone is set for a user THEN the system SHALL NOT display any time information
5. WHEN a user's timezone data is removed THEN the system SHALL stop displaying time information for that user

### Requirement 3

**User Story:** As a Discord user, I want my timezone settings to persist across Discord sessions, so that I don't have to reconfigure them every time I restart the application.

#### Acceptance Criteria

1. WHEN timezone data is set for a user THEN the system SHALL store this information locally using Vencord's data storage mechanism
2. WHEN Discord is restarted THEN the system SHALL load previously saved timezone associations
3. WHEN timezone data is updated THEN the system SHALL persist the changes immediately
4. IF storage fails THEN the system SHALL handle the error gracefully without crashing
5. WHEN a user is removed from storage THEN the system SHALL clean up associated timezone data

### Requirement 4

**User Story:** As a Discord user, I want to remove timezone information for a user, so that I can clean up outdated or incorrect timezone associations.

#### Acceptance Criteria

1. WHEN a user right-clicks on a user with existing timezone data THEN the system SHALL provide an option to "Remove Timezone"
2. WHEN "Remove Timezone" is selected THEN the system SHALL delete the stored timezone association for that user
3. WHEN timezone data is removed THEN the system SHALL immediately stop displaying time information for that user
4. WHEN timezone data is removed THEN the system SHALL update the context menu to show only "Set Timezone" option

### Requirement 5

**User Story:** As a Discord user, I want the timezone display to integrate seamlessly with Discord's existing UI, so that it feels like a native feature.

#### Acceptance Criteria

1. WHEN displaying time information THEN the system SHALL use Discord's existing styling and color schemes
2. WHEN positioning the time display THEN the system SHALL place it near the username without disrupting message layout
3. WHEN the time display is shown THEN the system SHALL ensure it doesn't interfere with other username decorations or plugins
4. IF other plugins modify username display THEN the system SHALL coexist without conflicts
5. WHEN Discord's UI theme changes THEN the system SHALL adapt the time display styling accordingly
