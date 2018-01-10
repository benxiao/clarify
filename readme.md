# Clarify

this project aims to visualize the model written in fact based modelling language CQL. Clarify provides
examples to visualize all three layers in the model (model, composite and element).



## Getting Started
all the dependency has been included in extern folder. no extra dependency is needed.

## Prerequisite
* basic understanding of d3 force layout
* entry-level javascript proficiency
* a lot of curiosity and patience


## Examples

### Model View

* for interactivity such as drag, you can do
```
d3cola.call(d3cola.drag)
```
this very likely the old d3v3 api, for d3v4, the drag has been split into 
three different callbacks, which gives you more fine-grained control, d3cola.drag
gives your good-enough default behaviour.


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
```
# will add a g tag for every node placeholder
const group = vis.selectAll(".node").append("g")
 
# will add a text label for every node group
const text = group.append("text")
 
# will add a cricle for every node group
const circle = group.append("circle")
 
# set their relative offset in the group
circle.attr("x", d => d.x)
 
# inside of tick

{
    

}
```

### Elemental View

### Adding or removing visual elements

### Groups

### Powergraph

