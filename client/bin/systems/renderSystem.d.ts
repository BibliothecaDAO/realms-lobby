import { ISystem, Registry } from '../engine/registry';
export declare class RenderSystem implements ISystem {
    events: Phaser.Events.EventEmitter;
    private ecs;
    constructor(events: Phaser.Events.EventEmitter, ecs: Registry);
    update: () => void;
}
