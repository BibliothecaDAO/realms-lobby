/* LoadingScene - Shown between scenes when the game needs to load assets. */

import { GameObjects, Scene } from 'phaser'
import { MapScene } from './mapscene'
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
                this.scene.start(MapScene.Name)
            },
            this
        ) // Pass in this as context so we can call the next scene

        this.load.baseURL = 'assets/'

        // Load Characters
        this.load.image('_character', 'sprites/characters/_character.png')

        // Load environment assets
        this.load.image('_resource', 'sprites/environment/_resource.png')
        // this.load.image('_resource-empty', 'sprites/environment/_resource-empty.png')

        // Load enemies
        this.load.image('_enemy', 'sprites/enemies/_enemy.png')

        // Load world tiles
        this.load.image('lobby-tileset', 'tilemaps/tinydungeon_packed.png')
    }

    create(): void {
        this.cameras.main.setBackgroundColor('#6c3e9c') // Set bg to purple while loading
    }
}
