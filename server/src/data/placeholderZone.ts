// Data for the placeholder stuff
// Defines and loads fake components that look blocky (on purpose)

{
    entities: [
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
        },
        // Base Zone
        {
            components: [
                {
                    type: 'zone',
                    width: 100,
                    height: 100
                }
            ]
        }
    ]
}
