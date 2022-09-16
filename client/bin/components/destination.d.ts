import { IComponent } from '../engine/registry';
export declare class Destination implements IComponent {
    type: string;
    x: number;
    y: number;
    constructor(x: number, y: number);
}
