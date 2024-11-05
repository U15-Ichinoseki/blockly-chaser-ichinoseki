
function createStageList(get_list){

  var stage_list = [];
  
  for(stage in get_list){
    stage_list.push(stage);
  }
  
  var h = document.getElementById('stage_list').clientHeight;
  var div_num = Math.ceil(h/80);
  
  
  if(stage_list.length >= div_num){
    div_num = stage_list.length*2;
  }
  else{
    div_num = Math.ceil(h*2/80);
  }
  
  div_num = stage_list.length;
  
  for(var i=0; i < div_num; i++){
    var one_stage = document.createElement('div');
    one_stage.classList.add("one_stage");
    
    var level = false;
    if(get_list[stage_list[i%stage_list.length]].level){
      level = get_list[stage_list[i%stage_list.length]].level;
    }
    
    
    var stage_div = document.createElement('div');
    if(i/stage_list.length < 1){
      one_stage.setAttribute("id","link_id_" + get_list[stage_list[i%stage_list.length]].stage_id);
    }
    stage_div.classList.add(get_list[stage_list[i%stage_list.length]].stage_id);
    stage_div.classList.add("stage_div");
    
    var stage_level = document.createElement('div');
    if(level){
      stage_level.classList.add("stage_level");
    }
    var newContent = document.createTextNode("Level " + level); 
    stage_level.appendChild(newContent);
    
    var stage_clear = document.createElement('div');
    stage_clear.classList.add("stage_status");
    if(localStorage[get_list[stage_list[i%stage_list.length]].stage_id]){
      stage_clear.classList.add("stage_clear");
    }
    
    var stage_name = document.createElement('div');
    stage_name.classList.add("stage_name");
    newContent = document.createTextNode(get_list[stage_list[i%stage_list.length]].name); 
    stage_name.appendChild(newContent);
    
    var stage_info = document.createElement('div');
    stage_info.classList.add("stage_info");
    if(get_list[stage_list[i%stage_list.length]].info){
      newContent = document.createTextNode(get_list[stage_list[i%stage_list.length]].info); 
    }
    else{
      newContent = document.createTextNode("");
    }
    stage_info.appendChild(newContent);
    
    stage_div.appendChild(stage_level);
    stage_div.appendChild(stage_clear);
    stage_div.appendChild(stage_name);
    stage_div.appendChild(stage_info);
    
    stage_div.onclick = function(e) {
      var stageId = this.classList[0];
      for(var select_id of stage_list){
        for(var select_class_list of document.getElementsByClassName(select_id)){
          if(stageId == select_id){
            select_class_list.classList.add("stage_select_on");
          }
          else if(select_class_list.classList.contains("stage_select_on")){
            select_class_list.classList.remove("stage_select_on");
          }
        }
      }
      stage_info_create(stageId,get_list);
      e.stopPropagation();
    };
    
    one_stage.appendChild(stage_div);
    
    document.getElementById('stage_list').appendChild(one_stage);
  }
  
  // var loop = document.getElementById('stage_list');
  
  // loop.onscroll = function(){
  //   var scrollTop = this.scrollTop;
  //   if(0 >= scrollTop){
  //     this.scrollTo( 0, stage_list.length*80-1 ) ;
  //   }
  //   else if(stage_list.length*80 < scrollTop){
  //     this.scrollTo( 0, 1 ) ;
  //   }
  // }
  // document.getElementById('stage_list').scrollTo( 0,1 ) ;
}

function stage_info_create(id,get_list){
  
  var data = get_list[id].map_data;
  var c = document.getElementById("map_table");
  if(c){
      c.parentNode.removeChild(c);
  }
  var rows=[];
  var table = document.createElement("table");
  table.setAttribute("id","map_table");
  
  for(i = 0; i < data.length; i++){
    rows.push(table.insertRow(-1));
    for(j = 0; j < data[0].length; j++){
      cell=rows[i].insertCell(-1);
      if(data[i][j] == 0){
        cell.classList.add("field_img");
      }
      else if(data[i][j] == 1){
        cell.classList.add("wall_img");
      }
      else if(data[i][j] == 2){
        cell.classList.add("hart_img");
      }
      else if(data[i][j] == 3){
        cell.classList.add("cool_img");
      }
      else if(data[i][j] == 4){
        cell.classList.add("hot_img");
      }
      else if(data[i][j] == 34){
        cell.classList.add("ch_img");
      }
      else if(data[i][j] == 43){
        cell.classList.add("hc_img");
      }
    }
  }
  
  c = document.getElementById("stage_join_div");
  if(c){
      c.parentNode.removeChild(c);
  }
  

  
  document.getElementById("stage_info_name").textContent = get_list[id].name;
  
  if(get_list[id].mode == "gethart"){
    document.getElementById("stage_info_hart_data").textContent = get_list[id].get_hart_value;
    if(document.getElementById("stage_info_hart").classList.contains('display_off')){
      document.getElementById("stage_info_hart").classList.remove("display_off");
    }
    
    if(!document.getElementById("stage_info_put").classList.contains('display_off')){
      document.getElementById("stage_info_put").classList.add("display_off");
    }
  }
  else if(get_list[id].mode == "puthot"){
    if(document.getElementById("stage_info_put").classList.contains('display_off')){
      document.getElementById("stage_info_put").classList.remove("display_off");
    }
    
    if(!document.getElementById("stage_info_hart").classList.contains('display_off')){
      document.getElementById("stage_info_hart").classList.add("display_off");
    }
  }
  document.getElementById("stage_info_block_data").textContent = get_list[id].block_limit;
  document.getElementById("stage_info_turn_data").textContent = get_list[id].turn;
  
  
  
  
  var stage_join_div = document.createElement('div');
  stage_join_div.setAttribute("id","stage_join_div");
  
  var stage_join_link = document.createElement('a');
  stage_join_link.classList.add("stage_join_link");
  stage_join_link.href = "/tutorial?stage=" + id;
  //server_join_link.target = "_blank";
  stage_join_link.innerText = "はじめる";
  	
  stage_join_div.appendChild(stage_join_link);
  	
  
  document.getElementById("stage_map").appendChild(table);
  document.getElementById("stage_info").appendChild(stage_join_div);
  
  document.getElementById("stage_map").classList.remove("display_off");
  document.getElementById("stage_info_condition").classList.remove("display_off");
  document.getElementById("stage_join_div").classList.remove("display_off");
  document.getElementById("stage_info_name").classList.remove("display_off");
  document.getElementById("menu_area").classList.add("select_back");
}


window.addEventListener('load', function() {
    getStageList();
})

function getStageList() {
    var url = './../api/tutorial';
    fetch(url)
    .then(function (data) {
        return data.json(); 
    })
    .then(function (json) {
        createStageList(json);
    });
}

document.getElementById("menu_area").onclick = function(){
  document.getElementById("stage_map").classList.add("display_off");
  document.getElementById("stage_info_condition").classList.add("display_off");
  document.getElementById("stage_join_div").classList.add("display_off");
  document.getElementById("stage_info_name").classList.add("display_off");
  document.getElementById("menu_area").classList.remove("select_back");
}

document.getElementById("stage_info").onclick = function(e){
  e.stopPropagation();
}

document.getElementById("stage_info_name").onclick = function(e){
  e.stopPropagation();
}