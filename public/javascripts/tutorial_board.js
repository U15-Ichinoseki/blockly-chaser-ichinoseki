function neighbor(i) {
    switch (i) {
        case 0: return "top";
        case 1: return "topright";
        case 2: return "bottomright";
        case 3: return "bottom";
        case 4: return "bottomleft";
        case 5: return "topleft";
        default: return null;
    }
}

function neighbors() {
    return ["top", "topright", "bottomright", "bottom", "bottomleft", "topleft"];
}

// へクス隣接 delta (flat-top, even-q offset)
// 方向名を top, topright, bottomright, bottom, bottomleft, topleft に統一
function hexDirectionDelta(dir, col) {
    const col_is_even = (col % 2) === 0;
    switch (dir) {
        case "top":          return { dx:  0, dy: -1 };
        case "bottom":       return { dx:  0, dy:  1 };
        case "topright":     return { dx:  1, dy: (col_is_even ? 0 :  -1) }
        case "bottomright":  return { dx:  1, dy: (col_is_even ? 1 :   0) }
        case "topleft":      return { dx: -1, dy: (col_is_even ? 0 :  -1) }
        case "bottomleft":   return { dx: -1, dy: (col_is_even ? 1 :   0) }
        default:             return { dx:  0, dy: 0 };
    }
}

// 中心セル(cx,cy)を基準に center + 6近傍 の7要素を判定
function isSurround7(cx, cy, x, y) {
    if (cx == x && cy == y) 
        return true;

    const neigh = neighbors();
    for (let dname of neigh) {
        const d = hexDirectionDelta(dname, cx);
        const nx = cx + d.dx;
        const ny = cy + d.dy;

        if (nx == x && ny == y) 
            return true;
    }

    return false;
}

// makeTable をflat-top hex レイアウトに差し替え
function makeTable(tableId, effect = false) {

    var random = -1;

    if (stage_data["spon_cool"]) {
        stage_data["spon_cool"] = false;
        random = Math.floor(Math.random() * stage_data["spon_cool_pos"].length);
        stage_data["cool_x"] = stage_data["spon_cool_pos"][random][0];
        stage_data["cool_y"] = stage_data["spon_cool_pos"][random][1];
        stage_data["map_data"][stage_data["cool_y"]][stage_data["cool_x"]] = 3;
    }

    if (stage_data["spon_hot"]) {
        stage_data["spon_hot"] = false;
        random = Math.floor(Math.random() * stage_data["spon_hot_pos"].length);
        stage_data["hot_x"] = stage_data["spon_hot_pos"][random][0];
        stage_data["hot_y"] = stage_data["spon_hot_pos"][random][1];
        stage_data["map_data"][stage_data["hot_y"]][stage_data["hot_x"]] = 4;
    }

    if (stage_data["spon_block"]) {
        stage_data["spon_block"] = false;
        random = Math.floor(Math.random() * stage_data["spon_block_pos"].length);
        for (let i=0; i< stage_data["spon_block_pos"][random].length; i++){
            stage_data["map_data"][stage_data["spon_block_pos"][random][i][0]][stage_data["spon_block_pos"][random][i][1]] = 1;
        }
    }

    if (stage_data["spon_item"]) {
        stage_data["spon_item"] = false;
        random = Math.floor(Math.random() * stage_data["spon_item_pos"].length);
        for (let i=0; i< stage_data["spon_item_pos"][random].length; i++){
            stage_data["map_data"][stage_data["spon_item_pos"][random][i][0]][stage_data["spon_item_pos"][random][i][1]] = 2;
        }
    }

    var data = stage_data["map_data"];
    var rows = data.length;
    var cols = data[0].length;

    var c = document.getElementById("ready_player");
    if (c) c.parentNode.removeChild(c);
    c = document.getElementById("game_result");
    if (c) c.parentNode.removeChild(c);

    var oldTable = document.getElementById("game_board_hex");
    if (oldTable) oldTable.parentNode.removeChild(oldTable);

    var cx = false, cy = false, hx = false, hy = false;
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if (data[i][j] == 3) { cx = j; cy = i; }
            else if (data[i][j] == 4) { hx = j; hy = i; }
            else if (data[i][j] == 34 || data[i][j] == 43) { cx = j; cy = i; hx = j; hy = i; }
        }
    }

    var parentEl = document.getElementById(tableId) || document.body;
    var containerWidth  = parentEl.clientWidth  ? parentEl.clientWidth  : 450;
    var containerHeight = parentEl.clientHeight ? parentEl.clientHeight : containerWidth;
    // 最小限のサイズ保証
    containerWidth  = Math.max(450, containerWidth);
    containerHeight = Math.max(450, containerHeight);

    // flat-top hex レイアウト（隙間なく）
    // size = 半径 (center->corner)
    // width = 2 * size, height = sqrt(3) * size
    // 横方向中心間隔 = 1.5 * size, 縦方向中心間隔 = height
    const maxSizeFromWidth = containerWidth / (1.5 * cols + 0.5);
    const maxSizeFromHeight = containerHeight / (Math.sqrt(3) * (rows + 0.5));
    const size = Math.max(4, Math.min(maxSizeFromWidth, maxSizeFromHeight));
    const hexWidth = 2 * size;
    const hexHeight = Math.sqrt(3) * size;
    const stepX = 1.5 * size;
    const stepY = hexHeight;
    const colOffsetY = hexHeight / 2;

    // 親コンテナ
    var boardContainer = document.createElement("div");
    boardContainer.id = "game_board_hex";
    boardContainer.style.width = containerWidth + "px";
    boardContainer.style.height = containerHeight + "px";

    // マップタイルヘルパ
    function getMapTile(v, bright) {
        if (bright) {
            if (v == 0) return "field_img";
            if (v == 1) return "wall_img";
            if (v == 2) return "hart_img";
            if (v == 3) return "cool_img";
            if (v == 4) return "hot_img";
            if (v == 34) return "ch_img";
            if (v == 43) return "hc_img";
        } else {
            if (v == 0) return "field_dark_img";
            if (v == 1) return "wall_dark_img";
            if (v == 2) return "hart_dark_img";
            if (v == 3) return "cool_dark_img";
            if (v == 4) return "hot_dark_img";
            if (v == 34) return "ch_dark_img";
            if (v == 43) return "hc_dark_img";
        }
        return bright ? "field_img" : "field_dark_img";
    }

    // 中央寄せ基点（中心座標原点）
    const boardPixelWidth = stepX * (cols - 1) + hexWidth;
    const boardPixelHeight = stepY * rows;
    const originX = (containerWidth - boardPixelWidth) / 2 + hexWidth / 2;
    const originY = (containerHeight - boardPixelHeight) / 2 + hexHeight / 2;

    const inMapCool = (cx !== false && cy !== false && cx >= 0 && cx < cols && cy >= 0 && cy < rows);
    const inMapHot  = (hx !== false && hy !== false && hx >= 0 && hx < cols && hy >= 0 && hy < rows);

    // 六角セル生成
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const val = data[r][c];
            const hex = document.createElement("div");
            hex.classList.add("hex");
            // 明るさ判定（プレイヤー周囲6マスは明るく）
            let bright = false;
            bright = (inMapCool && isSurround7(cx, cy, c, r)) 
                  || (inMapHot  && isSurround7(hx, hy, c, r));
            hex.classList.add(getMapTile(val, bright));

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

    // DOM 挿入
    parentEl.appendChild(boardContainer);

    // 効果表示（outline）
    if (effect) {
        const eff = effect;
        function markHex(rr, cc, color) {
            const el = document.getElementById(`hex_${rr}_${cc}`);
            if (el) {
                el.style.outline = `2px solid ${color}`;
                el.style.outlineOffset = "-2px";
                const v = data[rr][cc];
                el.className = "hex " + getMapTile(v, true);
            }
        }

        if (eff.t == "l") {
            // look: 指定方向に2マス進んだセルを中心にハイライト
            const neigh = neighbors();

            if (eff.p == "cool" && cx !== false) {
                let ccx = cx, ccy = cy;
                for (let s = 0; s < 2; s++) {
                    const dd = hexDirectionDelta(eff.d, ccx);
                    ccx += dd.dx; ccy += dd.dy;
                }
                if (ccx >= 0 && ccx < cols && ccy >= 0 && ccy < rows) markHex(ccy, ccx, "rgba(3,3,244,1.0)");
                for (let dname of neigh) {
                    const dd = hexDirectionDelta(dname, ccx);
                    const nx = ccx + dd.dx, ny = ccy + dd.dy;
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) markHex(ny, nx, "rgba(3,3,244,1.0)");
                }
            }

            if (eff.p == "hot" && hx !== false) {
                let ccx = hx, ccy = hy;
                for (let s = 0; s < 2; s++) {
                    const dd = hexDirectionDelta(eff.d, ccx);
                    ccx += dd.dx; ccy += dd.dy;
                }
                if (ccx >= 0 && ccx < cols && ccy >= 0 && ccy < rows) markHex(ccy, ccx, "rgba(3,3,244,1.0)");
                for (let dname of neigh) {
                    const dd = hexDirectionDelta(dname, ccx);
                    const nx = ccx + dd.dx, ny = ccy + dd.dy;
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) markHex(ny, nx, "rgba(3,3,244,1.0)");
                }
            }
        } else if (eff.t == "s") {
        	// search: 指定方向へ直進で最大7セルをハイライト
            if (eff.p == "cool" && cx !== false) {
                let sx = cx, sy = cy;
                for (let step = 1; step <= 7; step++) {
                    const dd = hexDirectionDelta(eff.d, sx);
                    sx += dd.dx; sy += dd.dy;
                    if (sy < 0 || sy >= rows || sx < 0 || sx >= cols) break;
                    markHex(sy, sx, "rgba(3,3,244,1.0)");
                }
            }

            if (eff.p == "hot" && hx !== false) {
                let sx = hx, sy = hy;
                for (let step = 1; step <= 7; step++) {
                    const dd = hexDirectionDelta(eff.d, sx);
                    sx += dd.dx; sy += dd.dy;
                    if (sy < 0 || sy >= rows || sx < 0 || sx >= cols) break;
                    markHex(sy, sx, "rgba(3,3,244,1.0)");
                }
            }
        } else if (eff.t == "r") {
            // get_ready: 中心と6近傍をハイライト
            const neigh = neighbors();
            if (eff.p == "cool" && cx !== false) {
                if (cy >= 0 && cy < rows && cx >= 0 && cx < cols) markHex(cy, cx, "rgba(3,244,3,1.0)");
                for (let dname of neigh) {
                    const dd = hexDirectionDelta(dname, cx);
                    const nx = cx + dd.dx, ny = cy + dd.dy;
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) markHex(ny, nx, "rgba(3,244,3,1.0)");
                }
            }
            if (eff.p == "hot" && hx !== false) {
                if (hy >= 0 && hy < rows && hx >= 0 && hx < cols) markHex(hy, hx, "rgba(3,244,3,1.0)");
                for (let dname of neigh) {
                    const dd = hexDirectionDelta(dname, hx);
                    const nx = hx + dd.dx, ny = hy + dd.dy;
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) markHex(ny, nx, "rgba(3,244,3,1.0)");
                }
            }
        }
    }

    document.getElementById('turn_now').textContent = String(stage_data["turn"]);
}

var Sound_Volume = 0.5;
if (localStorage["SOUND_VOLUME"]) {
    Sound_Volume = localStorage["SOUND_VOLUME"] / 100;
}

var resultSound = new Howl({
    src: ['sound/tutorial_result.mp3'],
    volume: Sound_Volume
});

function cpu(level) {
    makeTable("game_board", { "p": "hot", "t": "r" });
    var cpu_map_data = get_map_data("hot", "get_ready");

    if (level == 1) {
        setTimeout(function () {
            makeTable("game_board", { "p": "hot", "t": "l", "d": "topright" });
            cpu_map_data = get_map_data("hot", "look", "topright");
            setTimeout(function () { my_turn = true; }, 250);
        }, 250);
    }
    else if (level == 2) {
        // 六方向で移動可能な方向をリスト化
        var random_list = [];
        const hexDirs = neighbors();

        for (let i = 0; i < 6; i++) {
            if (cpu_map_data[i] != 2) { // 2=ブロック
                random_list.push(hexDirs[i]);
            }
        }

        if (random_list.length > 0) {
            var random = Math.floor(Math.random() * random_list.length);
            makeTable("game_board");
            setTimeout(function () {
                move_player(random_list[random], "hot");
                my_turn = true;
            }, 250);
        }
        else {
            setTimeout(function () {
                makeTable("game_board", { "p": "hot", "t": "s", "d": "top" });
                cpu_map_data = get_map_data("hot", "search", "top");
                setTimeout(function () { my_turn = true; }, 250);
            }, 250);
        }
    }
    else {
        setTimeout(function () {
            cpu_map_data = look("topright", "hot");
            my_turn = true;
        }, 250);
    }

}

function next_turn() {
    if (stage_data["cpu"]) {
        cpu(stage_data["cpu"].level);
    }
    else {
        my_turn = true;
    }
}

function stage_result(status = false) {
    var result_flag = false;

    if (stage_data["turn"]) {
        stage_data["turn"] -= 1;
    }

    if (stage_data["mode"] == "puthot" && stage_data["map_data"][stage_data["hot_y"]][stage_data["hot_x"]] == 1) {
        result_flag = true;
    }

    if (stage_data["mode"] == "gethart" && stage_data["get_hart_value"] <= hart_score) {
        result_flag = true;
    }

    if (stage_data["turn"] <= 0) {
        if (!result_flag) {
            Code.stopJS();
        }
    }

    // 自滅チェック
    var x = stage_data["map_size_x"];
    var y = stage_data["map_size_y"];
    var px = stage_data["cool_x"];
    var py = stage_data["cool_y"];

    // 六方向チェック（自滅判定）
    const neighDirs = neighbors();
    let allBlocked = true;
    for (const dname of neighDirs) {
        const dd = hexDirectionDelta(dname, px);
        const nx = px + dd.dx;
        const ny = py + dd.dy;
        if (nx < 0 || nx >= x || ny < 0 || ny >= y) {
            // 範囲外 = ブロック扱い
        } else {
            if (stage_data["map_data"][ny][nx] != 1) {
                allBlocked = false;
                break;
            }
        }
    }

    if (allBlocked && !result_flag) {
        Code.stopJS();
        return
    }

    //ブロック数制限を満たしているかの判定
    //満たしていない場合はクリアのテキストを変更
    var block_limit_flag = true;
    if (stage_data["block_limit"] && result_flag) {
        if(stage_data["block_limit"] < Code.workspace.getAllBlocks().length){
            var message_text = "次は目標ブロック数でのクリアを目指してみよう！";
            var message_title = "ブロック数オーバー！";
            block_limit_flag = false;
        }
        else if (stage_data["variant_stage"]) {
            var message_text = "違う配置でも試してみよう！";
            var message_title = "ステージクリア";
            block_limit_flag = true;
        }
        else {
            var message_text = "他のステージにもチャレンジしてみよう！";
            var message_title = "ステージクリア！";
            block_limit_flag = true;
        }
    }

    if (result_flag) {

        makeTable("game_board");
        Code.stopJS();

        if (localStorage["SOUND_STATUS"]) {
            if (localStorage["SOUND_STATUS"] == "on") {
                resultSound.play();
            }
        }
        else {
            resultSound.play();
        }

        var result = document.createElement("div");
        result.setAttribute("id", "game_result");
        var img = document.createElement('img');
        img.src = '/images/stageclear.png';
        document.getElementById("game_board").appendChild(result);

        var state = Blockly.serialization.workspaces.save(Code.workspace);
        var jsonText = JSON.stringify(state, null, 2);

        //オートセーブがオンの場合、ブロック数制約を満たしている場合のみセーブ
        if(localStorage["AUTO_SAVE"] && block_limit_flag){
            if (localStorage["AUTO_SAVE"] == "on") {
                localStorage.setItem(stage_data["stage_id"], jsonText);
            }
        }

        document.getElementById('overlay').classList.add("overlay_on");

        //ブロック数の制約を満たしている場合、満たしていない場合とでメッセージを変更
        document.getElementById("result_message_area").textContent = message_text;
        document.getElementById("result_message_title").textContent = message_title;
        if(block_limit_flag){
            result.appendChild(img);
            console.log("block_limit_flag");    
            document.getElementById("back_menu").style.display="block";
        }
        else{
            document.getElementById("back_menu").style.display="none";
        }

        var reset_button = document.getElementById('resetButton');
        var overlay_off = function () {
            document.getElementById('overlay').classList.remove("overlay_on");
        }
        reset_button.addEventListener('click', overlay_off, true);
        reset_button.addEventListener('touchend', overlay_off, true);

    }

    return result_flag;
}

// セル値マッピング (0:空/自分, 1:相手, 2:壁/範囲外, 3:アイテム)
function mapCell(v, chara) {
    if (v === undefined) return 2;
    const enemyNum = (chara === "cool") ? 4 : 3;
    if (v == enemyNum || v == 34 || v == 43) return 1;
    if (v == 1) return 2;
    if (v == 2) return 3;
    return 0;
}

function get_map_data(chara, mode, direction = false) {
    var now_x = stage_data[chara + "_x"];
    var now_y = stage_data[chara + "_y"];
    var load_map_size_x = stage_data["map_size_x"];
    var load_map_size_y = stage_data["map_size_y"];

    var chara_num_diff = { "cool": 4, "hot": 3 };
    var tmp_map_data = stage_data["map_data"];
    var return_map_data = [];

    if (mode == "get_ready" || mode == "move" || mode == "put") {
        // 自分の位置を中心に周囲6マス（計7マス）
        const neigh = neighbors();
        
        for (let dname of neigh) {
            let cx = now_x, cy = now_y;
            const d = hexDirectionDelta(dname, cx);
            cx += d.dx;
            cy += d.dy;
            if (cx < 0 || cx >= load_map_size_x || cy < 0 || cy >= load_map_size_y) {
                return_map_data.push(2);
            } else {
                return_map_data.push(mapCell(tmp_map_data[cy][cx], chara));
            }
        }
        // center
        if (now_x < 0 || now_x >= load_map_size_x || now_y < 0 || now_y >= load_map_size_y) return_map_data.push(2);
        else return_map_data.push(mapCell(tmp_map_data[now_y][now_x], chara));
    }
    else if (mode == "look") {
        // 指定方向に2マス先を中心に周囲6マス（計7マス）
        let lx = now_x, ly = now_y;
        for (let step = 0; step < 2; step++) {
            const d = hexDirectionDelta(direction, lx);
            lx += d.dx;
            ly += d.dy;
        }
        
        const neigh = neighbors();
        for (let dname of neigh) {
            let cx = lx, cy = ly;
            const d = hexDirectionDelta(dname, cx);
            cx += d.dx;
            cy += d.dy;
            if (cx < 0 || cx >= load_map_size_x || cy < 0 || cy >= load_map_size_y) {
                return_map_data.push(2);
            } else {
                return_map_data.push(mapCell(tmp_map_data[cy][cx], chara));
            }
        }
        // center
        if (lx < 0 || lx >= load_map_size_x || ly < 0 || ly >= load_map_size_y) return_map_data.push(2);
        else return_map_data.push(mapCell(tmp_map_data[ly][lx], chara));
    }
    else if (mode == "search") {
        // 自分隣（1歩目）から指定方向へ直進で7マス
        let cx = now_x, cy = now_y;
        for (let step = 1; step <= 7; step++) {
            const d = hexDirectionDelta(direction, cx);
            cx += d.dx;
            cy += d.dy;
            
            if (cx < 0 || cx >= load_map_size_x || cy < 0 || cy >= load_map_size_y) {
                return_map_data.push(2);
            } else {
                return_map_data.push(mapCell(tmp_map_data[cy][cx], chara));
            }
        }
    }

    return return_map_data;
}

function get_ready(chara = "cool") {
    if (my_turn) {
        makeTable("game_board", { "p": chara, "t": "r" });
        return get_map_data(chara, "get_ready");
    }
    else {
        return my_turn;
    }
}

function move_player(direction, chara = "cool") {
    console.log("move_player:", direction, chara);
    var d = hexDirectionDelta(direction, stage_data[chara + "_x"]);
    var move_x = d.dx;
    var move_y = d.dy;

    var mapdata = stage_data["map_data"];
    var x = stage_data["map_size_x"];
    var y = stage_data["map_size_y"];

    var px = stage_data[chara + "_x"];
    var py = stage_data[chara + "_y"];

    if (mapdata[py][px] == 34 || mapdata[py][px] == 43) {
        mapdata[py][px] = chara == "cool" ? 4 : 3;
    }
    else {
        mapdata[py][px] = 0;
    }

    if (0 <= px + move_x && px + move_x < x && 0 <= py + move_y && py + move_y < y) {

        if (mapdata[py + move_y][px + move_x] == 1) {
            makeTable("game_board");
            Code.stopJS();
        }
        else {
            if (mapdata[py + move_y][px + move_x] == 2) {
                mapdata[py][px] = 1;
                hart_score += chara == "cool" ? 1 : 0;
            }

            if (mapdata[py + move_y][px + move_x] == 4) {
                mapdata[py + move_y][px + move_x] = 34;
            }
            else if (mapdata[py + move_y][px + move_x] == 3) {
                mapdata[py + move_y][px + move_x] = 34;
            }
            else {
                mapdata[py + move_y][px + move_x] = chara == "cool" ? 3 : 4;
            }

            stage_data[chara + "_x"] = stage_data[chara + "_x"] + move_x;
            stage_data[chara + "_y"] = stage_data[chara + "_y"] + move_y;

            if (chara == "cool" && !stage_result()) {
                makeTable("game_board");
                next_turn();
                return get_map_data("cool", "move");
            }
        }
    }
    else {
        makeTable("game_board");
        stage_result("gameover");
        Code.stopJS();
    }
}

function look(direction, chara = "cool") {
    if (!stage_result()) {
        makeTable("game_board", { "p": chara, "t": "l", "d": direction });
        next_turn();
        return get_map_data(chara, "look", direction);
    }
}

function search(direction, chara = "cool") {
    if (!stage_result()) {
        makeTable("game_board", { "p": chara, "t": "s", "d": direction });
        next_turn();
        return get_map_data(chara, "search", direction);
    }
}

function put_wall(direction, chara = "cool") {
    var d = hexDirectionDelta(direction, stage_data[chara + "_x"]);
    var px = stage_data[chara + "_x"] + d.dx;
    var py = stage_data[chara + "_y"] + d.dy;

    var x = stage_data["map_size_x"];
    var y = stage_data["map_size_y"];

    var put_check = (0 <= px && px < x && 0 <= py && py < y);

    if (put_check) {
        stage_data["map_data"][py][px] = 1;

        var cpx = stage_data[chara + "_x"];
        var cpy = stage_data[chara + "_y"];

        // 六方向チェック（自滅判定）
        const neighDirs = neighbors();
        let allBlocked = true;
        for (const dname of neighDirs) {
            const dd = hexDirectionDelta(dname, cpx);
            const nx = cpx + dd.dx;
            const ny = cpy + dd.dy;
            if (nx < 0 || nx >= x || ny < 0 || ny >= y) {
                // 範囲外 = ブロック扱い
            } else {
                if (stage_data["map_data"][ny][nx] != 1) {
                    allBlocked = false;
                    break;
                }
            }
        }

        if (allBlocked) {
            makeTable("game_board");
            Code.stopJS();
            return;
        }
    }

    if (!stage_result()) {
        makeTable("game_board");
        next_turn();
        return get_map_data(chara, "put");
    }
}


var my_map_data = [];
var hart_score = 0;
var my_turn = false;


function endCode() {
    hart_score = 0;
    stage_data = JSON.parse(JSON.stringify(reset_data));
}
var hart_score = 0;
var my_turn = false;


function endCode() {
    hart_score = 0;
    stage_data = JSON.parse(JSON.stringify(reset_data));
}
