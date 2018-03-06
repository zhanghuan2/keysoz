# 政采云定点服务项目前端工程

政采云前端项目工程,开发环境依赖node,npm,gulp,建议先安装 nrm,使用淘宝镜像安装。

## 安装依赖
* nodejs
* gulp
```
sudo npm i -g gulp-cli
```
* nrm (可选)
```
sudo npm i -g nrm 
```
使用淘宝镜像
```
nrm use taobao
```

## 修改配置文件

1. package.json
> 修改项目信息
2. config.js 
> 修改目录信息

## Get Started

### 安装
安装工程依赖
```blash
npm i
```

### 查看帮助 
```
gulp
```

### 下载依赖资源
```
gulp bundles
```

### 开发调试
``` JavaScript
npm run dev
// 或者
gulp dev
```

### 构建
```
npm run build
// 或者
gulp build
```

### 测试
```
npm run test
//或者
gulp test
```
### 静态检测 ES代码并Watch更新
执行
```blash
gulp detection --watch
```
> 选项 --fix 自动修正eslint warning

### 静态检测 ESLint
``` JavaScript
npm run eslint
// 或者
gulp eslint
```
### 静态检测 SASSLint
``` JavaScript
npm run sasslint
// 或者
gulp sasslint
```


## 开发规范
### 页面url命名
视图文件(views)第一层目录都为角色名,如 supplier, purchaser,auditor。

规则为 /${role}/${module}/${function}/${step}

eg, 会议培训定点的联系单列表页面

采购单位的为:
```blash
/purchaser/meeting/order
```
供应商为: 
```blash
/supplier/meeting/order
```

## 注意事项

1. 文件名和目录名(README.md,LISENCE除外) 字母统一小写,单词间用 '-'分隔
2. 没通过eslint、sasslint前请不要push到中心库
3. 使用淘宝镜像安装或者更新依赖包