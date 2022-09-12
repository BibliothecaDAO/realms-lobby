// sprite - Contains a sprite to display

import { GameObjects } from 'phaser'
import { IComponent } from '../engine/registry'

export class Sprite implements IComponent {
    public type = 'sprite'

    public filename: string // Reference to a filename
    public sprite: GameObjects.Sprite // Reference to an actual phaser sprite

    constructor(filename: string, sprite: GameObjects.Sprite) {
        this.filename = filename
        this.sprite = sprite
    }
}
