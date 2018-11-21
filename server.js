const express = require('express');
const app = express();
// const fs = require('fs');
// const pug = require('pug');
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

//
// const plotly = require('plotly')('ted1508', 'MXqluxk6kopZ0HoOSIHu');
//
var https = require("https");
//var plotly = require('plotly')('ted1508', 'MXqluxk6kopZ0HoOSIHu');
var bit_bids = []; // [rate,quantity]
var bit_asks = [];
var pol_asks = [];
var pol_bids = [];

var bit_bids_r = [];
var bit_bids_q = [];
var bit_asks_r = [];
var bit_asks_q = [];

var rate_bin = [];
var bit_bids_q_bin = Array.apply(null, Array(100)).map(Number.prototype.valueOf,0);
var bit_asks_q_bin = Array.apply(null, Array(100)).map(Number.prototype.valueOf,0);
var pol_bids_q_bin = Array.apply(null, Array(100)).map(Number.prototype.valueOf,0);
var pol_asks_q_bin = Array.apply(null, Array(100)).map(Number.prototype.valueOf,0);

for (var i = 0; i <= 100; i++) {
    rate_bin.push(i/1000);
}



// bids in Bittrex order books
https.get("https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-LTC&type=buy", (resp) => {

  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    console.log(JSON.parse(data)["result"].length + " bids in Bittrex order books");
    for(i=0;i<JSON.parse(data)["result"].length;i++){
      bit_bids_r.push( JSON.parse(data)["result"][i].Rate);
      bit_bids_q.push( JSON.parse(data)["result"][i].Quantity);
      bit_bids.push( [bit_bids_r[i], bit_bids_q[i]]);
    }

    var j = 0;    // bin rates to 0.001
    while(j < bit_bids_r.length){
      bit_bids_r[j] = Number(bit_bids_r[j].toFixed(3));
      j++;
    }

    for (var k = 0; k < bit_bids_r.length; k++) {    // sum quantity per bin
      bit_bids_q_bin[bit_bids_r[k]*1000] += bit_bids_r[k];
    }

    console.log(Math.min.apply(Math,bit_bids_r) + " min of bit bids array");
    console.log(Math.max.apply(Math,bit_bids_r));
  });

}).on("error", (err) => {
 console.log("ERROR: " + err.message);
});



// asks in Bittrex order books
https.get("https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-LTC&type=sell", (resp) => {

  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    console.log(JSON.parse(data)["result"].length + " asks in Bittrex order books");
    for(i=0;i<JSON.parse(data)["result"].length;i++){
      bit_asks_r.push( JSON.parse(data)["result"][i].Rate);
      bit_asks_q.push( JSON.parse(data)["result"][i].Quantity);
      bit_asks.push( [bit_asks_r[i], bit_asks_q[i]]);
    }

    var j = 0;    // bin rates to 0.001
    while(j < bit_asks_r.length){
      bit_asks_r[j] = Number(bit_asks_r[j].toFixed(3));
      j++;
    }

    for (var k = 0; k < bit_asks_r.length; k++) {    // sum quantity per bin
      bit_asks_q_bin[bit_asks_r[k]*1000] += bit_asks_r[k];
    }

    console.log(Math.min.apply(Math,bit_asks_r) + " min of bit asks array");
    console.log(Math.max.apply(Math,bit_asks_r));
  });

}).on("error", (err) => {
 console.log("ERROR: " + err.message);
});



// Poloniex (Bids & Asks)
https.get("https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_ETH&depth=10000", (resp) => {

  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    var value = JSON.parse(data)[Object.keys(JSON.parse(data))[0]];

    // asks
    var pol_asks_q = JSON.parse(data).asks.map(function(value,index) { return value[1]; });
    var pol_asks_r = JSON.parse(data).asks.map(function(value,index) { return value[0] }).map(Number);
    for(i=0;i<pol_asks_r.length;i++){
      pol_asks.push( [pol_asks_r[i], pol_asks_q[i] ]);
    }

    var j = 0;    // bin rates to 0.001
    while(j < pol_asks_r.length){
      pol_asks_r[j] = Number(pol_asks_r[j].toFixed(3));
      j++;
    }

    for (var k = 0; k < pol_asks_r.length; k++) {    // sum quantity per bin
      pol_asks_q_bin[pol_asks_r[k]*1000] += pol_asks_r[k];
    }

    console.log(pol_asks_r.length + " asks in Poloniex order books");
    console.log(Math.min.apply(Math,pol_asks_r) + " min of pol asks array");
    console.log(Math.max.apply(Math,pol_asks_r));

    // bids
    var pol_bids_q = JSON.parse(data).bids.map(function(value,index) { return value[1]; });
    var pol_bids_r = JSON.parse(data).bids.map(function(value,index) { return value[0] }).map(Number);
    for(i=0;i<pol_bids_r.length;i++){
      pol_bids.push( [pol_bids_r[i], pol_bids_q[i] ]);
    }

    var j = 0;    // bin rates to 0.001
    while(j < pol_bids_r.length){
      pol_bids_r[j] = Number(pol_bids_r[j].toFixed(3));
      j++;
    }

    for (var k = 0; k < pol_bids_r.length; k++) {    // sum quantity per bin
      pol_bids_q_bin[pol_bids_r[k]*1000] += pol_bids_r[k];
    }

    console.log(pol_bids_r.length + " bids in Poloniex order books");
    console.log(Math.min.apply(Math,pol_bids_r) + " min of pol bids array");
    console.log(Math.max.apply(Math,pol_bids_r));

 });

}).on("error", (err) => {
 console.log("ERROR: " + err.message);
});


// send data to html

app.get('/', function(req, res) {
  console.log("you've loaded the webpage");

  // fs.readFile(
  // './templates/index.html','utf-8',(err, data) => {
  //   if (err) {
  //     console.log("whatsup error!");
  //   }
  //
  //
  //   var Bittrex_Bids = {
  //     x: rate_bin,
  //     y: bit_bids_q_bin,
  //     fill: 'tozeroy',
  //     type: 'scatter'
  //   };
  //
  //   var Bittrex_Asks = {
  //     x: rate_bin,
  //     y: bit_asks_q_bin,
  //     fill: 'tonexty',
  //     type: 'scatter'
  //   };
  //
  //   var Poloniex_Bids = {
  //     x: rate_bin,
  //     y: pol_bids_q_bin,
  //     fill: 'tozeroy',
  //     type: 'scatter'
  //   };
  //
  //   var Poloniex_Asks = {
  //     x: rate_bin,
  //     y: pol_asks_q_bin,
  //     fill: 'tonexty',
  //     type: 'scatter'
  //   };
  //
  //   var layout = {
  //     autosize: false,
  //     width: 475,
  //     height: 325,
  //     margin: {
  //       l: 35,
  //       // r: 10,
  //       b: 15,
  //       // t: 100,
  //       pad: 3
  //     },
  //     yaxis: {
  //       title: 'Quantity',
  //       tickmode: 'array',
  //       automargin: true
  //     },
  //     xaxis: {
  //       title: 'ETH / BTC rate',
  //       tickmode: 'array',
  //       automargin: true
  //     },
  //     showlegend: false,
  //     paper_bgcolor: 'transparent',
  //     plot_bgcolor: 'black'
  //   };
  //
  //   var data2 = [Bittrex_Bids, Poloniex_Bids, Bittrex_Asks, Poloniex_Asks];
  //
  //   res.render('index', {
  //     title: 'home',
  //     hello: 'ted',
  //     layouti: JSON.stringify(layout),
  //     datai: JSON.stringify(data2)
  //   })
  //
  //   console.log("done reading");
  // });
  res.send('Hello World!')
});


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
