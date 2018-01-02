let nodes, links;
let node, group, link, label;
const width = 1200,
    height = 800;
const margin = 10;
let nodeWidth = 130; // placeholder, will be changed later

const nodeHeight = 80;
let childNodeWidth = nodeWidth * 0.9;
const childNodeHeight = nodeHeight * 0.9;
const jsonfile = "graphdata/n7e25.json";

const color = d3.scaleOrdinal(d3.schemeCategory20);
const d3cola = cola.d3adaptor(d3);

function makeSVG() {
    const outer = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("pointer-events", "all");

    // define arrow markers for graph links
    outer.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 5)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5L2,0')
        .attr('stroke-width', '0px')
        .attr('fill', '#555');

    const zoomBox = outer.append('rect')
        .attr('class', 'background')
        .attr('width', "100%")
        .attr('height', "100%")
        .attr('fill', 'white');

    return outer.append('g');
}

function customizedNode(node) {
    node.attr("class", "node")
        .attr("width", function (d) {
            return d.width + 2 * margin;
        })
        .attr("height", function (d) {
            return d.height + 2 * margin;
        })
        .attr("rx", 8).attr("ry", 8)
        .attr("fill", function (x) {
            return x.children ? "#7f7f7f" : "#f7b6d2"
        })
        .on("click", nodeClickHandler)
        .call(d3cola.drag);
    node.append("title")
        .text(function (d) {
            return d.name;
        });
    return node
}

function customizedLabel(label) {
    label
        .attr("class", "label")
        .text(function (d) {
            return d.name;
        })
        .call(d3cola.drag)
        .on("click", nodeClickHandler);
    return label
}

function customizedLink(link) {
    link
        .attr("class", "link")
        .attr("stroke", "black");
    return link;
}

function flatten(nodes, all_nodes) {
    nodes.map(function (x) {
        all_nodes.push(x);
        if (x.children !== undefined) {
            flatten(x.children, all_nodes);
        }
    })
}


function customizedGroup(group) {
    group
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("class", "group")
        .each(function (g) {
            g.padding = 20;
        })
        .call(d3cola.drag)
        .style("fill", function (d, i) {
            return color(i);
        });
    return group;
}

function initial_layout() {

    d3cola
        .jaccardLinkLengths(10, 0.5)
        .avoidOverlaps(true)
        .flowLayout("x", 200)
        .size([width, height]);

    const svg = makeSVG();

    d3.json(jsonfile, function (error, graph) {

        /*
        powerGraphGroups is a callback function (hack)
        that allow you capture the references of the generated groups and so-called power edges
         */
        nodes = graph.nodes;

        // find the width for all nodes
        let allNodes = [];
        flatten(nodes, allNodes);
        const temp = svg.selectAll(".temp")
            .data(allNodes)
            .enter().append("text")
            .text(function (x) {
                return x.name
            })
            .attr("class", "label")
            .each(
                function (d) {
                    const textBox = this.getBBox();
                    d.width = textBox.width + 4 * margin;
                });
        temp.data([]).exit().remove();
        nodeWidth = childNodeWidth * 1.1;

        nodes.forEach(
            function (x) {
                x.height = nodeHeight;
            }
        );
        links = graph.links;

        let powerGraph;
        d3cola
            .nodes(nodes)
            .links(links)
            .powerGraphGroups(function (d) {
                powerGraph = d;
            })
            .start(10, 10, 10);

        group = svg.selectAll(".group")
            .data(powerGraph.groups)
            .enter().append("rect");
        customizedGroup(group);


        link = svg.selectAll(".link")
            .data(powerGraph.powerEdges)
            .enter().append("line");
        customizedLink(link);

        node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("rect");

        customizedNode(node);

        label = svg.selectAll(".label")
            .data(nodes)
            .enter().append("text");
        customizedLabel(label);


        d3cola.on("tick", function () {
            node.each(function (d) {
                d.innerBounds = d.bounds.inflate(-margin)
            });
            group.each(function (d) {
                d.innerBounds = d.bounds.inflate(-margin)
            });
            link.each(function (d) {
                d.route = cola.makeEdgeBetween(d.source.innerBounds, d.target.innerBounds, 5);

            });

            link.attr("x1", function (d) {
                return d.route.sourceIntersection.x;
            })
                .attr("y1", function (d) {
                    return d.route.sourceIntersection.y;
                })
                .attr("x2", function (d) {
                    return d.route.arrowStart.x;
                })
                .attr("y2", function (d) {
                    return d.route.arrowStart.y;
                });

            node.attr("x", function (d) {
                return d.innerBounds.x;
            })
                .attr("y", function (d) {
                    return d.innerBounds.y;
                })
                .attr("width", function (d) {
                    return d.innerBounds.width();
                })
                .attr("height", function (d) {
                    return d.innerBounds.height();
                });

            group.attr("x", function (d) {
                return d.innerBounds.x;
            })
                .attr("y", function (d) {
                    return d.innerBounds.y;
                })
                .attr("width", function (d) {
                    return d.innerBounds.width();
                })
                .attr("height", function (d) {
                    return d.innerBounds.height();
                });

            label.attr("x", function (d) {
                return d.x;
            })
                .attr("y", function (d) {
                    const h = this.getBBox().height;
                    return d.y + h / 3.5;
                });
        });

    });
}

function nodeClickHandler(d) {
    if (d.parent_ !== undefined) {
        nodeCollapse(d)

    } else if (d.children !== undefined) {
        nodeExpand(d)
    }
}

function areValueEquivalent(a, b) {
    // Create arrays of property names
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
        return false;
    }

    return aProps.map(function (x) {
        return a[x] === b[x]
    }).reduce(function (y, z) {
        return y + z
    }, 0) === aProps.length;
}

function uniqueInValue(array) {
    return array.filter(function (x, i) {
        return i === array.findIndex(function (y) {
            return areValueEquivalent(x, y)
        })
    })
}


function nodeExpand(d) {
    //remove the node is clicked on

    removeBy(nodes, function (x) {
        return d.name === x.name
    });
    let newNodes = d.children;
    let _width = d.children.map((x) => x.width).reduce(function (x, y) {
        return Math.max(x, y)
    }, 0);

    d.children.forEach(
        function (x) {
            x.width = _width;
            x.height = childNodeHeight;
            x.parent_ = d;
        }
    );
    nodes = nodes.concat(newNodes);
    let sourceLinks = links.filter(function (x) {
        return x.source === d
    });
    let newSourceLinks = sourceLinks.map(
        function (x) {
            return newNodes.map(function (y) {
                return {source: y, target: x.target}
            })
        }
    ).reduce(function (x, y) {
        return x.concat(y)
    }, []);
    //debugger
    let targetLinks = links.filter(function (x) {
        return x.target === d
    });
    let newTargetLinks = targetLinks.map(
        function (x) {
            return newNodes.map(function (y) {
                return {source: x.source, target: y}
            })
        }
    ).reduce(function (x, y) {
        return x.concat(y)
    }, []);
    links = links.filter(function (x) {
        return x.source !== d & x.target !== d
    });
    links = links.concat(newSourceLinks);
    links = links.concat(newTargetLinks);
    nodes.forEach(function (x, i) {
        x.index = i
    });

    updateView()
}

function nodeCollapse(d) {
    const parent = d.parent_;
    const children = nodes.filter(function (x) {
        return x.parent_ === parent
    });
    links.filter(function (x) {
        return children.indexOf(x.source) !== -1
    }).forEach(function (x) {
        x.source = parent
    });
    links.filter(function (x) {
        return children.indexOf(x.target) !== -1
    }).forEach(function (x) {
        x.target = parent
    });
    links = uniqueInValue(links);
    nodes = nodes.filter(function (x) {
        return children.indexOf(x) === -1
    });
    nodes.push(parent);
    nodes.forEach(function (x, i) {
        x.index = i
    });
    //debugger;
    updateView()
}

function removeBy(l, func) {
    return l.splice(l.findIndex(func), 1)
}

function updateView() {
    let powerGraph;
    //debugger
    d3cola._rootGroup = null;
    d3cola
        .nodes(nodes)
        .links(links)
        .powerGraphGroups(function (d) { // only called once
            powerGraph = d;
            powerGraph.groups.forEach(function (g) {
                g.padding = 20;
            })
        });

    //link
    link = link.data(powerGraph.powerEdges, function (x) {
        return x.source.name + "->" + x.target.name
    });
    link.exit().remove();
    const linkEnter = link.enter().insert("line", "rect");
    link = customizedLink(linkEnter).merge(link);

    //group
    // use all the names in the group as an identifier
    group = group.data(powerGraph.groups, function (x) {
        return x.leaves.map(function (y) {
            return y.name;
        }).join('-')
    });
    group.exit().remove();
    const groupEnter = group.enter().insert("rect", "rect.node");
    group = customizedGroup(groupEnter).merge(group);

    //node
    node = node.data(nodes, function (x) {
        return x.name
    });
    node.exit().remove();
    const nodeEnter = node.enter().append("rect");
    node = customizedNode(nodeEnter).merge(node);

    //debugger
    label = label.data(nodes, function (x) {
        return x.name
    });
    label.exit().remove();
    const labelEnter = label.enter().append("text");
    label = customizedLabel(labelEnter).merge(label);
    d3cola.start(10, 10, 10);
}

initial_layout();