import { Registry } from '../../engine/registry';
export declare class DebugCursorUI {
    private ecs;
    private events;
    private scene;
    private debugCursor;
    constructor(ecs: Registry, events: Phaser.Events.EventEmitter, scene: Phaser.Scene);
    toggleCursor: () => void;
    update: () => void;
}
