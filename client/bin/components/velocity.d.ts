import { IComponent } from '../engine/registry';
export declare class Velocity implements IComponent {
    type: string;
    speed: number;
    dirX: number;
    dirY: number;
    constructor(speed?: number, dirX?: number, dirY?: number);
}
