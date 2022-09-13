// gameui.ts - In-game menu overlays for selecting actions / state and toggling settings/debug.

import { State, StateMachine } from '../engine/statemachine'
import { GameObjects } from 'phaser'
import { DEPTH, GRID_SIZE } from '../config'
import { Registry } from '../engine/registry'

// UI Modes
import { MoveButton, SelectButton } from '../ui/modeButtons'

// Inventory
import { InventoryUI } from '../ui/inventoryMenu/inventoryUI'
import { InventoryButton } from '../ui/inventoryMenu/inventoryButton'

// Floating text (e.g. damage numbers)
import { FloatingTextUI } from '../ui/floatingTextUI'

// Debug
import { DebugUI } from '../ui/debugMenu/debugUI'
import { DebugButton } from '../ui/debugMenu/debugButton'
import { DebugCursorUI } from '../ui/debugMenu/debugCursorUI'

export class GameUIScene extends Phaser.Scene {
    // Configuration variables
    public static Name = 'ui-scene'

    // Layers to control the z-axis of our ui
    private menuLayer: GameObjects.Layer
    private charactersLayer: GameObjects.Layer
    private terrainLayer: GameObjects.Layer
    private backgroundLayer: GameObjects.Layer

    // Game objects for our ui elements
    private ui!: GameObjects.Container
    private debugPanel: DebugUI
    private debugCursor: DebugCursorUI
    private inventoryUI: InventoryUI
    private floatingTextUI: FloatingTextUI

    // Game objects for our buttons
    private selectButton: SelectButton
    private moveButton: MoveButton
    private inventoryButton: InventoryButton
    private debugButton: DebugButton

    // Other Systems we need to query
    private worldEvents: Phaser.Events.EventEmitter
    private ecs: Registry

    // State Machine for which UI mode the player is in (Move character / Attack / etc)
    private state: StateMachine
    private States = Object.freeze({
        // States should be immutable
        Select: Symbol('select'),
        Move: Symbol('move'),
        Inventory: Symbol('inventory')
    })

    constructor() {
        super(GameUIScene.Name)
    }

    create(data): void {
        // Pull in ecs so we can access components
        this.ecs = data.ecs

        // Pull in event bus so UI can fire off events
        this.worldEvents = data.events

        // Enable the in-game HUD
        this.createUIContainer()

        // Setup dynamic UI's (that get hidden/shown throughout)
        this.debugPanel = new DebugUI(this.ecs, this.worldEvents, this)
        this.debugCursor = new DebugCursorUI(this.ecs, this.worldEvents, this)
        this.inventoryUI = new InventoryUI(this.ecs, this.worldEvents, this)
        this.floatingTextUI = new FloatingTextUI(this.ecs, this.worldEvents, this)

        // Setup keybinds
        this.input.keyboard.on(
            'keydown-Q',
            () => {
                this.state.transition(this.States.Select)
            },
            this
        )
        this.input.keyboard.on(
            'keydown-W',
            () => {
                this.state.transition(this.States.Move)
            },
            this
        )
        this.input.keyboard.on(
            'keydown-B',
            () => {
                this.inventoryButton.toggleInventory()
            },
            this
        )
        // Reset back to Select when we hit escape
        this.input.keyboard.on(
            'keydown-ESC',
            () => {
                // Prevent the 'enter' function from triggering if we're already on Select
                if (this.state.current != this.States.Select) {
                    this.state.transition(this.States.Select)
                }
            },
            this
        )
    }

    // Update our UI (since they aren't proper systems)
    update(): void {
        this.state.update()
        this.debugPanel.update()
        this.inventoryUI.update()
        this.debugCursor.update()
    }

    createUIContainer = () => {
        // Creates the overarching container that houses the UI
        this.ui = this.add.container()  // For some reason setting the container position first causes it to be anchored on the left side of the screen
        // this.ui.setScale(4, 4)
        this.ui.setPosition(this.cameras.main.width / 2, GRID_SIZE * 2)
        this.ui.setDepth(DEPTH.UI)
    
        // Create the background for our UI
        const numButtons = 4
        const numSpacers = 2
        const width = (numButtons + numSpacers) * GRID_SIZE * 4 // Create space for ~6 buttons (4 buttons + 2 spacers)
        const height = GRID_SIZE * 4
        // x, y are set relative to the UI container
        const bg = this.add.rectangle(0, 0, width, height, 0x000000)

        const buttonSize = GRID_SIZE * 3.5

        // Modes (e.g. select stuff, move around, attack, take an action)
        // Only one mode can be active at a time, managed by a state machine
        this.selectButton = new SelectButton(this, this.States.Select, buttonSize, () => {
            this.state.transition(this.States.Select)
        })

        this.moveButton = new MoveButton(this, this.States.Move, buttonSize, { events: this.worldEvents }, () => {
            this.state.transition(this.States.Move)
        })

        // Utilities (e.g. open inventory)
        // Many utility UI functions can be active at a time
        this.inventoryButton = new InventoryButton(this, null, buttonSize, { events: this.worldEvents }, () => {
            this.inventoryButton.toggleInventory() // Hacky but we pass in a callback inside the function
        })

        this.debugButton = new DebugButton(this, null, buttonSize, { events: this.worldEvents }, () => {
            this.debugButton.toggleDebugGrid() // Hacky but we pass in a callback inside the function
        })

        // Group the UI in a single container so we can toggle it on/off if needed
        this.ui.add([bg, this.selectButton, this.moveButton, this.debugButton, this.inventoryButton])


        // Configure menu state machine to keep track of what's selected
        // Do this at the end to make sure the buttons are available when we call it
        this.state = new StateMachine(this.States.Select, [
            new State(this.States.Select, this.selectButton.enter, null, this.selectButton.exit),
            new State(this.States.Move, this.moveButton.enter, null, this.moveButton.exit)
        ])
    }
}
