import { IComponent } from '../engine/registry';
export declare class Zone implements IComponent {
    type: string;
    width: number;
    height: number;
    tileMap: any;
    constructor(width: number, height: number, tileMap?: any);
}
