var path = require('path')
var cheerio = require('cheerio')
var hljs = require('highlight.js')
var loaderUtils = require('loader-utils')
var markdown = require('markdown-it')
var cache = require('./cache')
var genId = require('./gen-id')

var trim = function (str) {
  return str.replace(/^\s+|\s+$/g, '')
}

/**
 * `{{ }}` => `<span>{{</span> <span>}}</span>`
 * @param  {string} str
 * @return {string}
 */
var replaceDelimiters = function (str) {
  return str.replace(/({{|}})/g, '<span>$1</span>')
}

/**
 * renderHighlight
 * @param  {string} str
 * @param  {string} lang
 */
var renderHighlight = function (str, lang) {
  if (!(lang && hljs.getLanguage(lang))) {
    return ''
  }

  try {
    return replaceDelimiters(hljs.highlight(lang, str, true).value)
  } catch (err) {}
}

/**
 * html => vue file template
 * @param  {[type]} html [description]
 * @return {[type]}      [description]
 */
var renderVueTemplate = function (html) {
  var $ = cheerio.load(html, {
    decodeEntities: false,
    lowerCaseAttributeNames: false,
    lowerCaseTags: false
  })

  var result

  result = '<template><section>' + $.html() + '</section></template>\n'

  return result
}

module.exports = function (source) {
  this.cacheable()

  var parser
  var params = loaderUtils.parseQuery(this.query)

  var opts = Object.assign(params, this.vueMarkdown, this.options.vueMarkdown)

  if ({}.toString.call(opts.render) === '[object Function]') {
    parser = opts
  } else {
    opts = Object.assign({
      preset: 'default',
      html: true,
      highlight: renderHighlight
    }, opts)

    var plugins = opts.use
    var preprocess = opts.preprocess

    delete opts.use
    delete opts.preprocess

    parser = markdown(opts.preset, opts)
    if (plugins) {
      plugins.forEach(function (plugin) {
        if (Array.isArray(plugin)) {
          parser.use.apply(parser, plugin)
        } else {
          parser.use(plugin)
        }
      })
    }
  }


  let head = {
    title: opts.options.titleSuffix || ''
  }
  var navRs = source.match(/---([\s\S]*?)---/)
  if (navRs && navRs[1]) {
    navRs[1].split('\n').filter(one => {
      return !!one
    }).forEach(one => {
      let list = one.split(':')
      if (list[0] === 'title') {
        head.title = trim(list[1]) + (opts.options.titleSuffix || '')
      }
    })
  }

  source = source.replace(/---([\s\S]*?)---/, '')

  var codeInlineRender = parser.renderer.rules.code_inline;
  parser.renderer.rules.code_inline = function () {
    return replaceDelimiters(codeInlineRender.apply(this, arguments));
  }

  if (preprocess) {
    source = preprocess.call(this, parser, source)
  }
  source = source.replace(/@/g, '__at__')

  var filePath = this.resourcePath
  var content = parser.render(source).replace(/__at__/g, '@')
  var result = `<template><div>${content}</div></template>`
  result = result.replace(/{{/g, '<span>{{</span>')
  .replace(/}}/g, '<span>}}</span>')

  result += `<script>
export default {
  head: ${JSON.stringify(head)}
}
  </script>`

  

  var fileName = path.basename(filePath, '.md')

  filePath = cache.save(fileName + '-' + genId(filePath), result)

  return 'module.exports = require(' +
    loaderUtils.stringifyRequest(this, '!!vue-loader!' + filePath) +
    ');'
}