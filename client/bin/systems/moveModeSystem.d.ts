import { ISystem, Registry } from '../engine/registry';
import { js as Finder } from 'easystarjs';
import { GameObjects } from 'phaser';
export declare class MoveModeSystem implements ISystem {
    private events;
    private ecs;
    private scene;
    private finder;
    private debugCursor;
    constructor(events: Phaser.Events.EventEmitter, ecs: Registry, scene: Phaser.Scene, finder: Finder);
    update: () => void;
    enableMoveMode: (entity: any) => void;
    disableMoveMode: (entity: any) => void;
    drawPath: (path: any, entity: any) => void;
    destroyPath: (line: GameObjects.Arc[]) => void;
    checkPath: (fromX: integer, fromY: integer, toX: integer, toY: integer, callback: any) => void;
    validateMove: (x: number, y: number) => boolean;
}
