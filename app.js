/*
 *
 */

var express = require('express')
  , stylus = require('stylus')
  , nib = require('nim');

var app = express();
function compile(str, path) {
	return stylus(str).set('filename', path).use(nib());
}


