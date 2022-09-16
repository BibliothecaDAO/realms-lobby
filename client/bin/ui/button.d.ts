export declare class Button extends Phaser.GameObjects.Container {
    protected selected: boolean;
    private unique;
    private buttonBg;
    private buttonText;
    private button;
    private fontSize;
    private styles;
    constructor(scene: Phaser.Scene, name: symbol, x: integer, y: integer, width: integer, height: integer, text: string, options: any, // unique: true/false - Set to true if this button is part of a statemachine and you don't want it to trigger other buttons
    callback: any);
    toggleSelected: () => void;
}
