// Global configuration for the game
// Add values that need to be accessed by many classes/scenes

import { Types } from 'phaser'

import { LoadingScene } from './scenes'

export const DEBUG = false // Used to flip on/off debug values globally
// export const DEBUG = true

export const GRID_SIZE = 16 // How big is the grid for movement? (Note this might be different from the UI tile size)
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

// Configure phaser w/ default settings
export const gameConfig: Types.Core.GameConfig = {
    // Load up our loading scene then figure out what to do next
    scene: [LoadingScene],
    title: 'crushbone ☠️',
    type: Phaser.WEBGL,
    parent: 'game',
    backgroundColor: '#351f1b',
    scale: {
        mode: Phaser.Scale.ScaleModes.NONE,
        width: window.innerWidth,
        height: window.innerHeight
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    render: {
        // antialiasGL: false,
        // antialias: false,
        pixelArt: true,
        roundPixels:true
    },
    callbacks: {
        postBoot: () => {
            window.sizeChanged()
        }
    },
    canvasStyle: `display: block; width: 100%; height: 100%;`,
    autoFocus: true,
    audio: {
        disableWebAudio: false
    }
}