/* eslint-disable no-unused-labels */

// Data for the placeholder stuff
// Defines and loads fake components that look blocky (on purpose)

{
	entities: [
		// Base Zone
		{
			components: [
				{
					type: 'zone',
					seed: 312531178,
					length: 5,
					// paste in graph data here:
					// TODO - Grab this from starknet
					// graph: [
					// 	[0, 1, 1],
					// 	[1, 2, 1],
					// 	[1, 4, 1],
					// 	[1, 5, 1],
					// 	[2, 3, 1],
					// 	[3, 4, 1],
					// [4, 0, 1], // Finish the graph (loop to exit)
					// ]
				},
			],
		},
		// Environment

		// Enemies
		{
			base: 'enemies/_enemy',
			components: [
				{
					type: 'transform',
					node: 1,
				},
			],
		},
	]
}
