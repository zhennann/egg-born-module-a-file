module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("require3");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const config = __webpack_require__(3);
const locales = __webpack_require__(4);
const errors = __webpack_require__(6);
const middlewares = __webpack_require__(7);

module.exports = app => {

  // routes
  const routes = __webpack_require__(11)(app);
  // services
  const services = __webpack_require__(14)(app);
  // models
  const models = __webpack_require__(18)(app);
  // meta
  const meta = __webpack_require__(21)(app);

  return {
    routes,
    services,
    models,
    config,
    locales,
    errors,
    middlewares,
    meta,
  };

};


/***/ }),
/* 3 */
/***/ (function(module, exports) {

// eslint-disable-next-line
module.exports = appInfo => {
  const config = {};

  // public dir
  config.publicDir = '';

  // middlewares
  config.middlewares = {
    file: {
      global: false,
      dependencies: 'base',
    },
  };

  return config;
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  'zh-cn': __webpack_require__(5),
};


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = {
  File: '文件',
};


/***/ }),
/* 6 */
/***/ (function(module, exports) {

// error code should start from 1001
module.exports = {
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

const file = __webpack_require__(8);

module.exports = {
  file,
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

const FileFn = __webpack_require__(9);
const FILE = Symbol('CTX#__FILE');

module.exports = () => {
  return async function file(ctx, next) {
    ctx.meta = ctx.meta || {};
    Object.defineProperty(ctx.meta, 'file', {
      get() {
        if (ctx.meta[FILE] === undefined) {
          ctx.meta[FILE] = new (FileFn(ctx))();
        }
        return ctx.meta[FILE];
      },
    });

    // next
    await next();
  };
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

const path = __webpack_require__(0);
const require3 = __webpack_require__(1);
const fse = require3('fs-extra');

const Fn = module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class File {

    constructor(moduleName) {
      this.moduleName = moduleName || ctx.module.info.relativeName;
    }

    // other module's file
    module(moduleName) {
      return new (Fn(ctx))(moduleName);
    }

    // get root path
    async getRootPath() {
      if (ctx.app.meta.isTest || ctx.app.meta.isLocal) {
        return ctx.app.config.static.dir;
      }
      const dir = ctx.config.module(moduleInfo.relativeName).publicDir || path.join(__webpack_require__(10).homedir(), 'cabloy', ctx.app.name, 'public');
      await fse.ensureDir(dir);
      return dir;
    }

    // get path
    async getPath(subdir, ensure) {
      const rootPath = await this.getRootPath();
      const dir = path.join(rootPath, ctx.instance.id.toString(), subdir || '');
      if (ensure) {
        await fse.ensureDir(dir);
      }
      return dir;
    }

    // get url
    getUrl(path) {
      const prefix = ctx.host ? `${ctx.protocol}://${ctx.host}` : '';
      return `${prefix}${path}`;
    }

    // get forward url
    getForwardUrl(path) {
      const prefix = (ctx.app.meta.isTest || ctx.app.meta.isLocal) ? ctx.app.config.static.prefix : '/public/';
      return `${prefix}${ctx.instance.id}/${path}`;
    }

  }

  return File;
};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

const version = __webpack_require__(12);
const file = __webpack_require__(13);

module.exports = app => {
  const routes = [
    // version
    { method: 'post', path: 'version/update', controller: version, middlewares: 'inner' },
    { method: 'post', path: 'version/init', controller: version, middlewares: 'inner' },
    { method: 'post', path: 'version/test', controller: version, middlewares: 'test' },
    // file
    { method: 'post', path: 'file/upload', controller: file, middlewares: 'file', meta: { auth: { user: true } } },
    { method: 'get', path: 'file/download/:downloadId', controller: file, action: 'download', middlewares: 'file' },
    { method: 'post', path: 'file/list', controller: file, middlewares: 'file',
      meta: { right: { type: 'atom', action: 2 } },
    },
    { method: 'post', path: 'file/delete', controller: file, middlewares: 'transaction',
      meta: { right: { type: 'atom', action: 3 } },
    },
  ];
  return routes;
};


/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = app => {
  class VersionController extends app.Controller {

    async update() {
      await this.service.version.update(this.ctx.request.body);
      this.ctx.success();
    }

    async init() {
      await this.service.version.init(this.ctx.request.body);
      this.ctx.success();
    }

    async test() {
      await this.service.version.test(this.ctx.request.body);
      this.ctx.success();
    }

  }
  return VersionController;
};


/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = app => {
  class FileController extends app.Controller {

    async list() {
      const options = this.ctx.request.body.options;
      options.page = this.ctx.meta.util.page(options.page, false);
      const items = await this.ctx.service.file.list({
        key: this.ctx.request.body.key,
        options,
        user: this.ctx.user.op,
      });
      this.ctx.successMore(items, options.page.index, options.page.size);
    }

    async delete() {
      const res = await this.ctx.service.file.delete({
        key: this.ctx.request.body.key,
        data: this.ctx.request.body.data,
        user: this.ctx.user.op,
      });
      this.ctx.success(res);
    }

    async upload() {
      const res = await this.service.file.upload({
        user: this.ctx.user.op,
      });
      this.ctx.success(res);
    }

    async download() {
      await this.service.file.download({
        downloadId: this.ctx.params.downloadId,
        width: this.ctx.query.width,
        height: this.ctx.query.height,
        user: this.ctx.user.op,
      });
    }

  }
  return FileController;
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

const version = __webpack_require__(15);
const file = __webpack_require__(16);

module.exports = app => {
  const services = {
    version,
    file,
  };
  return services;
};


/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = app => {

  class Version extends app.Service {

    async update(options) {
      if (options.version === 1) {
        // create table: aFile
        let sql = `
          CREATE TABLE aFile (
            id int(11) NOT NULL AUTO_INCREMENT,
            createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted int(11) DEFAULT '0',
            iid int(11) DEFAULT '0',
            userId int(11) DEFAULT '0',
            downloadId varchar(50) DEFAULT NULL,
            atomId int(11) DEFAULT '0',
            mode int(11) DEFAULT '0',
            fileSize int(11) DEFAULT '0',
            width int(11) DEFAULT '0',
            height int(11) DEFAULT '0',
            filePath varchar(255) DEFAULT NULL,
            fileName varchar(255) DEFAULT NULL,
            realName varchar(255) DEFAULT NULL,
            fileExt varchar(50) DEFAULT NULL,
            encoding varchar(50) DEFAULT NULL,
            mime varchar(50) DEFAULT NULL,
            attachment int(11) DEFAULT '0',
            flag varchar(255) DEFAULT NULL,
            PRIMARY KEY (id)
          )
        `;
        await this.ctx.model.query(sql);

        // aViewFile
        sql = `
          create view aViewFile as
            select a.*,b.userName,b.avatar from aFile a
              left join aUser b on a.userId=b.id
        `;
        await this.ctx.model.query(sql);
      }
    }

    async init(options) {
    }

    async test() {
    }

  }

  return Version;
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

const path = __webpack_require__(0);
const fs = __webpack_require__(17);
const require3 = __webpack_require__(1);
const sendToWormhole = require3('stream-wormhole');
const uuid = require3('uuid');
const gm = require3('gm');
const bb = require3('bluebird');
const pump = require3('pump');
const fse = require3('fs-extra');

module.exports = app => {

  class File extends app.Service {

    async list({ key, options, user }) {
      const _options = {};
      // where
      _options.where = options.where || {};
      _options.where.atomId = key.atomId;
      // orders
      _options.orders = options.orders;
      // page
      if (options.page.size !== 0) {
        _options.limit = options.page.size;
        _options.offset = options.page.index;
      }
      // select
      const list = await this.ctx.model.fileView.select(_options);
      for (const item of list) {
        item.downloadUrl = this.getDownloadUrl(item);
      }
      return list;
    }

    async delete({ key, data: { fileId }, user }) {
      // file
      const item = await this.ctx.model.file.get({ id: fileId });
      if (key.atomId !== item.atomId || item.userId !== user.id) this.ctx.throw(403);
      // delete
      await this.ctx.model.file.delete({ id: fileId });
      // attachmentCount
      if (item.atomId && item.attachment) {
        await this.ctx.meta.atom.attachment({ key, atom: { attachment: -1 }, user });
      }
    }

    async upload({ user }) {
      const stream = await this.ctx.getFileStream();
      try {
        // info
        const fileInfo = path.parse(stream.filename);
        const encoding = stream.encoding;
        const mime = stream.mime;
        const fields = stream.fields;
        const mode = parseInt(fields.mode || 2);
        const atomId = parseInt(fields.atomId || 0);
        const attachment = parseInt(fields.attachment || 0);
        const flag = fields.flag || '';
        let imgWidth = 0;
        let imgHeight = 0;

        // dest
        const downloadId = uuid.v4().replace(/-/g, '');
        const _filePath = `file/${mode === 1 ? 'image' : 'file'}/${this.ctx.meta.util.today()}`;
        const _fileName = uuid.v4().replace(/-/g, '');
        const destDir = await this.ctx.meta.file.getPath(_filePath, true);
        const destFile = path.join(destDir, `${_fileName}${fileInfo.ext}`);

        // write
        if (mode === 1) {
          // image
          await bb.fromCallback(cb => {
            let img = gm(stream);
            if (fields.cropped === 'true') {
              const cropbox = JSON.parse(fields.cropbox);
              img = img.crop(parseInt(cropbox.width), parseInt(cropbox.height), parseInt(cropbox.x), parseInt(cropbox.y));
            }
            img.quality(93).write(destFile, cb);
          });
          // size
          const imgSize = await bb.fromCallback(cb => {
            gm(destFile).size(cb);
          });
          imgWidth = imgSize.width;
          imgHeight = imgSize.height;
        } else if (mode === 2) {
          // check right only for file
          await this.checkRightWrite(atomId, user);
          // file
          const writeStream = fs.createWriteStream(destFile);
          await bb.fromCallback(cb => {
            pump(stream, writeStream, cb);
          });
        }

        // fileSize
        const stat = await fse.stat(destFile);
        const fileSize = stat.size;

        // save
        const res = await this.ctx.model.file.insert({
          userId: user.id,
          downloadId,
          atomId,
          mode,
          fileSize,
          width: imgWidth,
          height: imgHeight,
          filePath: _filePath,
          fileName: _fileName,
          realName: fileInfo.name,
          fileExt: fileInfo.ext,
          encoding,
          mime,
          attachment,
          flag,
        });
        const fileId = res.insertId;

        // attachmentCount
        if (atomId && attachment) {
          await this.ctx.meta.atom.attachment({ key: { atomId }, atom: { attachment: 1 }, user });
        }

        // ok
        const downloadUrl = this.getDownloadUrl({ downloadId, mode, fileExt: fileInfo.ext });
        return {
          fileId,
          realName: fileInfo.name,
          downloadId,
          downloadUrl,
        };

      } catch (e) {
        await sendToWormhole(stream);
        throw e;
      }
    }

    getDownloadUrl({ downloadId, mode, fileExt }) {
      return this.ctx.meta.file.getUrl(
        `/api/a/file/file/download/${downloadId}${mode === 1 ? fileExt : ''}`
      );
    }

    async download({ downloadId, width, height, user }) {
      // downloadId
      if (!downloadId) this.ctx.throw(404);
      const extPos = downloadId.indexOf('.');
      if (extPos > -1) downloadId = downloadId.substr(0, extPos);

      // get file
      const file = await this.ctx.model.file.get({ downloadId });
      if (!file) this.ctx.throw(404);

      // pre
      let fileName = file.fileName;
      if (file.mode === 1) {
        // adjust image
        fileName = await this.adjustImage(file, width, height);
      } else if (file.mode === 2) {
        // check right
        await this.checkRightRead(file.atomId, user);
      }

      // forward url
      const forwardUrl = this.ctx.meta.file.getForwardUrl(
        `${file.filePath}/${fileName}${file.fileExt}`
      );

      // send
      if (app.meta.isTest || app.meta.isLocal) {
        // redirect
        this.ctx.redirect(forwardUrl);
      } else {
        // redirect nginx
        this.ctx.set('content-type', file.mime);
        this.ctx.set('content-transfer-encoding', file.encoding);
        this.ctx.set('content-disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.realName)}${file.fileExt}`);
        this.ctx.set('X-Accel-Redirect', forwardUrl);
        this.ctx.success();
      }

    }

    async adjustImage(file, widthRequire, heightRequire) {
      widthRequire = widthRequire ? parseInt(widthRequire) : 0;
      heightRequire = heightRequire ? parseInt(heightRequire) : 0;
      if (!widthRequire && !heightRequire) return file.fileName;

      // cannot use * in path on windows
      const fileName = `${file.fileName}-${widthRequire}_${heightRequire}`;
      const destFile = await this.ctx.meta.file.getPath(
        `${file.filePath}/${fileName}${file.fileExt}`, false
      );

      const bExists = await fse.pathExists(destFile);
      if (bExists) return fileName;

      const width = widthRequire || parseInt(file.width * heightRequire / file.height);
      const height = heightRequire || parseInt(file.height * widthRequire / file.width);

      const srcFile = await this.ctx.meta.file.getPath(
        `${file.filePath}/${file.fileName}${file.fileExt}`, false
      );
      await bb.fromCallback(cb => {
        gm(srcFile)
          .resize(width, height, '!')
          .quality(100)
          .write(destFile, cb);
      });

      return fileName;
    }

    async checkRightWrite(atomId, user) {
      // not check if !atomId
      if (!atomId) return;
      const res = await this.ctx.meta.atom.checkRightUpdate({
        atom: { id: atomId, action: this.ctx.constant.module('a-base').atom.action.write },
        user,
      });
      if (!res) this.ctx.throw(403);
    }

    async checkRightRead(atomId, user) {
      // not check if !atomId
      if (!atomId) return;
      const res = await this.ctx.meta.atom.checkRightRead({ atom: { id: atomId }, user });
      if (!res) this.ctx.throw(403);
    }

  }

  return File;
};


/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

const file = __webpack_require__(19);
const fileView = __webpack_require__(20);

module.exports = app => {
  const models = {
    file,
    fileView,
  };
  return models;
};


/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = app => {
  class File extends app.meta.Model {
    constructor(ctx) {
      super(ctx, { table: 'aFile', options: { disableDeleted: false } });
    }
  }
  return File;
};


/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = app => {
  class FileView extends app.meta.Model {
    constructor(ctx) {
      super(ctx, { table: 'aViewFile', options: { disableDeleted: false } });
    }
  }
  return FileView;
};


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = app => {
  const schemas = __webpack_require__(22)(app);
  const meta = {
    base: {
      atoms: {
      },
      functions: {
      },
    },
    validation: {
      validators: {
      },
      keywords: {},
      schemas: {
      },
    },
  };
  return meta;
};


/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = app => {
  const schemas = {};
  return schemas;
};


/***/ })
/******/ ]);
//# sourceMappingURL=backend.js.map