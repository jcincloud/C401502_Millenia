﻿interface Console {
};

window.hasOwnProperty = window.hasOwnProperty || Object.prototype.hasOwnProperty;
if (typeof console === "undefined" || typeof console.log === "undefined") {
    var console: Console = <Console>{};

    console.log = function (msg) {
    };
    console.info = function (msg) {
    };
    console.error = function (msg) {
    };
    console.warn = function (msg) { }
}; 