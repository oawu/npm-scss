/**
 * @author      OA Wu <oawu.tw@gmail.com>
 * @copyright   Copyright (c) 2015 - 2025, @oawu/scss
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path = require('path')
const _sass = require('sass')
const fs = require('fs/promises')

const files = []

const { tryIgnore, closureOrPromise, Type: T } = require('@oawu/helper')

let _contents = null

const Scss = function (type, done = null) {
  return closureOrPromise(done, done => _sass.render({
    importer: (url, file, done) => {
      (async (url, file) => {
        if (_contents === null) {
          _contents = await fs.readFile(__dirname + Path.sep + 'Libs' + Path.sep + 'Lalilo.scss', { encoding: 'utf8' })
        }

        if (['Lalilo', '*'].includes(url) && _contents !== null) {
          return { contents: _contents }
        }

        const contents = ''
        const tokens = url.split('/').map(token => token.trim()).filter(token => token !== '')

        if (!tokens.length) {
          return { contents }
        }

        if (tokens.shift() == Scss.key) {

          if (file = __dirname + Path.sep + 'Libs' + Path.sep, tokens.length) {
            file += tokens.join(Path.sep)
          } else {
            file += Scss.key
          }
        } else {
          file = Path.dirname(file) + Path.sep + url
        }

        if (Path.extname(file) !== '.scss') {
          file += '.scss'
        }

        if (files.includes(file)) {
          return { file }
        }

        const access = await tryIgnore(fs.access(file, fs.constants.R_OK))
        if (T.err(access)) {
          throw new Error(`@import 的 "${url}" 沒有訪問權限。`, { cause: access })
        }

        const stats = await fs.stat(file)
        if (!stats.isFile()) {
          throw new Error(`@import 的 "${url}" 不是檔案類型。`)
        }

        files.push(file)

        return { file }

      })(url, file).then(done).catch(done)
    },
    outputStyle: Scss.minify
      ? 'compressed'
      : 'expanded',
    ...type,
  }, (error, result) => {
    if (T.err(error)) {
      error.info = error.formatted.split("\n").shift()
      return done(error)
    }

    result.utf8 = (Scss.minify ? '@charset "UTF-8";' + "\n" : '') + result.css.toString()
    return done(result)
  }))
}

Scss.key = '@'
Scss.minify = true
Scss.file = (file, done = null) => Scss({ file }, done)
Scss.data = (data, done = null) => Scss({ data }, done)

module.exports = Scss
