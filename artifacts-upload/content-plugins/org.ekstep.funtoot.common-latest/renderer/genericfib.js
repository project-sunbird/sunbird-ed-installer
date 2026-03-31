//@ sourceURL=genericfib.js
/**
 * Reusable genericfib evaluator
 * @author Henrietta D (henrietta.d@funtoot.com)
 */
/**
 * Constructs the FibEval object
 * @constructor
 */
function FibEval(model) {
    this.model = model;
}

FibEval.prototype.getUserValue = function (model) {
    var result = { u: "" };
    var inputTag = document.getElementById(model.blankId);
    var deb = inputTag.value;
    result.u = deb
    return result;

}
FibEval.prototype.onClick = function (evt) {
    evt.currentTarget.classList.add('input-box-selected');
    var keyboardObj = PluginManager.getPluginObject("keypadId");
    keyboardObj._self.visible = true;
    Renderer.update = true;
    /*PluginManager.getPluginObject('keypadId').switchTarget({ id: evt.id.toString() });
    Renderer.update = !0;*/
}

FibEval.prototype.onEvaluate = function (instance, blank) {
    var fibState = blank.isCorrect ? "correct" : "error";
    console.log('genricfib - onEvaluate called!');
    this.changeState(fibState, blank);
    /* var blankTag = document.getElementById(blank.blankId)
     blankTag.onMicroHint =
         function (e) {
             var helper = PluginManager.getPluginObject('plugin_helper');
             var mhData = {};
             mhData.title = 'Micro hint';
             mhData.type = "mh";
             mhData.containerId = '_ft_microhint_content_container__';
             mhData.x = 10; mhData.y = 10; mhData.w = 80; mhData.h = 60;
             mhData.content = " mhModel.mh";
             helper.showPopup(mhData);
         }
     var microhint = Object.create(null);
     microhint.id = instance._data.id + '-mh';
     microhint.attachTo = blankTag;
     microhint.mhPos = 'top-left';
     microhint.visible = true;//blank.isEvaluated && !blank.isCorrect;
     PluginManager.invoke('ftMicroHint', microhint, instance, instance._stage, instance._theme);
     var fibState = blank.isCorrect ? "correct" : "error";
     blank.isEvaluated = true;
     var tbcobj = PluginManager.getPluginObject(microhint.id + '-mh-mhicon');
     //tbcobj._self.visible = !blank.isCorrect;
     Renderer.update = !0;*/
}

/**
	 * Updates the state depending on the evaluation result
	 */
FibEval.prototype.changeState = function (state, blank) {
    var blankTag = document.getElementById(blank.blankId);
    var currentClasses = blankTag.classList;
    _.each(currentClasses, function (c) {
        blankTag.classList.remove(c.value);
    });
    blankTag.classList.add('input-box-' + state);;
};
