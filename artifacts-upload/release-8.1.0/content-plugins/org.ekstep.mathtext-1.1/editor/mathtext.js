/*
 * Plugin to create mathtext
 * @class org.ekstep.mathtext.mathTextController
 * @author Swati Singh <swati.singh@tarento.com>
 */
angular.module('org.ekstep.mathtext', [])
  .controller('mathTextController', ['$scope', 'instance', '$timeout', function ($scope, instance, $timeout) {

    var mathField, latex, latexSpan, hiddenSpanArea;
    $scope.isMathWysiwyg = true;
    $scope.libraryEquations = [
      {
        "title": "Area of circle",
        "latex": "A = \\pi r^2"
      },
      {
        "title": "Quadratic equation",
        "latex": "x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"
      },
      {
        "title": "Binomial theorem",
        "latex": "(x+a)^n = \\sum _{k=0}^n(\\frac{n_{ }}{k})x^ka^{n-k}"
      },
      {
        "title": "Expansion of a sum",
        "latex": "(1+x)^n=1+\\frac{nx}{1!}+\\frac{n(n-1)x^2}{2!}+......."
      },
      {
        "title": "Fourier series",
        "latex": "f(x)=a_0+\\sum _{n=1}^{\\infty }(a_n\\cos \\frac{n\\Pi x}{L}+b_n\\sin \\frac{n\\Pi x}{L})"
      },
      {
        "title": "Slope of a line",
        "latex": "m=\\frac{y_2-y}{x_2-x_1}"
      },
      {
        "title": "Distance between two points",
        "latex": "d=\\sqrt{(x_2-x_1)^2-(y_2-y_1)^2}"
      },
      {
        "title": "Volume of a sphere",
        "latex": "\\frac{4}{3}\\pi r^3"
      },
      {
        "title": "Product rule",
        "latex": "a^n\\times a^m=a^{n+m}"
      }
    ];

    // Each object definition is:
    // {
    //   latex: <string>, // Latex string to enter into math-field on click
    //   latexDisplay: <string>, // Latex string used to display in the UI (sometimes the latex used to display is different from the latex entered into math-field)
    //   icon: <string>, // If an icon should be displayed instead of latex
    //   symbol: <string> // If a literal symbol should be displayed instead of latex
    // }
    // Precedence for display in the UI: latexDisplay -> icon -> symbol -> latex

    $scope.symbols = {
      greek: [
        {
          latex: "\\alpha",
        },
        {
          latex: "\\beta",
        },
        {
          latex: "\\delta",
        },
        {
          latex: "\\epsilon",
        },
        {
          latex: "\\eta",
        },
        {
          latex: "\\gamma",
        },
        {
          latex: "\\iota",
        },
        {
          latex: "\\kappa",
        },
        {
          latex: "\\lambda",
        },
        {
          latex: "\\mu",
        },
        {
          latex: "\\nu",
        },
        {
          latex: "o",
        },
        {
          latex: "\\omega",
        },
        {
          latex: "\\phi",
        },
        {
          latex: "\\pi",
        },
        {
          latex: "\\psi",
        },
        {
          latex: "\\rho",
        },
        {
          latex: "\\sigma",
        },
        {
          latex: "\\tau",
        },
        {
          latex: "\\theta",
        },
        {
          latex: "\\upsilon",
        },
        {
          latex: "\\xi",
        },
        {
          latex: "\\zeta",
        },
        {
          latex: "\\Delta",
        },
        {
          latex: "\\Gamma",
        },
        {
          latex: "\\Lambda",
        },
        {
          latex: "\\Omega",
        },
        {
          latex: "\\Phi",
        },
        {
          latex: "\\Pi",
        },
        {
          latex: "\\Psi",
        },
        {
          latex: "\\Sigma",
        },
        {
          latex: "\\Theta",
        },
        {
          latex: "\\Upsilon",
        }],
      binary: [
        {
          latex: "\\ast"
        },
        {
          latex: "\\times"
        },
        {
          latex: "\\div"
        },
        {
          latex: "\\cdot"
        },
        {
          latex: "\\equiv"
        },
        {
          latex: "\\cong"
        },
        {
          latex: "\\ne"
        },
        {
          latex: "\\sim"
        },
        {
          latex: "\\simeq"
        },
        {
          latex: "\\approx"
        },
        {
          latex: "\\propto"
        },
        {
          latex: "\\models"
        },
        // {
        //   latex: "\\approxeq"
        // },
        {
          latex: "\\pm"
        },
        {
          latex: "\\mp"
        },
        {
          latex: "\\leq"
        },
        {
          latex: "\\ll"
        },
        {
          latex: "\\subset"
        },
        {
          latex: "\\subseteq"
        },
        {
          latex: "\\in"
        },
        {
          latex: "\\perp"
        },
        {
          latex: "\\mid"
        },
        {
          latex: "\\parallel"
        },
        {
          latex: "\\notin"
        },
        {
          latex: "\\cap"
        },
        {
          latex: "\\cup"
        },
        {
          latex: "\\geq"
        },
        {
          latex: "\\wedge"
        },
        {
          latex: "\\vee"
        },
        {
          latex: "\\gg"
        },
        {
          latex: "\\supset"
        },
        {
          latex: "\\supseteq"
        }
      ],
      arrow: [
        {
          latex: "\\leftarrow"
        },
        {
          latex: "\\Leftarrow"
        },
        {
          latex: "\\rightarrow"
        },
        {
          latex: "\\Rightarrow"
        },
        {
          latex: "\\leftrightarrow"
        },
        {
          latex: "\\Leftrightarrow"
        },
        // {
        //   latex: "\\dashrightarrow"
        // },
        // {
        //   latex: "\\leftrightarrows"
        // },
        // {
        //   latex: "\\rightleftharpoons"
        // },
        {
          latex: "\\rightharpoonup"
        },
        {
          latex: "\\rightharpoondown"
        },
        // {
        //   latex: "\\dashleftarrow"
        // },
        // {
        //   latex: "\\leftrightharpoons"
        // }
      ],
      misc: [
        {
          latex: "\\infty"
        },
        {
          latex: "\\nabla"
        },
        {
          latex: "\\partial"
        },
        {
          latex: "\\angle"
        },
        {
          latex: "\\triangle"
        },
        {
          latex: "\\square"
        }
      ]
    };
    $scope.symbolGroup = 'all';

    $scope.equations = {
      trig: [
        {
          latex: "\\sin\\theta"
        },
        {
          latex: "\\cos\\theta"
        },
        {
          latex: "\\sec\\theta"
        },
        {
          latex: "\\csc\\theta"
        },
        {
          latex: "\\tan\\theta"
        },
        {
          latex: "\\cot\\theta"
        },
        {
          latex: "\\log_{}\\left(\\right)",
          latexDisplay: "\\log_{\\square}"
        },
        {
          latex: "\\lg"
        },
        {
          latex: "\\ln"
        },
        {
          latex: "\\lim_{x\\to\\infty}\\left(\\right)",
          latexDisplay: "lim"
        },
        {
          latex: "\\dim"
        }
      ],
      supsub: [
        {
          latex: "x^2",
          latexDisplay: "x^2"
        },
        {
          latex: "e^{ }",
          latexDisplay: "e^{\\square}"
        },
        {
          latex: "{ }^{ }",
          latexDisplay: "\\square^\\square"
        },
        {
          latex: "x_2",
          latexDisplay: "x_2"
        },
        {
          latex: "{ }_{ }",
          latexDisplay: "\\square_\\square"
        },
      ],
      root: [
        {
          latexCmd: "\\sqrt",
          latexDisplay: "\\sqrt{\\square}"
        },
        {
          latexCmd: "\\nthroot",
          latexDisplay: "\\sqrt[\\square]{\\square}"
        }
      ],
      frac: [
        {
          latex: "\\frac{ }{ }",
          latexDisplay: "\\frac{\\square}{\\square}"
        }
      ]
    };
    $scope.equationGroup = 'all';


    var MQ = MathQuill.getInterface(2); // eslint-disable-line no-undef
    $scope.valid = false;

    $scope.equationType = _.uniqBy($scope.equations, function (equation) {
      return equation.type;
    });
    $scope.symbolsDivision = {};
    $scope.equationsDivision = {};
    $scope.latexDivision = {};

    _.each($scope.symbolType, function (value, key) {
      $scope.symbolsDivision[value.type] = [];
      $scope.latexDivision[value.type] = [];
      _.each($scope.symbols, function (val, key) {
        if (value.type == val.type) {
          $scope.symbolsDivision[value.type].push(val);
          $scope.latexDivision[val.type].push(val);
        }
      });
    });

    _.each($scope.equationType, function (value, key) {
      $scope.equationsDivision[value.type] = [];
      _.each($scope.equations, function (val, key) {
        if (value.type == val.type) {
          $scope.equationsDivision[value.type].push(val);
        }
      });
    });

    $scope.mergeAllSymbols = function () {
      return _.union($scope.symbols.greek, $scope.symbols.binary, $scope.symbols.arrow, $scope.symbols.misc);
    };

    $scope.symbolsDropDown = $scope.mergeAllSymbols();
    $scope.equationsDropDown = $scope.equationsDivision;
    $scope.latexDropDown = $scope.latexDivision;

    $scope.instance = instance;

    $scope.$on('ngDialog.opened', function (e, $dialog) {
      var currentScope = e.currentScope;
      if (currentScope.instance.mode === currentScope.instance.modes.integration) {
        if (currentScope.instance.textSelected) {
          $timeout(function () {
            $scope.selectedText = currentScope.instance.textSelected;
            $scope.latexToEquations({latex: currentScope.instance.latex});
          }, 500);
        }
      } else {
        $scope.selectedText = false;
        var textObj = ecEditor.getCurrentObject();
        if (currentScope.ngDialogData && currentScope.ngDialogData.textSelected && textObj) {
          $scope.selectedText = true;
          $timeout(function () {
            $scope.latexToEquations({latex: textObj.config.latex});
          }, 500);
        }
      }
      $scope.instanceId = currentScope.ngDialogData.instanceId;
      $timeout(function () {
        $('.mq-render').each(function (index, element) {
          MQ.StaticMath(element);
        });
      }, 1000);

    });

    $timeout(function () {
      $('.menu .item').tab();
      $('.ui.dropdown.latex-dropdown').dropdown({
        onChange: function (val, text, $choice) {
          $scope.latexDropDown = $scope.latexDivision;
          if (val != "all") {
            $scope.latexDropDown = {};
            $scope.latexDropDown[text] = $scope.latexDivision[text];
          }
          $scope.$safeApply();
        }
      });
      $('.ui.dropdown.equations-dropdown').dropdown({
        onChange: function (val, text, $choice) {
          $scope.equationsDropDown = $scope.equationsDivision;
          if (val != "all") {
            $scope.equationsDropDown = {};
            $scope.equationsDropDown[text] = $scope.equationsDivision[text];
          }
          $scope.$safeApply();
        }
      });
      $('.ui.dropdown.symbols-dropdown').dropdown({
        onChange: function (val, text, $choice) {
          $scope.symbolsDropDown = $scope.mergeAllSymbols();
          if (val != "all") {
            $scope.symbolsDropDown = {};
            $scope.symbolsDropDown[text] = $scope.symbolsDivision[text];
          }
          $scope.$safeApply();
        }
      });
    }, 1000);

    $timeout(function () {
      var mathFieldSpan = document.getElementById('math-field');
      latexSpan = document.getElementById('latex');
      hiddenSpanArea = document.getElementById('hiddenSpan');
      mathField = MQ.MathField(mathFieldSpan, {
        spaceBehavesLikeTab: true,
        handlers: {
          edit: function () {
            latexSpan.textContent = mathField.latex();
          }
        }
      });
      window.mathField = mathField;
      $(mathFieldSpan).keydown(function (e) {
        if (e.keyCode == 86) { //keycode value for "v"
          $timeout(function () {
            if (!$scope.valid) { // checks if the pasted value is not valid
              ecEditor.dispatchEvent("org.ekstep.toaster:error", {
                title: 'Incorrect formula entered.',
                position: 'topCenter',
              });
            }
          }, 1);
        }
      });
    }, 300);


    $scope.latexToEquations = function (object) {
      if(object.latexCmd) {
        mathField.cmd(object.latexCmd);
      } else {
        mathField.write(object.latex);
      }
    };

    $scope.latexToFormula = function (id, latex) {
      var mathDiv = document.getElementById(id);
      katex.render(latex, mathDiv, {displayMode: true}); // eslint-disable-line no-undef
    };

    // Some latex are not rendered correctly by katex. Use mathquill in those cases.
    $scope.latexToFormulaMQ = function(id) {
      var field = document.getElementById(id);
      MQ.StaticMath(field);
    };

    $scope.addToStage = function () {
      var equation = document.getElementById('latex').innerHTML;
      if (instance.mode === instance.modes.integration) {
        instance.callbackFn(equation, instance.textSelected);
      } else {
        // Convert the latex or mathquill to equation
        // add it to the stage
        if ($scope.selectedText && $scope.instanceId) {
          ecEditor.dispatchEvent('org.ekstep.mathtext:edit', {
            instanceId: $scope.instanceId,
            latex: equation
          });
        } else {
          ecEditor.dispatchEvent('org.ekstep.mathtext:create', {
            "latex": equation,
            "type": "rect",
            "x": 10,
            "y": 20,
            "fill": "rgba(0, 0, 0, 0)",
            "opacity": 1,
            "fontFamily": 'NotoSans',
            "fontSize": 18,
            "backgroundcolor": "#fff"
          });
        }
      }
      $scope.closeThisDialog();
    }
  }]);

//# sourceURL=mathText.js