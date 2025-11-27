const logger = require('../bin/logger.js');

//socket.io
var socket_io = require('socket.io');
var io = socket_io();

const server_data = require('../tool/server_data_load');

//game_server_list
var fs = require('fs');
var path = require('path');
const { json } = require('express/lib/response.js');

const config = require('../config/config.js');

var game_server = JSON.parse(JSON.stringify(server_data.load()));

//game_server_store
var store = {};
var looker = {};
var match_room_store = {};
var server_store = JSON.parse(JSON.stringify(game_server));
var room_info = {};

//create_map
function create_map(key) {

    var map = new Array(server_store[key].map_size_y);
    for (let y = 0; y < server_store[key].map_size_y; y++) {
        map[y] = new Array(server_store[key].map_size_x).fill(0);
    }

    server_store[key].map_data = map;

    var selectable_list = [];

    for (var s_x = 0; s_x < Math.floor(server_store[key].map_size_x / 2) + 1; s_x++) {
        for (var s_y = 0; s_y < server_store[key].map_size_y; s_y++) {
            if (s_y == Math.floor(server_store[key].map_size_y / 2) - 1 && s_x == Math.floor(server_store[key].map_size_x / 2)) {
                break;
            }
            else if (s_x == Math.floor(server_store[key].map_size_x / 2) - 1 && s_y <= Math.floor(server_store[key].map_size_y / 2) + 1 && s_y >= Math.floor(server_store[key].map_size_y / 2) - 1) {
                continue;
            }
            else {
                selectable_list.push([s_x, s_y]);
            }
        }
    }



    var cxy = Math.floor(Math.random() * selectable_list.length);

    var cx = selectable_list[cxy][0];
    var cy = selectable_list[cxy][1];

    var tx = Math.floor((server_store[key].map_size_x - 1) / 2);
    var ty = Math.floor((server_store[key].map_size_y - 1) / 2);

    var hx = tx + (tx - cx);
    var hy = ty + (ty - cy);

    selectable_list.splice(cxy, 1);

    server_store[key].cool.x = cx;
    server_store[key].cool.y = cy;
    server_store[key].hot.x = hx;
    server_store[key].hot.y = hy;

    server_store[key].map_data[cy][cx] = 3;
    server_store[key].map_data[hy][hx] = 4;


    if (server_store[key].auto_symmetry) {
        for (var add_list = 0; add_list < 3; add_list++) {
            selectable_list.push([Math.floor(server_store[key].map_size_x / 2) - 1, Math.floor(server_store[key].map_size_y / 2) - 1 + add_list]);
        }


        var selectable_list_temp = selectable_list;
        selectable_list = [];

        for (var list_data = 0; list_data < selectable_list_temp.length; list_data++) {
            if ((selectable_list_temp[list_data][0] >= cx - 1 && selectable_list_temp[list_data][0] <= cx + 1 && selectable_list_temp[list_data][1] >= cy - 1 && selectable_list_temp[list_data][1] <= cy + 1)) {
                continue;
            }
            else {
                selectable_list.push([selectable_list_temp[list_data][0], selectable_list_temp[list_data][1]]);
            }
        }


        if (server_store[key].auto_point % 2 == 0) {
            if (server_store[key].auto_point == 1) {
                server_store[key].auto_point += 1;
            }
            else {
                server_store[key].auto_point -= 1;
            }
        }

        if (server_store[key].auto_block % 2 == 1) {
            if (server_store[key].auto_block == 1) {
                server_store[key].auto_block += 1;
            }
            else {
                server_store[key].auto_block -= 1;
            }
        }
        server_store[key].map_data[ty][tx] = 2;
        server_store[key].auto_point -= 1;
    }
    else {
        selectable_list = [];
        for (var s_x = 0; s_x < server_store[key].map_size_x; s_x++) {
            for (var s_y = 0; s_y < server_store[key].map_size_y; s_y++) {
                if ((s_x < cx - 1 || s_x > cx + 1 || s_y < cy - 1 || s_y > cy + 1) && (s_x < hx - 1 || s_x > hx + 1 || s_y < hy - 1 || s_y > hy + 1)) {
                    selectable_list.push([s_x, s_y]);
                }
            }
        }
    }

    var pxy
    var px;
    var py;
    var bxy
    var bx;
    var by;

    if (server_store[key].auto_symmetry) {
        for (var i = 0; i < server_store[key].auto_point / 2; i++) {
            pxy = Math.floor(Math.random() * selectable_list.length);
            px = selectable_list[pxy][0];
            py = selectable_list[pxy][1];

            server_store[key].map_data[py][px] = 2;
            server_store[key].map_data[ty + (ty - py)][tx + (tx - px)] = 2;

            selectable_list.splice(pxy, 1);
        }
    }
    else {
        for (var i = 0; i < server_store[key].auto_point; i++) {
            pxy = Math.floor(Math.random() * selectable_list.length);
            px = selectable_list[pxy][0];
            py = selectable_list[pxy][1];

            server_store[key].map_data[py][px] = 2;

            selectable_list.splice(pxy, 1);
        }
    }


    var selectable_list_temp = selectable_list;
    selectable_list = [];
    for (var list_data = 0; list_data < selectable_list_temp.length; list_data++) {
        if (selectable_list_temp[list_data][0] < 1 || selectable_list_temp[list_data][0] > server_store[key].map_size_x - 2 || selectable_list_temp[list_data][1] < 1 || selectable_list_temp[list_data][1] > server_store[key].map_size_y - 2) {
            continue;
        }
        else if ((selectable_list_temp[list_data][0] == cx && (selectable_list_temp[list_data][1] == cy + 9 || selectable_list_temp[list_data][1] == cy - 9)) || (selectable_list_temp[list_data][0] == hx && (selectable_list_temp[list_data][1] == hy + 9 || selectable_list_temp[list_data][1] == hy - 9))) {
            continue;
        }
        else {
            selectable_list.push([selectable_list_temp[list_data][0], selectable_list_temp[list_data][1]]);
        }
    }


    if (server_store[key].auto_symmetry) {
        for (var i = 0; i < server_store[key].auto_block / 2; i++) {
            bxy = Math.floor(Math.random() * selectable_list.length);
            bx = selectable_list[bxy][0];
            by = selectable_list[bxy][1];

            server_store[key].map_data[by][bx] = 1;
            server_store[key].map_data[ty + (ty - by)][tx + (tx - bx)] = 1;

            selectable_list.splice(bxy, 1);
        }
    }
    else {
        for (var i = 0; i < server_store[key].auto_block; i++) {
            bxy = Math.floor(Math.random() * selectable_list.length);
            bx = selectable_list[bxy][0];
            by = selectable_list[bxy][1];

            server_store[key].map_data[by][bx] = 1;

            selectable_list.splice(bxy, 1);
        }
    }

}
for (var key in server_store) {
    if (!server_store[key].map_data.length) {
        create_map(key);
    } else {
        if (server_store[key].cool.x < 0 || server_store[key].cool.y < 0) {
            player_spon(key);
        }
    }
}


//player spon
function player_spon(key) {

    var selectable_list = [];

    for (var s_x = 0; s_x < Math.floor(server_store[key].map_size_x / 2) + 1; s_x++) {
        for (var s_y = 0; s_y < server_store[key].map_size_y; s_y++) {
            if (server_store[key].map_data[s_y][s_x] == 0
                && (!(s_x == Math.floor(server_store[key].map_size_x / 2) && s_y >= Math.floor(server_store[key].map_size_y / 2)))) {
                selectable_list.push([s_x, s_y]);
            }
        }
    }

    var s_xy = Math.floor(Math.random() * selectable_list.length);

    var s_x = selectable_list[s_xy][0];
    var s_y = selectable_list[s_xy][1];

    server_store[key].cool.x = s_x;
    server_store[key].cool.y = s_y;

    server_store[key].map_data[s_y][s_x] = 3;


    if (server_store[key].auto_symmetry) {
        server_store[key].hot.x = server_store[key].map_size_x - s_x;
        server_store[key].hot.y = server_store[key].map_size_y - s_y;
    }
    else {
        var selectable_list = [];

        for (var s_x = Math.floor(server_store[key].map_size_x / 2) + 1; s_x < server_store[key].map_size_x; s_x++) {
            for (var s_y = 0; s_y < server_store[key].map_size_y; s_y++) {
                if (server_store[key].map_data[s_y][s_x] == 0
                    && (!(s_x == Math.floor(server_store[key].map_size_x / 2) && s_y <= Math.floor(server_store[key].map_size_y / 2)))) {
                    selectable_list.push([s_x, s_y]);
                }
            }
        }

        var s_xy = Math.floor(Math.random() * selectable_list.length);

        var s_x = selectable_list[s_xy][0];
        var s_y = selectable_list[s_xy][1];

        server_store[key].hot.x = s_x;
        server_store[key].hot.y = s_y;
    }

    server_store[key].map_data[s_y][s_x] = 4;
}


function game_time_out(room, winer) {
    io.in(room).emit("game_result", {
        "winer": winer,
        "info": "タイムアウトより"
    });
    
    room_info[room] = {};
    deleteMap(room);
    game_server_reset(room);
}

function game_result_check(room, chara, effect_t = "r", effect_d = false, winer = false, winer_info = false) {

    if (server_store[room].cool.status && server_store[room].hot.status) {

        clearTimeout(server_store[room].timer);

        var effect_chara = { "cool": "hot", "hot": "cool" };

        if (chara == "hot") {
            server_store[room].turn -= 1;
        }

        var effect = {
            "t": effect_t,
            "p": chara
        }

        if (effect_d) {
            effect.d = effect_d;
        }

        io.in(room).emit("updata_board", {
            "map_data": server_store[room].map_data,
            "cool_score": server_store[room].cool.score,
            "hot_score": server_store[room].hot.score,
            "turn": server_store[room].turn,
            "effect": effect
        });

        if (!winer) {
            if (server_store[room].turn == 0) {
                if (server_store[room].cool.score > server_store[room].hot.score) {
                    winer = "cool";
                }
                else if (server_store[room].cool.score < server_store[room].hot.score) {
                    winer = "hot";
                }
                else {
                    winer = "draw";
                }
                winer_info = "スコアより";
            }
            else {

                var rcx = server_store[room].cool.x;
                var rcy = server_store[room].cool.y;
                var rhx = server_store[room].hot.x;
                var rhy = server_store[room].hot.y;

                if (server_store[room].map_data[rcy][rcx] != 34 && server_store[room].map_data[rcy][rcx] != 3 && server_store[room].map_data[rhy][rhx] != 4) {
                    winer = "draw";
                    winer_info = "アタックにより";
                }
                else if (server_store[room].map_data[rcy][rcx] != 34 && server_store[room].map_data[rcy][rcx] != 3) {
                    winer = "hot";
                    if (winer_info) {
                        winer_info = "アタックにより";
                    }
                    else {
                        winer_info = "ブロック衝突により";
                    }
                }
                else if (server_store[room].map_data[rcy][rcx] != 34 && server_store[room].map_data[rhy][rhx] != 4) {
                    winer = "cool";
                    if (winer_info) {
                        winer_info = "アタックにより";
                    }
                    else {
                        winer_info = "ブロック衝突により";
                    }
                }
                else {
                    // 六方向（hex）で閉じ込め判定
                    const neighDirs = neighbors();
                    
                    // cool の周囲6方向がすべてブロックか
                    let coolBlockedAll = true;
                    for (const dname of neighDirs) {
                        const d = hexDirectionDelta(dname, rcx);
                        const nx = rcx + d.dx;
                        const ny = rcy + d.dy;
                        if (! (nx < 0 || nx >= server_store[room].map_size_x || ny < 0 || ny >= server_store[room].map_size_y)
                            && (server_store[room].map_data[ny][nx] != 1) ) {
                                coolBlockedAll = false;
                                break;
                        }
                    }

                    // hot の周囲6方向がすべてブロックか
                    let hotBlockedAll = true;
                    for (const dname of neighDirs) {
                        const d = hexDirectionDelta(dname, rhx);
                        const nx = rhx + d.dx;
                        const ny = rhy + d.dy;
                        if ( !(nx < 0 || nx >= server_store[room].map_size_x || ny < 0 || ny >= server_store[room].map_size_y) 
                            && (server_store[room].map_data[ny][nx] != 1) ) {
                                hotBlockedAll = false;
                                break;
                        }
                    }

                    if (coolBlockedAll && hotBlockedAll) {
                        winer = "draw";
                        winer_info = "ブロック閉じ込めにより";
                    } else if (coolBlockedAll) {
                        winer = "hot";
                        winer_info = "ブロック閉じ込めにより";
                    } else if (hotBlockedAll) {
                        winer = "cool";
                        winer_info = "ブロック閉じ込めにより";
                    }
                }
            }
        }
        if (winer) {
            io.in(room).emit("game_result", {
                "winer": winer,
                "info": winer_info
            });
            
            //勝敗決定時に，ルームのCPU情報を削除
            //マップの削除判定関数を実施
            room_info[room] = {};
            deleteMap(room);

            if(room in server_store){
            	game_server_reset(room);
            }
        }
        else {
            server_store[room][effect_chara[chara]].turn = true;

            if (server_store[room].timeout) {
                server_store[room].timer = setTimeout(game_time_out, 1000 * server_store[room].timeout, room, chara);
            }
            else {
                server_store[room].timer = setTimeout(game_time_out, 10000, room, chara);
            }

            if (server_store[room].cpu && server_store[room][server_store[room].cpu.turn].turn) {
                cpu(room, server_store[room].cpu.level, server_store[room].cpu.turn);
            }
        }
    }
}

function game_server_reset(room) {
    for (var user_id in store) {
        if (store[user_id].room == room) {
            if (io.sockets.sockets[user_id]) {
                io.sockets.sockets[user_id].leave(room);
            }
            delete store[user_id];
        }
    }

    if (server_store[room] && server_store[room].timer) {
        clearTimeout(server_store[room].timer);
        delete server_store[room].timer;
    }
    if (game_server[room]) {
        server_store[room] = JSON.parse(JSON.stringify(game_server[room]));
    } else {
        console.error(`Error: game_server is undefined for room "${room ?? 'unknown'}"`);
        return;
    }

    if (!server_store[room].map_data.length) {
        create_map(room);
    } else {
        if (server_store[room].cool.x < 0 || server_store[room].cool.y < 0) {
            player_spon(room);
        }
    }
}


//player action
function get_ready(room, chara, id = false) {
    if(!server_store[room]) {
        console.error(`Error in get_ready:: server_store is undefined for room "${room ?? 'unknown'}"`);
        return;
    }
    if (server_store[room][chara].turn && server_store[room][chara].getready) {
        var now_x = server_store[room][chara].x;
        var now_y = server_store[room][chara].y;

        const surroundData = getSurroundData(room, chara, now_x, now_y);

        if (id) {
            io.to(id).emit('get_ready_rec', { "rec_data": surroundData });
            server_store[room][chara].getready = false;
        } else {
            server_store[room][chara].getready = false;
            return surroundData;
        }
    } else {
        if (id) {
            io.to(id).emit('get_ready_rec', { "rec_data": server_store[room][chara].true });
        } else {
            return false;
        }
    }
}

// move_player — 既存の動作を維持し，終了後に中心(現在位置)を基に7要素を emit/return
function move_player(room, chara, msg, id = false) {
    if(!server_store[room]) {
        console.error(`Error in move_player:: server_store is undefined for room "${room ?? 'unknown'}"`);
        return;
    }
    if (server_store[room][chara].turn && server_store[room][chara].getready == false) {
        server_store[room][chara].turn = false;
        server_store[room][chara].getready = true;
        var x = server_store[room][chara].x;
        var y = server_store[room][chara].y;

        var xy_check = false;
        var chara_num = { "cool": 3, "hot": 4 };
        var chara_num_diff = { "cool": 4, "hot": 3 };

        if (server_store[room].map_data[y][x] == 34) {
            server_store[room].map_data[y][x] = chara_num_diff[chara];
        }
        else {
            server_store[room].map_data[y][x] = 0;
        }

        var d = hexDirectionDelta(msg, x);
        var nx = x + d.dx;
        var ny = y + d.dy;
        if (0 <= nx && nx < server_store[room].map_size_x && 0 <= ny && ny < server_store[room].map_size_y) {
            server_store[room][chara].x = nx;
            server_store[room][chara].y = ny;
            x = nx; y = ny;
            xy_check = true;
        }

        if (xy_check) {
            if (server_store[room].map_data[y][x] == 0) {
                server_store[room].map_data[y][x] = chara_num[chara];
            }
            else if (server_store[room].map_data[y][x] == 2) {
                server_store[room].map_data[y][x] = chara_num[chara];
                server_store[room][chara].score += 1;

                var prev = { x: server_store[room][chara].x - d.dx, y: server_store[room][chara].y - d.dy };
                if (0 <= prev.x && prev.x < server_store[room].map_size_x && 0 <= prev.y && prev.y < server_store[room].map_size_y) {
                    server_store[room].map_data[prev.y][prev.x] = 1;
                }
            }
            else if (server_store[room].map_data[y][x] == chara_num_diff[chara]) {
                server_store[room].map_data[y][x] = 34;
            }

            const surroundData = getSurroundData(room, chara, server_store[room][chara].x, server_store[room][chara].y);
            if (id) {
                io.to(id).emit('move_rec', { "rec_data": surroundData });
            }
        }

        game_result_check(room, chara);

        if (!id) {
            return getSurroundData(room, chara, server_store[room][chara].x, server_store[room][chara].y);
        }
    }
}

// look: 指定方向に2歩進んだセルを中心に 7要素を返す
function look(room, chara, msg, id = false) {
    if(!server_store[room]) {
        console.error(`Error in look:: server_store is undefined for room "${room ?? 'unknown'}"`);
        return;
    }
    if (server_store[room][chara].turn && server_store[room][chara].getready == false) {
        server_store[room][chara].turn = false;
        server_store[room][chara].getready = true;

        var now_x = server_store[room][chara].x;
        var now_y = server_store[room][chara].y;

        // center: 指定方向に2ステップ（ステップ毎に行パリティを更新）
        var cx = now_x, cy = now_y;
        for (let s=0; s<2; s++) {
            const d = hexDirectionDelta(msg, cx);
            cx += d.dx; cy += d.dy;
        }

        const surroundData = getSurroundData(room, chara, cx, cy);

        if (id) {
            io.to(id).emit('look_rec', { "rec_data": surroundData });
            game_result_check(room, chara, "l", msg);
        } else {
            game_result_check(room, chara, "l", msg);
            return surroundData;
        }
    } else {
        if (id) io.to(id).emit('look_rec', { "rec_data": server_store[room][chara].true });
        else return false;
    }
}

// search: 自分の隣（1歩目）から指定方向に直進で7マス分の値を返す
function search(room, chara, msg, id = false) {
    if(!server_store[room]) {
        console.error(`Error in search:: server_store is undefined for room "${room ?? 'unknown'}"`);
        return;
    }
    if (server_store[room][chara].turn && server_store[room][chara].getready == false) {
        server_store[room][chara].turn = false;
        server_store[room][chara].getready = true;

        var tmp = server_store[room].map_data;
        var x = server_store[room][chara].x;
        var y = server_store[room][chara].y;
        var maxX = server_store[room].map_size_x;
        var maxY = server_store[room].map_size_y;

        var search_map = [];

        // 1..7 ステップ直進（最初のステップは隣のセル）
        for (let step=1; step<=7; step++) {
            const d = hexDirectionDelta(msg, x);
            x += d.dx;
            y += d.dy;
            if (x < 0 || x >= maxX || y < 0 || y >= maxY) {
                search_map.push(2);
            } else {
                search_map.push(mapCell(tmp[y][x], chara));
            }
        }

        if (id) {
            io.to(id).emit('search_rec', { "rec_data": search_map });
            game_result_check(room, chara, "s", msg);
        } else {
            game_result_check(room, chara, "s", msg);
            return search_map;
        }
    } else {
        if (id) io.to(id).emit('search_rec', { "rec_data": server_store[room][chara].true });
        else return false;
    }
}

// put_wall — 実行後に自分位置中心の7要素を返す
function put_wall(room, chara, msg, id = false) {
    if(!server_store[room]) {
        console.error(`Error in put_wall:: server_store is undefined for room "${room ?? 'unknown'}"`);
        return;
    }
    if (server_store[room][chara].turn && server_store[room][chara].getready == false) {
        server_store[room][chara].turn = false;
        server_store[room][chara].getready = true;
        var x = server_store[room][chara].x;
        var y = server_store[room][chara].y;

        var put_check = false;

        var d = hexDirectionDelta(msg, x);
        var tx = x + d.dx;
        var ty = y + d.dy;
        if (0 <= tx && tx < server_store[room].map_size_x && 0 <= ty && ty < server_store[room].map_size_y) {
            put_check = true;
        }

        var chara_num = { "cool": 3, "hot": 4 };
        var chara_num_diff = { "cool": 4, "hot": 3 };
        var player_put_chara = false;

        if (put_check) {
            if (server_store[room].map_data[ty][tx] == chara_num_diff[chara]) {
                player_put_chara = true;
            }
            server_store[room].map_data[ty][tx] = 1;
        }

        // ここで中心 = 自分位置 を基準に7要素を生成して送信/返却
        const centerX = server_store[room][chara].x;
        const centerY = server_store[room][chara].y;
        const surroundData = getSurroundData(room, chara, centerX, centerY);

        if (id) {
            io.to(id).emit('put_rec', { "rec_data": surroundData });
            if (player_put_chara) {
                game_result_check(room, chara, "r", false, false, "putより");
            }
            else {
                game_result_check(room, chara);
            }
        }
        else {
            if (player_put_chara) {
                game_result_check(room, chara, "r", false, false, "putより");
            }
            else {
                game_result_check(room, chara);
            }
            return surroundData;
        }
    }
}


//socket.io_on
const createMap= async (json_data = null) => {
    if(server_store[json_data.room_id]){
        console.log("room already exist");
        return;
    }
    
    await server_data.create_new_map(JSON.stringify(json_data));//server_data_load.jsが発火
    game_server = JSON.parse(JSON.stringify(server_data.load()));
    server_store[json.room_id]=JSON.parse(JSON.stringify(game_server[json_data.room_id]));

    RoomTimeoutCheck();//ルームの削除判定関数を実施
    game_server_reset(json_data.room_id);//ルームの初期化（ランダムマップじゃなければ必須じゃなさそう）
};

// マップをコピーするための関数
const copyMapByID = async (id) =>{
    await server_data.copy_map_by_id(id);
    game_server = JSON.parse(JSON.stringify(server_data.load()));//サーバの更新処理
    server_store[id] = JSON.parse(JSON.stringify(game_server[id]));//server_storeは，他のデータを傷つけない形で更新
    game_server_reset(id);//ルームの初期化（ランダムマップの生成）
}


// マップを削除するための関数
//既存マップの判定をserver_data_load.jsで実施すると，server_storeのマップ初期化で問題が発生するため，ここで判定
const deleteMap = async (id) => {
    //JSON内にdelete_timeが存在するかどうかで判定(onetime_roomの判別)
    if (server_store[id].delete_time) {
        await server_data.delete_map(id);
        //更新処理
        game_server = JSON.parse(JSON.stringify(server_data.load()));
        
        delete server_store[id];  
    }
}

//現存するonetimeルームで制限時間を超えた場合に削除する関数
const RoomTimeoutCheck =async () => {
    console.log("now time",Date.now());
    for (const room in server_store) {
        if (server_store[room].delete_time) {
            //使用中ではなく　or 一度も使用されていないルーム
            if(!server_store[room].match || server_store[room].match == undefined){
                //タイマーが現在のLinux時間を超えている
                if (server_store[room].delete_time  < Date.now()) {
                    console.log("time out room",server_store[room].room_id);
                    deleteMap(room);
                }
            }
        }
    }
}


io.on('connection', function (socket) {

    socket.on('create_new_map', async function (json_data) {
        
        if(json_data.key === config.commonKey){
            delete json_data.key;// JSONデータからkeyを削除
            await createMap(json_data);
            io.emit('map_created', { status: 'success' });  
        }else{
            io.emit('map_created', { status: 'error' });
        }
    });

    socket.on('player_join', async function (msg) {
        if (!server_store[msg.room_id]) {
            room_id_check = msg.room_id.split("?")[0];
            //コピーもとが存在するかチェック
            if(server_store[room_id_check]){
                await copyMapByID(msg.room_id);//?以降を削除
            }
            else{
                console.log("コピー元ルームが存在しません");
                io.to(socket.id).emit("error", "ルームが存在しません");
                return;//以降の処理をスキップ
            }
        }

        if (server_store[msg.room_id] && (!server_store[msg.room_id].cool.status || !server_store[msg.room_id].hot.status) && !server_store[msg.room_id].match) {
            var room_chara;

            if (server_store[msg.room_id].cpu) {
                if (server_store[msg.room_id].cpu.turn == "cool") {
                    server_store[msg.room_id].cool.status = true;
                    server_store[msg.room_id].cool.turn = false;
                    server_store[msg.room_id].cool.getready = true;
                    server_store[msg.room_id].cool.score = 0;
                    server_store[msg.room_id].cool.name = "cpu";
                    server_store[msg.room_id].hot.status = true;
                    server_store[msg.room_id].hot.turn = false;
                    server_store[msg.room_id].hot.getready = true;
                    server_store[msg.room_id].hot.score = 0;
                    server_store[msg.room_id].hot.name = msg.name;
                    room_chara = "hot";
                }
                else {
                    server_store[msg.room_id].cool.status = true;
                    server_store[msg.room_id].cool.turn = false;
                    server_store[msg.room_id].cool.getready = true;
                    server_store[msg.room_id].cool.score = 0;
                    server_store[msg.room_id].cool.name = msg.name;
                    server_store[msg.room_id].hot.status = true;
                    server_store[msg.room_id].hot.turn = false;
                    server_store[msg.room_id].hot.getready = true;
                    server_store[msg.room_id].hot.score = 0;
                    server_store[msg.room_id].hot.name = "cpu";
                    room_chara = "cool";
                }
            }
            else {
                if (!server_store[msg.room_id].cool.status) {
                    server_store[msg.room_id].cool.name = "接続待機中";
                }
                if (!server_store[msg.room_id].hot.status) {
                    server_store[msg.room_id].hot.name = "接続待機中";
                }

                if (!server_store[msg.room_id].cool.status) {
                    server_store[msg.room_id].cool.status = true;
                    server_store[msg.room_id].cool.turn = false;
                    server_store[msg.room_id].cool.getready = true;
                    server_store[msg.room_id].cool.score = 0;
                    server_store[msg.room_id].cool.name = msg.name;
                    room_chara = "cool";
                }
                else if (!server_store[msg.room_id].hot.status) {
                    server_store[msg.room_id].hot.status = true;
                    server_store[msg.room_id].hot.turn = false;
                    server_store[msg.room_id].hot.getready = true;
                    server_store[msg.room_id].hot.score = 0;
                    server_store[msg.room_id].hot.name = msg.name;
                    room_chara = "hot";
                }
            }

            var usrobj = {
                "room": msg.room_id,
                "name": msg.name,
                "chara": room_chara
            };

            store[socket.id] = usrobj;
            socket.join(msg.room_id);

            io.in(store[socket.id].room).emit("joined_room", {
                "x_size": server_store[msg.room_id].map_size_x,
                "y_size": server_store[msg.room_id].map_size_y,
                "cool_name": server_store[msg.room_id].cool.name,
                "hot_name": server_store[msg.room_id].hot.name
            });
            

            if (server_store[msg.room_id].hot.status) {
                var game_start_timer = function (room) {
                    //時間差でゲームが開始されるため，マップ削除した場合はエラーの原因になっていた
                    //正直この修正でも問題が発生する可能性がありそう
                    if(!server_store[room]){//既に削除済みの場合は処理を行わない
                        console.log("game_start_timer room not exist",room);
                        return;
                    }
                    io.in(room).emit("new_board", {
                        "map_data": server_store[room].map_data,
                        "cool_score": server_store[room].cool.score,
                        "hot_score": server_store[room].hot.score,
                        "turn": server_store[room].turn
                    });

                    server_store[room].cool.turn = true;

                    if (server_store[room].timeout) {
                        server_store[room].timer = setTimeout(game_time_out, 1000 * server_store[room].timeout, room, "hot");
                    }
                    else {
                        server_store[room].timer = setTimeout(game_time_out, 10000, room, "hot");
                    }

                    if (server_store[room].cpu && server_store[room].cool.name == "cpu") {
                        cpu(room, server_store[room].cpu.level, server_store[room].cpu.turn);
                    }
                }
                setTimeout(game_start_timer, 500, store[socket.id].room);
            }
        }
        else if (!server_store[msg.room_id]) {
            io.to(socket.id).emit("error", "サーバーIDが存在しません");
        }
        else if (server_store[msg.room_id].match) {
            var join_flag = false;
            if (server_store[msg.room_id].release) {
                if (!server_store[msg.room_id].cool.status) {
                    server_store[msg.room_id].cool.name = "接続待機中";
                }
                if (!server_store[msg.room_id].hot.status) {
                    server_store[msg.room_id].hot.name = "接続待機中";
                }
                if (server_store[msg.room_id].release.cool && !server_store[msg.room_id].cool.status) {
                    server_store[msg.room_id].cool.status = true;
                    server_store[msg.room_id].cool.turn = false;
                    server_store[msg.room_id].cool.getready = true;
                    server_store[msg.room_id].cool.score = 0;
                    server_store[msg.room_id].cool.name = msg.name;
                    room_chara = "cool";
                    join_flag = true;
                }
                else if (server_store[msg.room_id].release.hot && !server_store[msg.room_id].hot.status) {
                    server_store[msg.room_id].hot.status = true;
                    server_store[msg.room_id].hot.turn = false;
                    server_store[msg.room_id].hot.getready = true;
                    server_store[msg.room_id].hot.score = 0;
                    server_store[msg.room_id].hot.name = msg.name;
                    room_chara = "hot";
                    join_flag = true;
                }
            }
            else {
                io.to(socket.id).emit("error", "接続先サーバーは使用中です");
            }

            if (join_flag) {

                var usrobj = {
                    "room": msg.room_id,
                    "name": msg.name,
                    "chara": room_chara
                };

                store[socket.id] = usrobj;
                socket.join(msg.room_id);

                io.in(store[socket.id].room).emit("joined_room", {
                    "x_size": server_store[msg.room_id].map_size_x,
                    "y_size": server_store[msg.room_id].map_size_y,
                    "cool_name": server_store[msg.room_id].cool.name,
                    "hot_name": server_store[msg.room_id].hot.name
                });
            }
        }
        else {
            io.to(socket.id).emit("error", "接続先サーバーは満室です");
        }
    });

    socket.on('match_init', async function (msg) {
        if (!server_store[msg.room_id]) {
            room_id_check = msg.room_id.split("?")[0];
            //コピーもとが存在するかチェック
            if(server_store[room_id_check]){
                await copyMapByID(msg.room_id);//?以降を削除
            }
            else{
                console.log("コピー元ルームが存在しません");
                io.to(socket.id).emit("error", "ルームが存在しません");
                return;//以降の処理をスキップ
            }
        }

        if (server_store[msg.room_id]) {
            if (!(server_store[msg.room_id].cool.status || server_store[msg.room_id].hot.status)) {
                if (!match_room_store[socket.id]) {
                    match_room_store[socket.id] = msg.room_id;
                    server_store[msg.room_id].match = true;
                    io.to(socket.id).emit("match_init_rec", { "key": socket.id });

                    if (server_store[msg.room_id].cpu) {
                        server_store[msg.room_id][server_store[msg.room_id].cpu.turn].status = true;
                        server_store[msg.room_id][server_store[msg.room_id].cpu.turn].turn = false;
                        server_store[msg.room_id][server_store[msg.room_id].cpu.turn].getready = true;
                        server_store[msg.room_id][server_store[msg.room_id].cpu.turn].score = 0;
                        server_store[msg.room_id][server_store[msg.room_id].cpu.turn].name = "cpu";
                    }
                }
                else {
                    io.to(socket.id).emit("match_init_rec", { "error": "他のサーバーでマッチ中です" });
                }
            }
            else {
                io.to(socket.id).emit("match_init_rec", { "error": "接続先サーバーは使用中です" });
            }
        }
        else {
            io.to(socket.id).emit("error", "サーバーIDが存在しません");
        }
    });

    socket.on('match_start_check', function () {
        if (match_room_store[socket.id]) {
            if (!server_store[match_room_store[socket.id]]) {
                delete match_room_store[socket.id];
                return;
            }
            if (server_store[match_room_store[socket.id]].cool.status && server_store[match_room_store[socket.id]].hot.status) {
                io.to(socket.id).emit("match_start_check_rec", true);
            }
            else {
                io.to(socket.id).emit("match_start_check_rec", false);
            }
        }
        else {
            io.to(socket.id).emit("error", "不正な操作です");
        }
    });

    socket.on('match_start', function (msg) {
        clearTimeout(server_store[msg.room_id].timer);
        if (msg.room_id == match_room_store[msg.key]) {
            if (server_store[msg.room_id].cool.status && server_store[msg.room_id].hot.status) {
                server_store[msg.room_id].match = false;

                var game_start_timer = function (room) {
                    io.in(room).emit("new_board", {
                        "map_data": server_store[room].map_data,
                        "cool_score": server_store[room].cool.score,
                        "hot_score": server_store[room].hot.score,
                        "turn": server_store[room].turn
                    });

                    server_store[room].cool.turn = true;

                    if (server_store[room].timeout) {
                        server_store[room].timer = setTimeout(game_time_out, 1000 * server_store[room].timeout, room, "hot");
                    }
                    else {
                        server_store[room].timer = setTimeout(game_time_out, 10000, room, "hot");
                    }

                    if (server_store[room].cpu && server_store[room].cool.name == "cpu") {
                        cpu(room, server_store[room].cpu.level, server_store[room].cpu.turn);
                    }
                }
                setTimeout(game_start_timer, 500, msg.room_id);
            }
        }
        else {
            io.to(socket.id).emit("error", "不正な操作です");
        }
    });

    socket.on('player_join_match', async function (msg) {
        if (!server_store[msg.room_id]) {
            room_id_check = msg.room_id.split("?")[0];
            //コピーもとが存在するかチェック
            if(server_store[room_id_check]){
                await copyMapByID(msg.room_id);//?以降を削除
            }
            else{
                console.log("コピー元ルームが存在しません");
                io.to(socket.id).emit("error", "ルームが存在しません");
                return;//以降の処理をスキップ
            }
        }

        if (msg.room_id == match_room_store[msg.key]) {
            if (!server_store[msg.room_id].cool.status) {
                server_store[msg.room_id].cool.name = "接続待機中";
            }
            if (!server_store[msg.room_id].hot.status) {
                server_store[msg.room_id].hot.name = "接続待機中";
            }

            var join_flag = false;

            if (msg.chara == "cool" && !server_store[msg.room_id].cool.status) {
                server_store[msg.room_id].cool.status = true;
                server_store[msg.room_id].cool.turn = false;
                server_store[msg.room_id].cool.getready = true;
                server_store[msg.room_id].cool.score = 0;
                server_store[msg.room_id].cool.name = msg.name;
                room_chara = "cool";
                join_flag = true;
            }
            else if (msg.chara == "hot" && !server_store[msg.room_id].hot.status) {
                server_store[msg.room_id].hot.status = true;
                server_store[msg.room_id].hot.turn = false;
                server_store[msg.room_id].hot.getready = true;
                server_store[msg.room_id].hot.score = 0;
                server_store[msg.room_id].hot.name = msg.name;
                room_chara = "hot";
                join_flag = true;
            }

            if (join_flag) {
                var usrobj = {
                    "room": msg.room_id,
                    "name": msg.name,
                    "chara": room_chara
                };

                store[socket.id] = usrobj;
                socket.join(msg.room_id);

                io.in(store[socket.id].room).emit("joined_room", {
                    "x_size": server_store[msg.room_id].map_size_x,
                    "y_size": server_store[msg.room_id].map_size_y,
                    "cool_name": server_store[msg.room_id].cool.name,
                    "hot_name": server_store[msg.room_id].hot.name
                });
            }
            else {
                io.to(socket.id).emit("error", "接続先サーバーは使用中です");
            }
        }
        else {
            io.to(socket.id).emit("error", "不正な操作です");
        }
    });

    socket.on('release', function (msg) {
        try {
            if (msg.room_id == match_room_store[msg.key]) {
                if (!server_store[msg.room_id].release) {
                    server_store[msg.room_id].release = {};
                }

                if (msg.chara == "cool") {
                    server_store[msg.room_id].release.cool = true;
                }
                else if (msg.chara == "hot") {
                    server_store[msg.room_id].release.hot = true;
                }
            }
            else {
                io.to(socket.id).emit("error", "不正な操作です");
            }
        }
        catch (e) {
            console.log(e);
        }
    });

    socket.on('move_player', function (msg) {
        if (store[socket.id]) {
            move_player(store[socket.id].room, store[socket.id].chara, msg, socket.id);
        }
    });

    socket.on('get_ready', function () {
        if (store[socket.id]) {
            get_ready(store[socket.id].room, store[socket.id].chara, socket.id)
        }
    });

    socket.on('look', function (msg) {
        if (store[socket.id]) {
            look(store[socket.id].room, store[socket.id].chara, msg, socket.id);
        }
    });

    socket.on('search', function (msg) {
        if (store[socket.id]) {
            search(store[socket.id].room, store[socket.id].chara, msg, socket.id);
        }
    });

    socket.on('put_wall', function (msg) {
        if (store[socket.id]) {
            put_wall(store[socket.id].room, store[socket.id].chara, msg, socket.id);
        }
    });

    socket.on('looker_join', async function (msg) {
        if (!server_store[msg]) {
            room_id_check = msg.split("?")[0];
            //コピーもとが存在するかチェック
            if(server_store[room_id_check]){
                await copyMapByID(msg);//?以降を削除
            }
            else{
                console.log("コピー元ルームが存在しません");
                io.to(socket.id).emit("error", "ルームが存在しません");
                return;//以降の処理をスキップ
            }
        }

        if (server_store[msg]) {
            var usrobj = {
                "room": msg,
            };

            var cool_name = "接続待機中";
            var hot_name = "接続待機中";
            if (server_store[msg].cool.status) {
                cool_name = server_store[msg].cool.name;
            }
            if (server_store[msg].hot.status) {
                hot_name = server_store[msg].hot.name;
            }

            io.to(socket.id).emit("joined_room", {
                "x_size": server_store[msg].map_size_x,
                "y_size": server_store[msg].map_size_y,
                "cool_name": cool_name,
                "hot_name": hot_name
            });

            looker[socket.id] = usrobj;
            socket.join(msg);
        }
    });

    socket.on('disconnect', function () {
        if (store[socket.id] && server_store[store[socket.id].room]) {
            if (server_store[store[socket.id].room].cool.status && server_store[store[socket.id].room].hot.status && !server_store[store[socket.id].room].match) {
                if (store[socket.id].chara == "cool") {
                    game_result_check(store[socket.id].room, store[socket.id].chara, "r", false, "hot", "切断より");
                }
                else {
                    game_result_check(store[socket.id].room, store[socket.id].chara, "r", false, "cool", "切断より");
                }
            }
            else if (server_store[store[socket.id].room].match) {
                server_store[store[socket.id].room][store[socket.id].chara].status = false;
                delete store[socket.id];
            }
            else {
                game_server_reset(store[socket.id].room);
            }
        }
        else if (looker[socket.id]) {
            socket.leave(looker[socket.id].room);
            delete looker[socket.id];
        }
        if (match_room_store[socket.id]) {
            io.in(match_room_store[socket.id]).emit("error", "サーバー側から切断されました");
            console.log("切断されたルーム", match_room_store[socket.id]);
            if (!server_store[match_room_store[socket.id]]) {
                delete match_room_store[socket.id];
                return;
            }
            if (server_store[match_room_store[socket.id]].cool.status && server_store[match_room_store[socket.id]].hot.status) {
                game_server_reset(match_room_store[socket.id]);
            }
            for (var s_user in match_room_store) {
                if (s_user != socket.id && match_room_store[s_user] == match_room_store[socket.id]) {
                    delete match_room_store[socket.id];
                    break;
                }
            }
            if (match_room_store[socket.id]) {
                server_store[match_room_store[socket.id]].match = false;
                delete match_room_store[socket.id];
            }
        }
    });

    socket.on('leave_room', function () {
        if (store[socket.id] && server_store[store[socket.id].room]) {
            if (server_store[store[socket.id].room].cool.status && server_store[store[socket.id].room].hot.status && !server_store[store[socket.id].room].match) {
                if (store[socket.id].chara == "cool") {
                    game_result_check(store[socket.id].room, store[socket.id].chara, "r", false, "hot", "切断より");
                }
                else {
                    game_result_check(store[socket.id].room, store[socket.id].chara, "r", false, "cool", "切断より");
                }
            }
            else if (server_store[store[socket.id].room].match) {
                server_store[store[socket.id].room][store[socket.id].chara].status = false;
                delete store[socket.id];
            }
            else {
                game_server_reset(store[socket.id].room);
            }
        }
        else if (looker[socket.id]) {
            socket.leave(looker[socket.id].room);
            delete looker[socket.id];
        }
        if (match_room_store[socket.id]) {
            io.in(match_room_store[socket.id]).emit("error", "サーバー側から切断されました");
            if (server_store[match_room_store[socket.id]].cool.status && server_store[match_room_store[socket.id]].hot.status) {
                game_server_reset(match_room_store[socket.id]);
            }
            for (var s_user in match_room_store) {
                if (s_user != socket.id && match_room_store[s_user] == match_room_store[socket.id]) {
                    delete match_room_store[socket.id];
                    break;
                }
            }
            if (match_room_store[socket.id]) {
                server_store[match_room_store[socket.id]].match = false;
                delete match_room_store[socket.id];
            }
        }
    });

    socket.on('match_end', function (msg) {
        if (msg.room_id == match_room_store[msg.key]) {
            if (match_room_store[socket.id]) {
                delete match_room_store[socket.id];
            }
            if (looker[socket.id]) {
                socket.leave(looker[socket.id].room);
                delete looker[socket.id];
            }
        }
        else {
            io.to(socket.id).emit("error", "不正な操作です");
        }
    });

});

exports.io = io;


//cpu
function cpu(room, level, chara) {

    var cpu_map_date = get_ready(room, chara); // now returns 7-element: [center, neighbour(1)..neighbour(6)]
    const delay_time = 100;

    if (cpu_map_date) {
        if (typeof level == "string") {
            if (level[0] == "0") level = 0;
            else if (level[0] == "1") level = 1;
            else if (level[0] == "2") level = 2;
            else level = 0;
        }

        if (level == 0) {
            // 既存互換: top -> look upward の意味は曖昧なので keep original behavior by mapping to a direction
            setTimeout(look, delay_time, room, chara, "topright");
        }
        else if (level == 1) {
            // 壁でない隣接方向を全て列挙してランダムに移動
            var random_list = [];
            // cpu_map_date indices: 0=top, 1=topright,2=bottomright,3=bottom, 4=bottomleft,5=topleft,6=center
            const neighDirs = neighbors();
            for (let i=0;i<6;i++) {
                if (cpu_map_date[i] != 2) random_list.push(neighDirs[i]);
            }
            if (random_list.length) {
                var random = Math.floor(Math.random() * random_list.length);
                setTimeout(move_player, delay_time, room, chara, random_list[random]);
            }
        }
        else if (level == 2) {
            next_action = cpu_action(room, cpu_map_date);
            if (next_action[0] == "attack") {
                setTimeout(put_wall, delay_time, room, chara, next_action[1]);
            }
            else if (next_action[0] == "move") {
                setTimeout(move_player, delay_time, room, chara, next_action[1]);
            }
            else {
                setTimeout(look, delay_time, room, chara, next_action[1]);
            }
        }
        else {
            setTimeout(look, delay_time, room, chara, "top");
        }
    }
}

// cpu_action — get_ready の 7要素フォーマットに合わせる
function cpu_action(room, map_data) {
    // map_data: [top, topright, bottomright, bottom, bottomleft, topleft, center]
    item_num = 3;
    wall_num = 2;
    // 隣接に敵がいるか (indices 0..5)
    var enemy_present = false;
    for (let i=0;i<6;i++) if (map_data[i] == 1) enemy_present = true;
    var enemy_num = enemy_present ? 1 : 1; // 保守的に 1 を使用

    if (room in room_info && room_info[room]?.cpu?.action_history != undefined) {
        action_history = room_info[room].cpu.action_history;
    } else {
        action_history = ["mode_direction", "mode_direction", "mode_direction", "mode_direction", "mode_direction"];
        cpu_info = {};
        cpu_level = server_store[room].cpu.level;
        if (typeof cpu_level == "string" && cpu_level.indexOf("?") != -1) {
            paramater = cpu_level.split("?")[1];
            paramater_list = paramater.split("&");
            for (i = 0; i < paramater_list.length; i++) {
                paramater_key = paramater_list[i].split("=")[0];
                paramater_value = parseInt(paramater_list[i].split("=")[1], 10);
                cpu_info[paramater_key] = paramater_value;
            }
        }
        room_info[room] = { "cpu": cpu_info };
        room_info[room].cpu.now_item = 0;
        room_info[room].turn = 0;
        room_info[room].cpu.wall3 = 0;
    }

    room_info[room].turn += 1;
    can_get_item = false;
    if (Math.floor(room_info[room].turn / room_info[room].cpu.item) + 1 > room_info[room].cpu.now_item || room_info[room].cpu.item == undefined) {
        can_get_item = true;
    }

    if (action_history.length >= 6) action_history.shift();

    var directions = neighbors();
    // 隣接に敵がいる場合は攻撃
    for (let i = 0; i < 6; i++) {
        if (map_data[i] == 1) {
            if (cpu_info.holdAttack == undefined) {
                action_history.push("attack_" + directions[i]);
                if (room in room_info) room_info[room].cpu.action_history = action_history;
                return ["attack", directions[i]];
            }
        }
    }

    if (cpu_info.holdAttack != undefined) {
        cpu_info.holdAttack -= 1;
        if (cpu_info.holdAttack == 0) cpu_info.holdAttack = undefined;
    }

    // 周囲方向の評価（map_data indices 1..6）
    can_move_dic = {
        "top":         100,
        "topright":    100,
        "bottomright": 100,
        "bottom":      100,
        "bottomleft":  100,
        "topleft":     100
    };

    for (let i = 0; i < 6; i++) {
        if (map_data[i] == item_num && can_get_item) can_move_dic[neighbor(i)] += 50;
    }

    for (let i = 0; i < 6; i++) {
        if (map_data[i] == wall_num) can_move_dic[neighbor(i)] = 0;
    }

    for (let i = 1; i < Math.min(5, action_history.length); i++) {
        let before_action = action_history[action_history.length - i];
        let before_dir = before_action.split("_")[1];
        if (before_dir && can_move_dic[before_dir] > 0) can_move_dic[before_dir] += 20 / (i * i);
    }

    var max_key = Object.keys(can_move_dic).reduce((a, b) => can_move_dic[a] > can_move_dic[b] ? a : b);
    var max_list = Object.keys(can_move_dic).filter(k => can_move_dic[k] == can_move_dic[max_key]);
    max_key = max_list[Math.floor(Math.random() * max_list.length)];

    if (can_move_dic[max_key] >= 30) {
        action_history.push("move_" + max_key);
        if (room in room_info) room_info[room].cpu.action_history = action_history;
        else room_info[room] = { "cpu": { "action_history": action_history } };

        for (let i = 0; i < 6; i++) {
            if (map_data[i] == item_num && directions[i] == max_key) {
                room_info[room].cpu.now_item += 1;
            }
        }
        return ["move", max_key];
    }

    action_history.push("search_random");
    if (room in room_info) room_info[room].cpu.action_history = action_history;
    else room_info[room] = { "cpu": { "action_history": action_history } };
    return ["search", "top"];
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

// 中心セル(cx,cy)を基準に6近傍 + center の7要素を生成するヘルパー
function getSurroundData(room, chara, cx, cy) {
    const tmp = server_store[room].map_data;
    const maxX = server_store[room].map_size_x;
    const maxY = server_store[room].map_size_y;
    const surround = [];
    const neigh = neighbors();

    // neighbors
    for (let dname of neigh) {
        const d = hexDirectionDelta(dname, cx);
        const nx = cx + d.dx;
        const ny = cy + d.dy;
        if (nx < 0 || nx >= maxX || ny < 0 || ny >= maxY) surround.push(2);
        else surround.push(mapCell(tmp[ny][nx], chara));
    }
    // center
    if (cx < 0 || cx >= maxX || cy < 0 || cy >= maxY) surround.push(2);
    else surround.push(mapCell(tmp[cy][cx], chara));

    return surround;
}
