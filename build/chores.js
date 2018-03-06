/**
 * Created by xuexiaowei on 16/10/6.
 */
'use strict';

const glob = require('glob');
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

/**
 * 获取要合并的资源列表
 * @param group {Object} 分组
 * @param dest {String} 要打包的目的文件名
 * @returns {Array} 文件名数组
 */
function getConcatItems(globs, order) {
  let source = glob.sync(globs);
  let src = sortBy(source, order);
  return src;
}

/**
 * 数组排序
 * @param source {Array} eg, ['item1','item2','item3','item4','item5','item6']
 * @param order {Array} eg, ['item1','item3,'...','item2']
 * @return  {Array} eg,['item1','item3','item4','item5','item6','item2']
 */
function sortBy(source, order) {
  var divider = '...';
  var v;
  var temp = [];
  var len = source.length;
  for(var i = 0; i < len; i++) {
    temp[i] = source[i];
  }
  if(!order || order.length < 2) {
    v = temp;
  } else {
    var item, index, i, middleIndex = order.indexOf(divider),
      start = [],
      end = [];

    // 获取开始部分
    for(i = 0; i < middleIndex; i++) {
      item = order[i];
      index = temp.indexOf(item);
      if(index > -1) {
        start.push(item);
        temp.splice(index, 1);
      }
    }
    // 获取结束部分
    var len = order.length;
    for(i = middleIndex + 1; i < len; i++) {
      item = order[i];
      index = temp.indexOf(item);
      if(index > -1) {
        end.push(item);
        temp.splice(index, 1);
      }
    }
    v = start.concat(temp, end);
  }
  return v;
}

/**
 * 合并JavaScript 脚本文件
 * @param name {String} 任务名
 * @param globs {String} 匹配表达式
 * @param wrapper {String} 使用哪种 方式封装模块,null表式不需要 封装
 * @param isDefinition {Boolean} 是否需要添加 CMD 封装函数定义
 * @param fileName {String} 生成的文件名
 * @param dest {String} 生成的文件路径
 */
function initScriptConcatTask(name, globs, order, wrapper, isDefinition, dest) {
  gulp.task(name, function() {
    let destPath = path.parse(dest);
    let fileName = destPath.name + destPath.ext;
    let dir = destPath.dir;
    let coffeeFilter = plugins.filter(['**/*.coffee'], { restore: true });
    let babelFilter = plugins.filter('**/*.{es,es6,jsx}', { restore: true });
    let src = getConcatItems(globs, order);
    let reg = /^(\/)*app\/[^\/]+\//i;
    let wdir = process.cwd();
    return gulp.src(src)
      .pipe(plugins.plumber())
      .pipe(plugins.cached(name))
      .pipe(coffeeFilter)
      .pipe(plugins.coffee({ bare: true })).on('error', plugins.util.log)
      .pipe(coffeeFilter.restore)
      .pipe(babelFilter)
      .pipe(plugins.babel({
        presets: ['es2015'],
        plugins: ['transform-es3-property-literals', 'transform-es3-member-expression-literals']
      }))
      .pipe(babelFilter.restore)
      .pipe(plugins.if(wrapper, plugins.wrapFile({
        wrapper: function(content, file) {
          let moduleName = file.modName;
          if(moduleName.indexOf(wdir) > -1) {
            moduleName = moduleName.replace(dir, '');
            moduleName = moduleName.replace(/\\/g, '/');
          }
          if (moduleName.indexOf('\\') > -1) {
            moduleName = moduleName.replace(/\\/g, '/');
          }
          moduleName = moduleName.replace(reg, '');
          return 'this.require.define({"' + moduleName + '":function(exports, require, module){(function(){' + content + '}).call(this);}});';
        }
      })))
      .pipe(plugins.remember(name))
      .pipe(plugins.concat(fileName))
      .pipe(plugins.if(isDefinition, plugins.wrapFile({
        wrapper: function(content) {
          return fs.readFileSync('build/require.js', 'utf8') + content;
        }
      })))
      .pipe(gulp.dest(dir));
  });
}

/**
 * 初始化一个tar任务
 * @param name {String}
 * @param globs {String}
 * @param dest {String} 目标文件,包含路径
 */
function initTarTask(name, globs, dest) {
  gulp.task(name, function() {
    let destPath = path.parse(dest);
    let destName = destPath.name + destPath.ext;
    let destDir = destPath.dir;
    return gulp.src(globs)
      .pipe(plugins.tar(destName))
      .pipe(gulp.dest(destDir));
  });
}

/**
 * 初始化雪碧图处理任务
 * @param name {String} 任务名
 * @param globs {String}
 * @param imageDest {String} 生成图片路径
 * @param cssDest {String} 生成样式文件图
 * @param imgSrc {String} 样式中背景图片路径
 * @param templateSrc {String} 样式模板路径
 */
function initSpriteTask(name, globs, imageDest, cssDest, imgSrc, templateSrc) {
  gulp.task(name, function() {
    let imagePath = path.parse(imageDest);
    let cssPath = path.parse(cssDest);
    let imageName = imagePath.name + imagePath.ext;
    let cssName = cssPath.name + cssPath.ext;
    var stream = gulp.src(globs)
      .pipe(plugins.spritesmith({
        imgName: imageName,
        styleName: cssName,
        imgPath: imgSrc,
        styleTemplate: templateSrc
      }))
      .pipe(plugins.if('*.png', gulp.dest(imagePath.dir)))
      .pipe(plugins.if('*.{css,scss,sass}', gulp.dest(cssPath.dir)));
    return stream;
  });
}

/**
 * 初始化一个Compile 任务
 * @param name {String} 任务名
 * @param globs {String} grep 表达式
 * @param base {String} 相对根目录
 * @param dest {String} 目标路径
 * @param context {Object} 编译模板上下文
 */
function initCompileTask(name, globs, base, dest, context) {
  gulp.task(name, function() {
    return gulp.src(globs, { base: base })
      .pipe(plugins.changed(dest))
      .pipe(plugins.template(context))
      .pipe(plugins.regexRename(/\.erb$/, ''))
      .pipe(gulp.dest(dest));
  });
}

/**
 * 初始化文件拷贝任务
 * @param name {String} 任务名称
 * @param globs {String} grep格式的表达式
 * @param base {String} 相对目录
 * @param dest {String} 目录路径
 */
function initCopyTask(name, globs, base, dest) {
  gulp.task(name, function() {
    return gulp.src(globs, { base: base })
      .pipe(plugins.changed(dest))
      .pipe(gulp.dest(dest));
  });
}

/**
 * 初始化 handlebars 模板预编译任务
 * @param name {String} 任务名
 * @param globs {String} 模板globs
 * @param dest {String} 目标文件路径
 */
function initPrecompileTask(name, globs, dest) {
  gulp.task(name, function() {
    let reg = /^_.*/;
    let templateFilters = plugins.filter(function(file) {
      let name = path.parse(file.path).name;
      return !reg.test(name);
    }, { restore: true });
    let partialFilters = plugins.filter(function(file) {
      var name = path.parse(file.path).name;
      return reg.test(name);
    }, { restore: true });
    let destPath = path.parse(dest);
    let destFileName = destPath.name + destPath.ext;
    let destDir = destPath.dir;
    let appReg = /^(\/)*app\/[^\/]+\//i;
    let dir = process.cwd();
    return gulp.src(globs)
      .pipe(templateFilters)
      .pipe(plugins.handlebarsCompiler())
      .pipe(plugins.wrapFile({
        wrapper: function(content, file) {
          let moduleName = file.modName;
          if(moduleName.indexOf(dir) > -1) {
            moduleName = moduleName.replace(dir, '');
            moduleName = moduleName.replace(/\\/g, '/');
          }
          if (moduleName.indexOf('\\') > -1) {
            moduleName = moduleName.replace(/\\/g, '/');
          }
          moduleName = moduleName.replace(appReg, '');
          return '    templates["' + moduleName + '"] = template(' + content + ');';
        }
      }))
      .pipe(templateFilters.restore)
      .pipe(partialFilters)
      .pipe(plugins.handlebarsCompiler())
      .pipe(plugins.wrapFile({
        wrapper: function(content, file) {
          let moduleName = file.modName;
          if(moduleName.indexOf(dir) > -1) {
            moduleName = moduleName.replace(dir, '');
            moduleName = moduleName.replace(/\\/g, '/');
          }
          moduleName = moduleName.replace(appReg, '');
          return '    Handlebars.registerPartial("' + moduleName + '", Handlebars.template(' + content + '));';
        }
      }))
      .pipe(partialFilters.restore)
      .pipe(plugins.concat(destFileName))
      .pipe(plugins.wrapFile({ wrapper: '(function() {\n    var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};\n{file}\n})();' }))
      .pipe(gulp.dest(destDir));

  });
}

/**
 * 初始化合并样式文件任务
 * @param name {String}
 * @param globs {String}
 * @param order {Array}
 * @param dest {String}
 */
function initStyleConcatTask(name, globs, order, dest) {
  gulp.task(name, function() {
    let sassFilter = plugins.filter('**/*.{sass,scss}', { restore: true });
    let destPath = path.parse(dest);
    let destDir = destPath.dir;
    let destFileName = destPath.name + destPath.ext;
    let src = getConcatItems(globs, order);
    return gulp.src(src)
      .pipe(plugins.plumber())
      .pipe(plugins.cached(name))
      .pipe(sassFilter)
      .pipe(plugins.sass({
        includePaths: ['app/styles'],
        sourceComments: true
      })).on('error', plugins.sass.logError)
      .pipe(sassFilter.restore)
      .pipe(plugins.remember(name))
      .pipe(plugins.concat(destFileName))
      .pipe(gulp.dest(destDir));
  });
}

function initRevisionTask(name, globs, base, dest, manifestDest) {
  gulp.task(name, function() {
    let manifestDestPath = path.parse(manifestDest);
    let manifestDestDir = manifestDestPath.dir;
    let manifestDestName = manifestDestPath.name + manifestDestPath.ext;
    return gulp.src(globs, { base: base })
      .pipe(plugins.rev())
      .pipe(plugins.revDeleteOriginal())
      .pipe(gulp.dest(dest))
      .pipe(plugins.rev.manifest(manifestDestName))
      .pipe(gulp.dest(manifestDestDir));
  })
}

module.exports = {
  initCompileTask: initCompileTask,
  initCopyTask: initCopyTask,
  initPrecompileTask: initPrecompileTask,
  initRevisionTask: initRevisionTask,
  initScriptConcatTask: initScriptConcatTask,
  initSpriteTask: initSpriteTask,
  initStyleConcatTask: initStyleConcatTask,
  initTarTask: initTarTask
};