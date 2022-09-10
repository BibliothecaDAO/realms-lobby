// map - A 2D array representing walls/floor

import { GameObjects } from 'phaser'
import { IComponent } from '../engine/registry'

export class Zone implements IComponent {
    public type = 'zone'

    public width: number
    public height: number
    public tiles: Array<Array<number>>
    public tileMap?: Phaser.Tilemaps.Tilemap

    constructor(width: number, height: number, tiles?: Array<Array<number>>) {
        this.width = width
        this.height = height
        this.tiles = tiles
    }
}
