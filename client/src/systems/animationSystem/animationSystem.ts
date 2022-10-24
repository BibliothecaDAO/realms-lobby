// Animations -

import { ISystem, Registry } from '../../engine/registry'

// Components
import { Sprite } from '../../components/sprite'
import { getLocation } from '../utils/getLocation'
import { Graph } from '../../components/graph'
import { ActionQueue } from '../../engine/actionQueue'

// Animations
import { MoveAnimation } from './actions/moveAnimation'
import { OpenDoorAnimation } from './actions/openDoorAnimation'
import { RevealAnimation } from './actions/revealAnimation'
import { CombatAnimation } from './actions/combatAnimation'

export class AnimationSystem implements ISystem {
	private ecs: Registry
	private events: Phaser.Events.EventEmitter
	private scene: Phaser.Scene
	private actions: ActionQueue

	private graph: Graph

	constructor(
		events: Phaser.Events.EventEmitter,
		ecs: Registry,
		scene: Phaser.Scene,
		actions: ActionQueue
	) {
		this.ecs = ecs
		this.events = events
		this.scene = scene
		this.actions = actions

		// Event Listeners
		this.events.on('spawnZone', this.setupGraph)
		this.events.on('moveAttempt', this.handleMove)
		this.events.on('combat', this.handleCombat)
	}

	// Event listeners
	setupGraph = (entity: string) => {
		try {
			this.graph = this.ecs.getComponent(entity, 'graph') as Graph
		} catch (e) {
			console.error(e)
		}
	}

	// Player moves to a new node
	handleMove = (entity: string, src: number, dst: number): void => {
		try {
			const sprite = (this.ecs.getComponent(entity, 'sprite') as Sprite).sprite

			// Kick off (slow) move tween
			if (sprite != undefined && src != undefined && dst != undefined) {
				// Determine which direction to move
				const startLocation: Phaser.Math.Vector2 = getLocation(src, this.graph)
				const endLocation: Phaser.Math.Vector2 = getLocation(dst, this.graph)

				// Calculate direction from current sprite to destination
				// Get a vector direction from -1 to 1 (returns a float)
				const directionVector = new Phaser.Math.Vector2(
					startLocation.x - endLocation.x,
					startLocation.y - endLocation.y
				).normalize()

				// Round the vector to the nearest int (-1, 0, 1) which gives us a direction we can multiply by
				const direction = new Phaser.Math.Vector2(
					Math.round(directionVector.x),
					Math.round(directionVector.y)
				)

				// Calculate stopping point ~2 characters from the destination
				// Character will stop here and perform any necessary actions before traveling to the node
				const actionLocation = new Phaser.Math.Vector2(
					endLocation.x + direction.x * 2.5 * sprite.width,
					endLocation.y + direction.y * 2.5 * sprite.height
				)

				// Start moving the player to the destination
				// this.actions.add(
				// 	new MoveAnimation(sprite, startLocation, actionLocation)
				// )
				// Await the next event (e.g. combat)
				// HACK
				this.events.emit('combat', entity, dst, 'skeleton')
			}
		} catch (e) {
			console.error(e)
		}
	}

	// Plays the reveal -> Combat animation then moves the player to their destination
	handleCombat = (entity: string, node: number, enemyName: string) => {
		if (node != undefined) {
			// Keep track of our door
			let doorSprite: Sprite
			let doorEntity: string

			// Grab sprite at that node location
			// Get all entities at that location
			const entitiesAtLocation = this.ecs.locationFilter(node)

			for (let i = 0; i < entitiesAtLocation.length; i++) {
				// only grab a door sprite (not a player, enemy, etc)
				const sprite = this.ecs.getComponent(
					entitiesAtLocation[i],
					'sprite'
				) as Sprite

				if (
					sprite &&
					sprite.sprite &&
					sprite.sprite.texture &&
					sprite.sprite.texture.key == 'door'
				) {
					doorSprite = sprite
					doorEntity = entitiesAtLocation[i]
					break
				}
			}

			// Spawn enemy (it will use our existing door entity)
			// Enemy will start invisible

			const enemySprite = this.scene.add
				.sprite(doorSprite.sprite.x, doorSprite.sprite.y, enemyName)
				.setScale(4)
				.setAlpha(0)
			const enemyComponent = new Sprite(enemyName, enemySprite)

			// Open the door
			this.actions.add(new OpenDoorAnimation(doorSprite, doorEntity, this.ecs))

			const enemy = doorEntity // For convenience, this is now an enemy entity :D

			// Reveal enemy at the door
			this.actions.add(new RevealAnimation(enemy, enemyComponent, this.ecs))

			// Combat happens here !
			// Get player's sprite
			const sprite = this.ecs.getComponent(entity, 'sprite') as Sprite
			this.actions.add(
				new CombatAnimation(entity, sprite, enemy, enemyComponent, this.events)
			)

			// // Move the player fo the final destination
			// const playerLocation = new Phaser.Math.Vector2(sprite.x, sprite.y)

			// const finishMove = this.actions.add(
			// 	new MoveAnimation(sprite, playerLocation, getLocation(node, this.graph))
			// )
		}
	}

	update = () => {
		//
	}

	// Helper funftions
}
