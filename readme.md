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
```
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
it is nothing too special about it.

#### future work
All the visual elements that are associated with one node should be put in one group and 
move as one for performance and code clarity. on the other hand, the links should be kept the way 
it is, as group visual elements on links will allowed them to be stretched, when they are
dragged.
````
# will add a g tag for every node placeholder
const group = vis.selectAll(".node").append("g")
 
# will add a text label for every node group
const text = group.append("text")
 
# will add a cricle for every node group
const circle = group.append("circle")
 
# set their relative offset in the group
circle.attr("x", d => d.x)
 
# inside of tick

function tick(){
    ....
    group.attr("transform", callback)
  
    ....
}
````


### Elemental View
There are two versions of elemental views. elementalView_group.html includes some enhancement than the
vanilla version doesn't have. the biggest idea is to combine the use of boundboxes and running the simulation 
in two passes.
* first run with long linkdistance give the gradient decent full freedom to lay out nodes in its desired position.
* second run with tighted linkdistance, so the boundboxes will acts constraints to make sure elements are perfectly
aligned.

#### future work
resolve the crosses of links on the fact types, applying some simple hurestics. something that will work in some cases, for example, two objects are
crossed over and both of two only connects to one fact type, then "switch the label and links" 

another way would be to aim to spread the fact type evenly on both size, left and right. we can use reading of the fact type
that has the entity type as the first argument or the last arguement, maybe use inequality constraints to layout them out.
vertical constraints could be too heavy handed and easily run into pathological edge cases. There is definitely a lot of work in this area.

#### limitation
the boundbox for the facts and objects have to have the same dimensions for the overlay removing algorithm to work
correctly. Which is why for some of the long labels may stick outside of their boxes.


### Adding or removing visual elements




### Groups

### Powergraph

