import { GameObjects } from 'phaser';
import { ISystem, Registry } from '../engine/registry';
export declare class AttachToCursorSystem implements ISystem {
    events: Phaser.Events.EventEmitter;
    ecs: Registry;
    scene: Phaser.Scene;
    entity: string;
    private status;
    private States;
    constructor(events: Phaser.Events.EventEmitter, ecs: Registry, scene: Phaser.Scene);
    startFollow: () => void;
    update: () => void;
    stopFollow: () => void;
    createCursor: (playerEntity: string) => void;
    configureSprite: (filename: any) => GameObjects.Sprite;
    checkCollision: (entity: any) => boolean;
}
