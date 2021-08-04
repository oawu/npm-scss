/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2021, @oawu/scss
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */
const Notifier = require('node-notifier')
const { Typeof } = require('@oawu/helper')

let notifierEnable = true

module.exports = (message, title, subtitle) => {
  if (!notifierEnable) return
  let option = { sound: true, wait: false, timeout: 5, closeLabel: '關閉', actions: ['不再顯示'], dropdownLabel: '其他', withFallback: true, reply: true }
  
  Typeof.str.notEmpty.do(title, title => option.title = title)
  Typeof.str.notEmpty.do(subtitle, subtitle => option.subtitle = subtitle)
  Typeof.str.notEmpty.do(message, message => option.message = message)

  new Notifier.NotificationCenter().notify(option, (error, response, metadata) => notifierEnable = !(response == 'activate' && metadata.activationValue == '不再顯示'))
}
