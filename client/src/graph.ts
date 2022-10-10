async function main() {

    // build directed straight line of length of crypt
    // get random edges from indexes from seed
    // add branches starting from edges
    const num = 5;
    const seed = 312531178;
    const max_edge_length = 8;

    const buildStraightLine = (start_index, length) => {
        let graph = [];
        for (let i = start_index; i <= length; i++) {
            graph.push({ src_identifier: i, dst_identifier: i + 1, weight: 0 });
        }
        return graph
    }


    const randomIndexes = (seed, graph) => {
        const l = graph.length

        let length = seed % l

        let indexes = [];
        for (let i = 0; i < length; i++) {
            indexes.push(graph[(seed + i * 123456789) % graph.length].src_identifier);
        }
        return indexes;
    }


    const buildBranches = (seed, indexes) => {
        let graph = [];
        for (let i = 0; i < indexes.length; i++) {


            let length = (seed + i * 123456789) % max_edge_length

            // connect to random index
            graph.push({ src_identifier: indexes[i], dst_identifier: indexes[i] * 100, weight: 0 });

            // build branch
            graph.push(buildStraightLine(indexes[i] * 100, (length - 1) + indexes[i] * 100))

            // connect branch to random index - TODO: this is not right
            let connecting_node = (seed + indexes[i] * 123546) % num

            console.log(connecting_node)

            // add connection back to graph
            graph.push({ src_identifier: indexes[i] * 100 + length, dst_identifier: connecting_node, weight: 0 });
        }
        return graph.flatMap(x => x);
    }

    // TODO: add entity creation


    const graph = buildStraightLine(0, num);
    const indexes = randomIndexes(seed, graph);
    const branches = buildBranches(seed, indexes);

    const graph_full = graph.concat(branches);

    const entities = randomIndexes(seed, graph_full);
    console.log('indexes', indexes)
    console.log(graph_full);

    console.log(entities);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });