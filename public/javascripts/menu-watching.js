function createserverList(get_list) {
  // グループ分け: 対戦/自動
  const groupMap = {
    "対戦": [],
    "自動": []
  };

  for (var key in get_list) {
    const server = get_list[key];
    if (server.name.includes('room_onetime')) continue;
    if (!server.cpu) {
      groupMap["対戦"].push(server);
    } else {
      groupMap["自動"].push(server);
    }
  }

  const watchingListElem = document.getElementById('watching_list');
  watchingListElem.innerHTML = '';

  Object.keys(groupMap).forEach(groupName => {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('server_group');

    const groupTitle = document.createElement('div');
    groupTitle.classList.add('server_group_title');
    groupTitle.textContent = groupName;
    groupDiv.appendChild(groupTitle);

    const rowDiv = document.createElement('div');
    rowDiv.classList.add('server_row');

    groupMap[groupName].forEach(server => {
      const one_server_div = document.createElement('div');
      one_server_div.classList.add("one_watching_server");
      one_server_div.setAttribute("id", "link_id_" + server.room_id);

      const vs = !server.cpu ? "VS" : "AUTO";

      const server_div = document.createElement('div');
      server_div.classList.add(server.room_id);
      server_div.classList.add("watching_server_div");

      const server_vs = document.createElement('div');
      if (vs == "VS") {
        server_vs.classList.add("server_vs_player");
      } else {
        server_vs.classList.add("server_vs_auto");
      }
      let newContent = document.createTextNode(vs);
      server_vs.appendChild(newContent);

      const server_name = document.createElement('div');
      server_name.classList.add("server_name");
      const serverName = server.name.replace("room_onetime_", "");
      newContent = document.createTextNode(serverName);
      server_name.appendChild(newContent);

      const server_id = document.createElement('div');
      server_id.classList.add("server_id");
      newContent = document.createTextNode(server.room_id);
      server_id.appendChild(newContent);

      server_div.appendChild(server_vs);
      server_div.appendChild(server_name);
      server_div.appendChild(server_id);

      server_div.onclick = function (e) {
        var serverId = this.classList[0];
        document.querySelectorAll('.watching_server_div').forEach(div => {
          div.classList.remove("server_select_on");
        });
        this.classList.add("server_select_on");
        server_info(serverId, get_list);
        e.stopPropagation();
      };

      one_server_div.appendChild(server_div);
      rowDiv.appendChild(one_server_div);
    });

    groupDiv.appendChild(rowDiv);
    watchingListElem.appendChild(groupDiv);
  });
}

function server_info(id, get_list) {

  var data = get_list[id].map_data || [];

  var c = document.getElementById("game_board_hex");
  if (c) {
    c.parentNode.removeChild(c);
  }

  // 表示領域取得（フォールバックあり）
  var parentEl = document.getElementById("watching_info") || document.body;

  // 親コンテナ
  var boardContainer = document.createElement("div");
  boardContainer.id = "game_board_hex";
  parentEl.appendChild(boardContainer);

  if (data.length) {
      const rows = data.length;
      const cols = data[0].length;

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
  }
  

  c = document.getElementById("server_info_div");
  if (c) {
    c.parentNode.removeChild(c);
  }

  c = document.getElementById("server_join_div");
  if (c) {
    c.parentNode.removeChild(c);
  }

  c = document.getElementById("server_watch_div");
  if (c) {
    c.parentNode.removeChild(c);
  }

  c = document.getElementById("server_info_name");
  if (c) {
    c.parentNode.removeChild(c);
  }

  c = document.getElementById("server_access_div");
  if (c) {
    c.parentNode.removeChild(c);
  }

  var server_info_name = document.createElement('div');
  server_info_name.setAttribute("id", "server_info_name");
  var newContent = document.createTextNode(get_list[id].name);
  server_info_name.appendChild(newContent);


  var server_info_div = document.createElement('div');
  server_info_div.setAttribute("id", "server_info_div");

  var server_info_title = document.createElement('span');
  newContent = document.createTextNode(lng_list["SERVER_INFO"]);
  server_info_title.appendChild(newContent);

  var server_info_id = document.createElement('div');
  server_info_id.setAttribute("id", "server_info_id");
  newContent = document.createTextNode(get_list[id].room_id);
  server_info_id.appendChild(newContent);

  var server_info_map = document.createElement('div');
  server_info_map.setAttribute("id", "server_info_map");
  var map_status = lng_list["FIXITY"];
  if (!get_list[id].map_data.length) {
    boardContainer.classList.add("auto_create_map");
    map_status = lng_list["AUTOMATIC_GENERATION"];
    if (get_list[id].auto_symmetry) {
      map_status += lng_list["SYMMETRY"];
    }
    else {
      map_status += lng_list["RANDOM"];
    }
  }
  newContent = document.createTextNode(map_status);
  server_info_map.appendChild(newContent);

  var server_info_turn = document.createElement('div');
  server_info_turn.setAttribute("id", "server_info_turn");
  var turn_status = lng_list["CONNECTION_ORDER"];
  if (get_list[id].cpu) {
    turn_status = lng_list["FIXITY"];
    if (get_list[id].cpu.turn == "cool") {
      turn_status += lng_list["TURN_H"];
    }
    else {
      turn_status += lng_list["TURN_C"];
    }
  }
  newContent = document.createTextNode(turn_status);
  server_info_turn.appendChild(newContent);

  server_info_div.appendChild(server_info_title);
  server_info_div.appendChild(server_info_id);
  server_info_div.appendChild(server_info_map);
  server_info_div.appendChild(server_info_turn);


  var server_access_div = document.createElement('div');
  server_access_div.setAttribute("id", "server_access_div");

  var server_match_button = document.createElement('button');
  server_match_button.setAttribute("id", "server_match_button");
  server_match_button.classList.add("server_match_button");
  server_match_button.innerText = lng_list["MATCH"];
  server_match_button.addEventListener('click', function() {
      var additionalText = encodeURIComponent(server_token_input.value);
      if (additionalText == "") {
          additionalText = "no_token";
      }
      window.location.href = '/match?room_id=' + id + '&room_token=' + additionalText;
  });

  var server_watch_button = document.createElement('button');
  server_watch_button.setAttribute("id", "server_watch_button");
  server_watch_button.classList.add("server_watch_button");
  server_watch_button.innerText = lng_list["WATCHING"];
  server_watch_button.addEventListener('click', function() {
      var additionalText = encodeURIComponent(server_token_input.value);
      if (additionalText == "") {
          additionalText = "no_token";
      }
      window.location.href = '/watching?room_id=' + id + '&room_token=' + additionalText;
  });

  var server_token_input = document.createElement('input');
  server_token_input.setAttribute("id", "server_token_input");
  server_token_input.classList.add("server_token_input");
  server_token_input.type = 'text';
  server_token_input.placeholder = '合言葉を入力';
  server_token_input.addEventListener('input', function() {
    this.value = this.value.replace(/[^\x00-\x7F]/g, '');
  });

  server_access_div.appendChild(server_match_button);
  server_access_div.appendChild(server_watch_button);
  server_access_div.appendChild(server_token_input);

  document.getElementById("watching_info").appendChild(boardContainer);
  document.getElementById("watching_info").appendChild(server_info_div);
  document.getElementById("watching_info").appendChild(server_access_div);
  document.getElementById("menu_area").appendChild(server_info_name);
  document.getElementById("menu_area").classList.add("select_back");
}


window.addEventListener('load', function () {
  getserverList();
})

function getserverList() {
  var url = './../api/game';
  fetch(url)
    .then(function (data) {
      return data.json();
    })
    .then(function (json) {
      createserverList(json);
    });
}

