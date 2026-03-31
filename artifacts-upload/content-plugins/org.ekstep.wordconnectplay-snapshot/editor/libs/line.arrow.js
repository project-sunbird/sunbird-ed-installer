(function(global) {

  "use strict";
  var LINK_DOUBLE_ARROW_DIRECTION = "linkDoubleArrowDirection";

  var fabric = global.fabric || (global.fabric = { }),
      extend = fabric.util.object.extend,
      coordProps = { 'x1': 1, 'x2': 1, 'y1': 1, 'y2': 1 },
      supportsLineDash = fabric.StaticCanvas.supports('setLineDash');

  if (fabric.Linearrow) {
    fabric.warn('fabric.Linearrow is already defined');
    return;
  }

  /**
   * Line class
   * @class fabric.Linearrow
   * @extends fabric.Object
   * @see {@link fabric.Linearrow#initialize} for constructor definition
   */
  fabric.Linearrow = fabric.util.createClass(fabric.Object, /** @lends fabric.Linearrow.prototype */ {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'linearrow',

    /**
     * Constructor
     * @param {Array} [points] Array of points
     * @param {Object} [options] Options object
     * @return {fabric.Linearrow} thisArg
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

      this.set('width', Math.abs(this.x2 - this.x1) || 1);
      this.set('height', Math.abs(this.y2 - this.y1) || 1);

      this.set('left', 'left' in options ? options.left : (Math.min(this.x1, this.x2) + this.width / 2));
      this.set('top', 'top' in options ? options.top : (Math.min(this.y1, this.y2) + this.height / 2));
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
      ctx.beginPath();

      var isInPathGroup = this.group && this.group.type === 'path-group';
      if (isInPathGroup && !this.transformMatrix) {
        ctx.translate(-this.group.width/2 + this.left, -this.group.height / 2 + this.top);
      }

      var xMult = this.x1 <= this.x2 ? -1 : 1;
      var yMult = this.y1 <= this.y2 ? -1 : 1;
      if (!this.strokeDashArray || this.strokeDashArray && supportsLineDash) {

        // move from center (of virtual box) to its left/top corner
        // we can't assume x1, y1 is top left and x2, y2 is bottom right

        ctx.moveTo(
          this.width === 1 ? 0 : (xMult * this.width / 2),
          this.height === 1 ? 0 : (yMult * this.height / 2));

        ctx.lineTo(
          this.width === 1 ? 0 : (xMult * -1 * this.width / 2),
          this.height === 1 ? 0 : (yMult * -1 * this.height / 2));
      }

      ctx.lineWidth = this.strokeWidth;
      this.dx = this.x2-this.x1;
      this.dy = this.y2-this.y1;

      // TODO: test this
      // make sure setting "fill" changes color of a line
      // (by copying fillStyle to strokeStyle, since line is stroked, not filled)
      var origStrokeStyle = ctx.strokeStyle;
      ctx.strokeStyle = this.stroke || ctx.fillStyle;
      this._renderStroke(ctx);
      ctx.strokeStyle = origStrokeStyle;
          var size = ctx.lineWidth;
          var endingAngle = Math.atan2(this.dy, this.dx);
          var base = size*6.8 * Math.cos(endingAngle);
          var opp =  size*6.8 * Math.sin(endingAngle);
          var newx = (xMult * -1 * this.width / 2) - base;
          var newy = (yMult * -1 * this.height / 2) - opp;
          ctx.beginPath();
          ctx.save();
          ctx.translate(newx, newy);
          this.setCoords();
          ctx.rotate(endingAngle);

          // ctx.moveTo(0, 0);
          // ctx.lineTo(0, -size * 3.5);
          // ctx.lineTo(size * 7, 0);
          // ctx.lineTo(0, size * 3.5);
          // ctx.lineTo(0, 0);

          // ctx.moveTo(0, 0);
          // ctx.quadraticCurveTo((size * 3.5)/2,(size * 3.5)/8,0, -(size * 3.5));
          // ctx.lineTo(size * 7, 0);
          // ctx.lineTo(0, (size * 3.5));
          // ctx.quadraticCurveTo((size * 3.5)/2,(size * 3.5)/8,0, 0);

          ctx.moveTo(0, 0);
          ctx.lineTo(-3, -size * 3.5);
          ctx.lineTo(size * 7, 0);
          ctx.lineTo(-3, size * 3.5);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
          
         // ctx.stroke();
          ctx.restore();
          if(this.hasCircle){
            // ctx.beginPath();
            // var base = size*1.75 * Math.cos(endingAngle);
            // var opp =  size*1.75 * Math.sin(endingAngle);
            // var newx = (xMult * this.width / 2);
            // var newy = (yMult * this.height / 2);
            // ctx.translate((newx+base), (newy+opp));
            // ctx.arc(0, 0, size*1.75, 0, Math.PI*2, true); 
            // ctx.closePath();
            // ctx.fill();
          }
         if(this.linkArrowDirection == LINK_DOUBLE_ARROW_DIRECTION){

          //left arrow
           var oppAngle = Math.atan2(-this.dy,-this.dx);
          ctx.beginPath();
          ctx.save();
          ctx.translate(-newx,-newy);
          this.setCoords();
          ctx.rotate(oppAngle);

          ctx.moveTo(0, 0);
          ctx.lineTo(-3, -size * 3.5);
          ctx.lineTo(size * 7, 0);
          ctx.lineTo(-3, size * 3.5);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          }
        

    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderDashedStroke: function(ctx) {
      var
        xMult = this.x1 <= this.x2 ? -1 : 1,
        yMult = this.y1 <= this.y2 ? -1 : 1,
        x = this.width === 1 ? 0 : xMult * this.width / 2,
        y = this.height === 1 ? 0 : yMult * this.height / 2;

      ctx.beginPath();
      fabric.util.drawDashedLine(ctx, x, y, -x, -y, this.strokeDashArray);
      ctx.closePath();
    },

    /**
     * Returns object representation of an instance
     * @methd toObject
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      return extend(this.callSuper('toObject', propertiesToInclude), {
        x1: this.get('x1'),
        y1: this.get('y1'),
        x2: this.get('x2'),
        y2: this.get('y2'),
        head: this.get('head'),
        tail: this.get('tail'),
        headid: this.get('headid'),
        tailid: this.get('tailid'),
        hasCircle: this.get('hasCircle'),
        hasBorders:false
      });
    },

    /* _TO_SVG_START_ */
    /**
     * Returns SVG representation of an instance
     * @param {Function} [reviver] Method for further parsing of svg representation.
     * @return {String} svg representation of an instance
     */
    toSVG: function(reviver) {
      var markup = this._createBaseSVGMarkup();

      markup.push(
        '<line ',
          'x1="', this.get('x1'),
          '" y1="', this.get('y1'),
          '" x2="', this.get('x2'),
          '" y2="', this.get('y2'),
          '" style="', this.getSvgStyles(),
        '"/>'
      );

      return reviver ? reviver(markup.join('')) : markup.join('');
    },
    /* _TO_SVG_END_ */

    /**
     * Returns complexity of an instance
     * @return {Number} complexity
     */
    complexity: function() {
      return 1;
    }
  });

  /* _FROM_SVG_START_ */
  /**
   * List of attribute names to account for when parsing SVG element (used by {@link fabric.Linearrow.fromElement})
   * @static
   * @memberOf fabric.Linearrow
   * @see http://www.w3.org/TR/SVG/shapes.html#LineElement
   */
  fabric.Linearrow.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat('x1 y1 x2 y2'.split(' '));

  /**
   * Returns fabric.Linearrow instance from an SVG element
   * @static
   * @memberOf fabric.Linearrow
   * @param {SVGElement} element Element to parse
   * @param {Object} [options] Options object
   * @return {fabric.Linearrow} instance of fabric.Linearrow
   */
  fabric.Linearrow.fromElement = function(element, options) {
    var parsedAttributes = fabric.parseAttributes(element, fabric.Linearrow.ATTRIBUTE_NAMES);
    var points = [
      parsedAttributes.x1 || 0,
      parsedAttributes.y1 || 0,
      parsedAttributes.x2 || 0,
      parsedAttributes.y2 || 0
    ];
    return new fabric.Linearrow(points, extend(parsedAttributes, options));
  };
  /* _FROM_SVG_END_ */

  /**
   * Returns fabric.Linearrow instance from an object representation
   * @static
   * @memberOf fabric.Linearrow
   * @param {Object} object Object to create an instance from
   * @return {fabric.Linearrow} instance of fabric.Linearrow
   */
  fabric.Linearrow.fromObject = function(object) {
    var points = [object.x1, object.y1, object.x2, object.y2];
    return new fabric.Linearrow(points, object);
  };

})(typeof exports !== 'undefined' ? exports : this);
