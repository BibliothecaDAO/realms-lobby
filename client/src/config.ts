// Global configuration for the game
// Add values that need to be accessed by many classes/scenes

export const DEBUG = false // Used to flip on/off debug values globally
// export const DEBUG = true

export const GRID_SIZE = 64 // How big is the grid for movement? (Note this might be different from the UI tile size)
export const WORLD_SIZE = 2000 // How many tiles across is our world?

// Enums for depth sorting UI elements. Objects are sorted by height from menu (front) to background (back)
export const DEPTH = {
    // States should be immutable
    UI: 4, // Errors, achievements, effects
    Characters: 3, // Characters, monsters, NPCs, etc
    Terrain: 2, // Any scenery like shrubs etc
    Background: 1 // Background titles
    // 0 - Anything not assigned (Default ordering)
}
