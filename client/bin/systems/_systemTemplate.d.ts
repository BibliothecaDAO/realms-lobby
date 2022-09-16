import Phaser from 'phaser';
import { ISystem, Registry } from '../engine/registry';
export declare class TemplateSystem implements ISystem {
    private events;
    private ecs;
    constructor(events: Phaser.Events.EventEmitter, ecs: Registry);
    update: () => void;
}
