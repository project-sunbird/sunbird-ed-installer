//@ sourceURL=ftFib.js
/* global PluginManager */
/**
 * Plugin for fib blank. This plugin encapsulates a Text plugin input, a shape plugin to define
 * a border to the text input. It also can support a background for the edit control to give a
 * perspective of a real input box.
 *
 * This plugin can be configured for editable/non-editable (readonly) states.
 * This plugin are the different sub-states for editable state
 * 1) Deselected / Non-isEvaluated (default)
 * 2) Evaluated - correct answer
 * 3) Evaluated - incorrect answer
 * 4) Selected
 * When the blank is editable, it invokes the keyboard when the user clicks on it.
 *
 * In the non-editable state, when the user touches it, it hides the keyboard.
 *
 * @fires showKeyboard
 * @fires hideKeyboard
 * @author Amulya <amulya.k@funtoot.com>
 */
Plugin.extend({
	_type: 'ftFib',
	/**
	 * initializes the plugin
	 */
	initPlugin: function (data) {
		var ftdata = data;
		var inst = this;
		this._self = new createjs.Container();
		var dims = this.relativeDims();
		this._self.x = dims.x;
		this._self.y = dims.y;
		inst.itemCtrl = this._stage.getController("item");
		var model = inst.itemCtrl.getModelValue(this._data.model);
		inst.options = {
			readonly: {
				showBgImg: true,
				asset: "nonEditable"
			},
			writable: {
				showBgImg: true,
				asset: "editable",
			},
			"selected": {
				"stroke": "#0a9ec7",
				"fill": "",
				"asset": ""
			},
			"deselected": {
				"stroke": "#000000",
				"fill": "",
				"asset": ""
			},
			"error": {
				"stroke": "#e42012",
				"fill": "",
				"asset": ""
			},
			"correct": {
				"stroke": "#28a54c",
				"fill": "",
				"asset": ""
			},
			blankType: "box"
		};
		Object.assign(inst.options, data.options);
		//creates the textBox background image
		if (model.w && inst.options.writable.showBgImg != false) {
			var itemImage = {};
			itemImage.id = _.unique("itemImageId");
			itemImage.stretch = "false";
			itemImage.asset = inst.options.writable.asset;
			itemImage.x = 0;
			itemImage.y = 0;
			itemImage.h = 100;
			itemImage.w = 100;
			PluginManager.invoke('image', itemImage, this, this._stage, this._theme);
		} else if (!model.w && inst.options.readonly.showBgImg != false) {
			var itemImage = {};
			itemImage.id = _.unique("itemImageId");
			itemImage.stretch = "false";
			itemImage.asset = inst.options.readonly.asset;
			itemImage.x = 0;
			itemImage.y = 0;
			itemImage.h = 100;
			itemImage.w = 100;
			PluginManager.invoke('image', itemImage, this, this._stage, this._theme);
		}
		// creates the textBox border
		var defaultBlankType = "box";
		var blankType = (data.blankType || defaultBlankType);
		var textBoxStroke = ftdata.state ? inst.options[data.state].stroke : inst.options["deselected"].stroke;
		var textBoxContainer = {};
		textBoxContainer.id = ftdata.isSolution ? data.id + "-fib-container-sol" : data.id + "-fib-container-text";
		textBoxContainer.type = "rect";
		textBoxContainer.stroke = model.w ? textBoxStroke : null;
		textBoxContainer.hitArea = true;
		textBoxContainer.x = 1;
		textBoxContainer.y = inst.options.blankType == "line" ? 98 : 1;
		textBoxContainer.h = inst.options.blankType == "line" ? 0 : 98;
		textBoxContainer.w = 98;
		PluginManager.invoke('shape', textBoxContainer, this, this._stage, this._theme);

		// invokes text in the textBoxContainer
		var textBox = Object.create(data);
		textBox.id = ftdata.isSolution ? data.id + "-sol" : data.id + "-text";
		textBox.align = "center";
		textBox.valign = "middle";
		textBox.model = "fibModels." + data.id + ".u";
		textBox.x = 0;
		textBox.y = 15;
		textBox.h = 100;
		textBox.w = 100;
		textBox.fontsize = ftdata.fontsize;
		textBox.limit = ftdata.limit;
		this._self._textBox = PluginManager.invoke('text', textBox, this, this._stage, this._theme);
		this.refresh();
		//show or hide keyboard on click of textBox only if it's not a solution
		if (!model.isSolution) {
			var tbcobj = PluginManager.getPluginObject(textBoxContainer.id);
			tbcobj._self.on("click", function (event) {
				var evt = new createjs.Event(model.w ? 'showKeyboard' : 'hideKeyboard');
				evt.id = this.parent._textBox._id;
				evt.bubbles = true;
				evt.boxId = ftdata.id;
				this.dispatchEvent(evt);
			});
		}
		if (model.w && !model.isSolution) {
			// create the micro-hint with a delay to allow this object to get created
			setTimeout((function () {
				var microhint = Object.create(null);
				microhint.id = inst._data.id + '-mh';
				microhint.attachTo = inst._data.id;
				microhint.mhPos = 'top-left';
				var model = inst.itemCtrl.getModelValue(inst._data.model);
				microhint.visible = model.isEvaluated && !model.isCorrect;
				//	microhint.model = model;
				PluginManager.invoke('ftMicroHint', microhint, inst, inst._stage, inst._theme);
			}.bind(this)), 1000);
		}
	},

	/**
	 * callback when microhint is clicked
	 * gets the microhint data and displays the microhint popup
	 */
	onMicroHint: function (e) {
		console.log("microhint");
		var model = this.itemCtrl.getModelValue(this._data.model);
		var mhData = {};
		mhData.title = 'Micro hint';
		mhData.type = "mh";
		mhData.containerId = '_ft_microhint_content_container__';
		mhData.x = 10;
		mhData.y = 10;
		mhData.w = 80;
		mhData.h = 60;
		mhData.content = model.mh;
		mhData.mmc = model.mmc;
		return mhData;
	},

	/**
	 * displays the model value on the UI. If this is for solution, then
	 * displays the expected value
	 */
	refresh: function () {
		var model = this.itemCtrl.getModelValue(this._data.model);
		textStr = model.isSolution ? model.e : model.w ? model.u : model.e;
		this._self._textBox._self.text = textStr;
		Renderer.update = !0;
	},

	/**
	 * callback - called after submit button is pressed.
	 * Updates the state depending on the evaluation result
	 */
	onEvaluate: function () {
		console.log('fib - onEvaluate called!');
		var areMicrohintsEnabled = this.itemCtrl._data.selectedConfig && !_.isUndefined(this.itemCtrl._data.selectedConfig.areMicrohintsEnabled) ? this.itemCtrl._data.selectedConfig.areMicrohintsEnabled : true
		var model = this.itemCtrl.getModelValue(this._data.model);
		var fibState = model.isCorrect ? "correct" : "error";
		if (model.w) {
			model.isEvaluated = true;
			var tbcobj = PluginManager.getPluginObject(this._data.id + '-mh-mhicon');

			tbcobj._self.visible = !areMicrohintsEnabled ? false : !model.isCorrect;
			tbcobj._data.visible = !areMicrohintsEnabled ? false : !model.isCorrect;
			if (areMicrohintsEnabled) {
				Renderer.update = !0;
				this.changeState(fibState);
			}
		}
	},

	/**
	 * Updates the state depending on the evaluation result
	 */
	changeState: function (state) {
		console.log("change state");
		this._data.state = state;
		var obj = PluginManager.getPluginObject(this._data.id + '-fib-container-text');
		obj._self.graphics._stroke.style = this.options[state].stroke;
	}
});