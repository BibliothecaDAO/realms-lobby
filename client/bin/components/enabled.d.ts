import { IComponent } from '../engine/registry';
export declare class Enabled implements IComponent {
    type: string;
    active: boolean;
    constructor(active: boolean);
}
