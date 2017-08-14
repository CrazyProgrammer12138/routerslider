/*
 * spmrc
 *
 * Thanks to: https://github.com/shockie/node-iniparser
 *
 * An example of ~/.spm/spmrc-3x
 *
 * [user]
 * username=lepture
 *
 * [server:spm]
 * url = https://spmjs.io
 *
 */

var fs = require('fs');
var path = require('path');

var homedir = process.env.HOME;
if (!homedir) {
  homedir = process.env.HOMEDRIVE + process.env.HOMEPATH;
}

module.exports = function (opts) {

  var DIR = opts.dir || '.node-cli-config'
  var FILE = opts.file || 'config'
  var DEFAULTS = opts.defaults || {}

  /**
   * Where is your spmrc file.
   */
  var spmrcfile = path.join(homedir, DIR, FILE);

  var tmpdir = process.env.TMPDIR || process.env.TMP || process.env.TEMP;
  if (!tmpdir) {
    if (process.platform === 'win32') {
      tmpdir = 'c:\\windows\\temp';
    } else {
      tmpdir = '/tmp';
    }
  }

  var defaults = DEFAULTS

  var get = function (key) {
    var file = spmrcfile;
    var ret = renderConfig(parse(file));
    if (!key) return ret;

    key = key.replace(':', '.');
    var keys = key.split('.');
    keys.forEach(function (section) {
      ret = ret ? ret[section] : null;
    });
    if (!ret && defaults[key]) {
      return defaults[key];
    }
    return ret;
  };

  var set = function (key, value) {
    var file = spmrcfile;
    var data = parse(file);
    var keys = key.split('.');
    var ret;

    if (keys.length === 3) {
      ret = [];
      ret.push(keys[0] + ':' + keys[1]);
      ret.push(keys[2]);
      keys = ret;
    }
    if (keys.length === 2) {
      data[keys[0]] = data[keys[0]] || {};
      data[keys[0]][keys[1]] = value;
    } else if (keys.length === 1) {
      data[keys[0]] = value;
    } else {
      throw new Error('A valid input should be something like user.username=spm');
    }
    updateConfig(data);
    return data;
  };

  /**
   * Combine set and get into one function.
   */
  var config = function (key, value) {
    if (!value) return get(key);
    return set(key, value);
  };

  var regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,
    comment: /^\s*;.*$/
  };
  var _cache = {};

  /**
   * Parse ini format data.
   */
  function parse(file) {
    file = file || spmrcfile;
    if (!fs.existsSync(file)) {
      return {};
    }
    var data;
    if (_cache.hasOwnProperty(file)) {
      data = _cache[file];
    } else {
      data = fs.readFileSync(file, 'utf8');
      _cache[file] = data;
    }
    var value = {};
    var lines = data.split(/\r\n|\r|\n/);
    var section = null;
    var match;
    lines.forEach(function (line) {
      if (regex.comment.test(line)) {
        return;
      }
      if (regex.param.test(line)) {
        match = line.match(regex.param);
        if (section) {
          value[section][match[1]] = match[2];
        } else {
          value[match[1]] = match[2];
        }
      } else if (regex.section.test(line)) {
        match = line.match(regex.section);
        value[match[1]] = {};
        section = match[1];
      } else if (line.length === 0 && section) {
        section = null;
      }
    });
    return value;
  }
  var parse = parse;

  function updateConfig(data) {
    var text = '';
    var init = true;
    var file = spmrcfile;

    Object.keys(data).forEach(function (section) {
      if (!init) {
        text += '\n';
      } else {
        init = false;
      }
      if (typeof data[section] === 'object') {
        text += '[' + section + ']\n';
        Object.keys(data[section]).forEach(function (key) {
          text += key + ' = ' + data[section][key] + '\n';
        });
      } else {
        text += section + ' = ' + data[section];
      }
    });
    mkdir(path.dirname(file));
    fs.writeFileSync(file, text);
    delete _cache[file];
  }
  var write = updateConfig;
  return {
    get: get,
    set: set,
    config: config,
    write: write,
    parse: parse,
    spmrcfile: spmrcfile
  }
}

/**
 * Make config data to objects.
 */
function renderConfig(data) {
  var ret = {};
  Object.keys(data).forEach(function (section) {
    var sections = section.split(':');
    if (sections.length === 2) {
      ret[sections[0]] = ret[sections[0]] || {};
      ret[sections[0]][sections[1]] = data[section];
    } else {
      ret[section] = data[section];
    }
  });
  return ret;
}

/**
 * Merge object key values.
 */
function merge(obj) {
  var target, key;

  for (var i = 1; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}

/**
 * Recursively mkdir. Like `mkdir -r`
 */
function mkdir(dirpath) {
  if (fs.existsSync(dirpath)) return;

  dirpath.split(/[\/\\]/g).reduce(function (parts, part) {
    parts += part + '/';
    var subpath = path.resolve(parts);
    if (!fs.existsSync(subpath)) {
      fs.mkdirSync(subpath);
    }
    return parts;
  }, '');
}