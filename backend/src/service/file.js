const path = require('path');
const fs = require('fs');
const require3 = require('require3');
const sendToWormhole = require3('stream-wormhole');
const uuid = require3('uuid');
const gm = require3('gm');
const bb = require3('bluebird');
const pump = require3('pump');
const fse = require3('fs-extra');

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class File extends app.Service {

    // where adjusted by controller
    async list({ options }) {
      const _options = {};
      // where
      _options.where = options.where || {};
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

    async delete({ data: { fileId } }) {
      // file
      const item = await this.ctx.model.file.get({ id: fileId });
      // delete
      await this.ctx.model.file.delete({ id: fileId });
      // attachmentCount
      if (item.atomId && item.attachment) {
        await this.ctx.meta.atom.attachment({ key: { atomId: item.atomId }, atom: { attachment: -1 } });
      }
    }

    async uploadInner({ file, meta, user }) {
      return await this._upload({ fileContent: file, meta, user });
    }

    async upload({ user }) {
      const stream = await this.ctx.getFileStream();
      try {
        const meta = {
          filename: stream.filename,
          encoding: stream.encoding,
          mime: stream.mime,
          fields: stream.fields,
        };
        return await this._upload({ fileContent: stream, meta, user });
      } catch (e) {
        await sendToWormhole(stream);
        throw e;
      }
    }
    async _upload({ fileContent, meta, user }) {
      // info
      const fileInfo = path.parse(meta.filename);
      const encoding = meta.encoding;
      const mime = meta.mime;
      const fields = meta.fields;
      const mode = parseInt(fields.mode || 2);
      const atomId = parseInt(fields.atomId || 0);
      const attachment = parseInt(fields.attachment || 0);
      const flag = fields.flag || '';
      let imgWidth = 0;
      let imgHeight = 0;

      // jpeg->jpg
      if (fileInfo.ext === '.jpeg') fileInfo.ext = '.jpg';

      // dest
      const downloadId = uuid.v4().replace(/-/g, '');
      const _filePath = `file/${mode === 1 ? 'image' : (mode === 2 ? 'file' : 'audio')}/${this.ctx.meta.util.today()}`;
      const _fileName = uuid.v4().replace(/-/g, '');
      const destDir = await this.ctx.meta.base.getPath(_filePath, true);
      const destFile = path.join(destDir, `${_fileName}${fileInfo.ext}`);

      // write
      if (mode === 1) {
        // image
        await bb.fromCallback(cb => {
          let img = gm(fileContent);
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
      } else if (mode === 2 || mode === 3) {
        // check right only for file
        if (mode === 2) {
          await this.checkRightWrite(atomId, user);
        }
        // file
        if (Buffer.isBuffer(fileContent)) {
          // buffer
          await fse.outputFile(destFile, fileContent);
        } else {
          // stream
          const writeStream = fs.createWriteStream(destFile);
          await bb.fromCallback(cb => {
            pump(fileContent, writeStream, cb);
          });
        }
      }

      // fileSize
      const stat = await fse.stat(destFile);
      const fileSize = stat.size;

      // save
      const res = await this.ctx.model.file.insert({
        userId: user ? user.id : 0,
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

    }

    getDownloadUrl({ downloadId, mode, fileExt }) {
      return this.ctx.meta.base.getAbsoluteUrl(
        `/api/a/file/file/download/${downloadId}${(mode === 1 || mode === 3) ? fileExt : ''}`
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
        await this.fileDownloadCheck({ file, user });
      } else if (file.mode === 3) {
        // do nothing
      }

      // forward url
      const forwardUrl = this.ctx.meta.base.getForwardUrl(
        `${file.filePath}/${fileName}${file.fileExt}`
      );

      // send
      if (app.meta.isTest || app.meta.isLocal) {
        // redirect
        this.ctx.redirect(forwardUrl);
      } else {
        // redirect nginx
        // this.ctx.set('content-type', file.mime);
        this.ctx.set('content-transfer-encoding', file.encoding);
        this.ctx.set('content-disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.realName)}${file.fileExt}`);
        this.ctx.set('X-Accel-Redirect', forwardUrl);
        // this.ctx.success();
        this.ctx.response.status = 200;
        this.ctx.response.type = file.mime;
      }

    }

    // inner invoke
    async fileInfo({ downloadId }) {
      // downloadId
      if (!downloadId) this.ctx.throw(404);
      const extPos = downloadId.indexOf('.');
      if (extPos > -1) downloadId = downloadId.substr(0, extPos);

      // get file
      const file = await this.ctx.model.file.get({ downloadId });
      if (!file) this.ctx.throw(404);

      // absolutePath
      const destDir = await this.ctx.meta.base.getPath(file.filePath, true);
      const absolutePath = path.join(destDir, `${file.fileName}${file.fileExt}`);
      // ok
      return {
        file,
        absolutePath,
      };
    }

    async adjustImage(file, widthRequire, heightRequire) {
      widthRequire = widthRequire ? parseInt(widthRequire) : 0;
      heightRequire = heightRequire ? parseInt(heightRequire) : 0;
      if (!widthRequire && !heightRequire) return file.fileName;

      // cannot use * in path on windows
      const fileName = `${file.fileName}-${widthRequire}_${heightRequire}`;
      const destFile = await this.ctx.meta.base.getPath(
        `${file.filePath}/${fileName}${file.fileExt}`, false
      );

      const bExists = await fse.pathExists(destFile);
      if (bExists) return fileName;

      const width = widthRequire || parseInt(file.width * heightRequire / file.height);
      const height = heightRequire || parseInt(file.height * widthRequire / file.width);

      const srcFile = await this.ctx.meta.base.getPath(
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

    async fileDownloadCheck({ file, user }) {
      // not check if !atomId
      if (file.atomId) {
        const res = await this.ctx.meta.atom.checkRightRead({ atom: { id: file.atomId }, user });
        if (!res) this.ctx.throw(403);
      }
      // invoke event
      const res = await this.ctx.meta.event.invoke({
        module: moduleInfo.relativeName,
        name: 'fileDownloadCheck',
        data: { file, user },
      });
      if (res === false) this.ctx.throw(403);
    }

  }

  return File;
};
