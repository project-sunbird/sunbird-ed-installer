describe("EditorPlugin", function() {
  var plugin, popupService,dataObj,event;

  beforeEach(module('org.ekstep.questionbank'));

  beforeEach(function() {
    plugin = new org.ekstep.questionbank.EditorPlugin({}, {}, {});
    spyOn(plugin, "initialize").and.callThrough();
    spyOn(plugin, "loadHtml").and.callThrough();
    dataObj = {callback:undefined,data:undefined};
    event = {target:undefined,type:"org.ekstep.questionbank:showpopup"};
    popupService = jasmine.createSpyObj("popupService", ["loadNgModules", "open"]);
    spyOn(ecEditor, "getService").and.callFake(function(serviceName) {
      if (serviceName === ServiceConstants.POPUP_SERVICE) {
        return popupService;
      }
    });
  });
  describe("initialize", function() {
    it("should initialize dependancy plugins", function() {
      plugin.initialize();
      expect(ecEditor.getService).toHaveBeenCalled();
    });
  });

  describe("load HTML", function() {
    it("should call load html", function() {
      plugin.loadHtml(event,dataObj);
    });
  });

}); 
