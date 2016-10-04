var request = require('request');
var TelegramBot = require('node-telegram-bot-api');
var YandexTranslator = require('yandex.translate');
var translate = require('yandex-translate')('trnsl.1.1.20160814T030040Z.8d320379d747e007.8104bd6ee8d6f3b0a27556f65d33d736a04a2d7c');

var options = {
    polling: true
};
var mood = null;
var res = '';
var llll = '';
var ak = 'b7d11214c8fc452db3de12028cf46daa';
var sk = '64631fe987f4423bb0a117101bf90a45'
var ocr = require('./ocr.js').create(ak, sk);
var a = [
    ['eat-drink', 'restaurant'],
    ['coffee-tea', 'snacks-fast-food'],
    ['going-out', 'sights-museums'],
    ['transport', 'airport'],
    ['accommodation', 'shopping'],
    ['leisure-outdoor', 'natural-geographical'],
    ['petrol-station', 'atm-bank-exchange'],
    ['toilet-rest-area', 'hospital-health-care-facility'],
    ['administrative-areas-buildings']
];

var token = '198085265:AAFygFU7n37DMDSRZPnRVpnkpK6s2zEA4jo';

var bot = new TelegramBot(token, options);
bot.getMe().then(function(me) {
    console.log('Hi my name is %s!', me.username);
});

bot.onText(/\/search/, function(msg) {
    var chatId = msg.chat.id;
    var opts = {
        reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
            keyboard: a
        })
    };
    bot.sendMessage(chatId, 'Select your mood ', opts);
    console.log(msg);
});
bot.on('message', function(msg) {
    var chatId = msg.chat.id;
    var flag = false;
    if (msg.text != undefined) {
        var i = 0;
        while (i < a.length) {
            if (a[i].indexOf(msg.text) != -1) {
                flag = true;
                break;
            }
            i += 1;
        }
    }
    if (flag) {
        flag = false;
        mood = msg.text;
        console.log(msg);
    }
    if (msg.location != undefined && mood != null) {
        console.log(mood, 'latitude', msg.location.latitude);
        console.log(mood, 'longitude', msg.location.longitude);
        request({
            url: 'https://places.demo.api.here.com/places/v1/discover/explore?at=' + msg.location.latitude + ',' + msg.location.longitude + '&cat=' + mood + '&app_id=qWWMtPTtoZAUNjN8FRqj&app_code=_Vidf-iou_-XwDu-27uF8A',
            json: true
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body.results.items);
                var k = body.results.items;
                if (k.length > 7) k.length = 7
                for (var i = 0; i < k.length; i++) {
                    res = res.concat(i + 1);
                    res = res.concat(') ');
                    res = res.concat(body.results.items[i].title);
                    res = res.concat('\n');
                }
                bot.sendMessage(chatId, res);
                res = '';

            }
        })
        mood = null;
    }
    if (msg.photo != undefined) {
        length = msg.photo.length;
        console.log(msg.photo[length - 1].file_id);
        request({
            url: 'https://api.telegram.org/bot198085265:AAFygFU7n37DMDSRZPnRVpnkpK6s2zEA4jo/getFile?file_id=' + msg.photo[length - 1].file_id,
            json: true
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                llll = 'https://api.telegram.org/file/bot198085265:AAFygFU7n37DMDSRZPnRVpnkpK6s2zEA4jo/' + body.result.file_path;
            }
        })}

        if (msg.text == 'translate to english') {
        console.log(msg.text)
            ocr.scan({
                url: llll,
                type: 'text',
            }).then(function(result) {

                translate.translate(result.results.words, { to: 'en' }, function(err, res) {
                    var a = res.text;
                    console.log(a);
                    bot.sendMessage(chatId, a[0]);
                });
            }).catch(function(err) {
                console.log('err', err);
            })
        } else if (msg.text == 'translate to hindi') {
            ocr.scan({
                url: llll,
                type: 'text',
            }).then(function(result) {

                translate.translate(result.results.words, { to: 'hi' }, function(err, res) {
                    var a = res.text;
                    console.log(a);
                    bot.sendMessage(chatId, a[0]);
                })
            })
        }
});
