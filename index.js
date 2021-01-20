/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2021, @oawu/scss
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const sass       = require('sass')
const Path       = require('path')
const FileSystem = require('fs')
const files      = new Map()

function Scss(type, done, fail) {
  const outputStyle = Scss.minify ? 'compressed' : 'expanded'

  const finish = (error, result) => error ? fail(error) : done(result)

  return sass.render({ ...type, outputStyle, importer: Scss.importer }, finish)
}

Scss.minify = true
Scss.key    = '@'

try { Scss.contents = FileSystem.readFileSync(__dirname + Path.sep + 'Libs' + Path.sep + 'Lalilo.scss', 'utf8') }
catch (_) { Scss.contents = null }

Scss.importer = (url, file, done) => {
  if (url === 'Lalilo' && Scss.contents !== null)
    return { contents: Scss.contents }

  const contents = '',
        tokens = url.split('/').map(token => token.trim()).filter(token => token.length)

  if (!tokens.length)
    return { contents }
  
  if (tokens.shift() == Scss.key)
    if (file = __dirname + Path.sep + 'Libs' + Path.sep, tokens.length)
      file += tokens.join(Path.sep)
    else
      file += '@'
  else
    file = Path.dirname(file) + Path.sep + url

  return Path.extname(file) !== '.scss' && (file += '.scss'),
    FileSystem.existsSync(file)
      ? files.has(file)
        ? { contents }
        : (files.set(file), { file })
      : new Error('@import 的 ' + url + ' 不存在！')
}

Scss.file = file => Scss({ file })
Scss.data = data => Scss({ data })

module.exports = Scss
