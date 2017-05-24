var LCNoOpTool = function(lc) {  // take lc as constructor arg
  var self = this;

  return {
    usesSimpleAPI: false,  // DO NOT FORGET THIS!!!
    name: 'MyTool',

    didBecomeActive: function(lc) {
		lc.removeEventListeners();
    },

    willBecomeInactive: function(lc) {
 		lc.addEventListeners();
    }
  }
};
LCMenu = {
	tools: {},
	setDefaults: function(options){
		options = options || {}
		options.previewScale = options.previewScale || 0.25;
		options.previewBackgroundColor = options.previewBackgroundColor || '#ccffcc';
		return options;
	},
	initMenuElems: function(menu, $body){
		menu.$lcMenu = $('#lc-menu');
		menu.$lcmTab = $('<div id="lcm-tab"><div id="tools-span"><img src="/static/lcmenu/images/drag.png"/>&nbsp;<span style="position:relative;top:-6px;">Tools</span></div></div>');
		menu.$lcMenu.append(menu.$lcmTab);
		menu.$lcMenu.draggable();
		menu.$lcmTab.parent().append($body);
		menu.shown = false;
		menu.$selIconElem = null;
		menu.$lcmTab.click($.proxy(function( ev ){
			if (this.shown){ 
				$body.css({display: 'none'});
				this.shown = false;
			} else { 
				$body.css({top: (this.$lcmTab.position().top + this.$lcmTab.height()), left: this.$lcmTab.position().left});
				$body.css({display: 'block'});
				this.shown = true;
			}
		}, menu));
	},
	initBody: function(menu, $body, lc, options){
		var previewScale = options.previewScale;
		var previewBGColor = options.previewBackgroundColor;
		$('#preview-area', $body).css({width: $('#page').width()*previewScale, height: $('#page').height()*previewScale});
		$('#undo-tool', $body).click(function(){ lc.undo(); });
		$('#redo-tool', $body).click(function(){ lc.redo(); });
		$('#preview-tool', $body).click(function(){ 
			var $preview = $('#preview-area');
			if ($preview.css('display') == 'none'){
				if (menu.tools['text'].active){
					menu.tools['text'].commit(lc);
				}
				function updatePreview(){
					$preview[0].innerHTML = lc.getSVGString({version: 2, scale: previewScale, backgroundColor: previewBGColor});
				}
				updatePreview();
				lc.on('drawingChange', updatePreview);
				$preview.css('display', 'block');
				$(this).addClass('selected');
			} else {
				$preview.css('display', 'none');
				lc.on('drawingChange', function(){});
				$(this).removeClass('selected');
			}
		});
		$('#clear-tool', $body).click(function(){ lc.clear(); });

		LCMenu.tools = menu.tools = {
			pencil: new LC.tools.Pencil(lc),
			line: new LC.tools.Line(lc),
			eraser: new LC.tools.Eraser(lc),
			text: new LC.tools.Text(lc),
			rectangle: new LC.tools.Rectangle(lc),
			ellipse: new LC.tools.Ellipse(lc),
			polygon: new LC.tools.Polygon(lc),
			select: new LC.tools.SelectShape(lc),
		}
		noopTool = LCNoOpTool(lc);
		for (tool in menu.tools){
			$('#' + tool + '-tool', $body).click(function(){
				var tool = this.id.split('-')[0];
				if (menu.$selIconElem && menu.$selIconElem.attr('id') == this.id){
					lc.setTool(noopTool); // the default tool
					lc.repaintLayer('main');
					menu.$selIconElem.removeClass('selected');
					menu.$selIconElem = null;
				} else {
					lc.setTool(menu.tools[tool]); 
					if (menu.$selIconElem){
						menu.$selIconElem.removeClass('selected');
					}
					menu.$selIconElem = $(this);
					menu.$selIconElem.addClass('selected');
				}
			});
		}
		$('#delete-tool', $body).click(function(){ 
			if (menu.$selIconElem && menu.tools['select'].selectedShape){
				selShape = menu.tools['select'].selectedShape;
				menu.tools['select'].willBecomeInactive(lc);
				lc.repaintLayer('main');
				lc.setTool(noopTool); // the default tool
				menu.$selIconElem.removeClass('selected');
				menu.$selIconElem = null;
				lc.clearShape(selShape);
			} else {
				alert('No Selection!');
			}
		});
		var type = 'primary';
		$('.color-tool', $body).click(function(){ 
			var $cpicker = $('#color-picker');
			if ($cpicker.css('display') == 'none'){
				type = (this.id == 'fcolor-tool' ? 'secondary' : 'primary');
				$cpicker.css('display', 'block');
			} else {
				$cpicker.css('display', 'none');
			}
		});
		$('#shapes-tool', $body).click(function(){ 
			var $spicker = $('#shape-picker');
			if ($spicker.css('display') == 'none'){
				$spicker.css('display', 'block');
			} else {
				$spicker.css('display', 'none');
			}
		});
		$('#swidth-tool', $body).click(function(){ 
			var $spicker = $('#size-picker');
			if ($spicker.css('display') == 'none'){
				$spicker.css('display', 'block');
			} else {
				$spicker.css('display', 'none');
			}
		});
		function updatePoints(points, attr, value){
			for (var i = 0; i < points.length; i++){
				points[i][attr] = value;
			}
		}
		$('#color-picker .tool-icon', $body).click(function(ev){
			var color = this.id.split('-')[1];
			lc.setColor(type, color);
			var $cpicker = $('#color-picker', $body);
			$cpicker.css('display', 'none');
			$coloredLayerElem = (type == 'primary' ? $('#scolor-tool .colored-layer', $body) : $('#fcolor-tool .colored-layer', $body));
			if (menu.$selIconElem && menu.tools['select'].selectedShape){
				var selShape = menu.tools['select'].selectedShape;
				if (selShape.strokeColor && type == 'primary'){
					selShape.strokeColor = color;
					if (selShape.points) updatePoints(selShape.points, 'color', color);
				}
				if (selShape.color && type == 'primary'){
					selShape.color = color;
				}
				if (selShape.smoothedPoints && type == 'primary'){
					updatePoints(selShape.smoothedPoints, 'color', color);
				}
				if (selShape.fillColor && type == 'secondary'){
					selShape.fillColor = color;
				}
				lc.repaintLayer('main');
			}
			$coloredLayerElem.css({backgroundColor: color});
		});
		$('#size-picker .tool-icon', $body).click(function(ev){
			var size = parseInt(this.id.split('-')[1]);
			lc.trigger('setStrokeWidth', size);
			if (menu.$selIconElem && menu.tools['select'].selectedShape){
				var selShape = menu.tools['select'].selectedShape;
				if (selShape.strokeWidth){
					selShape.strokeWidth = size;
					if (selShape.points) updatePoints(selShape.points, 'size', size);
				}
				if (selShape.smoothedPoints){
					updatePoints(selShape.smoothedPoints, 'size', size);
				}
				lc.repaintLayer('main');
			}
			var $spicker = $('#size-picker', $body);
			$spicker.css('display', 'none');
		});
	},
	largeMenu: function LargeMenu(lc, options) {
		options = LCMenu.setDefaults(options);
		this.$lmBody = $(`
			<div id="lm-body">
				<div id="undo-tool" class="tool-icon" title="undo"></div>
				<div id="redo-tool" class="tool-icon" title="redo"></div>
				<div id="eraser-tool" class="tool-icon" title="eraser"></div>
				<div id="select-tool" class="tool-icon" title="select"></div>

				<div id="clear-tool" class="tool-icon" title="clear all"></div>
				<div id="delete-tool" class="tool-icon" title="clear selected"></div>
				<div id="line-tool" class="tool-icon" title="line"></div>
				<div id="shapes-tool" class="tool-icon" title="shapes"></div>

				<div id="pencil-tool" class="tool-icon" title="pencil"></div>
				<div id="text-tool" class="tool-icon" title="text"></div>
				<div id="math-tool" class="tool-icon" title="math"></div>
				<div id="polygon-tool" class="tool-icon" title="polygon"></div>

				<div id="fcolor-tool" class="tool-icon color-tool" title="fill color"><div class="colored-layer"></div></div>
				<div id="swidth-tool" class="tool-icon" title="stroke width"></div>
				<div id="scolor-tool" class="tool-icon color-tool" title="stroke color"><div class="colored-layer"></div></div>
				<div id="preview-tool" class="tool-icon" title="preview"></div>

				<div id="shape-picker">
					<div id="rectangle-tool" class="tool-icon" title="rectangle"></div>
					<div id="ellipse-tool" class="tool-icon" title="ellipse"></div>
				</div>
				<div id="preview-area"></div>
				<div id="color-picker">
					<div id="color-black" class="tool-icon" style="background-color: Black;"></div>
					<div id="color-white" class="tool-icon" style="background-color: White;"></div>
					<div id="color-red" class="tool-icon" style="background-color: Red;"></div>
					<div id="color-yellow" class="tool-icon" style="background-color: Yellow;"></div>
					<div id="color-lime" class="tool-icon" style="background-color: Lime;"></div>
					<div id="color-green" class="tool-icon" style="background-color: Green;"></div>
					<div id="color-blue" class="tool-icon" style="background-color: Blue;"></div>
					<div id="color-navy" class="tool-icon" style="background-color: Navy;"></div>
				</div>
				<div id="size-picker">
					<div id="size-2pt" class="tool-icon"><div style="height:2px;background-color:Black; margin-top:16px;"></div></div>
					<div id="size-4pt" class="tool-icon"><div style="height:4px;background-color:Black; margin-top:15px;"></div></div>
					<div id="size-8pt" class="tool-icon"><div style="height:8px;background-color:Black; margin-top:13px;"></div></div>
					<div id="size-16pt" class="tool-icon"><div style="height:16px;background-color:Black; margin-top:9px;"></div></div>
				</div>
			</div>`
		);
		LCMenu.initBody(this, this.$lmBody, lc, options);
		LCMenu.initMenuElems(this, this.$lmBody);
	}
}