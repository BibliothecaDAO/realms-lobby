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
					length: 10,
				},
			],
		},
		// Environment

		// Enemies
		{
			base: 'enemies/skeleton',
			components: [
				{
					type: 'transform',
					node: 1,
				},
			],
		},
	]
}
