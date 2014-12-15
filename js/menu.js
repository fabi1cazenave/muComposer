var gui = require('nw.gui');
var fs  = require('fs');
var os  = require('os');
var OSX = (os.platform === 'darwin');

var gEditorPath = '';
// var gEditorTitle = '';

document.addEventListener('DOMContentLoaded', function (e) {
  document.getElementById('editor').src = 'blank.html';

  document.getElementById('open').addEventListener('change', function (e) {
    gEditorPath = this.value;
    document.getElementById('editor').src = this.value;
  });

  document.getElementById('save').addEventListener('change', function (e) {
    gEditorPath = this.value;
    fileActions.save();
  });

  function getFilePicker(id) {
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click');
    document.getElementById(id).dispatchEvent(event);
  }

  var fileActions = {
    newWindow: function newWindow() {
      gui.Window.open('index.xhtml', { toolbar: false });
    },

    open: function open() {
      getFilePicker('open');
    },

    openURL: function openURL() {
      gEditorPath = '';
      document.getElementById('editor').src = 'http://localhost/me/cazenave.me/resume.html';
    },

    closeWindow: function closeWindow() {
      gui.Window.get().close();
    },

    save: function save() {
      if (!gEditorPath) {
        return fileActions.saveAs();
      }
      gEditorDoc.body.removeAttribute('contentEditable');
      var dt = gEditorDoc.doctype;
      var html = "<!DOCTYPE " +
        dt.name +
        (dt.publicId ? ' PUBLIC "' + dt.publicId + '"' : '') +
        (!dt.publicId && dt.systemId ? ' SYSTEM' : '') +
        (dt.systemId ? ' "' + dt.systemId + '"' : '') +
        '>' + os.EOL +
        gEditorDoc.documentElement.outerHTML;
      fs.writeFile(gEditorPath, html);
      gEditorDoc.body.contentEditable = true;
    },

    saveAs: function saveAs() {
      getFilePicker('save');
    },

    quit: function quit() {
      gui.App.closeAllWindows();
      // gui.App.quit();
    }
  };

  function newSubMenu(items) {
    var submenu = new gui.Menu();

    items.forEach(function (item) {
      if ('key' in item) {
        var key = item.key;
        if (key.length == 1) {
          item.modifiers = OSX ? 'cmd' : 'ctrl';
          if (key == key.toUpperCase()) {
            item.modifiers += ', shift';
          }
        }
      }
      submenu.append(new gui.MenuItem(item));
    });

    return submenu;
  }

  var menu = new gui.Menu({ type: 'menubar' });

  menu.append(new gui.MenuItem({
    label: 'File',
    submenu: newSubMenu([
      { label: 'New',       key: 'n', click: fileActions.newWindow   },
      { label: 'Open…',     key: 'o', click: fileActions.open        },
      { label: 'Open URL…', key: 'L', click: fileActions.openURL     },
      { label: 'Close',     key: 'w', click: fileActions.closeWindow },
      { type: 'separator' },
      { label: 'Save',      key: 's', click: fileActions.save        },
      { label: 'Save as…',  key: 'S', click: fileActions.saveAs      },
      { type: 'separator' },
      { label: 'Export…', disabled: true },
      { type: 'separator' },
      { label: 'Quit',      key: 'q', click: fileActions.quit        }
    ])
  }));

  menu.append(new gui.MenuItem({
    label: 'Edit',
    submenu: newSubMenu([
      { label: 'Cut' },
      { label: 'Copy' },
      { label: 'Paste' }
    ])
  }));

  menu.append(new gui.MenuItem({
    label: 'Tools',
    submenu: newSubMenu([{
      label: 'devtools',
      type: 'checkbox',
      checked: false,
      key: 'F12',
      click: function() {
        var devtools = document.getElementById('devtools');
        var checked = this.checked;
        var win = gui.Window.get();
        win.showDevTools('editor', true);
        win.on('devtools-opened', function(url) {
          if (checked) {
            devtools.src = url;
            devtools.style.display = 'block';
          } else {
            devtools.style.display = 'none';
            devtools.src = 'blank.html';
          }
        });
      }
    }])
  }));

  menu.append(new gui.MenuItem({
    label: 'Help',
    submenu: newSubMenu([
      { label: 'About…', enabled: false }
    ])
  }));

  gui.Window.get().menu = menu;

  // document.body.addEventListener('contextmenu', function(ev) {
  //   ev.preventDefault();
  //   menu.popup(ev.x, ev.y);
  //   return false;
  // });
});
