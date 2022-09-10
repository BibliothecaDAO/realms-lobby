# realms-lobby
Battle other lords in a multiplayer lobby

## Installation
1. clone this repository
2. install dependencies: `yarn`
3. run dev server: `yarn all:dev`
4. visit http://localhost:8080 in your browser


# Tech used


# Architecture: ECS (Entity, Component, Systems)

// ECS Registry - Entity, Component, Syste,
// Entities are an ID (string) that refers to a set of components
// Components contain data (no logic) and are referenced by components.
// Systems contain logic and act on components.
//
// Entities should never contain data or logic
// Components should never contain logic
// Each component and each system should do one thing (and only one thing !) well

# Common Workflows

# Writing multiplayer code