/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2021, @oawu/scss
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const sass       = require('sass')
const Path       = require('path')
const FileSystem = require('fs')
const files      = []

function Scss(type, done) {
  return sass.render({ ...type, outputStyle: Scss.minify ? 'compressed' : 'expanded', importer: Scss.importer }, (error, result) => {
    if (!done) return

    error && (error.info = error.formatted.split("\n").shift())
    error || (result.utf8 = (Scss.minify ? '@charset "UTF-8";' + "\n" : '') + result.css.toString())

    return done(error, result)
  })
}

Scss.key    = '@'
Scss.minify = true

try { Scss.contents = FileSystem.readFileSync(__dirname + Path.sep + 'Libs' + Path.sep + 'Lalilo.scss', 'utf8') }
catch (_) { Scss.contents = null }

Scss.importer = (url, file, done) => {
  if (['Lalilo', '*'].includes(url) && Scss.contents !== null)
    return { contents: Scss.contents }

  const contents = '',
        tokens = url.split('/').map(token => token.trim()).filter(token => token.length)

  if (!tokens.length)
    return { contents }

  if (tokens.shift() == Scss.key)
    if (file = __dirname + Path.sep + 'Libs' + Path.sep, tokens.length)
      file += tokens.join(Path.sep)
    else
      file += Scss.key
  else
    file = Path.dirname(file) + Path.sep + url

  if (Path.extname(file) !== '.scss')
    file += '.scss'

  if (files.includes(file))
    return { file }

  if (!FileSystem.existsSync(file))
    return new Error('@import 的 "' + url + '" 不存在！')

  return files.push(file), { file }
}

Scss.file = (file, done) => Scss({ file }, done)
Scss.data = (data, done) => Scss({ data }, done)

module.exports = Scss
