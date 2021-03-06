/** Helpers for JavaScript debuging
 * Copyright (c) 2013-2014 Sendanor <info@sendanor.fi>
 * Copyright (c) 2013-2014 Jaakko-Heikki Heusala <jheusala@iki.fi>
 *
 */

"use strict";

var is = require("nor-is");
var util = require('util');
var debug = require('./core.js');
var print_path = require('./print-path.js');

/* Helper to get function name */
function get_function_name(fun) {
	var ret = ''+fun;
	var len = 'function '.length;
	if(ret.substr(0, len) === 'function ') {
		ret = ret.substr(len);
		ret = ret.substr(0, ret.indexOf('('));
	} else {
		ret = util.inspect(fun);
	}
	return ret;
}

/** Returns prefix for assert messages */
function get_assert_prefix() {
	var stack = debug.__stack;
	var file, line, func;

	if(stack && (stack.length >= 3)) {
		file = print_path(stack[2].getFileName()) || 'unknown';
		line = stack[2].getLineNumber();
		func = stack[2].getFunctionName();
	}

	// Initialize the start of msg
	var prefix = '';
	if(func) {
		prefix += 'Argument passed to ' + func + '()';
	} else {
		prefix += 'Assertion failed';
		prefix += ' (at ' + file + ':' + line +')';
	}
	return prefix;
}

/**  */
function NorAssert(value) {
	this.value = value;
	this.value_ignored = false;
}

/** Ignore tests if `this.value` is same as `value2` */
NorAssert.prototype.ignore = function assert_ignore(value2) {
	if(this.value === value2) {
		this.value_ignored = true;
	}
	return this;
};

/** Check that `this.value` is instance of `Type`
 * @todo Implement here improved log message "Argument #NNN passed to
 *       #FUNCTION_NAME is not instance of...", and I mean the original
 *       function where the assert was used!
 */
NorAssert.prototype['instanceof'] = function assert_instanceof(Type) {
	if(this.value_ignored) { return this; }
	if(this.value instanceof Type) { return this; }
	throw new TypeError( get_assert_prefix() + ' is not instance of ' + get_function_name(Type) + ': ' + util.inspect(this.value) );
}; // assert_instanceof

NorAssert.prototype.instanceOf = NorAssert.prototype['instanceof'];

/** Check that `this.value` is type of `type`
 * @param type {string} Name of type; string, number, object, ...
 * @todo Implement here improved log message "Argument #NNN passed to
 *       #FUNCTION_NAME is not instance of...", and I mean the original
 *       function where the assert was used!
 */
NorAssert.prototype['typeof'] = function assert_typeof(type) {
	if(this.value_ignored) { return this; }
	if(typeof this.value === ''+type) { return this; }
	throw new TypeError( get_assert_prefix() + ' is not type of ' + type + ': ' + util.inspect(this.value) );
}; // assert_typeof

NorAssert.prototype.typeOf = NorAssert.prototype['typeof'];

/** Changes the chain to test the property by name `key` from object `this.value`
 * @param value2 {string} Property name
 */
NorAssert.prototype.prop = function assert_property(key) {
	if(this.value_ignored) { return this; }
	if(!is.obj(this.value)) {
		throw new TypeError( get_assert_prefix() + ' cannot read property ' + util.inspect(key) + ' from non-object ' + util.inspect(this.value) );
	}
	return debug.assert(this.value[key]);
}; // assert_property

NorAssert.prototype.property = NorAssert.prototype.prop;

/** Check that `this.value` equals to `value2`
 * @param value2 {string} Another this.value
 * @todo Implement here improved log message "Argument #NNN passed to
 *       #FUNCTION_NAME is not instance of...", and I mean the original
 *       function where the assert was used!
 */
NorAssert.prototype.equals = function assert_equals(value2) {
	if(this.value_ignored) { return this; }
	if(this.value === value2) { return this; }
	throw new TypeError( get_assert_prefix() + ' does not equal: ' + util.inspect(this.value) + ' !== ' + util.inspect(value2) );
}; // assert_equals

/** Check that `this.value` is between range `min` and `max`
 * @param min {string} Optional. Minimum this.value accepted. Set to `undefined` to accept any this.value.
 * @param max {string} Optional. Maximum this.value accepted.
 * @todo Implement here improved log message "Argument #NNN passed to
 *       #FUNCTION_NAME is not instance of...", and I mean the original
 *       function where the assert was used!
 */
NorAssert.prototype.range = function assert_range(min, max) {
	if(this.value_ignored) { return this; }
	var min_accepted = is.defined(min) ? (this.value >= min) : true;
	var max_accepted = is.defined(max) ? (this.value <= max) : true;
	if( min_accepted && max_accepted ) { return this; }
	throw new TypeError( get_assert_prefix() + ' value ' + util.inspect(this.value) + ' not in range ' + util.inspect(min) + ' .. ' + util.inspect(max) );
}; // assert_range

/** Check that length of `this.value.length` equals to `value2`
 * @param value2 {number} Length
 */
NorAssert.prototype.length = function assert_length(value2) {
	if(this.value_ignored) { return this; }
	if(this.value.length === value2) { return this; }
	throw new TypeError( get_assert_prefix() + ' length does not equal: ' + util.inspect(this.value.length) + ' !== ' + util.inspect(value2) );
}; // assert_length

/** Check that length of `this.value.length` is equal or greater than `value2`
 * @param value2 {number} Length
 */
NorAssert.prototype.minLength = function assert_min_length(value2) {
	if(this.value_ignored) { return this; }
	if(this.value.length >= value2) { return this; }
	throw new TypeError( get_assert_prefix() + ' length less than: ' + util.inspect(this.value.length) + ' < ' + util.inspect(value2) );
}; // assert_min_length

/** Check that length of `this.value.length` is equal or less than `value2`
 * @param value2 {number} Length
 */
NorAssert.prototype.maxLength = function assert_max_length(value2) {
	if(this.value_ignored) { return this; }
	if(this.value.length <= value2) { return this; }
	throw new TypeError( get_assert_prefix() + ' length greater than: ' + util.inspect(this.value.length) + ' > ' + util.inspect(value2) );
}; // assert_max_length

/** Check `this.value` with nor-is, meaning it will check that `require('nor-is')[value2](this.value)` returns true.
 * @param value2 {mixed} Any this.value type, passed to nor-is function.
 */
NorAssert.prototype.is = function assert_is(value2) {
	if(this.value_ignored) { return this; }
	if(typeof is[value2] !== 'function') {
		throw new TypeError( get_assert_prefix() + ' has no support for checking ' + value2 );
	}
	if(is[value2](this.value)) { return this; }
	throw new TypeError( get_assert_prefix() + ' is not ' + value2 + ': ' + util.inspect(this.value) );
}; // assert_is

/** Check `this.value` with nor-is, meaning it will check that `require('nor-is')[value2](this.value)` returns not true.
 * @param value2 {mixed} Any this.value type, passed to nor-is function.
 */
NorAssert.prototype.not = function assert_is(value2) {
	if(this.value_ignored) { return this; }
	if(typeof is[value2] !== 'function') {
		throw new TypeError( get_assert_prefix() + ' has no support for checking ' + value2 );
	}
	if(!is[value2](this.value)) { return this; }
	throw new TypeError( get_assert_prefix() + ' is ' + value2 + ': ' + util.inspect(this.value) );
}; // assert_is

/** Check `this.value` matches pattern `value2`.
 * @param value2 {RegExp} The pattern as `RegExp` object
 */
NorAssert.prototype.pattern = function assert_pattern(value2) {
	if(this.value_ignored) { return this; }
	if(!is.objOf(value2, RegExp)) {
		throw new TypeError( get_assert_prefix() + ' has no support for other than RegExp: ' + util.inspect(value2) );
	}
	if(value2.test(this.value)) { return this; }
	throw new TypeError( get_assert_prefix() + ' does not match ' + value2 + ': ' + util.inspect(this.value) );
}; // assert_pattern

// Exports
module.exports = NorAssert;

/* EOF */
