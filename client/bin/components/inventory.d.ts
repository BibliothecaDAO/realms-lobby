import { IComponent } from '../engine/registry';
export declare class Inventory implements IComponent {
    type: string;
    items: string[];
    constructor(items: Array<string>);
}
