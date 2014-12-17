var fs = require('fs');
var os = require('os');

function Editor(iframe) {
  var editorDoc = null; // active editable document
  var activeElt = null; // active editing host (should be <body>)
  function setActiveEditor() {
    activeElt = this;
  }

  iframe.addEventListener('load', function initEditorNodes(event) {
    editorDoc = iframe.contentDocument;
    editorDoc.body.contentEditable = true;
    var editors = editorDoc.querySelectorAll('*[contentEditable]');
    for (var i = 0; i < editors.length; i++) {
      editors[i].onfocus = setActiveEditor.bind(editors[i]);
    }
    editorDoc.body.focus();
  }, false);

  function ExecCommand() {
    if (!editorDoc) return;
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
    editorDoc.execCommand(command, false, argVal); // send requested action
    if (activeElt) activeElt.focus(); // re-focus the editable element
  }

  var buttons = document.querySelectorAll('*[data-command]');
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].onclick  = ExecCommand.bind(buttons[j]);
    buttons[j].onchange = ExecCommand.bind(buttons[j]);
  }
  ExecCommand.bind(document.querySelector('*[data-command=styleWithCSS]'))();

  this.__defineGetter__('_document', function () { return editorDoc; });
  this.__defineGetter__('_iframe',   function () { return iframe;    });
}

Editor.prototype.__defineGetter__('editable', function getEditable() {
  return this._document.body.contentEditable;
});

Editor.prototype.__defineSetter__('editable', function setEditable(val) {
  if (val) {
    this._document.body.contentEditable = true;
  } else {
    this._document.body.removeAttribute('contentEditable');
  }
});

Editor.prototype.__defineGetter__('doctype', function getDoctype() {
  var dt = this._document.doctype;
  return '<!DOCTYPE ' +
    dt.name +
    (dt.publicId ? ' PUBLIC "' + dt.publicId + '"' : '') +
    (!dt.publicId && dt.systemId ? ' SYSTEM' : '') +
    (dt.systemId ? ' "' + dt.systemId + '"' : '') +
    '>';
});

Editor.prototype.open = function open(path) {
  this.path = path;
  this._iframe.src = path;
};

Editor.prototype.openURL = function openURL(src) {
  this.path = '';
  this._iframe.src = src;
};

Editor.prototype.save = function save(path) {
  this.editable = false;
  path = path || this.path;

  fs.writeFile(path,
    this.doctype + os.EOL + this._document.documentElement.outerHTML);

  this.path = path;
  this.editable = true;
};

var gEditor = null;
window.addEventListener('DOMContentLoaded', function() {
  gEditor = new Editor(document.getElementById('editor'));
  gEditor.open('blank.html');
});

