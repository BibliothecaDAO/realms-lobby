import { IComponent } from '../engine/registry';
import { GameObjects } from 'phaser';
export declare class MoveMode implements IComponent {
    type: string;
    line: GameObjects.Arc[];
    lastX: integer;
    lastY: integer;
}
