Literally Canvas v0.4.14
========================

Literally Canvas is an extensible, open source (BSD-licensed), HTML5 drawing
widget. Its only dependency is [React.js](http://facebook.github.io/react/).

Get help on our mailing list by sending an email to
[literallycanvas+subscribe@googlegroups.com](mailto:literallycanvas+subscribe@googlegroups.com)
or by visiting [Google Groups](https://groups.google.com/forum/#!forum/literallycanvas).

### [Full documentation](http://literallycanvas.com)

### [Examples](http://github.com/literallycanvas/literallycanvas-demos)

Along with the CSS, JS, and image assets, this is all it takes:

```javascript
<div class="my-drawing"></div>
<script>
  LC.init(document.getElementsByClassName('my-drawing')[0]);
</script>
```

Developing
----------

Setup: `npm install --dev`

Watching and serving: `gulp dev`

Browse to `localhost:8080/demo` and modify `demo/index.html` to test code
in progress.

To generate a production-ready `.js` file, run `gulp` and pull out either
`lib/js/literallycanvas.js` or `lib/js/literallycanvas.min.js`.

Pankaj's Updates
----------------
Forked the master branch to use selection box. Here are the list of features and changes:

1. **Movable Toolobx.** Added LCMenu, a movable toolbox for easy drawing on touchpads. The Javascript, CSS and assets are in directory `static/lcmenu`. To see this in action, run `gulp dev` as explained in [Developing](#Developing) section and point your Browser to <http://localhost:8080/demo/lcmenu_demo.html>
2. **Zoom on Pinch.** Disabled event listeners when none of the tools are active -- added methods `addEventListeners` and `removeEventListeners` to file `src/core/LiterallyCanvas.coffee` for use by `LCNoOpTool`. This also required changes in file `src/core/bindEvents.coffee`. Also ignored multi-touch events so that accidental touch by another finger doesn't clobber current  drawing.
3. **Update Selected Shape: change strokeWidth, strokeColor, fillColor. Delete Selected Shape.** The code is mostly outside the core and in the event handlers in LCMenu. The only change is to expose `selectedShape` property in Selection Tool.
4. **Allow Active Text Shape to be saved.** Had to modify the Text Shape so that the user is not surprised by ommission on Save/Submit.
5. **Start Polygon on Single Click.** The existing behavior was non-intuitive.
6. **Scaled SVG Rendering.** This is for preview.
7. **Optimized Rendering of LinePath (Pencil).** The existing behavior was too slow and displayed lag on pencil drawings.

You can see my code changes via [git diff](https://github.com/literallycanvas/literallycanvas/compare/master...pankajku:leetmath_editors).

Although the changes work, they are kind of hackish and rely on the client, especially LCMenu code, knowing internals of the Literally Canvas. Also, the changes might have broken other clients and hence unlikely to be accepted as a pull request.

WOuld also like to see additional functionality such as resizing and rotation of selected shape. More control over text tool, such as font and size selection, would also be helpful.