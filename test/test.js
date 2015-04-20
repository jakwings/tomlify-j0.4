'use strict';

var fs = require('fs');
var should = require('should');
var yaml = require('js-yaml');
var toml = require('toml-j0.4');
var tomlify = require(__dirname + '/..');


describe('tomlify.toKey(key, alternative)', function () {

  [ ['key',             false,    'key']
  , ['M-N',             false,    'M-N']
  , ['M_N',             false,    'M_N']
  , ['101',             false,    '101']
  , ['U.S',             false,    '"U.S"']
  , ['"A"',             false,    '"\\"A\\""']
  , ['C:\\',            false,    '"C:\\\\"']
  , ['X\bY',            false,    '"X\\bY"']
  , ['X\tY',            false,    '"X\\tY"']
  , ['X\nY',            false,    '"X\\nY"']
  , ['X\fY',            false,    '"X\\fY"']
  , ['X\rY',            false,    '"X\\rY"']
  , ['X\0Y',            false,    '"X\\u0000Y"']
  , ['key',             true,     'key']
  , ['M-N',             true,     'M-N']
  , ['M_N',             true,     'M_N']
  , ['101',             true,     '101']
  , ['U.S',             true,     '"U.S"']
  , ['"A"',             true,     '"\\"A\\""']
  , ['C:\\',            true,     '"C:\\\\"']
  , ['X\bY',            true,     '"X\\bY"']
  , ['X\tY',            true,     '"X\\tY"']
  , ['X\nY',            true,     '"X\\nY"']
  , ['X\fY',            true,     '"X\\fY"']
  , ['X\rY',            true,     '"X\\rY"']
  , ['X\0Y',            true,     '"X\\u0000Y"']
  , [[],                false,    '']
  , [['a', 'b'],        false,    'a.b']
  , [['a', '.', 'c'],   false,    'a.".".c']
  , [['a', 0, 'c'],     false,    'a.[0].c']
  , [[],                true,     '']
  , [['a', 'b'],        true,     'a.b']
  , [['a', '.', 'c'],   true,     'a.".".c']
  , [['a', 0, 'c'],     true,     'a.c']
  ].forEach(function (data, i) {
    it('#' + (i + 1), function () {
      should(tomlify.toKey(data[0], data[1])).equal(data[2]);
    });
  });

});


describe('tomlify.toValue(value, null, null)', function () {

  [ [true,                    'true']
  , [false,                   'false']
  , ['key',                   '"key"']
  , ['M-N',                   '"M-N"']
  , ['M_N',                   '"M_N"']
  , ['101',                   '"101"']
  , ['U.S',                   '"U.S"']
  , ['"A"',                   '"\\"A\\""']
  , ['C:\\',                  '"C:\\\\"']
  , ['X\bY',                  '"X\\bY"']
  , ['X\tY',                  '"X\\tY"']
  , ['X\nY',                  '"X\\nY"']
  , ['X\fY',                  '"X\\fY"']
  , ['X\rY',                  '"X\\rY"']
  , ['X\0Y',                  '"X\\u0000Y"']
  , [0,                       '0.0']
  , [-300,                    '-300.0']
  , [3.14e30,                 '3.14e+30']
  , [new Date(1429529944532), '2015-04-20T11:39:04.532Z']
  , [{},                      '{}']
  , [{one: 1, $wo: '2'},      '{one = 1.0, "$wo" = "2"}']
  , [[],                      '[]']
  , [[[], []],                '[[], []]']
  , [[true, false],           '[true, false]']
  , [[1, 1.0],                '[1.0, 1.0]']
  , [[[true, false], [0, 0]], '[[true, false], [0.0, 0.0]]']
  ].forEach(function (data, i) {
    it('#' + (i + 1), function () {
      should(tomlify.toValue(data[0])).eql(data[1]);
    });
  });

});


describe('tomlify(value, null, space)', function () {

  var lineno = 0;
  var snippets = fs.readFileSync(__dirname + '/fixtures/snippets-values.txt', {
    encoding: 'utf8'
  }).split('\n-----------------------------------------------------------%\n')
    .forEach(function (s, i) {
      var data = s.split('\n-----------------------------%\n');
      if (data.length < 2) {
        return;
      }
      lineno += 1;
      var YAMLlg = data[0].match(/^/mg).length;
      var TOMLlg = data[1].match(/^/mg).length;
      var YAMLse = 'YAML[' + lineno + ':0-' + (lineno + YAMLlg) + ':0]';
      lineno += YAMLlg + 1;
      var TOMLse = 'TOML[' + lineno + ':0-' + (lineno + TOMLlg) + ':0]';
      lineno += TOMLlg;
      it('#' + (i + 1) + ' ' + YAMLse + ' ' + TOMLse, function () {
        should(tomlify(yaml.safeLoad(data[0]), null, 2)).equal(data[1]);
      });
    });

});


describe('tomlify(table, null, space)', function () {

  var lineno = 0;
  var snippets = fs.readFileSync(__dirname + '/fixtures/snippets-tables.txt', {
    encoding: 'utf8'
  }).split('\n-----------------------------------------------------------%\n')
    .forEach(function (s, i) {
      var data = s.split('\n-----------------------------%\n');
      if (data.length < 2) {
        return;
      }
      var YAMLlg = data[0].match(/^/mg).length;
      var TOMLlg = data[1].match(/^/mg).length;
      lineno += 1;
      var YAMLse = 'YAML[' + lineno + ':0-' + (lineno + YAMLlg) + ':0]';
      lineno += YAMLlg + 1;
      var TOMLse = 'TOML[' + lineno + ':0-' + (lineno + TOMLlg) + ':0]';
      lineno += TOMLlg;
      it('#' + (i + 1) + ' ' + YAMLse + ' ' + TOMLse, function () {
        var tableA = toml.parse(tomlify(yaml.safeLoad(data[0]), null, '\t'));
        var tableB = toml.parse(data[1]);
        should(tableA).eql(tableB);
      });
    });

});


describe('tomlify(table, replacer, space)', function () {

  var replace = function (key, value) {
    var context = this;
    if (typeof value === 'number') {
      return (value * 2).toFixed(0);
    } else if (context.path[0] === '$wo') {
      return null;
    } else if ('servers.beta.country' === tomlify.toKey(context.path)) {
      return null;
    } else if ('products.[1].comments' === tomlify.toKey(context.path)) {
      return null;
    }
    return false;
  };
  var lineno = 0;
  var snippets = fs.readFileSync(__dirname + '/fixtures/snippets-replace.txt', {
    encoding: 'utf8'
  }).split('\n-----------------------------------------------------------%\n')
    .forEach(function (s, i) {
      var data = s.split('\n-----------------------------%\n');
      if (data.length < 2) {
        return;
      }
      var YAMLlg = data[0].match(/^/mg).length;
      var TOMLlg = data[1].match(/^/mg).length;
      lineno += 1;
      var YAMLse = 'YAML[' + lineno + ':0-' + (lineno + YAMLlg) + ':0]';
      lineno += YAMLlg + 1;
      var TOMLse = 'TOML[' + lineno + ':0-' + (lineno + TOMLlg) + ':0]';
      lineno += TOMLlg;
      it('#' + (i + 1) + ' ' + YAMLse + ' ' + TOMLse, function () {
        var tableA = toml.parse(tomlify(yaml.safeLoad(data[0]), replace, '\t'));
        var tableB = toml.parse(data[1]);
        should(tableA).eql(tableB);
      });
    });

});
