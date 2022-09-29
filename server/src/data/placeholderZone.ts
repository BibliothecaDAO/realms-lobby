// Data for the placeholder stuff
// Defines and loads fake components that look blocky (on purpose)

{
    entities: [
        // Base Zone
        {
            components: [
                {
                    type: 'zone',
                    width: 70,
                    height: 50,
                    // paste in tiled file here:
                    tileMap: 'arena.json'
                }
            ]
        },
        // Placeholder players
        {
            base: 'characters/mage',
            components: [
                {
                    type: 'transform',
                    x: 35,
                    y: 25
                }
            ]
        }, 
        {
            base: 'characters/hunter',
            components: [
                {
                    type: 'transform',
                    x: 30,
                    y: 29
                }
            ]
        }, 
        // Environment
        {
            base: 'environment/_resource',
            components: [
                {
                    type: 'transform',
                    x: 3,
                    y: 3
                }
            ]
        },
        {
            base: 'environment/_resource',
            components: [
                {
                    type: 'transform',
                    x: 10,
                    y: 5
                }
            ]
        },
        {
            base: 'environment/_resource',
            components: [
                {
                    type: 'transform',
                    x: 2,
                    y: 19
                }
            ]
        },
        {
            base: 'environment/_resource',
            components: [
                {
                    type: 'transform',
                    x: 5,
                    y: 8
                }
            ]
        },
        // Enemies
        {
            base: 'enemies/_enemy',
            components: [
                {
                    type: 'transform',
                    x: 7,
                    y: 4
                }
            ]
        }
    ]
}
