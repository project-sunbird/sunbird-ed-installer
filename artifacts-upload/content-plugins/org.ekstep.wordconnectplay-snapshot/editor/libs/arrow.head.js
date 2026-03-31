(function(global) {

  "use strict";

  var fabric = global.fabric || (global.fabric = { }),
      extend = fabric.util.object.extend,
      coordProps = { 'x1': 1, 'x2': 1, 'y1': 1, 'y2': 1 },
      supportsLineDash = fabric.StaticCanvas.supports('setLineDash');

  if (fabric.Arrowhead) {
    fabric.warn('fabric.Arrowhead is already defined');
    return;
  }

  /**
   * Line class
   * @class fabric.Arrowhead
   * @extends fabric.Object
   * @see {@link fabric.Arrowhead#initialize} for constructor definition
   */
  fabric.Arrowhead = fabric.util.createClass(fabric.Object, /** @lends fabric.Arrowhead.prototype */ {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'arrowhead',

    /**
     * Constructor
     * @param {Array} [points] Array of points
     * @param {Object} [options] Options object
     * @return {fabric.Arrowhead} thisArg
     */
    initialize: function(points, options) {
      options = options || { };

      if (!points) {
        points = [0, 0, 0, 0];
      }

      this.callSuper('initialize', options);

      this.set('x1', points[0]);
      this.set('y1', points[1]);
      this.set('x2', points[2]);
      this.set('y2', points[3]);
      this.set('head', options.head);
      this.set('tail', options.tail);
      this.set('tailid', '');
      this.set('headid', '');
      this.set('hasBorders', false);
      this.set('hasCircle', true);
      this._setWidthHeight(options);
    },

    /**
     * @private
     * @param {Object} [options] Options
     */
    _setWidthHeight: function(options) {
      options || (options = { });

      this.set('width', 16);
      this.set('height', 16);

      //this.set('left', 'left' in options ? options.left : (Math.min(this.x1, this.x2) + this.width / 2));
      //this.set('top', 'top' in options ? options.top : (Math.min(this.y1, this.y2) + this.height / 2));
    },

    /**
     * @private
     * @param {String} key
     * @param {Any} value
     */
    _set: function(key, value) {
      this[key] = value;
      if (key in coordProps) {
        this._setWidthHeight();
      }
      return this;
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _render: function(ctx) {
     ctx.lineWidth = this.strokeWidth;
      var size = ctx.lineWidth;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-size * 7,size * 3.5);
      ctx.lineTo(-size * 6,0);
      ctx.lineTo(-size * 7,-size * 3.5);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    },

  
    /**
     * Returns object representation of an instance
     * @methd toObject
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      return extend(this.callSuper('toObject', propertiesToInclude), {
      /*  x1: this.get('x1'),
        y1: this.get('y1'),
        x2: this.get('x2'),
        y2: this.get('y2'),*/
        head: this.get('head'),
        tail: this.get('tail'),
        headid: this.get('headid'),
        tailid: this.get('tailid'),
       // hasCircle: this.get('hasCircle'),
        hasBorders:false
      });
    }
  });

  


  
  /**
   * Returns fabric.Arrowhead instance from an object representation
   * @static
   * @memberOf fabric.Arrowhead
   * @param {Object} object Object to create an instance from
   * @return {fabric.Arrowhead} instance of fabric.Arrowhead
   */
  fabric.Arrowhead.fromObject = function(object) {
    var points = [object.x1, object.y1, object.x2, object.y2];
    return new fabric.Arrowhead(points, object);
  };

})(typeof exports !== 'undefined' ? exports : this);
