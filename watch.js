/**
 * @author      OA Wu <oawu.tw@gmail.com>
 * @copyright   Copyright (c) 2015 - 2022, @oawu/scss
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path       = require('path')
const FileSystem = require('fs')
const Chokidar   = require('chokidar')
const Process    = require('child_process')

const Xterm  = require('@oawu/xterm')
const Cli    = require('@oawu/cli-progress')
const Queue  = require('@oawu/queue')
const Helper = require('@oawu/helper')

Xterm.stringPrototype()
Cli.option.color = true

const { file: SCSS } = require('./scss.js')
const notify         = require('./notify.js')

const { title, done, fail } = Cli
const { clean, exists, access, println, mkdir } = Helper

const cmdColor = (desc, action = null) => desc.lightGray.dim + (action !== null ? '：'.dim + action.lightGray.dim.italic : '')

const ScssQ = {
  scssDir: null,
  cssDir: null,
  items: [],
  isWorking: false,
  enqueue (type, file) {
    clearTimeout(this.timer)

    const items = []
    for (let item of this.items)
      item.file == file || items.push(item)
    items.push({ type, file })

    return this.items = items, this.timer = setTimeout(_ => this.dequeue(), 200), this
  },
  dequeue () {
    if (this.isWorking) {
      return this;
    } else {
      this.isWorking = true
    }

    if (this.items.length) {
      const { type, file: scssFile } = this.items[0]

      const path = Path.relative(this.scssDir, scssFile)
      const dirs = path.split(Path.sep)
      const fileName = dirs.pop()
      const name = Path.basename(fileName, '.scss') + '.css'

      const cssFilePath = this.cssDir + (dirs.length ? dirs.join(Path.sep) + Path.sep : '')
      const cssFile = cssFilePath + name
        
      return type < 0
        ? title('移除 SCSS', `scss 路徑：${scssFile}`.dim, `css 路徑：${cssFile}`.dim) && FileSystem.exists(cssFile, exists => exists ? FileSystem.unlink(cssFile, error => error ? this.fail([`檔案路徑：${cssFile}`, `錯誤原因：${error.message}`]) : FileSystem.exists(cssFile, exists => exists ? this.fail([`檔案路徑：${cssFile}`, '錯誤原因：刪除失敗！']) : this.done())) : this.done())
        : title(type == 0 ? '修改 SCSS' : '加入 SCSS', `scss 路徑：${scssFile}`.dim, `css 路徑：${cssFile}`.dim) && SCSS(scssFile, (error, result) => {
          if (error) return this.fail([`檔案路徑：${scssFile}`, `錯誤位置：第 ${error.line} 行，第 ${error.column} 個字}`, `錯誤原因：${error.info}`])

          exists(cssFilePath) || mkdir(cssFilePath, true)
          exists(cssFilePath)
            ? FileSystem.writeFile(cssFile, result.utf8.replace(/^\uFEFF/gm, ""), error => error ? this.fail(['寫入 css 失敗', '檔案路徑：' + cssSrc]) : this.done())
            : this.fail(['建立 css 子目錄失敗', '檔案路徑：' + Path.relative(rootPath, cssFilePath)])
        })
    } else {
      this.isWorking = false
    }

    return this
  },
  next () {
    this.items.shift()
    this.isWorking = false
    this.dequeue()
    return this
  },
  done () {
    done()
    return this.next()
  },
  fail (messages) {
    fail()
    println(`   ${'※'.red} 錯誤資訊`)
    messages.forEach(message => println(`     ${'↳'.dim.red} ${message}`))
    notify(messages.join("\n"))
    return this.next()
  },
}


const Watch = {
  _dir: {
    scss: null,
    css: null,
  },
  scssDir (dir) {
    return this._dir.scss = Path.resolve(dir) + Path.sep, this
  },
  cssDir (dir) {
    return this._dir.css = Path.resolve(dir) + Path.sep, this
  },
  start () {
    Queue()
      .enqueue(next => {
        clean()
        println("\n" + ' § '.dim + '啟動 OA\'s SCSS ➜ CSS 轉換器'.blod)
        println("\n" + ' 【檢查目錄是否正確】'.yellow)
        next()
      })
      .enqueue(next => {
        title('檢查 scss 目錄是否存在', cmdColor('執行動作', 'check scss dir is exists?'))

        exists(this._dir.scss) && access(this._dir.scss, FileSystem.constants.R_OK || FileSystem.constants.W_OK)
          ? next(done())
          : fail(null, 'SCSS 目錄不存在或者沒有讀寫權限', '目錄：' + this._dir.scss)    
      })
      .enqueue(next => {
        title('檢查 css 目錄是否存在', cmdColor('執行動作', 'check css dir is exists?'))

        exists(this._dir.css) && access(this._dir.css, FileSystem.constants.R_OK || FileSystem.constants.W_OK)
          ? next(done())
          : fail(null, 'CSS 目錄不存在或者沒有讀寫權限', '目錄：' + this._dir.css)    
      })
      .enqueue(next => {
        title('清空 CSS 目錄', cmdColor('執行指令', 'rm -rf ' + this._dir.css + '*'))
        Process.exec('rm -rf ' + this._dir.css + '*', error => error ? fail(null, error) : next(done()))
      })
      .enqueue(next => {
        println("\n" + ' 【開始轉譯】'.yellow)

        ScssQ.scssDir = this._dir.scss
        ScssQ.cssDir = this._dir.css

        Chokidar
          .watch(this._dir.scss + '**' + Path.sep + '*')
          .on('add',    file => ScssQ.enqueue(1, file))
          .on('change', file => ScssQ.enqueue(0, file))
          .on('unlink', file => ScssQ.enqueue(-1, file))
          .on('error', error => {
            println(`   ${'※'.red} 發生錯誤`)
            println('')
            println(error)
            process.exit()
          })
          .on('ready', _ => next())
      })
    return this
  }
}

module.exports = Watch
