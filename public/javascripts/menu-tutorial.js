function createStageList(get_list) {
  // ステージ名でグルーピング
  const groupMap = {};
  for (const key in get_list) {
    const stage = get_list[key];
    let groupName = stage.name;
    const match = groupName.match(/^(ステージ\s*\d+)/);
    if (match) {
      groupName = match[1];
    }
    if (!groupMap[groupName]) {
      groupMap[groupName] = [];
    }
    groupMap[groupName].push(stage);
  }

  const stageListElem = document.getElementById('stage_list');
  stageListElem.innerHTML = '';

  // ステージ名でソート
  Object.keys(groupMap)
    .sort((a, b) => {
      const aMatch = a.match(/(\d+)/);
      const bMatch = b.match(/(\d+)/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
      }
      return a.localeCompare(b, 'ja', {numeric: true});
    })
    .forEach((groupName, groupIdx) => {
      const groupDiv = document.createElement('div');
      groupDiv.classList.add('stage_group');

      const groupTitle = document.createElement('div');
      groupTitle.classList.add('stage_group_title');
      groupTitle.textContent = groupName;
      groupDiv.appendChild(groupTitle);

      const rowDiv = document.createElement('div');
      rowDiv.classList.add('stage_row');

      // ステージ番号でソート
      groupMap[groupName].sort((a, b) => {
        const aMatch = a.name.match(/-(\d+)$/);
        const bMatch = b.name.match(/-(\d+)$/);
        if (aMatch && bMatch) {
          return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
        }
        return a.name.localeCompare(b.name, 'ja', {numeric: true});
      });

      groupMap[groupName].forEach((stage, i) => {
        const one_stage = document.createElement('div');
        one_stage.classList.add("one_stage");
        one_stage.setAttribute("id", "link_id_" + stage.stage_id);

        const level = stage.level || false;

        const stage_div = document.createElement('div');
        stage_div.classList.add(stage.stage_id);
        stage_div.classList.add("stage_div");

        const stage_level = document.createElement('div');
        if (level) {
          stage_level.classList.add("stage_level");
        }
        let newContent = document.createTextNode("Level " + level);
        stage_level.appendChild(newContent);

        const stage_clear = document.createElement('div');
        stage_clear.classList.add("stage_status");
        if (localStorage[stage.stage_id]) {
          stage_clear.classList.add("stage_clear");
        }

        const stage_name = document.createElement('div');
        stage_name.classList.add("stage_name");
        newContent = document.createTextNode(stage.name);
        stage_name.appendChild(newContent);

        const stage_info = document.createElement('div');
        stage_info.classList.add("stage_info");
        if (stage.info) {
          newContent = document.createTextNode(stage.info);
        } else {
          newContent = document.createTextNode("");
        }
        stage_info.appendChild(newContent);

        stage_div.appendChild(stage_level);
        stage_div.appendChild(stage_clear);
        stage_div.appendChild(stage_name);
        stage_div.appendChild(stage_info);

        stage_div.onclick = function (e) {
          var stageId = this.classList[0];
          document.querySelectorAll('.stage_div').forEach(div => {
            div.classList.remove("stage_select_on");
          });
          this.classList.add("stage_select_on");
          stage_info_create(stageId, get_list);
          e.stopPropagation();
        };

        one_stage.appendChild(stage_div);
        rowDiv.appendChild(one_stage);
      });

      groupDiv.appendChild(rowDiv);
      stageListElem.appendChild(groupDiv);
    });
}

function stage_info_create(id, get_list) {

  var data = get_list[id].map_data;

  var rows = data.length;
  var cols = data[0].length;

  var c = document.getElementById("game_board_hex");
  if (c) {
    c.parentNode.removeChild(c);
  }

  // 表示領域取得（フォールバックあり）
  var parentEl = document.getElementById("stage_map") || document.body;
  parentEl.classList.remove("display_off");

  // 親コンテナ
  var boardContainer = document.createElement("div");
  boardContainer.id = "game_board_hex";
  parentEl.appendChild(boardContainer);

  // 表示領域取得
  var containerWidth  = boardContainer.clientWidth;
  var containerHeight = boardContainer.clientHeight;
  // 最小限のサイズ保証
  containerWidth  = Math.max(200, containerWidth);
  containerHeight = Math.max(200, containerHeight);
  
  // flat-top hex レイアウト（隙間なく）
  // size = 半径 (center->corner)
  // width = 2 * size, height = sqrt(3) * size
  // 横方向中心間隔 = 1.5 * size, 縦方向中心間隔 = height
  const maxSizeFromWidth = containerWidth / (1.5 * cols + 0.5);
  const maxSizeFromHeight = containerHeight / (Math.sqrt(3) * (rows + 1.5));
  const size = Math.max(4, Math.min(maxSizeFromWidth, maxSizeFromHeight));
  const hexWidth = 2 * size;
  const hexHeight = Math.sqrt(3) * size;
  const stepX = 1.5 * size;
  const stepY = hexHeight;
  const colOffsetY = hexHeight / 2;

  // マップタイルヘルパ
  function getMapTile(v) {
      if (v == 0) return "field_img";
      if (v == 1) return "wall_img";
      if (v == 2) return "hart_img";
      if (v == 3) return "cool_img";
      if (v == 4) return "hot_img";
      if (v == 34) return "ch_img";
      if (v == 43) return "hc_img";
      return "field_img";
  }

  // 中央寄せ基点（中心座標原点）
  const boardPixelWidth = stepX * (cols - 1) + hexWidth;
  const boardPixelHeight = stepY * rows;
  const originX = (containerWidth - boardPixelWidth) / 2 + hexWidth / 2;
  const originY = (containerHeight - boardPixelHeight) / 2 + hexHeight / 2;

  // 六角セル生成
  for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
          const val = data[r][c];
          const hex = document.createElement("div");
          hex.classList.add("hex");
          hex.classList.add(getMapTile(val));

          // flat-top クリップパス（左右が平らな六角形）
          hex.style.width = hexWidth + "px";
          hex.style.height = hexHeight + "px";

          hex.id = `hex_${r}_${c}`;

          // 中心座標算出（flat-top, even-q）
          const centerX = originX + c * stepX;
          const centerY = originY + r * stepY + ((c % 2 === 0) ? colOffsetY : 0);
          hex.style.left = (centerX - hexWidth / 2) + "px";
          hex.style.top = (centerY - hexHeight / 2) + "px";

          boardContainer.appendChild(hex);
      }
  }
  
  c = document.getElementById("stage_join_div");
  if (c) {
    c.parentNode.removeChild(c);
  }



  document.getElementById("stage_info_name").textContent = get_list[id].name;

  if (get_list[id].mode == "gethart") {
    document.getElementById("stage_info_hart_data").textContent = get_list[id].get_hart_value;
    if (document.getElementById("stage_info_hart").classList.contains('display_off')) {
      document.getElementById("stage_info_hart").classList.remove("display_off");
    }

    if (!document.getElementById("stage_info_put").classList.contains('display_off')) {
      document.getElementById("stage_info_put").classList.add("display_off");
    }
  }
  else if (get_list[id].mode == "puthot") {
    if (document.getElementById("stage_info_put").classList.contains('display_off')) {
      document.getElementById("stage_info_put").classList.remove("display_off");
    }

    if (!document.getElementById("stage_info_hart").classList.contains('display_off')) {
      document.getElementById("stage_info_hart").classList.add("display_off");
    }
  }
  document.getElementById("stage_info_block_data").textContent = get_list[id].block_limit;
  document.getElementById("stage_info_turn_data").textContent = get_list[id].turn;




  var stage_join_div = document.createElement('div');
  stage_join_div.setAttribute("id", "stage_join_div");

  var stage_join_link = document.createElement('a');
  stage_join_link.classList.add("stage_join_link");
  stage_join_link.href = "/tutorial?stage=" + id;
  //server_join_link.target = "_blank";
  stage_join_link.innerText = "はじめる";

  stage_join_div.appendChild(stage_join_link);


  document.getElementById("stage_info").prepend(stage_join_div);

  document.getElementById("stage_map").classList.remove("display_off");
  document.getElementById("stage_info_condition").classList.remove("display_off");
  document.getElementById("stage_join_div").classList.remove("display_off");
  document.getElementById("stage_info_name").classList.remove("display_off");
  document.getElementById("menu_area").classList.add("select_back");
}


window.addEventListener('load', function () {
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

document.getElementById("menu_area").onclick = function () {
  document.getElementById("stage_map").classList.add("display_off");
  document.getElementById("stage_info_condition").classList.add("display_off");
  document.getElementById("stage_join_div").classList.add("display_off");
  document.getElementById("stage_info_name").classList.add("display_off");
  document.getElementById("menu_area").classList.remove("select_back");
}

document.getElementById("stage_info").onclick = function (e) {
  e.stopPropagation();
}

document.getElementById("stage_info_name").onclick = function (e) {
  e.stopPropagation();
}