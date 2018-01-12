# Clarify

this project aims to visualize the model written in fact based modelling language CQL. Clarify provides
examples to visualize all three layers in the model (model, composite and element).

## Getting Started
all the dependency has been included in extern folder. no extra dependency is needed.

## Prerequisite
* basic understanding of d3 and d3 force layout
* entry-level javascript proficiency
* a little curiosity and patience


## Examples

### Model View
* for interactivity such as drag, you can do
``` javascript
d3cola.call(d3cola.drag)
```
this very likely the old d3v3 api, for d3v4, the drag has been split into 
three different callbacks, which gives you more fine-grained control, d3cola.drag
gives your good-enough default behaviour. so when you see the d3v3 style of api, don't 
get confused.


#### future work
* it uses static horizontal and vertical constraints, but the horizontal constraints 
can be generated from nodes and links in your javascript with a little hint from the
data itself. for example, the node can be assigned with stage number, and this can be
used to compute the offset we should assign to it.
``` 
{
   "type": "alignment",
   "axis": "x",
   "offsets": [
        {
            "node": "0",
            "offset": x + 200 * stage_number
        },
        {
            "node": "2",
            "offset": x + 400 * stage_number
        },
        ....]
}
```

### Composite View
As mentioned in the source code, composite view resembles the UML diagram in OOP, technically
it has nothing too special about it.

#### future work
All the visual elements that are associated with one node should be put in one group and 
move as one for performance and code clarity. on the other hand, the links should be kept the way 
it is, as group visual elements on links will allowed them to be stretched, when they are
dragged.
```javascript
// will add a g tag for every node placeholder
const group = vis.selectAll(".node").append("g");
 
// will add a text label for every node group
const text = group.append("text");
 
// will add a cricle for every node group
const circle = group.append("circle");
 
//set their relative offset in the group
circle.attr("x", d => d.x);
 
// inside of tick
function tick(){
    //....
    group.attr("transform", callback); // change the coordinates of a view group on the screen
    //....
}
```

### Elemental View
There are two versions of elemental views. elementalView_group.html includes some enhancement than the
vanilla version doesn't have. the biggest idea is to combine the use of boundboxes and running the simulation 
in two passes.
* first run with long linkdistance give the gradient decent full freedom to lay out nodes in its desired position.
* second run with tighted linkdistance, so the boundboxes will acts constraints to make sure elements are perfectly
aligned.

#### future work
split the fact type into multiple node elements, which will give the layout engine a better idea on how to lay out
the graph, and this technique should also reduce the number of "crosses" in the graph.

resolve the crosses of links on the fact types, applying some simple hurestics. something that will work in some cases, 
for example, two objects are crossed over and both of two only connects to one fact type, then "switch the label and 
links" 

another way would be to aim to spread the fact type evenly on both size, left and right. we can use reading of the fact
 type that has the entity type as the first argument or the last arguement, maybe use inequality constraints to layout 
them out. vertical constraints could be too heavy handed and easily run into pathological edge cases. There is definitely a lot of work in this area.

at the moment, the boundboxes for the facts and objects all have the same dimensions but it doesn't have to be. the 
dimension of the object type will automatically adjusts to the length of the label.


### Adding or removing visual elements
There is a common design pattern for dynamically adding and removing visual element from the layout.

```javascript
// called when you click on a visual element in the layout.
function updateData(d){ 
    //... 
    updateView()
}

function updateView(){
    node
    .data(modifiedNodes, unqiueIdentifer).exit().remove();
    const nodeEnter = node.enter().append("rect");
        //.attr(...)
        //.attr(...)
    node.merge(nodeEnter);
    // repeat similar process with link and groups and constraints
    
    d3cola
        .nodes(modifiedNodes)
        .links(modifiedLinks)
        .start();
}
```
You can have as many updateData type functions as you want to perform different visual changes, at the end
of function, updateView() will update the elements in the DOM and then restart the simulation.

### Groups
unlike nodes and links, groups are unique to webcola, it provides a container for several nodes, the api supports
nested nodes as well, it can be either statically defined in the json file or dynamically generated from Javascript.
Here is the format for groups in webcola.

```
{
    nodes: {...}
    links:{...}
    groups:[
    "leaves":[1,2],"groups":[1]
    ...
}
```
for each groups, "leaves" refer to the index of nodes, while groups refer to the index of group list.

```javascript
//groups defined previously
d3cola.groups(groups);
```

### Constraints
There are multiple constraints type in webcola, they are powerful when used correctly. horizontal and vertical
alignment constraints are shown in example modelView.
here is a sample of one
```
constraints:[
...,
{
    "type": "alignment",
    "axis": "y",
    "offsets": [
        {
            "node": "0",
            "offset": "0"
        },
        {
            "node": "1",
            "offset": "0"
        }
    ]
},
...]

```
it will ensure the nodes will have the same y value when they are moved.

future work
* investigate the use of inequality constraints, it is used in webcola internally to implement some of its
features, such as groups and power groups.

### Powergraphs
for powergraphs, the inclusion of group is generated by d3cola. the api for this is a little bit
unusual. the reference of the generated groups and edges are passed to the client through callback.
user can subsequently use these edges and graphs as data for group and links views.
```javascript 
    let powerGraph
    d3cola
     .nodes(nodes)
     .links(links)
     .powerGraphGroups(function (d) {
        powerGraph = d;
     })         
 //now do something with powerGraph.groups, powerGraph.powerEdges
```
since the groups and powerEdges are generated by the model d3cola, they don't need to be passed to the d3cola
like you usually do.

#### PowerGraph adding or removing visual elements
```javascript
function updateView(){
    d3cola._rootGroup = null;
    // ....
}
```
this line remove groups generated by the previous simulation, set it to null forcing the simulation to
regenerate the new data representation of the groups. if it is not set to null after you perform surgery
on the underlying data, the model will reuse the old data representation, which no longer matches the 
current data and crashes. It is a cheap hack, as the rootGroup is private instance variable that is not part of
its public api, but at the moment, there is no clear or rest function on the model.

#### use case
power graph can be used to model multiple disconnected process chain with popups, however at the moment,
it is only what it is good for, it breaks down dealing with non-linear situations.

