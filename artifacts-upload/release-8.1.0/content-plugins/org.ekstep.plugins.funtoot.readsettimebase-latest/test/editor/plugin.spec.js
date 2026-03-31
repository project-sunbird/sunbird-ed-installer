describe("EditorPlugin", function() {
    describe("newInstance", function() {
        var plugin;

        beforeEach(function() {
            plugin = new org.ekstep.plugins.funtoot.readsettime.EditorPlugin({}, {}, {});
        });

        it("should ?", function() {
            plugin.newInstance();

            expect(true).toBe(true);
        });
    });
});
