var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');
var server_data = require('../tool/server_data_load');

const reloadServerData = async () => {    
    return JSON.parse(JSON.stringify(server_data.load()));
};
let game_server = reloadServerData();


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('match');
});


router.get('/player', async function(req, res, next) {
    game_server = await reloadServerData();
    if (req.query.room_id) {
        try {
            if (game_server[req.query.room_id].cpu) {
                if (game_server[req.query.room_id].cpu.turn == req.query.chara) {
                    res.render('match-cpu');
                }
                else {
                    res.render('match-player');
                }
            }
            else {
                res.render('match-player');
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    else {
        res.render('match-player');
    }
});

module.exports = router;