(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.index = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  function createStore(_ref) {
    var updater = _ref.updater;
    var state = _ref.state;
    var _ref$subscribers = _ref.subscribers;
    var subscribers = _ref$subscribers === undefined ? [] : _ref$subscribers;

    function dispatch(action) {
      state = updater(state, action);
      subscribers.forEach(function (subscriber) {
        return subscriber(state);
      });
    }

    function subscribe(fn) {
      subscribers.push(fn);
      return function () {
        if (subscribers.indexOf(fn) !== -1) {
          subscribers.splice(subscribers.indexOf(fn), 1);
        }
      };
    }

    function getState() {
      return state;
    }

    return { getState: getState, subscribe: subscribe, dispatch: dispatch };
  }

  function createElement(_ref2) {
    var tagName = _ref2.tagName;
    var _ref2$props = _ref2.props;
    var props = _ref2$props === undefined ? {} : _ref2$props;
    var _ref2$children = _ref2.children;
    var children = _ref2$children === undefined ? [] : _ref2$children;
    var parent = _ref2.parent;

    children = !Array.isArray(children) ? [children] : children;
    var element = document.createElement(tagName);
    Object.keys(props).forEach(function (prop) {
      element[prop] = props[prop];
    });
    if (parent) {
      parent.appendChild(element);
    }
    if (children.length) {
      children.forEach(function (child) {
        if (typeof child === "string" || typeof child === "number") {
          element.innerText = child;
        } else {
          createElement(Object.assign({}, child, { parent: element }));
        }
      });
    }
    return element;
  }

  function render(component, selector) {
    document.querySelector(selector).appendChild(createElement(component));
  }

  exports.default = { createStore: createStore, createElement: createElement, render: render };
});
