import { Registry } from '../../engine/registry';
export declare class DebugUI {
    private ecs;
    private events;
    private scene;
    private entityMap;
    private active;
    private panel;
    private entityPanels;
    constructor(ecs: Registry, events: Phaser.Events.EventEmitter, scene: Phaser.Scene);
    update: () => void;
    drawEntity: (entity: any, components: any, iterator: any) => void;
}
