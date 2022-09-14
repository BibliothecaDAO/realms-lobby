// Button - Generic button that displays text and has a hover state and click events.

import { GameObjects } from 'phaser'

export class Button extends Phaser.GameObjects.Container {
    // Track button state
    protected selected = false

    // Options
    private unique = false // Does clicking on this button toggle itself off? (commonly used in state machines)

    // UI elements that make up the button
    private buttonBg: GameObjects.Rectangle
    private buttonText: Phaser.GameObjects.Text
    private button: Phaser.GameObjects.Container

    // Configuration variables
    private fontSize = 48 // 12pt

    // Style the buttons
    private styles = {
        selected: {
            bg: 0xffffff,
            color: '#000',
        },
        unselected: {
            bg: 0x000000,
            color: '#fff'
        },
        hover: {
            bg: 0x333333
        }
    }

    constructor(
        scene: Phaser.Scene,
        name: symbol,
        x: integer,
        y: integer,
        width: integer,
        height: integer,
        text: string,
        options, // unique: true/false - Set to true if this button is part of a statemachine and you don't want it to trigger other buttons
        //  rotation: int in radians - How much should we rotate the text when displaying it
        callback
    ) {
        super(scene, x, y)

        // Add a background
        this.buttonBg = scene.add.rectangle(
            0,
            0,
            width,
            height,
            this.styles.unselected.bg // Button is not selected by default
        )

        // Add the button text
        this.buttonText = scene.add
            .text(
                0,
                0,
                text,
                this.styles.unselected // Button is not selected by default
            )
            .setFontSize(this.fontSize)
        this.buttonText.setOrigin(0.5) // Center text within container

        // Assign the text/backgorund to the container (this object)
        this.button = this.add([this.buttonBg, this.buttonText])

        // Make the button interactive
        this.button.setSize(width, height) // Required to set interactive - otherwise it won't emit events: https://snowbillr.github.io/blog/2018-07-03-buttons-in-phaser-3/
        this.button.setInteractive({ useHandCursor: true }) // Let the button respond to clicks

        // Handle options (if they exist)
        if (options) {
            if (options.rotation) {
                this.buttonText.rotation = options.rotation
            }
            if (options.unique) {
                this.unique = options.unique
            }
        }

        // Add Listeners
        // Handle hover states
        this.button.on('pointerover', () => {
            if (!this.selected) {
                this.buttonBg.fillColor = this.styles.hover.bg
            }
        })

        this.button.on('pointerout', () => {
            if (!this.selected) {
                this.buttonBg.fillColor = this.styles.unselected.bg
            }
        })

        // Handle clicks
        this.button.on('pointerup', () => {
            callback() // Call whatever handler has been passed through
        })
    }

    // Turns the button between 'selected' and 'deselected' state (update visuals)
    public toggleSelected = () => {
        this.selected = !this.selected

        if (this.selected) {
            this.buttonBg.fillColor = this.styles.selected.bg
            this.buttonText.setColor(this.styles.selected.color)
        } else {
            this.buttonBg.fillColor = this.styles.unselected.bg
            this.buttonText.setColor(this.styles.unselected.color)
        }
    }
}
