import { GameObjects } from 'phaser';
import { Sprite } from '../../components/sprite';
import { Registry } from '../../engine/registry';
export declare class InventoryUI {
    private ecs;
    private events;
    private scene;
    widthMultiplier: number;
    heightMultiplier: number;
    itemSpacer: number;
    itemsPerRow: number;
    inventoryContainer: GameObjects.Container;
    inventoryBg: GameObjects.Rectangle;
    hoverCursor: GameObjects.Rectangle;
    inventoryItems: Array<GameObjects.Sprite>;
    constructor(ecs: Registry, events: Phaser.Events.EventEmitter, scene: Phaser.Scene);
    update: () => void;
    enableInventoryView: () => void;
    disableInventoryView: () => void;
    updateInventory: (items: any) => void;
    drawItem: (sprite: Sprite, index: number) => GameObjects.Sprite;
    enableHover: (sprite: GameObjects.Sprite) => void;
    sortSprites: (entities: Array<string>) => string[];
}
