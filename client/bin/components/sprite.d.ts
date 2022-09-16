import { GameObjects } from 'phaser';
import { IComponent } from '../engine/registry';
export declare class Sprite implements IComponent {
    type: string;
    filename: string;
    sprite: GameObjects.Sprite;
    constructor(filename: string, sprite: GameObjects.Sprite);
}
