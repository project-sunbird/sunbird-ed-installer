//@ sourceURL=ftGrid.js
/* global PluginManager */
/**
 * This is a common Plugin which generates grid layout
 * @extends Plugin
 * @fires ftFib
 * @author Ram Jayaraman (ram.j@funtoot.com)
 */
Plugin.extend({
	_type: 'ftGrid',
	initPlugin: function (data) {
		var item = this._stage.getController("item");
		if (item)
			this._item = item;
		this._self = new createjs.Container();
		var dims = this.relativeDims();
		this._self.x = dims.x;
		this._self.y = dims.y;
		var cellCount = data.rows * data.cols;
		var numbers = data.numbers;
		// mask is either an array of zero-based column indices which we ask the user to input answer, or a decimal value
		// which denotes the % of input fields that should be editable by the user.
		var maskedArray = this.getUserInputMask(data);
		if (!data.isSolution) {
			this._item.setModelValue("fibModels", {});
			this._item.setModelValue("mask", maskedArray);
		}
		var yGutter = data.yGutter;//vertical space between cells
		var xGutter = data.xGutter;//Horizontal space between cells
		var cellHeight = (data.h - ((data.rows) * yGutter)) / data.rows;
		var cellWidth = (data.w - ((data.cols) * xGutter)) / data.cols;
		var textBoxHeight = (45 * cellHeight) / 100.0;
		var textBoxWidth = (45 * cellWidth) / 100.0;
		var n = 0;
		for (let i = 0; i < data.rows; i++) {
			var yPosition = (i * 100 / data.rows) + yGutter / 2;
			var boxYposition = yPosition + (cellHeight - textBoxHeight) / 2;
			for (let j = 0; j < data.cols; j++) {
				var xPosition = (j * 100 / data.cols) + xGutter / 2;
				var boxXposition = xPosition + ((cellWidth - textBoxWidth) / 2);
				if (data.tileImg) {
					var itemImage = Object.create({});
					itemImage.id = _.unique("itemImageId");
					itemImage.stretch = "false";
					itemImage.asset = data.tileImg;
					itemImage.x = xPosition;
					itemImage.y = yPosition;
					itemImage.h = cellHeight;
					PluginManager.invoke('image', itemImage, this, this._stage, this._theme);
					/*var debug = {x:xPosition, y:yPosition, w:cellWidth, h:cellHeight, type:"rect", stroke:"#ff0000", fill:"grey"}
					PluginManager.invoke('shape', debug, this, this._stage, this._theme);*/
				}
				var cellId = (i + 1).toString() + (j + 1).toString();
				var key = "fib" + cellId;
				if (!data.isSolution) {
					var fibData = {
						e: numbers.nums[n].displayValue,
						u: maskedArray[n] ? '' : numbers.nums[n].displayValue,
						w: maskedArray[n],
						isSolution: data.isSolution,
						isEvaluated: false,
						isCorrect: false
					}
					var fibM = this._item.getModelValue().model.fibModels;
					fibM[key] = fibData;
				}
				this._item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
				var fib = Object.create(data);
				fib.id = key;
				fib.model = "fibModels." + key;
				fib.w = textBoxWidth;
				fib.x = boxXposition;
				fib.y = boxYposition;
				fib.h = textBoxHeight;
				fib.fontsize = data.fontsize;
				fib.state = "deselected";
				PluginManager.invoke('ftFib', fib, this, this._stage, this._theme);
				n++;
			}
		}
	},
	//Returns an boolean array 
	getUserInputMask: function (data) {
		var masks = new Array(data.rows * data.cols).fill(!1); // initialize all as read-only
		if (_.isArray(data.mask)) {
			//the data.mark is a array of columns to mask (e.g [2,5]) 
			if (_.contains(data.mask, true))
				return data.mask;// if the array is already masked then return the same array(in case of solution array will be already masked)
			for (r = 0; r < data.rows; r++) {
				for (m = 0; m < data.mask.length; m++) {
					masks[r * data.cols + data.mask[m] - 1] = !0;
				}
			}
			return masks;
		}
		else {
			// the data.mark is a value between 0 and 1 (e.g 0.5)
			var t = data.rows * data.cols;
			var n = _.filter(masks, function (b) { return !b; }).length;
			do {
				masks[n - 1] = !0;
				n = _.filter(masks, function (b) { return !b; }).length;
			} while ((n / t) > data.mask);
			return _.shuffle(masks);
		}
	}
});
