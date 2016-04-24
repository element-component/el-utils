(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, function () { 'use strict';

  var babelHelpers = {};
  babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };
  babelHelpers;

  var trim = function trim(string) {
    return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
  };

  var hasClass = function hasClass(el, cls) {
    if (!el || !cls) return false;
    if (cls.indexOf(' ') != -1) throw new Error('className should not contain space.');
    if (el.classList) {
      return el.classList.contains(cls);
    } else {
      return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
  };

  var addClass = function addClass(el, cls) {
    if (!el) return;
    var curClass = el.className;
    if (!(cls || "").split) debugger;
    var classes = (cls || '').split(' ');

    for (var i = 0, j = classes.length; i < j; i++) {
      var clsName = classes[i];
      if (!clsName) continue;

      if (el.classList) {
        el.classList.add(clsName);
      } else {
        if (!hasClass(el, clsName)) {
          curClass += ' ' + clsName;
        }
      }
    }
    if (!el.classList) {
      el.className = curClass;
    }
  };

  var removeClass = function removeClass(el, cls) {
    if (!el || !cls) return;
    var classes = cls.split(' ');
    var curClass = ' ' + el.className + ' ';

    for (var i = 0, j = classes.length; i < j; i++) {
      var clsName = classes[i];
      if (!clsName) continue;

      if (el.classList) {
        el.classList.remove(clsName);
      } else {
        if (hasClass(el, clsName)) {
          curClass = curClass.replace(' ' + clsName + ' ', ' ');
        }
      }
    }
    if (!el.classList) {
      el.className = trim(curClass);
    }
  };

  describe('className util test', function () {
    var test_box;

    beforeEach(function () {
      test_box = document.getElementById('test_box');
      test_box.className = "test_box";
    });

    it('hasClass', function () {
      hasClass(test_box).should.be.false;
      hasClass().should.doesNotThrow;
      (function () {
        hasClass(test_box, 'test_box a');
      }).should.throw();
      hasClass(test_box, 'test_box').should.be.true;
      hasClass(test_box, 'test_box2').should.be.false;
    });

    it('addClass', function () {
      (function () {
        addClass();
        addClass(test_box);
      }).should.not.throw();
      addClass(test_box, 'a');
      hasClass(test_box, 'a').should.be.true;
    });

    it('removeClass', function () {
      (function () {
        removeClass();
        removeClass(test_box);
      }).should.not.throw();
      removeClass(test_box, 'a');
      test_box.className.should.equal('test_box');
      removeClass(test_box, 'test_box');
      test_box.className.should.equal('');
    });
  });

  var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
  var MOZ_HACK_REGEXP = /^moz([A-Z])/;

  var ieVersion = Number(document.documentMode);
  var camelCase = function camelCase(name) {
    return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    }).replace(MOZ_HACK_REGEXP, 'Moz$1');
  };

  var getStyle = ieVersion < 9 ? function (element, styleName) {
    if (!element || !styleName) return null;
    styleName = camelCase(styleName);
    if (styleName === 'float') {
      styleName = 'styleFloat';
    }
    try {
      switch (styleName) {
        case 'opacity':
          try {
            return element.filters.item('alpha').opacity / 100;
          } catch (e) {
            return 1.0;
          }
          break;
        default:
          return element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null;
      }
    } catch (e) {
      return element.style[styleName];
    }
  } : function (element, styleName) {
    if (!element || !styleName) return null;
    styleName = camelCase(styleName);
    if (styleName === 'float') {
      styleName = 'cssFloat';
    }
    try {
      var computed = document.defaultView.getComputedStyle(element, '');
      return element.style[styleName] || computed ? computed[styleName] : null;
    } catch (e) {
      return element.style[styleName];
    }
  };

  var setStyle = function setStyle(element, styleName, value) {
    if (!element || !styleName) return;

    if ((typeof styleName === 'undefined' ? 'undefined' : babelHelpers.typeof(styleName)) === 'object') {
      for (var prop in styleName) {
        if (styleName.hasOwnProperty(prop)) {
          setStyle(element, prop, styleName[prop]);
        }
      }
    } else {
      styleName = camelCase(styleName);
      if (styleName === 'opacity' && ieVersion < 9) {
        element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
      } else {
        element.style[styleName] = value;
      }
    }
  };

  describe('style unit test', function () {
    var test_box;

    beforeEach(function () {
      test_box = document.getElementById('test_box');
      test_box.className = "test_box";
    });

    it('getStyle', function () {
      (function () {
        getStyle();
        getStyle(test_box);
      }).should.not.throw();

      getStyle(test_box, 'width').should.equal('100px');
    });

    it('setStyle', function () {
      (function () {
        setStyle();
        setStyle(test_box);
      }).should.not.throw();

      setStyle(test_box, 'width', '200px');
      getStyle(test_box, 'width').should.equal('200px');
    });
  });

  var on = function () {
    if (document.addEventListener) {
      return function (element, event, handler) {
        if (element && event && handler) {
          element.addEventListener(event, handler, false);
        }
      };
    } else {
      return function (element, event, handler) {
        if (element && event && handler) {
          element.attachEvent('on' + event, handler);
        }
      };
    }
  }();

  var off = function () {
    if (document.removeEventListener) {
      return function (element, event, handler) {
        if (element && event) {
          element.removeEventListener(event, handler, false);
        }
      };
    } else {
      return function (element, event, handler) {
        if (element && event) {
          element.detachEvent('on' + event, handler);
        }
      };
    }
  }();

  var once = function once(el, event, fn) {
    var listener = function listener() {
      if (fn) {
        fn.apply(this, arguments);
      }
      on(el, event, listener);
    };
    off(el, event, listener);
  };

  describe('event util', function () {
    var test_box;

    beforeEach(function () {
      test_box = document.getElementById('test_box');
      test_box.className = "test_box";
    });

    it('should add event to dom', function () {
      (function () {
        on();
        on(test_box);
        on(test_box, 'click');
      }).should.not.throw();
      var handler = sinon.spy();
      on(test_box, 'click', handler);

      test_box.click();
      handler.should.calledOnce;
      test_box.click();
      handler.should.calledTwice;

      off(test_box, 'click', handler);

      test_box.click();
      handler.should.calledTwice;
    });

    it('should remove event of dom', function () {
      (function () {
        off();
        off(test_box);
        off(test_box, 'click');
      }).should.not.throw();
      var handler = sinon.spy();
      on(test_box, 'click', handler);

      test_box.click();
      handler.should.calledOnce;

      off(test_box, 'click', handler);

      test_box.click();
      handler.should.calledOnce;
    });

    it('should bind event once', function () {
      (function () {
        once();
        once(test_box);
        once(test_box, 'click');
      }).should.not.throw();

      var handler = sinon.spy();
      once(test_box, 'click', handler);

      test_box.click();
      handler.should.calledOnce;
      test_box.click();
      handler.should.calledOnce;

      off(test_box, 'click', handler);

      test_box.click();
      handler.should.calledOnce;
    });
  });

}));