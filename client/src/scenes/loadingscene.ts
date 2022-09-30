/* LoadingScene - Shown between scenes when the game needs to load assets. */

import { GameObjects, Scene } from 'phaser'
import { GraphScene } from './graphscene'
// import logo from ''
export class LoadingScene extends Scene {
    public static Name = 'loading-scene'
    private logo!: GameObjects.Sprite

    constructor() {
        super(LoadingScene.Name)
        // TODO - Setup a base scene w/ just logo and loading progress bar then jump to this scene to load the rest of assets
    }

    preload(): void {
        // Once loading is complete, call the next scene
        this.load.on(
            'complete',
            function () {
                this.scene.start(GraphScene.Name)
            },
            this
        ) // Pass in this as context so we can call the next scene

        this.load.baseURL = 'assets/'

        // Load character

        // Load items
        this.load.image('sword', 'sprites/items/sword.png')
        this.load.image('chest', 'sprites/items/chest.png')
        this.load.image('helm', 'sprites/items/helm.png')
        this.load.image('belt', 'sprites/items/belt.png')
        this.load.image('boots', 'sprites/items/boots.png')
        this.load.image('gloves', 'sprites/items/gloves.png')
        this.load.image('amulet', 'sprites/items/amulet.png')
        this.load.image('ring', 'sprites/items/ring.png')

        // Load enemies
    }

    create(): void {
        this.cameras.main.setBackgroundColor('#141414') // Set bg to purple while loading
    }
}
