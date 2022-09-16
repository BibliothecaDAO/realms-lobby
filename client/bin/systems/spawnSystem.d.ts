import { ISystem } from '../engine/registry';
import { Registry } from '../engine/registry';
export declare class SpawnSystem implements ISystem {
    private events;
    private ecs;
    private scene;
    constructor(events: Phaser.Events.EventEmitter, ecs: Registry, scene: Phaser.Scene);
    update: () => void;
    handleSpawn: (entity: string, components: any) => void;
    handleDespawn: (entity: string) => void;
}
