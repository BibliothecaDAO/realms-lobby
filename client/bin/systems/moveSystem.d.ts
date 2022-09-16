import { ISystem, Registry } from '../engine/registry';
export declare class MoveSystem implements ISystem {
    private events;
    private ecs;
    constructor(events: Phaser.Events.EventEmitter, ecs: Registry);
    update: () => void;
    validMove: (entity: any, x: any, y: any) => void;
}
