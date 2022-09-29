// index.js - Entry point to the game. Coordinates loading phaser/libraries, passing in configs, and instantiating the game.
//
// 1. Defines configuration values for the game
// 2. Instantiates the world (world map, characters, enemies, etc)
// 3. Pre-loads scenes
// 4. Launches initial scene

// Load Phaser config data
import { gameConfig } from './config'

// Load phaser base classes
import { World } from './engine/world'

// Load our scenes (each scene defines a mode of gameplay)
import { GraphScene } from './scenes/graphscene'

export default class Game extends Phaser.Game {
    public world: World // The current instance of the game world

    constructor(config) {
        super(config)

        // Instantiate our world and populate it with initial data
        this.world = new World()

        // Start loading scenes in background (but we kick off LoadingScreen)
        this.scene.add(GraphScene.Name, GraphScene, false, { ecs: this.world.ecs, world: this.world, events: this.world.events })
        // this.scene.add(MapScene.Name, MapScene, false, { ecs: this.world.ecs, world: this.world, events: this.world.events }) // TODO: Race condition where player isn't available yet
    }
}

// sizeChanged - Adjust window size when the user resizes the browser
window.sizeChanged = () => {
    if (window.game.isBooted) {
        setTimeout(() => {
            window.game.scale.resize(window.innerWidth, window.innerHeight)
            window.game.canvas.setAttribute('style', `display: block; width: ${window.innerWidth}px; height: ${window.innerHeight}px;`)
        }, 100)
    }
}
window.onresize = () => window.sizeChanged()

window.onload = () => {
    const game = new Game(gameConfig)
}
