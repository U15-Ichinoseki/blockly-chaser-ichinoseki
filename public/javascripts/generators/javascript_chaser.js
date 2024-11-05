javascript.javascriptGenerator.forBlock['wait'] = function(block) {
  var seconds = Number(block.getFieldValue('seconds'));
  var code = 'wait(' + seconds + ');\n';
  return code;
};

javascript.javascriptGenerator.forBlock['server_join'] = function(block) {
  var dropdown_room_id = block.getFieldValue('room_id');
  var text_name = block.getFieldValue('name');
  var statements_main_loop_content = Blockly.JavaScript.statementToCode(block, 'main_loop_content');
  // TODO: Assemble JavaScript into code variable.
  
  if(!text_name){
      text_name = "NoName"
  }
  var code = 'join("' + dropdown_room_id + '","' + text_name + '");\n';
  return code + statements_main_loop_content;
};

javascript.javascriptGenerator.forBlock['get_ready'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'map_info = get_ready();\n';
  return code;
};

javascript.javascriptGenerator.forBlock['move_player'] = function(block) {
  var dropdown_move = block.getFieldValue('move');
  // TODO: Assemble JavaScript into code variable.
  var code = 'map_info = move_player("' + dropdown_move + '");\n';
  return code;
};

javascript.javascriptGenerator.forBlock['look'] = function(block) {
  var dropdown_look = block.getFieldValue('look').toString();
  var code = 'look_info = look("'+ dropdown_look +'");\n';
  return code;
};

javascript.javascriptGenerator.forBlock['search'] = function(block) {
  var dropdown_look = block.getFieldValue('search').toString();
  var code = 'search_info = search("'+ dropdown_look +'");\n';
  return code;
};

javascript.javascriptGenerator.forBlock['put_wall'] = function(block) {
  var dropdown_put_wall = block.getFieldValue('put_wall').toString();
  // TODO: Assemble JavaScript into code variable.
  var code = 'map_info = put_wall("' + dropdown_put_wall + '");\n';
  return code;
};

javascript.javascriptGenerator.forBlock['get_value'] = function(block) {
  var dropdown_get_value = block.getFieldValue('get_value');
  // TODO: Assemble JavaScript into code variable.
  var code = 'valueNum(map_info['+ dropdown_get_value +'])';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['get_look_value'] = function(block) {
  var dropdown_get_value = block.getFieldValue('get_value');
  // TODO: Assemble JavaScript into code variable.
  var code = 'valueNum(look_info['+ dropdown_get_value +'])';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['get_search_value'] = function(block) {
  var dropdown_get_value = block.getFieldValue('get_value');
  // TODO: Assemble JavaScript into code variable.
  var code = 'valueNum(search_info['+ dropdown_get_value +'])';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['if_value'] = function(block) {
  var dropdown_map_value = block.getFieldValue('map_value');
  var dropdown_map_item = block.getFieldValue('map_item');
  // TODO: Assemble JavaScript into code variable.
  var code = 'map_info['+ dropdown_map_value +'] == ' + dropdown_map_item + '';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['if_look_value'] = function(block) {
  var dropdown_map_value = block.getFieldValue('map_value');
  var dropdown_map_item = block.getFieldValue('map_item');
  // TODO: Assemble JavaScript into code variable.
  var code = 'look_info['+ dropdown_map_value +'] == ' + dropdown_map_item + '';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['if_search_value'] = function(block) {
  var dropdown_map_value = block.getFieldValue('map_value');
  var dropdown_map_item = block.getFieldValue('map_item');
  // TODO: Assemble JavaScript into code variable.
  var code = 'search_info['+ dropdown_map_value +'] == ' + dropdown_map_item + '';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['infinite_loop'] = function(block) {
  var statements_infinite_loop_content = Blockly.JavaScript.statementToCode(block, 'infinite_loop_content');
  // TODO: Assemble JavaScript into code variable.
  statements_infinite_loop_content = Blockly.JavaScript.addLoopTrap(statements_infinite_loop_content, block);
  var code = 'while (!false) {\n'+ statements_infinite_loop_content + '}\n';
  return code;
};

