import { IComponent } from '../engine/registry';
export declare class Transform implements IComponent {
    type: string;
    x: integer;
    y: integer;
    constructor(x: integer, y: integer);
}
