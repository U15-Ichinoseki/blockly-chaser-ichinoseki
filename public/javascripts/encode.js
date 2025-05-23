Blockly.JavaScript.addReservedWords('exit');


var outputArea = document.getElementById('output');
var runButton = document.getElementById('runButton');
var myInterpreter = null;
var runner;
var map_info = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var look_info = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var search_info = [0, 0, 0, 0, 0, 0, 0, 0, 0];


class ObjInterpreter extends Interpreter {
  constructor(code, initAlert) {
    super(code, initAlert);

    this._obj = {}; //store last valid scope
    this._result = null; // store last result from external function
  }

  getProperty(obj, name) {
    if ((obj == null) || !obj.isReal) {
      this._obj = obj;
      return super.getProperty(obj, name);
    }
    else {
      var member;
      member = obj.connectedObject[name.toString()];
      if ((member != null) && typeof member === "object") {
        return this._createConnectedObject(member); // return object
      }
      else if ((member != null) && typeof member === "function") {
        this._result = obj.connectedObject[name.toString()](); //run function (without attr)
        return super.getProperty(this._obj, 'proxy'); //return dummy function
      }
      else {
        return this.createPrimitive(member); // return primitve typ
      }

    }
  }

  setProperty(obj, name, value, opt_fixed, opt_nonenum) {
    if ((obj == null) || !obj.isReal) {
      return super.setProperty(obj, name, value, opt_fixed, opt_nonenum);
    }
    else {
      obj.connectedObject[name.toString()] = value;
    }
  }

  _createConnectedObject(obj) {
    var cobj;
    cobj = this.createObject(this.OBJECT);
    cobj.isReal = true;
    cobj.connectedObject = obj;
    return cobj;
  }

  connectObject(scope, name, obj) {
    this.setProperty(scope, name, this._createConnectedObject(obj, name));
  }
}


Blockly.JavaScript.addLoopTrap("infinite_loop");


function initApi(interpreter, scope) {
  // Add an API function for the alert() block, generated for "text_print" blocks.

  interpreter.connectObject(scope, "map_info", map_info);
  interpreter.connectObject(scope, "look_info", look_info);
  interpreter.connectObject(scope, "search_info", search_info);

  var wrapper = function (text) {
    text.toString();
    outputArea.value = outputArea.value + '\n' + text;
  };
  interpreter.setProperty(scope, 'alert',
    interpreter.createNativeFunction(wrapper));

  // Add an API function for the prompt() block.
  var wrapper = function (text, callback) {
    text = text ? text.toString() : '';
    self_prompt_b(text, callback);
  };
  interpreter.setProperty(scope, 'prompt',
    interpreter.createAsyncFunction(wrapper));

  // Add an API function for highlighting blocks.
  var wrapper = function (id) {
    id = id ? id.toString() : '';
    return interpreter.createPrimitive(highlightBlock(id));
  };
  interpreter.setProperty(scope, 'highlightBlock',
    interpreter.createNativeFunction(wrapper));

  var wrapper = function () {
    var socket = io();
  };
  interpreter.setProperty(scope, 'io',
    interpreter.createNativeFunction(wrapper));

  var wrapper = function (id, name) {
    id = id ? id.toString() : '';
    name = name ? name.toString() : '';

    var user = {};
    user.room_id = id;
    user.name = name;
    socket.emit("player_join", user);

    servar_connect_status = true;
  };
  interpreter.setProperty(scope, 'join',
    interpreter.createNativeFunction(wrapper));

  var wrapper = function (direction, callback) {
    if (my_turn) {
      direction = direction ? direction.toString() : '';
      look_search_data = false;
      var getDate = function () {
        if (look_search_data) {
          map_info = look_search_data;
          callback(look_search_data.join(''));
        }
        else if (myInterpreter) {
          socket.emit("move_player", direction);
          setTimeout(getDate, 100);
        }
      };
      getDate();
    }
    else {
      if (stage_data["cpu"]) {
        Code.stopJS();
        return
      }
      callback(map_info.join(''));
    }
  };
  interpreter.setProperty(scope, 'move_player',
    interpreter.createAsyncFunction(wrapper));


  var wrapper = function (direction, callback) {
    if (my_turn) {
      direction = direction ? direction.toString() : '';
      look_search_data = false;
      var getDate = function () {
        if (look_search_data) {
          map_info = look_search_data;
          callback(look_search_data.join(''));
        }
        else if (myInterpreter) {
          socket.emit("put_wall", direction);
          setTimeout(getDate, 100);
        }
      };
      getDate();
    }
    else {
      if (stage_data["cpu"]) {
        Code.stopJS();
        return
      }
      callback(map_info.join(''));
    }
  };
  interpreter.setProperty(scope, 'put_wall',
    interpreter.createAsyncFunction(wrapper));


  var wrapper = function (text) {
    text = text ? text.toString() : '';
    return +text;
  };
  interpreter.setProperty(scope, 'valueNum',
    interpreter.createNativeFunction(wrapper));



  var wrapper = function (callback) {
    my_turn = false;
    var getDate = function () {
      if (my_turn) {
        map_info = my_turn;
        callback(my_turn.join(''));
      }
      else if (myInterpreter) {
        socket.emit("get_ready");
        setTimeout(getDate, 100);
      }
    };
    getDate();
  };
  interpreter.setProperty(scope, 'get_ready',
    interpreter.createAsyncFunction(wrapper));

  var wrapper = function (direction, callback) {
    if (my_turn) {
      look_search_data = false;
      var getDate = function () {
        if (look_search_data) {
          look_info = look_search_data;
          callback(look_search_data.join(''));
        }
        else if (myInterpreter) {
          socket.emit("look", direction);
          setTimeout(getDate, 100);
        }
      };
      getDate();
    }
    else {
      if (stage_data["cpu"]) {
        Code.stopJS();
        return
      }
      callback(look_info.join(''));
    }
  };
  interpreter.setProperty(scope, 'look',
    interpreter.createAsyncFunction(wrapper));

  var wrapper = function (direction, callback) {
    if (my_turn) {
      look_search_data = false;
      var getDate = function () {
        if (look_search_data) {
          search_info = look_search_data;
          callback(look_search_data.join(''));
        }
        else if (myInterpreter) {
          socket.emit("search", direction);
          setTimeout(getDate, 100);
        }
      };
      getDate();
    }
    else {
      if (stage_data["cpu"]) {
        Code.stopJS();
        return
      }
      callback(search_info.join(''));
    }
  };
  interpreter.setProperty(scope, 'search',
    interpreter.createAsyncFunction(wrapper));
}


var highlightPause = false;
var latestCode = '';

function highlightBlock(id) {
  Code.workspace.highlightBlock(id);
  highlightPause = true;
}

function resetStepUi(clearOutput) {
  Code.workspace.highlightBlock(null);
  highlightPause = false;
  runButton.disabled = '';

  if (clearOutput) {
    outputArea.value = 'Program output:\n=================';
  }

  generateUiCodeAndLoadIntoInterpreter();
}

function generateUiCodeAndLoadIntoInterpreter() {
  Blockly.JavaScript.STATEMENT_PREFIX = '';
  Blockly.JavaScript.INFINITE_LOOP_TRAP = '';

  latestCode = javascript.javascriptGenerator.workspaceToCode(Code.workspace);
}

function generateCodeAndLoadIntoInterpreter() {
  // Generate JavaScript code and parse it.
  Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
  Blockly.JavaScript.addReservedWords('highlightBlock');


  if (localStorage["LOOP_STATUS"]) {
    if (localStorage["LOOP_STATUS"] == "on") {
      var LoopTrap = 1000;
      Blockly.JavaScript.INFINITE_LOOP_TRAP = 'if(--LoopTrap == 0) throw "Infinite loop.";\n';
      latestCode = javascript.javascriptGenerator.workspaceToCode(Code.workspace);
      latestCode = "var LoopTrap = " + LoopTrap + ";\n" + latestCode;
    }
  }


}

function saveCodelocalStorage() {
  var xmlDom = Blockly.Xml.workspaceToDom(Code.workspace);
  var xmlText = Blockly.Xml.domToPrettyText(xmlDom);

  if (localStorage["AUTO_SAVE"]) {
    if (localStorage["AUTO_SAVE"] == "on") {
      localStorage.setItem("LastRun", xmlText);
    }
  }
}

function resetInterpreter() {
  myInterpreter = null;
  if (runner) {
    clearTimeout(runner);
    runner = null;
  }
  if (runner) {
    clearTimeout(runner);
    runner = null;
  }
}

function resetVar() {
  if (servar_connect_status) {
    socket.emit("leave_room");
  }
  my_turn = false;
  servar_connect_status = false;
  map_info = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  look_info = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  search_info = [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

var step_flag = false;
if (localStorage["LOWSPEED_MODE"]) {
  if (localStorage["LOWSPEED_MODE"] == "on") {
    step_flag = true;
  }
  else {
    step_flag = false;
  }
}
else {
  localStorage["LOWSPEED_MODE"] == "off";
}

Code.runJS = function () {
  if (!myInterpreter) {

    resetStepUi(true);
    runButton.disabled = 'disabled';

    setTimeout(function () {
      highlightPause = false;
      generateCodeAndLoadIntoInterpreter();
      saveCodelocalStorage();

      console.log(latestCode);

      myInterpreter = new ObjInterpreter(latestCode, initApi);
      runner = function () {
        var hasMore;
        if (myInterpreter) {
          try {
            if (step_flag) {
              hasMore = myInterpreter.step();
            }
            else {
              hasMore = myInterpreter.run();
            }

            if (hasMore) {
              setTimeout(runner, 10);
            }
            else {
              outputArea.value += '\n\n<< Program complete >>';
              resetInterpreter();
              resetVar();
              resetStepUi(false);
            }
          }
          catch (e) {
            outputArea.value += '\n\n<< Error ' + e + '>>';
            resetInterpreter();
            resetVar();
            resetStepUi(false);
          }
        }
      };
      runner();
    }, 100);
    return;
  }
};


Code.stopJS = function () {
  if (myInterpreter) {
    clearTimeout();
    resetVar();
    runButton.disabled = 'disabled';
    outputArea.value += '\n\n<< Stop Program >>';
    resetInterpreter();
    resetStepUi(false);
  }
  var c = document.getElementById("ready_player");
  if (c) {
    c.parentNode.removeChild(c);
  }
};

Code.download = function () {
  var xmlTextarea = document.getElementById('content_xml');
  var xmlDom = Blockly.Xml.workspaceToDom(Code.workspace);
  var xmlText = Blockly.Xml.domToPrettyText(xmlDom);

  var userAgent = window.navigator.userAgent.toLowerCase();
  var webbrowser_check = 0;

  if (userAgent.indexOf('msie') != -1 || userAgent.indexOf('trident') != -1) {
    webbrowser_check = 1;
  }
  else if (userAgent.indexOf('edge') != -1) {
    webbrowser_check = 1;
  }
  else if (userAgent.indexOf('chrome') != -1) {
    webbrowser_check = 1;
  }
  else if (userAgent.indexOf('safari') != -1) {
    webbrowser_check = 0;
  }
  else if (userAgent.indexOf('firefox') != -1) {
    webbrowser_check = 1;
  }
  else if (userAgent.indexOf('opera') != -1) {
    webbrowser_check = 1;
  }
  else {
    webbrowser_check = 0;
  }

  if (webbrowser_check == 0) {
    window.alert("ご利用のブラウザは本機能を使用できません");
  }
  else {
    var blob = new Blob([xmlText], { type: "application/octet-stream" });

    self_prompt("ファイル名を入力してください", function (file_name, teacher_mode = false) {
      if (file_name) {
        if (teacher_mode) {
          var save_json = {};
          var saveCode = javascript.javascriptGenerator.workspaceToCode(Code.workspace);

          save_json.teacher_code = btoa(unescape(encodeURIComponent(saveCode)));
          var json_string = JSON.stringify(save_json)
          blob = new Blob([json_string], { type: "text/plain" });

          file_name = file_name + ".json";
        }
        else {
          file_name = file_name + ".xml";
        }
        if (window.navigator.msSaveBlob) {
          // IE
          window.navigator.msSaveBlob(blob, file_name);
        } else {
          // another
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.target = '_blank';
          a.download = file_name;
          a.click();
        }
      }
    });
  }
}


Code.downloadPython = function () {
  var pythonTextarea = document.getElementById('content_python');
  var pythonText = python.pythonGenerator.workspaceToCode(Code.workspace);

  var userAgent = window.navigator.userAgent.toLowerCase();
  var webbrowser_check = 0;

  if (userAgent.indexOf('msie') != -1 || userAgent.indexOf('trident') != -1) {
    webbrowser_check = 1;
  }
  else if (userAgent.indexOf('edge') != -1) {
    webbrowser_check = 1;
  }
  else if (userAgent.indexOf('chrome') != -1) {
    webbrowser_check = 1;
  }
  else if (userAgent.indexOf('safari') != -1) {
    webbrowser_check = 0;
  }
  else if (userAgent.indexOf('firefox') != -1) {
    webbrowser_check = 1;
  }
  else if (userAgent.indexOf('opera') != -1) {
    webbrowser_check = 1;
  }
  else {
    webbrowser_check = 0;
  }

  if (webbrowser_check == 0) {
    window.alert("ご利用のブラウザは本機能を使用できません");
  }
  else {
    var blob = new Blob([pythonText], { type: "application/octet-stream" });

    self_prompt("ファイル名を入力してください", function (file_name, teacher_mode = false) {
      if (file_name) {
        if (teacher_mode) {
          var save_json = {};
          var saveCode = javascript.javascriptGenerator.workspaceToCode(Code.workspace);

          save_json.teacher_code = btoa(unescape(encodeURIComponent(saveCode)));
          var json_string = JSON.stringify(save_json)
          blob = new Blob([json_string], { type: "text/plain" });

          file_name = file_name + ".json";
        }
        else {
          file_name = file_name + ".py";
        }
        if (window.navigator.msSaveBlob) {
          // IE
          window.navigator.msSaveBlob(blob, file_name);
        } else {
          // another
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.target = '_blank';
          a.download = file_name;
          a.click();
        }
      }
    });
  }
}


function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function (e) {
    var contents = e.target.result;
    var xmlTextarea = document.getElementById('content_xml');
    var xmlDom;
    var xmlText = contents.toString();

    try {
      xmlDom = Blockly.utils.xml.textToDom(xmlText);
    } catch (e) {
      window.alert("ファイルの読み込みに失敗しました");
    }
    if (xmlDom) {
      Code.workspace.clear();
      Blockly.Xml.domToWorkspace(xmlDom, Code.workspace);
    }

  };
  reader.readAsText(file);
}


document.getElementById('file_load').addEventListener('change', readSingleFile, false);


function initDataLoad() {

  var queryStr = window.location.search.slice(1);
  queries = {};

  if (!queryStr) {
    return queries;
  }

  queryStr.split('&').forEach(function (queryStr) {
    var queryArr = queryStr.split('=');
    queries[queryArr[0]] = queryArr[1];
  });
  if (queries.loaddata) {
    var xmlTextarea = document.getElementById('content_xml');
    var xmlDom;
    var xmlText;
    if (localStorage[queries.loaddata]) {
      try {
        xmlText = localStorage.getItem(queries.loaddata).toString();
        xmlDom = Blockly.utils.xml.textToDom(xmlText);
      }
      catch (e) {
        window.alert("ファイルの読み込みに失敗しました");
      }
      if (xmlDom) {
        Code.workspace.clear();
        Blockly.Xml.domToWorkspace(xmlDom, Code.workspace);
      }
    }
  }
}

if (localStorage["DEBUG_MODE"]) {
  if (localStorage["DEBUG_MODE"] == "off") {
    // document.getElementById("tab_blocks").style.width = "100%";
    // document.getElementById("tab_python").style.display = "none";
    document.getElementById("tab_javascript").style.display = "none";
    document.getElementById("tab_xml").style.display = "none";
  }
}
else {
  localStorage["DEBUG_MODE"] == "off"
}

function self_prompt(message, callback) {
  var input_text = "";
  var pdiv = document.createElement("div");
  pdiv.setAttribute("id", "input_text_area");

  var pmdiv = document.createElement("div");
  pmdiv.setAttribute("id", "input_text_message");
  var newContent = document.createTextNode(message);
  pmdiv.appendChild(newContent);
  pdiv.appendChild(pmdiv);

  var pidiv = document.createElement("input");
  pidiv.setAttribute("type", "text");
  pidiv.setAttribute("maxlength", "25");
  pidiv.setAttribute("id", "input_text_form");
  pdiv.appendChild(pidiv);

  var pddiv = document.createElement("div");
  pddiv.setAttribute("id", "input_text_button");

  var podiv = document.createElement("div");
  podiv.setAttribute("id", "input_text_ok");
  var newContent = document.createTextNode("OK");
  podiv.appendChild(newContent);

  var input_text_ok = function () {
    input_text = "" + document.getElementById("input_text_form").value;
    var c = document.getElementById("input_text_area");
    if (c) {
      c.parentNode.removeChild(c);
    }
    callback(input_text);
  }
  podiv.addEventListener('click', input_text_ok, true);
  podiv.addEventListener('touchend', input_text_ok, true);

  var pcdiv = document.createElement("div");
  pcdiv.setAttribute("id", "input_text_cancel");
  var newContent = document.createTextNode("キャンセル");
  pcdiv.appendChild(newContent);

  var input_text_cancel = function () {
    var c = document.getElementById("input_text_area");
    if (c) {
      c.parentNode.removeChild(c);
    }
    callback(false);
  }
  pcdiv.addEventListener('click', input_text_cancel, true);
  pcdiv.addEventListener('touchend', input_text_cancel, true);

  var ptdiv = document.createElement("div");
  ptdiv.setAttribute("id", "input_text_ok");
  var newContent = document.createTextNode("教師データ");
  ptdiv.appendChild(newContent);

  var input_text_teacher = function () {
    input_text = "" + document.getElementById("input_text_form").value;
    var c = document.getElementById("input_text_area");
    if (c) {
      c.parentNode.removeChild(c);
    }
    callback(input_text, "teacher");
  }
  ptdiv.addEventListener('click', input_text_teacher, true);
  ptdiv.addEventListener('touchend', input_text_teacher, true);

  if (localStorage["DEBUG_MODE"] == "on") {
    pddiv.appendChild(ptdiv);
  }
  pddiv.appendChild(podiv);
  pddiv.appendChild(pcdiv);
  pdiv.appendChild(pddiv);

  document.body.appendChild(pdiv);

};


function self_prompt_b(message, callback) {
  var input_text = "";
  var pdiv = document.createElement("div");
  pdiv.setAttribute("id", "input_text_area");

  var pmdiv = document.createElement("div");
  pmdiv.setAttribute("id", "input_text_message");
  var newContent = document.createTextNode(message);
  pmdiv.appendChild(newContent);
  pdiv.appendChild(pmdiv);

  var pidiv = document.createElement("input");
  pidiv.setAttribute("type", "text");
  pidiv.setAttribute("maxlength", "25");
  pidiv.setAttribute("id", "input_text_form");
  pdiv.appendChild(pidiv);

  var pddiv = document.createElement("div");
  pddiv.setAttribute("id", "input_text_button");

  var podiv = document.createElement("div");
  podiv.setAttribute("id", "input_text_ok");
  var newContent = document.createTextNode("OK");
  podiv.appendChild(newContent);

  var input_text_ok = function () {
    input_text = "" + document.getElementById("input_text_form").value;
    var c = document.getElementById("input_text_area");
    if (c) {
      c.parentNode.removeChild(c);
    }
    callback(input_text);
  }
  podiv.addEventListener('click', input_text_ok, true);
  podiv.addEventListener('touchend', input_text_ok, true);

  var pcdiv = document.createElement("div");
  pcdiv.setAttribute("id", "input_text_cancel");
  var newContent = document.createTextNode("キャンセル");
  pcdiv.appendChild(newContent);

  var input_text_cancel = function () {
    var c = document.getElementById("input_text_area");
    if (c) {
      c.parentNode.removeChild(c);
    }
    callback('');
  }
  pcdiv.addEventListener('click', input_text_cancel, true);
  pcdiv.addEventListener('touchend', input_text_cancel, true);

  pddiv.appendChild(podiv);
  pddiv.appendChild(pcdiv);
  pdiv.appendChild(pddiv);

  document.body.appendChild(pdiv);

};

Blockly.dialog.setPrompt(function(msg, defaultValue, callback)
{
  self_prompt_b(msg, callback);
}
);