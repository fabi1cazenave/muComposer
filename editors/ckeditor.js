function Editor(event) {
  var _ckeditor = event.editor;
  var iframe = _ckeditor.container.$.querySelector('.cke_wysiwyg_frame');
  iframe.setAttribute('sandbox', '');

  this.__defineGetter__('_ckeditor', function () {
    return _ckeditor;
  });
  this.__defineGetter__('document', function () {
    return _ckeditor.document.$;
  });
  this.__defineGetter__('iframe', function () {
    return _ckeditor.container.$.querySelector('.cke_wysiwyg_frame');
  });
}

Editor.prototype.__defineGetter__('editable', function getEditable() {
  return this.document.body.contentEditable;
});

Editor.prototype.__defineSetter__('editable', function setEditable(val) {
  if (val) {
    this.document.body.contentEditable = true;
  } else {
    this.document.body.removeAttribute('contentEditable');
  }
});

Editor.prototype.__defineGetter__('doctype', function getDoctype() {
  var dt = this.document.doctype;
  return '<!DOCTYPE ' +
    dt.name +
    (dt.publicId ? ' PUBLIC "' + dt.publicId + '"' : '') +
    (!dt.publicId && dt.systemId ? ' SYSTEM' : '') +
    (dt.systemId ? ' "' + dt.systemId + '"' : '') +
    '>';
});

Editor.prototype.getClassList = function getClassList() {
  var classes = [];

  var elements = this.document.querySelectorAll('*[class]');
  for (var i = 0, l = elements.length; i < l; i++) {
    var cl = elements[i].classList;
    for (var j = 0, m = cl.length; j < m; j++) {
      if (classes.indexOf(cl[j]) < 0) {
        classes.push(cl[j]);
      }
    }
  }

  return classes.sort();
};

Editor.prototype.open = function open(path) {
  if (!path) return;
  this.path = path;
  this.iframe.src = path;
};

Editor.prototype.openURL = function openURL(src) {
  if (!src) return;
  this.path = '';
  this.iframe.src = src;
};

Editor.prototype.save = function save(path) {
  this.editable = false;
  path = path || this.path;

  fs.writeFile(path,
    this.doctype + EOL + this.document.documentElement.outerHTML);

  this.path = path;
  this.editable = true;
};

var gEditor = null;
window.addEventListener('DOMContentLoaded', function() {
  CKEDITOR.appendTo('main', {
    allowedContent: true,
    fullPage: true
  });
  CKEDITOR.on('instanceReady', function (event) {
    gEditor = new Editor(event);
    // gEditor.iframe.src = 'http://localhost/me/cazenave.me/resume.html';
    gEditor.open(BLANK_DOC);
  });
});

