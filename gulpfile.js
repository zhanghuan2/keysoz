/**
 * @description 使用gulp来构建前端,替换原有 linner + jiggly 的组合, 简化前端开发环境 的复杂度,提高构建的效率
 * 增加构建的灵活性可定制性
 */
'use strict';

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const gulpSequence = plugins.sequence.use(gulp);
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const decompress = require('gulp-decompress');


const browserSync = require('browser-sync').create();

const fs = require('fs');
const path = require('path');
const Url = require('url');
const chalk = require('chalk');
const _ = require('lodash');

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const config = require('./config');
const defaultsEnv = {revision: true, postCss: true, uglify: true};
const environments = config.environments || {};
let env = defaultsEnv;
const e = argv.e;
if (e) {
  env = environments[e] || env;
}
const chores = require('./build/chores');
const action = process.argv[2];

const dirSrc = config.paths.src;
const dirPublic = config.paths.public;

const isWatch = ('dev' === action);

console.log(isWatch);

/**
 * 监视文件变化
 * @param globs {String}
 * @param name {String} 任务名
 */
function doWatch(globs, name) {
  if (isWatch) {
    let watcher = gulp.watch(globs, [name]);
    watcher.on('change', function (event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
  }
}

/**
 * 初始化文件拷贝任务
 */
function initCopyTasks() {
  let copyConfig = config.chores.copy;
  let taskName = 'copy';
  let copyTasks = [];
  if (copyConfig) {
    let key, itemConfig, name, globs, base, dest;
    for (key in copyConfig) {
      name = `copy-${key}`;
      itemConfig = copyConfig[key];
      globs = path.join(dirSrc, itemConfig.globs);
      base = path.join(dirSrc, itemConfig.base);
      dest = path.join(dirPublic, itemConfig.dest);
      copyTasks.push(name);
      chores.initCopyTask(name, globs, base, dest);
      doWatch(globs, name);
    }
  }
  gulp.task(taskName, copyTasks);
}
initCopyTasks();

/**
 * 初始化编译任务
 */
function initCompileTasks() {
  let compileConfig = config.chores.compile;
  let taskName = 'compile';
  let compileTasks = [];
  let envCompile = env.compile;
  if (compileConfig) {
    let key, itemConfig, name, globs, base, dest, context;
    for (key in compileConfig) {
      itemConfig = compileConfig[key];
      name = `compile-${key}`;
      globs = path.join(dirSrc, itemConfig.globs);
      base = path.join(dirSrc, itemConfig.base);
      dest = path.join(dirPublic, itemConfig.dest);
      context = (envCompile && envCompile[key] && envCompile[key].context) || itemConfig.context;
      chores.initCompileTask(name, globs, base, dest, context);
      compileTasks.push(name);
      doWatch(globs, name);
    }
  }
  gulp.task(taskName, compileTasks);
}
initCompileTasks();

/**
 * 初始化编译模板任务
 */
function initPrecompileTasks() {
  let precompileConfig = config.chores.precompile;
  let taskName = 'precompile';
  let precompileTasks = [];
  if (precompileConfig) {
    let key, name, configItem, dest, globs;
    for (key in precompileConfig) {
      name = `precompile-${key}`;
      configItem = precompileConfig[key];
      globs = path.join(dirSrc, configItem.globs);
      dest = path.join(dirPublic, configItem.dest);
      chores.initPrecompileTask(name, globs, dest);
      precompileTasks.push(name);
      doWatch(globs, name);
    }
  }
  gulp.task(taskName, precompileTasks);
}
initPrecompileTasks();

/**
 * 初始化合并脚本文件任务
 */
function initConcatScriptTasks() {
  let concatScriptConfig = config.chores.concatScript;
  let taskName = 'concat-script';
  let concatScriptTasks = [];
  if (concatScriptConfig) {
    let key, configItem, name, globs, dest, definition, wrapper, order;
    for (key in concatScriptConfig) {
      configItem = concatScriptConfig[key];
      name = `concat-script-${key}`;
      globs = path.join(dirSrc, configItem.globs);
      dest = path.join(dirPublic, configItem.dest);
      definition = configItem.definition;
      wrapper = !!configItem.wrapper;
      order = configItem.order;
      chores.initScriptConcatTask(name, globs, order, wrapper, definition, dest);
      concatScriptTasks.push(name);
      if(isWatch) {
        let watcher = gulp.watch(globs, [name]);
        console.log(globs);
        watcher.on('change',function (event){
          console.log(`${event.type}:${event.path}`);
          if('delete' === event.type) {
            delete plugins.cached.caches[name][event.path];
            plugins.remember.forget(name,event.path);
          }
        });
      }
    }
  }
  gulp.task(taskName, concatScriptTasks);
}
initConcatScriptTasks();

/**
 * 初始化合并样式文件任务
 */
function initConcatStyleTasks() {
  let concatStyleConfig = config.chores.concatStyle;
  let taskName = 'concat-style';
  let tasks = [];
  if (concatStyleConfig) {
    let key, itemConfig, name, globs, dest, order;
    for (key in concatStyleConfig) {
      itemConfig = concatStyleConfig[key];
      name = `concat-style-${key}`;
      globs = path.join(dirSrc, itemConfig.globs);
      dest = path.join(dirPublic, itemConfig.dest);
      order = itemConfig.order;
      chores.initStyleConcatTask(name, globs, order, dest);
      tasks.push(name);
      if(isWatch) {
        let watcher = gulp.watch(globs, [name]);
        watcher.on('change',function (event){
          console.log(`${event.type}:${event.path}`);
          if('delete' === event.type) {
            delete plugins.cached.caches[name][event.path];
            plugins.remember.forget(name,event.path);
          }
        });
      }
    }
  }
  gulp.task(taskName, tasks);
}
initConcatStyleTasks();

/**
 * 初始化雪碧图处理任务
 */
// function initSpriteTasks() {
//   let spriteConfig = config.chores.sprite;
//   let taskName = 'sprite';
//   let tasks = [];
//   if (spriteConfig) {
//     let key, name, itemConfig, globs, outImage, outCss, imageUrl, templateSrc;
//     for (key in spriteConfig) {
//       name = `sprite-${key}`;
//       itemConfig = spriteConfig[key];
//       globs = path.join(dirSrc, itemConfig.globs);
//       outImage = path.join(dirPublic, itemConfig.outImage);
//       outCss = path.join(dirPublic, itemConfig.outCss);
//       imageUrl = itemConfig.imageUrl;
//       templateSrc = path.join(dirSrc, itemConfig.templateSrc);
//       chores.initSpriteTask(name, globs, outImage, outCss, imageUrl, templateSrc)
//       tasks.push(name);
//       doWatch(globs, name);
//     }
//   }
//   gulp.task(taskName, tasks);
// }
// initSpriteTasks();

/**
 * 初始化tar任务
 */
function initTarTasks() {
  let tarConfig = config.chores.tar;
  let taskName = 'tar';
  let tasks = [];
  if (tarConfig) {
    let key, itemConfig, name, globs, dest;
    for (key in tarConfig) {
      itemConfig = tarConfig[key];
      name = `tar-${key}`;
      globs = path.join(dirSrc, itemConfig.globs);
      dest = path.join(dirPublic, itemConfig.dest);
      chores.initTarTask(name, globs, dest);
      tasks.push(name);
      doWatch(globs, name);
    }
  }
  gulp.task(taskName, tasks);
}
initTarTasks();


/**
 * 初始化hash任务
 */
function initRevisionTasks() {
  let revisionConfig = config.chores.revision;
  let taskName = 'revision';
  let tasks = [];
  if (revisionConfig) {
    let key, itemConfig, name, globs, base, dest, manifestDest;
    for (key in revisionConfig) {
      name = `revision-${key}`;
      itemConfig = revisionConfig[key];
      globs = path.join(dirPublic, itemConfig.globs);
      base = dirPublic;
      dest = dirPublic;
      manifestDest = path.join(dirPublic, itemConfig.dest);
      chores.initRevisionTask(name, globs, base, dest, manifestDest);
      tasks.push(name);
    }
  }
  gulp.task(taskName, tasks);
}
initRevisionTasks();


/**
 * 初始化替换文件版本任务
 * @param {String} name
 * @param {String} manifest
 * @param {String} globs
 * @param {String} prefix
 */
function initRevisionReplaceTask(name, manifestPath, globs, prefix) {
  gulp.task(name, function () {
    let manifestSrc = path.join(dirPublic, manifestPath);
    let src = path.join(dirPublic, globs);
    let manifest = gulp.src(manifestSrc);
    return gulp.src(src, {base: dirPublic})
        .pipe(plugins.revReplace({
          manifest: manifest,
          prefix: prefix
        }))
        .pipe(gulp.dest(dirPublic));
  });
}

/**
 * 初始化替换 assets文件版本任务
 */
function initRevisionReplaceTasks() {
  let taskName = 'revision-replace';
  let tasks = [];
  let revisionReplaceConfig = config.chores.revisionReplace;
  if (revisionReplaceConfig) {
    let key, configItem, name, manifestPath, prefix, globs;
    for (key in revisionReplaceConfig) {
      configItem = revisionReplaceConfig[key];
      name = `${taskName}-key`;
      globs = configItem.globs;
      prefix = configItem.prefix;
      manifestPath = configItem.manifest;
      initRevisionReplaceTask(name, manifestPath, globs, prefix);
      tasks.push(name);
    }
  }
  gulp.task(taskName, tasks);
}
initRevisionReplaceTasks();

// 提示帮助
gulp.task('help', function () {
  let log = console.log;
  log(`
        ${chalk.green('gulp help')}     显示帮助信息
        ${chalk.green('gulp build')}    构建
        ${chalk.green('gulp dev')}      启动开发调试
        ${chalk.green('gulp test')}     启动测试
        ${chalk.green('gulp bundles')}  开始下载第三方依赖资源
        ${chalk.green('gulp doc')}      生成jsdoc文档
        ${chalk.green('gulp serve-doc')}启动jsweb文档web服务
        ${chalk.green('gulp eslint')}   JavaScript 代码静态检测
        ${chalk.green('gulp sasslint')} SASS代码表态检测
        `);
});

// clean css
gulp.task('clean-css', function () {
  let opts = {compatibility: 'ie8'};
  let src = `${dirPublic}/**/*.css`;
  return gulp.src(src, {base: dirPublic})
      .pipe(plugins.cleanCss(opts))
      .pipe(gulp.dest(dirPublic));
});

// post css
gulp.task('post-css', function () {
  let src = `${dirPublic}/**/*.css`;
  let processors = [
    autoprefixer({browsers: ['last 2 version', 'IE 8']}),
    cssnano(),
  ];
  return gulp.src(src)
      .pipe(plugins.postcss(processors))
      .pipe(gulp.dest(dirPublic));
});

// 解压装修组件
gulp.task('unzip', function () {
  return gulp.src(`${dirSrc}/**/*.{tar,tar.bz2,tar.gz,zip}`)
  .pipe(decompress())
  .pipe(gulp.dest(`${dirSrc}/components_zcy/comps`));
});

// uglify js
gulp.task('uglify', function () {
  let src = `${dirPublic}/**/*.js`;
  return gulp.src(src, {base: dirPublic})
      .pipe(plugins.uglify({
        mangle: false,
        compress: {
          properties: false
        },
        output: {
          quote_keys: true
        }
      }))
      .pipe(gulp.dest(dirPublic));
});

// 清空public目录
gulp.task('clean', function () {
  return gulp.src(dirPublic, {read: false})
      .pipe(plugins.clean({force: true}))
});

// 下载依赖资源
gulp.task('bundles', function () {
  var bundles = config.chores.bundles;
  var urls = [];
  for (var key in bundles) {
    urls.push({
      file: key,
      url: bundles[key].url
    });
  }
  // https请求不难cert
  var opts = {
    strictSSL: false,
    checkServerIdentity: function (host, cert) {
      return undefined;
    }
  };
  var stream = plugins.downloadStream(urls, opts)
      .pipe(gulp.dest('./vendor'));
  return stream;
});

// 默认显示帮助
gulp.task('default', ['help']);

(function (){
  let buildTasks = ['clean', 'unzip', [ 'compile', 'copy', 'concat-script', 'concat-style', 'tar', 'precompile']];
  if(env.revision) {
    buildTasks.push('revision', 'revision-replace');
  }
  let extraTasks = [];
  if(env.postCss){
    extraTasks.push('post-css');
  }
  if(env.uglify){
    extraTasks.push('uglify');
  }
  if(extraTasks.length > 0){
    buildTasks.push(extraTasks);
  }
  gulp.task('build', gulpSequence.apply(this,buildTasks));
}());

// 启动Web服务
gulp.task('serve', function () {
  const ProxyMiddleware = require('http-proxy-middleware')
  const FileNotFoundError = require('./build/jiggly/errors').FileNotFoundError;
  let render = require('./build/jiggly/handlebars/render');
  let dataProvider = require('./build/jiggly/data_provider');
  let middleware = [
    // view 资源处理
    function (req, res, next) {
      var context, err, globalData, path, result, urlDataResult, url;
      url = Url.parse(req.url, true);
      path = url.pathname;

      urlDataResult = dataProvider.getUrlData(path, 'GET', url.query);
      globalData = dataProvider.getGlobalData();
      context = _.isPlainObject(urlDataResult.result) ? _.assign(url.query, urlDataResult.result) : url.query;
      context = _.assign(globalData, context);
      try {
        result = render.renderFile(path, context);
        res.write(result);
        res.end();
        return res;
      } catch (_error) {
        err = _error;
        if (err instanceof FileNotFoundError) {
          return next();
        } else {
          throw err;
        }
      }
    },
    // API 接口资源
    function (req, res, next) {
      var dataResult, path, url;
      url = Url.parse(req.url, true);
      path = url.pathname;
      dataResult = dataProvider.getUrlData(path, req.method, url.query);
      if (dataResult.found) {
        res.write(JSON.stringify(dataResult.result));
        res.end();
        return res;
      } else {
        return next();
      }
    }
  ]
  let proxyTable = config.server.proxyTable;
  if (proxyTable) {
    let proxyKeys = Object.keys(proxyTable);
    proxyKeys.forEach(function(key) {
      let middlewareItem, opts;
      opts = proxyTable[key];
      middlewareItem = new ProxyMiddleware(key, opts);
      middleware.push(middlewareItem)
    });
  }
  browserSync.init({
    port: config.server.port,
    server: {
      baseDir: dirPublic,
      directory: true,
      index: 'index'
    },
    middleware: middleware,
    open: false
  }, function () {
    console.log('Develop server listening at port:' + config.server.port);
  });
  gulp.watch(`${dirPublic}/**/*.{js,hbs,png}`, browserSync.reload);
  gulp.watch(`${dirPublic}/**/*.css`, function (event) {
    gulp.src(event.path)
        .pipe(browserSync.stream());
  });
  gulp.watch(config.server.dataFilePatterns, function (event) {
    if(event.type !== 'deleted'){
      dataProvider.updateData(event.path);
    }
    browserSync.reload();
  });
});

// 调试
gulp.task('dev', gulpSequence('unzip', 'detection', ['compile', 'copy', 'concat-script', 'concat-style', 'tar', 'precompile'], 'serve'));

let esPatterns = 'app/**/*.{js,jsx,es6}';
let esBase = 'app';
let sassPatterns = 'app/**/*.{scss,sass}';


// JavaScript 代码静态检测
gulp.task('eslint', function () {
  let isFixed = function (file) {
    return (file.eslint != null) && file.eslint.fixed;
  }
  return gulp.src(esPatterns,{base: esBase})
      .pipe(plugins.cached('eslint'))
      .pipe(plugins.eslint({
        fix: argv.fix
      }))
      .pipe(plugins.eslint.format())
      .pipe(plugins.if(isFixed,gulp.dest(esBase)));
});

// SASS 代码静态检测
gulp.task('sasslint', function () {
  let opts = require('./.sasslintrc.json');
  return gulp.src(sassPatterns)
      .pipe(plugins.cached('sasslint'))
      .pipe(plugins.sassLint(opts))
      .pipe(plugins.sassLint.format())
      .pipe(plugins.if(!isWatch, plugins.sassLint.failOnError())); // 构建时,有报错就中止任务
});

gulp.task('detection', ['eslint','sasslint'],function () {
  if(argv.watch) {
    let esWatcher = gulp.watch(esPatterns,['eslint']);
    esWatcher.on('change', function (event) {
      console.log(`${event.type}:${event.path}`);
    });
    let sassWatcher = gulp.watch(sassPatterns,['sasslint']);
    sassWatcher.on('change', function (event) {
      console.log(`${event.type}:${event.path}`);
    });
  }
});
