export declare class GameUIScene extends Phaser.Scene {
    static Name: string;
    private menuLayer;
    private charactersLayer;
    private terrainLayer;
    private backgroundLayer;
    private ui;
    private debugPanel;
    private debugCursor;
    private inventoryUI;
    private floatingTextUI;
    private selectButton;
    private moveButton;
    private inventoryButton;
    private debugButton;
    private worldEvents;
    private ecs;
    private state;
    private States;
    constructor();
    create(data: any): void;
    update(): void;
    createUIContainer: () => void;
}
