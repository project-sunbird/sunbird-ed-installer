//@ sourceURL=timeintrocustom-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate measurement problems
 * @extends ftFibBasePlugin
 * @fires table, grid
 * @author Amit (amit.dawar@funtoot.com)
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.timecustomintro',
    _isContainer: false,
    _render: true,
    initPlugin: function (data) {
        this._super(data);
        //var instance = this;
        // initialize the item controller
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);

        var can = document.createElement("canvas");
        can.id = data.id;
        can.width = "200";
        can.height = "200";
        can.style = "margin-left:70px;margin-top:70px;";
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(can);

        //var i18n = PluginManager.getPluginObject('i18n_helper');
        //var langId = i18n.config.numericLangId
        //var nums = i18n.getNumbers(langId);

        var canvas = document.getElementById(data.id);
        var ctx = canvas.getContext("2d");
        var radius = canvas.height / 2;
        ctx.translate(radius, radius);
        radius = radius * 0.90;

        var imageObj = document.createElement("img");
        imageObj.id = "baseimg";
        imageObj.style = "z-index:-1;position:absolute;width:240px;height:240px;right:285px;top:51px;";
        imageObj.src = 'https://localhost:8081/org.ekstep.funtoot.common-1.0/assets/QTIM_Clock_Base.png';
        //ctx.drawImage(imageObj, 0, 0, 100, 100);
        body = document.getElementsByTagName("body")[0];
        body.appendChild(imageObj);

        function drawClock() {
            //drawFace(ctx, radius);
            drawNumbers(ctx, radius);
            drawTime(ctx, radius);
            //requestAnimationFrame(drawClock);
        }
        drawClock();

        /*function drawFace(ctx, radius) {
            var grad;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
            grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
            grad.addColorStop(0, '#3382c6');
            grad.addColorStop(0.5, 'white');
            grad.addColorStop(1, '#3382c6');
            ctx.strokeStyle = grad;
            ctx.lineWidth = radius * 0.1;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
            ctx.fillStyle = '#333';
            ctx.fill();
        }*/

        function drawNumbers(ctx, radius) {
            var ang;
            var num;
            ctx.font = radius * 0.15 + "px arial";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            for (num = 1; num < 13; num++) {
                ang = num * Math.PI / 6;
                ctx.rotate(ang);
                ctx.translate(0, -radius * 0.85);
                ctx.rotate(-ang);
                ctx.fillText(num, 0, 0);
                ctx.rotate(ang);
                ctx.translate(0, radius * 0.85);
                ctx.rotate(-ang);
            }
        }

        function drawTime(ctx, radius) {
            var now = new Date();
            var hour = now.getHours();
            var minute = now.getMinutes();
            var second = now.getSeconds();
            //hour
            hour = hour % 12;
            hour = (hour * Math.PI / 6) +
                (minute * Math.PI / (6 * 60)) +
                (second * Math.PI / (360 * 60));
            drawHand(ctx, hour, radius * 0.5, radius * 0.07);
            //minute
            minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
            drawHand(ctx, minute, radius * 0.8, radius * 0.07);
            // second
            second = (second * Math.PI / 30);
            drawHand(ctx, second, radius * 0.9, radius * 0.02);
        }

        function drawHand(ctx, pos, length, width) {
            ctx.beginPath();
            ctx.lineWidth = width;
            ctx.lineCap = "round";
            ctx.moveTo(0, 0);
            ctx.rotate(pos);
            ctx.lineTo(0, -length);
            ctx.stroke();
            ctx.rotate(-pos);
        }

    }
});