# qiniu-upload-image-plus

一个 VS Code 插件，编写 Markdown 时可以快捷上传本地图片获取七牛图床外链。

## Features

![priview](https://raw.githubusercontent.com/yscoder/vscode-qiniu-upload-image/master/features/demo.gif)

> Tips: 只有在编辑 Markdown 时插件才可使用。

## Usage

1. 粘贴图片路径上传：`SHIFT + P`
2. 直接选择图片上传：`SHIFT + O`
3. 截屏图片上传： `SHIFT + V`
> 支持qq，微信等工具的截图

> 按键需在英文编辑状态下有效，功能2 需要升级 vscode 到 v1.17+。

## Install

`Ctrl+P` 输入命令：

```bash
ext install qiniu-upload-image-plus
```
> 还没上传

## User Settings

```js
{
    // 插件开关
    "qiniu.enable": true,

    // 一个有效的七牛 AccessKey 签名授权
    "qiniu.access_key": "*****************************************",

    // 一个有效的七牛 SecretKey 签名授权
    "qiniu.secret_key": "*****************************************",

    // 七牛图片上传空间
    "qiniu.bucket": "ysblog",

    // 七牛图片上传路径，参数化命名，暂时支持 ${fileName}、${mdFileName}、${date}、${dateTime}
    // 示例：
    //   ${fileName}-${date} -> picName-20160725.jpg
    //   ${mdFileName}-${dateTime} -> markdownName-20170412222810.jpg
    "qiniu.remotePath": "${fileName}",

    // 七牛图床域名
    "qiniu.domain": "http://xxxxx.xxxx.com",

    // 截图图片本地保存路径（因为七牛的api限制，截图上传是先将黏贴板里的图片存储到本地，然后再根据这个路径上传图片
    // 如果介意，可以再图片存储路径添加自动删除脚本
    "qiniu.location": "./img"
}
```

## 参考
本插件是综合一下两个实现，支持开源，尊重原创

[https://github.com/favers/vscode-qiniu-upload-image](https://github.com/favers/vscode-qiniu-upload-image)

[https://github.com/yscoder/vscode-qiniu-upload-image](https://github.com/yscoder/vscode-qiniu-upload-image)

**Enjoy!**
