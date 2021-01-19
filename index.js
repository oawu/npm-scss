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

function Scss(file, done, fail) {
  const outputStyle = Scss.minify ? 'compressed' : 'expanded'

  const importer = (url, file, done) => {
    const contents = '',
          tokens = url.split('/').map(token => token.trim()).filter(token => token.length)

    if (!tokens.length)
      return { contents }
    
    if (tokens.shift() == 'Lalilo')
      if (file = __dirname + Path.sep + 'Libs' + Path.sep, tokens.length)
        file += tokens.join(Path.sep)
      else
        file += Scss.quick ? 'Quick' : '_'
    else
      file = Path.dirname(file) + Path.sep + url

    return Path.extname(file) !== '.scss' && (file += '.scss'),
      FileSystem.existsSync(file)
        ? files.has(file)
          ? { contents }
          : (files.set(file), { file })
        : new Error('@import 的 ' + url + ' 不存在！')
  }

  const finish = (error, result) => error ? fail(error) : done(result)

  return sass.render({ file, outputStyle, importer }, finish)
}


Scss.minify = true
Scss.quick  = false

module.exports = Scss
