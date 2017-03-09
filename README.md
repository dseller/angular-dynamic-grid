# angular-dynamic-grid
Angular module for rendering dynamic grids like Visio

## Introduction

While designing a drag & drop powered designer for a project, the need for user friendly alignment arose. In my opinion, Visio has a great way of doing this. Therefore, I created this angular module. It still requires a great deal of work, but I figured I'd make it open source from the beginning.

## Requirements

* Angular 1.5.x

## Usage

The library consists of 1 component. Below, you can find an example of using it. I personally use [angular-dragdrop](https://github.com/codef0rmer/angular-dragdrop) to move the foreground object.

These are the bindings:
* __active__: Whether the component should render the guide lines
* __objects__: An array with the objects in the grid. Should be of format ```{ x: 0, y: 0, w: 0, h: 0 }```
* __debug__: Boolean which can be used (de)activate the rendering of debug elements
* __fg-obj__: The position and size of the foreground object (the item you drag). Of format ```{ x: 0, y: 0, w: 0, h: 0 }```
* __margin__: The margin, in pixels, the component will take into account when calculating whether two objects are aligned
* __bg-image__: Path to the background image. *Note: in the future this will probably no longer be an image, but rather, a template*

__Please note that the contents between the starting and closing tag of dynamic-grid-container are transcluded into the resulting container!__

```html
<dynamic-grid-container active="isDragging" 
                        objects="objects" 
                        debug="debug" 
                        fg-obj="fgObj" 
                        margin="5" 
                        bg-image="'bg.png'">
    <img src="fg.png" 
         style="position:absolute; cursor: move; z-index: 10000;"
         data-drag="true"
         data-jqyoui-options="{containment: '.dynamic-grid-container'}"
         jqyoui-draggable="{onDrag: 'ctrlDrag(item)', onStop: 'ctrlDrop(item)'}"/>
</dynamic-grid-container>
```