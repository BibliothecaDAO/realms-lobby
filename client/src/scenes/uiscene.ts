// gameui.ts - In-game menu overlays for selecting actions / state and toggling settings/debug.

import { State, StateMachine } from '../engine/statemachine'
import { GameObjects } from 'phaser'
import { DEPTH, COLORS } from '../config'
import { Registry } from '../engine/registry'

// Floating text (e.g. damage numbers)
import { FloatingTextUI } from '../ui/floatingTextUI'
import { Button } from '../ui/button'

export class GameUIScene extends Phaser.Scene {
	// Configuration variables
	public static Name = 'ui-scene'

	// Game objects for our ui elements
	private headline: GameObjects.Text
	private adventurer: GameObjects.Container
	private roomPanel: GameObjects.Container
	private itemButtons: Array<GameObjects.Rectangle> = []
	private items: Array<string> = [
		'sword',
		'chest',
		'helm',
		'belt',
		'boots',
		'gloves',
		'amulet',
		'ring',
	]

	// private actionButtons: Array<GameObjects> = []

	private floatingTextUI: FloatingTextUI

	// Game objects for our buttons

	// Other Systems we need to query
	private worldEvents: Phaser.Events.EventEmitter
	private ecs: Registry

	constructor() {
		super(GameUIScene.Name)
	}

	create(data): void {
		// Pull in ecs so we can access components
		this.ecs = data.ecs

		// Pull in event bus so UI can fire off events
		this.worldEvents = data.events

		// Add a background so the map doesn't scroll under the UI
		this.drawBackground()

		// Headline text 'danger awaits'
		this.drawHeadline()

		// Adventurer + Inventory
		this.drawAdventurer()

		// Room Description w/ actions
		this.drawRoom()

		// Setup dynamic UI's (that get hidden/shown throughout)
		this.floatingTextUI = new FloatingTextUI(this.ecs, this.worldEvents, this)

		// Setup keybinds
	}

	// Update our UI (since they aren't proper systems)
	update(): void {
		//
	}

	drawBackground(): void {
		const xOffset = 0.44

		const background = this.add.rectangle(
			0,
			0,
			this.cameras.main.width * xOffset,
			this.cameras.main.height,
			COLORS.bg.hex
		)
		background.setOrigin(0, 0)
	}

	// Headline text 'danger awaits'
	drawHeadline = (): void => {
		this.headline = this.add
			.text(
				this.cameras.main.centerX,
				this.cameras.main.height * 0.1,
				'Danger Awaits',
				{
					fontSize: '32px',
					color: COLORS.primary.toString(),
				}
			)
			.setOrigin(0.5)
	}

	drawAdventurer = (): void => {
		// Adventurer and inventory

		// Draw Adventurer bg panel
		// TODO - Replace stub data w/ real data via ECS
		// x/y are a percentage of the screen (remember that 0,0 is center, not top left)
		const xOffset = 0.3
		const yOffset = 0.4

		// Width is a percentage of the screen
		const width = 0.18
		const height = 0.4
		this.adventurer = this.add.container(
			this.cameras.main.centerX * xOffset,
			this.cameras.main.height * yOffset
		)
		const adventurerPanel = this.add.rectangle(
			0,
			0,
			this.cameras.main.width * width,
			this.cameras.main.height * height,
			COLORS.primary.hex
		)
		this.adventurer.add(adventurerPanel)

		// Draw Adventurer text (TBD)
		const adventurerText = this.add
			.text(0, 0, 'adventurer equipment and statistics', {
				align: 'center',
				fontSize: '16px',
				color: COLORS.bg.toString(),
			})
			.setOrigin(0.5)
		// Wrap text so that it fits within our container nicely
		adventurerText.setStyle({ wordWrap: { width: adventurerPanel.width } })
		this.adventurer.add(adventurerText)

		// Draw Items
		const itemsPerRow = 3

		// We'll use the scene width so we resize based on size of screen
		// We want the boxes to be square so we don't need a separate height variable
		const itemSize = this.cameras.main.width * 0.0535
		const itemPadding = this.cameras.main.width * 0.01

		for (let i = 0; i < this.items.length; i++) {
			// Calculate how many rows we need
			const row = Math.floor(i / (this.items.length / itemsPerRow))
			const rowPosition = Math.floor(i % (this.items.length / itemsPerRow))

			// Align with the left side of our adventurer
			let x = -adventurerPanel.width / 2 + itemSize / 2
			// Determine our position in the row
			x += rowPosition * itemSize
			// Add padding between items if needed
			x += rowPosition * itemPadding

			// Add one row of padding between adventurer and our items
			let y = adventurerPanel.height / 2 + itemSize / 2 + itemPadding
			// Determine which row we're in
			y += row * itemSize
			// Add padding between rows if needed
			y += row * itemPadding

			const itemPanel = this.add.rectangle(
				x,
				y,
				itemSize,
				itemSize,
				COLORS.primary.hex
			)
			// Keep track of our array so we can place items in them
			this.itemButtons.push(itemPanel) // Keep track of our array
			const sword = this.add
				.sprite(itemPanel.x, itemPanel.y, this.items[i])
				.setScale(3.5)
			this.adventurer.add(itemPanel)
			this.adventurer.add(sword)
		}
	}

	drawRoom = (): void => {
		// Room description and actions

		// Draw Room bg panel
		// TODO - Replace stub data w/ real data via ECS
		// x/y are a percentage of the screen (remember that 0,0 is center, not top left)
		const xOffset = 0.7
		const yOffset = 0.5

		// Width is a percentage of the screen
		const width = 0.18
		const height = 0.6

		this.roomPanel = this.add.container(
			this.cameras.main.centerX * xOffset,
			this.cameras.main.height * yOffset
		)
		const roomBg = this.add
			.rectangle(
				0,
				0,
				this.cameras.main.width * width,
				this.cameras.main.height * height,
				COLORS.bg.hex,
				0
			)
			.setStrokeStyle(2, COLORS.primary.hex)
		this.roomPanel.add(roomBg)

		// Room Headline (Room #)
		const roomHeadline = this.add.text(
			-roomBg.width / 2.5,
			-roomBg.height / 2.2,
			'Room 0',
			{
				fontSize: '20px',
				color: COLORS.primary.toString(),
			}
		)
		this.roomPanel.add(roomHeadline)

		// Draw Room Text (gen from GPT3)
		const roomContent =
			'You find yourself wading through mud. It\'s dark, musty....\n\nThen you come across a chest!'
		const roomText = this.add
			.text(0, 0, roomContent, {
				align: 'left',
				fontSize: '14px',
				color: COLORS.primary.toString(),
			})
			.setOrigin(0.5)
			.setPadding(8, 0, 0, 0)

		// Wrap text so that it fits within our container nicely
		roomText.setStyle({ wordWrap: { width: roomBg.width } })
		this.roomPanel.add(roomText)

		// Room Buttons (Actions)]
		// TODO - Dynamically populate action buttons based on adjacent graph nodes

		const buttonWidth = this.cameras.main.width * 0.1
		const buttonHeight = this.cameras.main.height * 0.03

		const buttonPadding = this.cameras.main.height * 0.03
		const actionButton1 = new Button(
			this,
			'action1',
			-this.cameras.main.width * 0.03,
			this.cameras.main.height * 0.1,
			buttonWidth,
			buttonHeight,
			'Q - Open It'
		)
		const actionButton2 = new Button(
			this,
			'action2',
			-this.cameras.main.width * 0.03,
			actionButton1.y + actionButton1.height / 2 + buttonPadding,
			buttonWidth,
			buttonHeight,
			'W - Move to room 1'
		)
		const actionButton3 = new Button(
			this,
			'action3',
			-this.cameras.main.width * 0.03,
			actionButton2.y + actionButton2.height / 2 + buttonPadding,
			buttonWidth,
			buttonHeight,
			'Z - Use escape rope'
		)
		this.roomPanel.add([actionButton1, actionButton2, actionButton3])
	}
}
