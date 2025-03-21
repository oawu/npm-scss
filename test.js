/**
 * @author      OA Wu <oawu.tw@gmail.com>
 * @copyright   Copyright (c) 2015 - 2025, @oawu/scss
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const fs = require('fs/promises')
const { Type: T } = require('@oawu/helper')

const Scss = require('./index.js')

Scss.minify = false

const src = 'test/test.scss'
const desc = 'test/test.css'

Scss.file(src, result => {
  if (T.err(result)) {
    console.error('info：' + result.info)
    console.error('line：' + result.line)
    console.error('column：' + result.column)
    console.error('message：' + result.message)
    return
  }
  console.error(result.stats.duration)

  ;(async src => {
    const result = await Scss.file(src)

    if (T.err(result)) {
      console.error('info：' + result.info)
      console.error('line：' + result.line)
      console.error('column：' + result.column)
      console.error('message：' + result.message)
      return
    }

    console.error(result.stats.duration)

    await fs.writeFile(desc, result.utf8, { encoding: 'utf8' })
    console.error('ok')
  })(src).catch(console.error)
})

