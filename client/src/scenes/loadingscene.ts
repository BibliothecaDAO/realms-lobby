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

        // Load Characters

        // Load environment assets

        // Load enemies
    }

    create(): void {
        this.cameras.main.setBackgroundColor('#141414') // Set bg to purple while loading
    }
}
