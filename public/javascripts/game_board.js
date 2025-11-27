function ready_game(elementId) {
    var c = document.getElementById("game_board_hex");
    if (c) {
        c.parentNode.removeChild(c);
    }
    c = document.getElementById("game_info_div");
    if (c) {
        c.parentNode.removeChild(c);
    }
    c = document.getElementById("game_result");
    console.log('ready_game: remove game_result'); 
    if (c) {
        console.log('ready_game: removed game_result');
        c.parentNode.removeChild(c);
    }

    var ready_player = document.createElement("div");
    ready_player.setAttribute("id", "ready_player_div");

    c = document.getElementById("ready_player_div");
    if (c) {
        c.parentNode.removeChild(c);
    }

    var ready_server = document.createElement("div");
    ready_server.setAttribute("id", "ready_server");
    var newContent = document.createTextNode("接続中・・・");
    ready_server.appendChild(newContent);
    ready_player.appendChild(ready_server);

    if (c_name.length) {
        var ready_cool = document.createElement("div");
        ready_cool.setAttribute("id", "ready_cool");
        var newContent = document.createTextNode(c_name);
        ready_cool.appendChild(newContent);
        ready_player.appendChild(ready_cool);
    }

    if (h_name.length) {
        var ready_hot = document.createElement("div");
        ready_hot.setAttribute("id", "ready_hot");
        var newContent = document.createTextNode(h_name);
        ready_hot.appendChild(newContent);
        ready_player.appendChild(ready_hot);
    }
    else {
        var ready_hot = document.createElement("div");
        ready_hot.setAttribute("id", "wait_hot");
        var newContent = document.createTextNode("接続待ち");
        ready_hot.appendChild(newContent);
        ready_player.appendChild(ready_hot);
    }

    document.getElementById("ready_player").appendChild(ready_player);

}

var game_bgm_flag = true;

var Sound_Volume = 0.5;
if (localStorage["SOUND_VOLUME"]) {
    Sound_Volume = localStorage["SOUND_VOLUME"] / 100;
}

var gameBgmFile = "sound/01.mp3";
var resultSoundFile = "sound/02.mp3";
if (localStorage["GAME_BGM"]) {
    gameBgmFile = "bgm/" + localStorage["GAME_BGM"];
}
if (localStorage["RESULT_BGM"]) {
    resultSoundFile = "bgm/" + localStorage["RESULT_BGM"];
}


var gameBgm = new Howl({
    src: [gameBgmFile],
    loop: true,
    volume: Sound_Volume
});
var resultSound = new Howl({
    src: [resultSoundFile],
    volume: Sound_Volume
});


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
function makeTable(msg, x, y, effect, tableId) {
    if (game_bgm_flag) {
        game_bgm_flag = false;
        if (localStorage["SOUND_STATUS"]) {
            if (localStorage["SOUND_STATUS"] == "on") {
                gameBgm.play();
            }
        }
        else {
            gameBgm.play();
        }
    }

    // 古い hex コンテナがあれば削除
    var oldHex = document.getElementById("game_board_hex");
    if (oldHex) oldHex.parentNode.removeChild(oldHex);

    var data = msg.map_data;
    var item_num = 0;

    var rows = data.length;
    var cols = data[0].length;

    // アイテム数とプレイヤー座標を取得
    var cx = false, cy = false, hx = false, hy = false;
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if (data[i][j] == 2) item_num++;
            else if (data[i][j] == 3) { cx = j; cy = i; }
            else if (data[i][j] == 4) { hx = j; hy = i; }
            else if (data[i][j] == 34 || data[i][j] == 43) { cx = j; cy = i; hx = j; hy = i; }
        }
    }
    
    // 表示領域取得（フォールバックあり）
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
    const originY = hexHeight / 2;  // 上寄せなので top = 0 基準

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

   	// 効果表示（outline）対応
    const eff = msg.effect || effect;
    if (eff) {
        function markHex(rr, cc, color) {
            const el = document.getElementById(`hex_${rr}_${cc}`);
            if (el) {
                el.style.outline = `2px solid ${color}`;
                el.style.outlineOffset = "-2px";
                const vv = data[rr][cc];
                el.className = "hex " + getMapTile(vv, true);
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

    var odiv = document.createElement("div");
    odiv.setAttribute("id", "game_info_div");

    c = document.getElementById("game_info_div");
    if (c) {
        c.parentNode.removeChild(c);
    }


    var cdiv = document.createElement("div");
    cdiv.setAttribute("id", "cool_info_div");

    var cndiv = document.createElement("div");
    cndiv.setAttribute("id", "cool_name");
    var newContent = document.createTextNode(c_name);
    cndiv.appendChild(newContent);

    var csdiv = document.createElement("div");
    csdiv.setAttribute("id", "cool_score");
    newContent = document.createTextNode(msg.cool_score);
    csdiv.appendChild(newContent);

    cdiv.appendChild(cndiv);
    cdiv.appendChild(csdiv);


    var turndiv = document.createElement("div");
    turndiv.setAttribute("id", "turn_div");

    var tturn = document.createElement("div");
    tturn.setAttribute("id", "turn_title");
    newContent = document.createTextNode("残りターン数");
    tturn.appendChild(newContent);

    var nturn = document.createElement("div");
    nturn.setAttribute("id", "turn_n");
    newContent = document.createTextNode(msg.turn);
    nturn.appendChild(newContent);

    turndiv.appendChild(tturn);
    turndiv.appendChild(nturn);


    var hdiv = document.createElement("div");
    hdiv.setAttribute("id", "hot_info_div");

    var hndiv = document.createElement("div");
    hndiv.setAttribute("id", "hot_name");
    var newContent = document.createTextNode(h_name);
    hndiv.appendChild(newContent);

    var hsdiv = document.createElement("div");
    hsdiv.setAttribute("id", "hot_score");
    newContent = document.createTextNode(msg.hot_score);
    hsdiv.appendChild(newContent);


    var hartdiv = document.createElement("div");
    hartdiv.setAttribute("id", "hart_div");

    var thart = document.createElement("div");
    thart.setAttribute("id", "hart_title");
    newContent = document.createTextNode("残りアイテム数");
    thart.appendChild(newContent);

    var nhart = document.createElement("div");
    nhart.setAttribute("id", "hart_n");
    newContent = document.createTextNode(item_num);
    nhart.appendChild(newContent);

    hartdiv.appendChild(thart);
    hartdiv.appendChild(nhart);


    hdiv.appendChild(hndiv);
    hdiv.appendChild(hsdiv);


    odiv.appendChild(turndiv);
    odiv.appendChild(cdiv);
    odiv.appendChild(hdiv);
    odiv.appendChild(hartdiv);


    // document.getElementById(tableId).appendChild(table);
    document.getElementById("game_info").appendChild(odiv);
}



function reqFullscreen(target_id = false) {
    var target = document.getElementById("game_area");
    if (target_id) {
        try {
            target = document.getElementById(target_id);
        }
        catch (e) {
            target = document.getElementById("game_area");
        }
    }
    if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen();
    } else if (target.mozRequestFullScreen) {
        target.mozRequestFullScreen();
    } else if (target.msRequestFullscreen) {
        target.msRequestFullscreen();
    } else if (target.requestFullscreen) {
        target.requestFullscreen();
    } else {
        alert('ご利用のブラウザはフルスクリーン操作に対応していません');
        return;
    }
}

function exitFullscreen() {
    if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.cancelFullScreen) {
        document.cancelFullScreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}
