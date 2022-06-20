/**
 * @author      OA Wu <oawu.tw@gmail.com>
 * @copyright   Copyright (c) 2015 - 2022, @oawu/xterm
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Scss = require('./index.js')
const FileSystem = require('fs')

Scss.minify = false
Scss.file('test/test.scss', (error, result) => {
  if (error) {
    console.error('info：' + error.info);
    console.error('line：' + error.line);
    console.error('column：' + error.column);
    console.error('message：' + error.message);
    return
  }
  
  console.error(result.stats.duration);

  FileSystem.writeFile("test/test.css", result.utf8, 'utf8', error => {
    console.error('ok');
  })
})
