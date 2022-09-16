import { Registry } from '../engine/registry';
export declare class MapScene extends Phaser.Scene {
    static Name: string;
    events: Phaser.Events.EventEmitter;
    ecs: Registry;
    constructor();
    preload(): void;
    create(data: any): void;
    update(): void;
    initPlayer: (entity: string) => void;
    initCamera: (entity: any) => void;
}
