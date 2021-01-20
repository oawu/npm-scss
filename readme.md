# OA's Node scss 轉換工具

OA's Node scss 轉換工具 📝


## 說明
很簡單就是一個 [`md5`](https://zh.wikipedia.org/zh-tw/MD5) 功能，比較特別的就是加入了類似 [PHP](https://zh.wikipedia.org/zh-tw/PHP) 的 [`md5_file`](https://www.php.net/manual/zh/function.md5-file.php) 函式。

## 安裝

```shell
npm install @oawu/md5
```


## 使用

引入 `require('@oawu/md5')` 即可使用 **md5** 功能，如下範例：

```javascript

  const md5 = require('@oawu/md5')
  console.log(md5('哈囉～'))
  console.log(md5.file('/filepath...'))

```
