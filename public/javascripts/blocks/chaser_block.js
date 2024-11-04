Blockly.Blocks['server_connect'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(get_server_list), "room_id")
        .appendField("サーバに接続する");
    this.appendDummyInput()
        .appendField("プレイヤー名")
        .appendField(new Blockly.FieldTextInput(""), "name");
    this.appendDummyInput()
        .appendField("値の初期化");
    this.appendStatementInput("init_value")
        .setCheck(null);
    this.appendDummyInput();
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("https://www.gstatic.com/codesite/ph/images/star_on.gif", 15, 15, "*"))
        .appendField("　ゲームが終了するまで繰り返す");
    this.appendDummyInput()
        .appendField("もし自分のターンなら実行");
    this.appendStatementInput("my_turn")
        .setCheck(null);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(new Blockly.FieldImage("https://www.gstatic.com/codesite/ph/images/star_on.gif", 15, 15, "*"))
        .appendField("に戻る");
    this.setColour(195);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['wait'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(0, 0, 60, 0.1), "seconds")
        .appendField("秒　待つ");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(195);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

window.addEventListener('load', function() {
    getServarList();
})

function getServarList() {
    var url = './../api/join';
    fetch(url)
    .then(function (data) {
        return data.json(); 
    })
    .then(function (json) {
        Blockly.Blocks['server_join'] = {
          init: function() {
            this.appendDummyInput()
                .appendField(new Blockly.FieldDropdown(json), "room_id")
                .appendField(Blockly.Msg["SERVER_JOIN_BEFORE"])
                .appendField(new Blockly.FieldTextInput(""), "name")
                .appendField(Blockly.Msg["SERVER_JOIN_AFTER"]);
            this.appendStatementInput("main_loop_content")
                .setCheck(null);
            this.setInputsInline(true);
            this.setColour(195);
         this.setTooltip("");
         this.setHelpUrl("");
          },
          getDeveloperVariables: function () {
            return ['player'];
          }
        };
        initDataLoad();
    });
}
        

Blockly.Blocks['get_ready'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg["WAIT_MY_TURN"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(195);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['move_player'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg["DIRECTION_COMMAND_TOP"],"top"], [Blockly.Msg["DIRECTION_COMMAND_BOTTOM"] ,"bottom"], [Blockly.Msg["DIRECTION_COMMAND_LEFT"] ,"left"], [Blockly.Msg["DIRECTION_COMMAND_RIGHT"],"right"]]), "move")
        .appendField(Blockly.Msg["MOVE_INFO"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(90);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['look'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg["DIRECTION_COMMAND_TOP"],"top"], [Blockly.Msg["DIRECTION_COMMAND_BOTTOM"] ,"bottom"], [Blockly.Msg["DIRECTION_COMMAND_LEFT"] ,"left"], [Blockly.Msg["DIRECTION_COMMAND_RIGHT"],"right"]]), "look")
        .appendField(Blockly.Msg["LOOK_INFO"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(90);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['search'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg["DIRECTION_COMMAND_TOP"],"top"], [Blockly.Msg["DIRECTION_COMMAND_BOTTOM"] ,"bottom"], [Blockly.Msg["DIRECTION_COMMAND_LEFT"] ,"left"], [Blockly.Msg["DIRECTION_COMMAND_RIGHT"],"right"]]), "search")
        .appendField(Blockly.Msg["SEARCH_INFO"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(90);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['put_wall'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg["DIRECTION_COMMAND_TOP"],"top"], [Blockly.Msg["DIRECTION_COMMAND_BOTTOM"] ,"bottom"], [Blockly.Msg["DIRECTION_COMMAND_LEFT"] ,"left"], [Blockly.Msg["DIRECTION_COMMAND_RIGHT"],"right"]]), "put_wall")
        .appendField(Blockly.Msg["PUT_INFO"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(90);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['get_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["1","0"], ["2","1"], ["3","2"], ["4","3"], ["5","4"], ["6","5"], ["7","6"], ["8","7"], ["9","8"]]), "get_value")
        .appendField(Blockly.Msg["MAP_VALUE_INFO"]);
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour(195);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['get_look_value'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("周りの")
      .appendField(new Blockly.FieldDropdown([["1", "0"], ["2", "1"], ["3", "2"], ["4", "3"], ["5", "4"], ["6", "5"], ["7", "6"], ["8", "7"], ["9", "8"]]), "get_value")
      .appendField(Blockly.Msg["MAP_VALUE_INFO"]);
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour(195);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['get_search_value'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("遠くの")
      .appendField(new Blockly.FieldDropdown([["1", "0"], ["2", "1"], ["3", "2"], ["4", "3"], ["5", "4"], ["6", "5"], ["7", "6"], ["8", "7"], ["9", "8"]]), "get_value")
      .appendField(Blockly.Msg["MAP_VALUE_INFO"]);
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour(195);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['if_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["1","0"], ["2","1"], ["3","2"], ["4","3"], ["5","4"], ["6","5"], ["7","6"], ["8","7"], ["9","8"]]), "map_value")
        .appendField(Blockly.Msg["MAP_VALUE_INFO"] + "が")
        .appendField(new Blockly.FieldDropdown([["なにもない","0"], ["プレイヤーがいる","1"], ["ブロックがある","2"], ["ハートがある","3"]]), "map_item")
        .appendField("なら");
    this.setInputsInline(true);
    this.setOutput(true, "Boolean");
    this.setColour(195);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['if_look_value'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("周りの")
      .appendField(new Blockly.FieldDropdown([["1", "0"], ["2", "1"], ["3", "2"], ["4", "3"], ["5", "4"], ["6", "5"], ["7", "6"], ["8", "7"], ["9", "8"]]), "map_value")
      .appendField(Blockly.Msg["MAP_VALUE_INFO"] + "が")
      .appendField(new Blockly.FieldDropdown([["なにもない","0"], ["プレイヤーがいる","1"], ["ブロックがある","2"], ["ハートがある","3"]]), "map_item")
      .appendField("なら");
    this.setInputsInline(true);
    this.setOutput(true, "Boolean");
    this.setColour(195);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['if_search_value'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("遠くの")
      .appendField(new Blockly.FieldDropdown([["1", "0"], ["2", "1"], ["3", "2"], ["4", "3"], ["5", "4"], ["6", "5"], ["7", "6"], ["8", "7"], ["9", "8"]]), "map_value")
      .appendField(Blockly.Msg["MAP_VALUE_INFO"] + "が")
      .appendField(new Blockly.FieldDropdown([["なにもない","0"], ["プレイヤーがいる","1"], ["ブロックがある","2"], ["ハートがある","3"]]), "map_item")
      .appendField("なら");
    this.setInputsInline(true);
    this.setOutput(true, "Boolean");
    this.setColour(195);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['infinite_loop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg["INFINITE_LOOP"]);
    this.appendStatementInput("infinite_loop_content")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
 this.setTooltip("");
 this.setHelpUrl("");
 this.setStyle("loop_blocks");
  }
};

Blockly.libraryBlocks.loops.loopTypes.add('infinite_loop');
