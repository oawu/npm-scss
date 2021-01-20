/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2021, @oawu/xterm
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Scss = require('./index.js')
const FileSystem = require('fs')

Scss.file('test/test.scss', (error, { stats, css }) => {
  if (error) {
    console.error(error.message);
    console.error('line：' + error.line);
    console.error('column：' + error.column);
    return
  }
  
  console.error(stats.duration);

  FileSystem.writeFile("test/test.css", css.toString(), 'utf8', error => {
    console.error('ok');
  })
})
