var gEditorDoc    = null; // active editable document
var gActiveEditor = null; // active editing host
function setActiveEditor() {
  gActiveEditor = this;
}

function ExecCommand() {
  if (!gEditorDoc) return;
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
  gEditorDoc.execCommand(command, false, argVal); // send requested action
  if (gActiveEditor) gActiveEditor.focus(); // re-focus the editable element
}

window.addEventListener('DOMContentLoaded', function() {
  var iframe = document.getElementById('editor');
  iframe.onload = function() {
    gEditorDoc = iframe.contentDocument;
    gEditorDoc.body.contentEditable = true;
    var editors = gEditorDoc.querySelectorAll('*[contenteditable]');
    for (var i = 0; i < editors.length; i++) {
      editors[i].onfocus = setActiveEditor.bind(editors[i]);
    }
  };

  var buttons = document.querySelectorAll('*[data-command]');
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].onclick  = ExecCommand.bind(buttons[j]);
    buttons[j].onchange = ExecCommand.bind(buttons[j]);
  }

  ExecCommand.bind(document.querySelector('*[data-command=styleWithCSS]'))();
}, false);

