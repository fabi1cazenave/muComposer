var fs = require('fs');
var os = require('os');

function Editor(iframe) {
  var _editorDoc    = null; // active editable document
  var _activeEditor = null; // active editing host (should be <body>)
  function setActiveEditor() {
    _activeEditor = this;
  }

  var self = this;
  iframe.addEventListener('load', function initEditorNodes(event) {
    _editorDoc = iframe.contentDocument;
    _editorDoc.body.contentEditable = true;
    var editors = _editorDoc.querySelectorAll('*[contentEditable]');
    for (var i = 0; i < editors.length; i++) {
      editors[i].onfocus = setActiveEditor.bind(editors[i]);
    }
    _editorDoc.body.focus();
    self._document = _editorDoc;
  }, false);

  function ExecCommand() {
    if (!_editorDoc) return;
    var argVal, argStr,
        type    = this.getAttribute('type'),
        command = this.getAttribute('data-command');

    // get the execCommand argument according to the button type
    switch (type) {
      case 'button':   // toolbar button: no argument
        argVal = argStr = false;
        break;
      case 'checkbox': // styleWithCSS: boolean argument
        argVal = argStr = this.checked;
        break;
      default:         // <select> menu: string argument
        if (!this.selectedIndex) return;
        argVal = this.value;
        argStr = '"' + argVal.replace('<', '&lt;').replace('>', '&gt;') + '"';
        this.selectedIndex = 0; // reset drop-down list
    }

    // apply command
    _editorDoc.execCommand(command, false, argVal); // send requested action
    if (_activeEditor) _activeEditor.focus(); // re-focus the editable element
  }

  var buttons = document.querySelectorAll('*[data-command]');
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].onclick  = ExecCommand.bind(buttons[j]);
    buttons[j].onchange = ExecCommand.bind(buttons[j]);
  }
  ExecCommand.bind(document.querySelector('*[data-command=styleWithCSS]'))();

  /* return {
    get iframe()   { return iframe; },
    get document() { return _editorDoc; },
    get editable() { return !!_editorDoc.body.contentEditable; },
    set editable(val) {
      if (val) {
        _editorDoc.body.contentEditable = true;
      } else {
        _editorDoc.body.removeAttribute('contentEditable');
      }
    }
  }; */
  this._iframe = iframe;
  this._document = _editorDoc;
}

Editor.prototype.setEditable = function setEditable(val) {
  if (val) {
    this._document.body.contentEditable = true;
  } else {
    this._document.body.removeAttribute('contentEditable');
  }
};

Editor.prototype.open = function open(path) {
  this.path = path;
  this._iframe.src = path;
};

Editor.prototype.openURL = function openURL(src) {
  this.path = '';
  this._iframe.src = src;
};

Editor.prototype.save = function save(path) {
  this.setEditable(false);
  path = path || this.path;

  var dt = this._document.doctype;
  var html = "<!DOCTYPE " +
    dt.name +
    (dt.publicId ? ' PUBLIC "' + dt.publicId + '"' : '') +
    (!dt.publicId && dt.systemId ? ' SYSTEM' : '') +
    (dt.systemId ? ' "' + dt.systemId + '"' : '') +
    '>' + os.EOL +
    this._document.documentElement.outerHTML;
  fs.writeFile(path, html);

  this.path = path;
  this.setEditable(true);
};

var gEditor = null;
window.addEventListener('DOMContentLoaded', function() {
  gEditor = new Editor(document.getElementById('editor'));
  gEditor.open('blank.html');
});

