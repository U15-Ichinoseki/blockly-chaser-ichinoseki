var JtoP = {
  '"top"': 'Up',
  '"bottom"': 'Down',
  '"left"': 'Left',
  '"right"': 'Right'
};

var NumtoName = [
  'UpLeft',
  'Up',
  'UpRight',
  'Left',
  'Center',
  'Right',
  'DownLeft',
  'Down',
  'DownRight'
];

var NumtoItem = [
  'Floor',
  'Enemy',
  'Block',
  'Item'
];

python.pythonGenerator.forBlock['wait'] = function (block) {
  var seconds = Number(block.getFieldValue('seconds'));
  var code = 'wait(' + seconds + ');\n';
  return code;
};


python.pythonGenerator.forBlock['server_join'] = function (block) {
  var dropdown_room_id = block.getFieldValue('room_id');
  var text_name = block.getFieldValue('name');
  var statements_main_loop_content = Blockly.Python.statementToCode(block, 'main_loop_content');
  // TODO: Assemble Python into code variable.
  Blockly.Python.definitions_['import_chaser'] = 'from CHaser import * # 同じディレクトリに CHaser.py';
  Blockly.Python.definitions_['import_argparse'] = 'import argparse';

  var globals = [];

  var variables = Blockly.Variables.allUsedVarModels(block.workspace) || [];
  for (var i = 0, variable; variable = variables[i]; i++) {
    globals.push(Blockly.Python.nameDB_.getName(variable.name, Blockly.Variables.NAME_TYPE));
  }
  // Add developer variables.
  var devVarList = Blockly.Variables.allDeveloperVariables(block.workspace);
  for (var i = 0; i < devVarList.length; i++) {
    globals.push(Blockly.Python.nameDB_.getName(devVarList[i], Blockly.Names.DEVELOPER_VARIABLE_TYPE));
  }

  globals = globals.length ? 'global ' + globals.join(', ') + '\n' : '';


  begin_code = 'def main(port, name, host):\n'
    + Blockly.Python.INDENT + globals + '\n\n'
    + Blockly.Python.INDENT + '# サーバーと接続\n'
    + Blockly.Python.INDENT + 'player = Client(port=port, name=name, host=host)\n\n';


  if (!text_name) {
    text_name = "COOL";
  }

  var end_code = '\n\n\nif __name__ == "__main__":\n'
    + Blockly.Python.INDENT + 'parser = argparse.ArgumentParser()\n'
    + Blockly.Python.INDENT + "parser.add_argument('-p', '--port', default=2009)\n"
    + Blockly.Python.INDENT + "parser.add_argument('-n', '--name', default='" + text_name + "')\n"
    + Blockly.Python.INDENT + "parser.add_argument('-i', '--host', default='localhost')\n\n"
    + Blockly.Python.INDENT + 'args = parser.parse_args()\n\n'
    + Blockly.Python.INDENT + 'main(port=args.port, name=args.name, host=args.host)\n';

  code = begin_code + statements_main_loop_content + end_code;

  return code;
};


python.pythonGenerator.forBlock['get_ready'] = function (block) {
  // TODO: Assemble Python into code variable.
  var code = 'map_info = player.get_ready()\n';
  return code;
};

python.pythonGenerator.forBlock['move_player'] = function (block) {
  value_move = block.getFieldValue('move');

  // TODO: Assemble Python into code variable.
  if (value_move in JtoP) value_move = JtoP[value_move];
  var code = 'player.walk(' + value_move + ')\n';
  return code;
};

python.pythonGenerator.forBlock['random_move'] = function (block) {
  // TODO: Assemble Python into code variable.
  var code = '';
  code = code + '__noblock = []\n';
  code = code + 'if (map_info[Up] != Block):\n';
  code = code + Blockly.Python.INDENT + '__noblock.append(Up)\n';
  code = code + 'if (map_info[Down] != Block):\n';
  code = code + Blockly.Python.INDENT + '__noblock.append(Down)\n';
  code = code + 'if (map_info[Left] != Block):\n';
  code = code + Blockly.Python.INDENT + '__noblock.append(Left)\n';
  code = code + 'if (map_info[Right] != Block):\n';
  code = code + Blockly.Python.INDENT + '__noblock.append(Right)\n';
  code = code + 'player.walk(random.choice(__noblock))\n';

  return code;
};

python.pythonGenerator.forBlock['put_wall'] = function (block) {
  value_put_wall = block.getFieldValue('put_wall');

  // TODO: Assemble Python into code variable.
  if (value_put_wall in JtoP) value_put_wall = JtoP[value_put_wall];
  var code = 'player.put(' + value_put_wall + ')\n';
  return code;
};

python.pythonGenerator.forBlock['look'] = function (block) {
  value_look = block.getFieldValue('look');

  if (value_look in JtoP) value_look = JtoP[value_look];
  var code = 'look_info = player.look(' + value_look + ')\n';
  return code;
};

python.pythonGenerator.forBlock['search'] = function (block) {
  value_search = block.getFieldValue('search');

  if (value_search in JtoP) value_search = JtoP[value_search];
  var code = 'search_info = player.search(' + value_search + ')\n';
  return code;
};

python.pythonGenerator.forBlock['get_value'] = function (block) {
  value_map_position = block.getFieldValue('map_position').toString();

  // TODO: Assemble Python into code variable.
  if (value_map_position in NumtoName) value_map_position = NumtoName[value_map_position];
  var code = 'map_info[' + value_map_position + ']';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['get_look_value'] = function (block) {
  value_map_position = block.getFieldValue('map_position').toString();

  // TODO: Assemble Python into code variable.
  if (value_map_position in NumtoName) value_map_position = NumtoName[value_map_position];
  var code = 'look_info[' + value_map_position + ']';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['get_search_value'] = function (block) {
  value_map_position = block.getFieldValue('map_position').toString();

  // TODO: Assemble Python into code variable.
  var code = 'search_info[' + value_map_position + ']';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['if_value'] = function (block) {
  value_map_position = block.getFieldValue('map_position').toString();
  value_map_item = block.getFieldValue('map_item').toString();

  // TODO: Assemble Python into code variable.
  if (value_map_position in NumtoName) value_map_position = NumtoName[value_map_position];
  if (value_map_item in NumtoItem) value_map_item = NumtoItem[value_map_item];
  var code = 'map_info[' + value_map_position + '] == ' + value_map_item + '';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

python.pythonGenerator.forBlock['if_look_value'] = function (block) {
  value_map_position = block.getFieldValue('map_position').toString();
  value_map_item = block.getFieldValue('map_item').toString();

  // TODO: Assemble Python into code variable.
  if (value_map_position in NumtoName) value_map_position = NumtoName[value_map_position];
  if (value_map_item in NumtoItem) value_map_item = NumtoItem[value_map_item];
  var code = 'look_info[' + value_map_position + '] == ' + value_map_item + '';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

python.pythonGenerator.forBlock['if_search_value'] = function (block) {
  value_map_position = block.getFieldValue('map_position').toString();
  value_map_item = block.getFieldValue('map_item').toString();

  // TODO: Assemble Python into code variable.
  if (value_map_item in NumtoItem) value_map_item = NumtoItem[value_map_item];
  var code = 'search_info[' + value_map_position + '] == ' + value_map_item + '';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};



// expert mode
python.pythonGenerator.forBlock['direction4_value'] = function (block) {
  var dropdown_direction = block.getFieldValue('direction_value').toString();
  // TODO: Assemble Python into code variable.
  code = JtoP[dropdown_direction];

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['position9_value'] = function (block) {
  var dropdown_position = block.getFieldValue('position_value').toString();
  // TODO: Assemble Python into code variable.
  code = NumtoName[dropdown_position];

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['position9_num_value'] = function (block) {
  var dropdown_position = block.getFieldValue('position_num_value').toString();
  // TODO: Assemble Python into code variable.
  code = dropdown_position;

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['item4_value'] = function (block) {
  var dropdown_item = block.getFieldValue('item_value').toString();
  // TODO: Assemble Python into code variable.
  code = NumtoItem[dropdown_item];

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['move_player_exp'] = function (block) {
  var value_move = Blockly.Python.valueToCode(block, 'move', Blockly.Python.ORDER_ATOMIC);

  // TODO: Assemble Python into code variable.
  if (value_move in JtoP) value_move = JtoP[value_move];
  var code = 'player.walk(' + value_move + ')\n';
  return code;
};

python.pythonGenerator.forBlock['put_wall_exp'] = function (block) {
  var value_put_wall = Blockly.Python.valueToCode(block, 'put_wall', Blockly.Python.ORDER_ATOMIC);

  // TODO: Assemble Python into code variable.
  if (value_put_wall in JtoP) value_put_wall = JtoP[value_put_wall];
  var code = 'player.put(' + value_put_wall + ')\n';
  return code;
};

python.pythonGenerator.forBlock['look_exp'] = function (block) {
  var value_look = Blockly.Python.valueToCode(block, 'look', Blockly.Python.ORDER_ATOMIC);

  if (value_look in JtoP) value_look = JtoP[value_look];
  var code = 'look_info = player.look(' + value_look + ')\n';
  return code;
};

python.pythonGenerator.forBlock['search_exp'] = function (block) {
  var value_search = Blockly.Python.valueToCode(block, 'search', Blockly.Python.ORDER_ATOMIC);

  if (value_search in JtoP) value_search = JtoP[value_search];
  var code = 'search_info = player.search(' + value_search + ')\n';
  return code;
};

python.pythonGenerator.forBlock['get_ready_list'] = function (block) {
  // TODO: Assemble Python into code variable.
  var code = 'map_info';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['look_list'] = function (block) {
  var code = 'look_info';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['search_list'] = function (block) {
  var code = 'search_info';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['get_value_exp'] = function (block) {
  var value_map_position = Blockly.Python.valueToCode(block, 'map_position', Blockly.Python.ORDER_ATOMIC);

  // TODO: Assemble Python into code variable.
  if (value_map_position in NumtoName) value_map_position = NumtoName[value_map_position];
  var code = 'map_info[' + value_map_position + ']';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['get_look_value_exp'] = function (block) {
  var value_map_position = Blockly.Python.valueToCode(block, 'map_position', Blockly.Python.ORDER_ATOMIC);

  // TODO: Assemble Python into code variable.
  if (value_map_position in NumtoName) value_map_position = NumtoName[value_map_position];
  var code = 'look_info[' + value_map_position + ']';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['get_search_value_exp'] = function (block) {
  var value_map_position = Blockly.Python.valueToCode(block, 'map_position', Blockly.Python.ORDER_ATOMIC);

  // TODO: Assemble Python into code variable.
  var code = 'search_info[' + value_map_position + ']';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['if_value_exp'] = function (block) {
  var value_map_position = Blockly.Python.valueToCode(block, 'map_position', Blockly.Python.ORDER_ATOMIC);
  var value_map_item = Blockly.Python.valueToCode(block, 'map_item', Blockly.Python.ORDER_ATOMIC);

  // TODO: Assemble Python into code variable.
  if (value_map_position in NumtoName) value_map_position = NumtoName[value_map_position];
  if (value_map_item in NumtoItem) value_map_item = NumtoItem[value_map_item];
  var code = 'map_info[' + value_map_position + '] == ' + value_map_item + '';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

python.pythonGenerator.forBlock['if_look_value_exp'] = function (block) {
  var value_map_position = Blockly.Python.valueToCode(block, 'map_position', Blockly.Python.ORDER_ATOMIC);
  var value_map_item = Blockly.Python.valueToCode(block, 'map_item', Blockly.Python.ORDER_ATOMIC);


  // TODO: Assemble Python into code variable.
  if (value_map_position in NumtoName) value_map_position = NumtoName[value_map_position];
  if (value_map_item in NumtoItem) value_map_item = NumtoItem[value_map_item];
  var code = 'look_info[' + value_map_position + '] == ' + value_map_item + '';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

python.pythonGenerator.forBlock['if_search_value_exp'] = function (block) {
  var value_map_position = Blockly.Python.valueToCode(block, 'map_position', Blockly.Python.ORDER_ATOMIC);
  var value_map_item = Blockly.Python.valueToCode(block, 'map_item', Blockly.Python.ORDER_ATOMIC);

  // TODO: Assemble Python into code variable.
  if (value_map_item in NumtoItem) value_map_item = NumtoItem[value_map_item];
  var code = 'search_info[' + value_map_position + '] == ' + value_map_item + '';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};


python.pythonGenerator.forBlock['infinite_loop'] = function (block) {
  var statements_infinite_loop_content = Blockly.Python.statementToCode(block, 'infinite_loop_content');
  // TODO: Assemble Python into code variable.
  statements_infinite_loop_content = Blockly.Python.addLoopTrap(statements_infinite_loop_content, block);
  var code = 'while True:\n' + statements_infinite_loop_content;
  return code;
};
