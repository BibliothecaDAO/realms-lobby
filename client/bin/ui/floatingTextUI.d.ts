import { Registry } from '../engine/registry';
export declare type transfer = {
    type: string;
    sender: string;
    recipient: string;
};
export declare class FloatingTextUI {
    private ecs;
    private events;
    private scene;
    private spawnQueue;
    constructor(ecs: Registry, events: Phaser.Events.EventEmitter, scene: Phaser.Scene);
    transferItem: (sender: string, recipient: string, item: string) => void;
    processSpawnQueue: (entity: string) => void;
}
