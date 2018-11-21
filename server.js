const express = require('express');
const app = express();
const fs = require('fs');
const pug = require('pug');
app.set('view engine', 'pug');
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

var bit_tot = 0;
var pol_tot = 0;

for (var i = 0; i <= 100; i++) {
    rate_bin.push(i/1000);
}



// bids in Bittrex order books
https.get("https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-ETH&type=buy", (resp) => {

  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    for(i=0;i<JSON.parse(data)["result"].length;i++){
      bit_bids_r.push( JSON.parse(data)["result"][i].Rate);
      bit_bids_q.push( JSON.parse(data)["result"][i].Quantity);
      bit_bids.push( [bit_bids_r[i], bit_bids_q[i]]);
    }

    console.log("bit_bids_r.length  " + bit_bids_r.length);
    console.log("bit_bids_q.length  " + bit_bids_q.length);

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
https.get("https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-ETH&type=sell", (resp) => {

  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
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

    console.log(Math.min.apply(Math,pol_bids_r) + " min of pol bids array");
    console.log(Math.max.apply(Math,pol_bids_r));

    pol_tot = (pol_asks_r.length + pol_bids_r.length);

 });

}).on("error", (err) => {
 console.log("ERROR: " + err.message);
});


// send data to html via pug

app.get('/', function(req, res) {
  console.log("you've loaded the webpage");

  var tot_bid = pol_bids_q_bin.map((a, i) => a + bit_bids_q_bin[i]);
  var tot_ask = pol_asks_q_bin.map((a, i) => a + bit_asks_q_bin[i]);

  var Bittrex_Bids = {
    x: rate_bin,
    y: bit_bids_q_bin,
    fill: 'tozeroy',
    line: {
      color: 'rgb(0, 255, 0)',
    },
    type: 'scatter',
    name: 'Bittrex Bids'
  };

  var Bittrex_Asks = {
    x: rate_bin,
    y: bit_asks_q_bin,
    fill: 'tozeroy',
    line: {
      color: 'rgb(255, 16, 0)',
    },
    type: 'scatter',
    name: 'Bittrex Asks'
  };

  var Poloniex_Bids = {
    x: rate_bin,
    y: pol_bids_q_bin,
    fill: 'tozeroy',
    line: {
      color: 'rgb(0, 160, 1)',
    },
    type: 'scatter',
    name: 'Poloniex Bids'
  };

  var Poloniex_Asks = {
    x: rate_bin,
    y: pol_asks_q_bin,
    fill: 'tozeroy',
    line: {
      color: 'rgb(153, 10, 0)',
    },
    type: 'scatter',
    name: 'Poloniex Asks'
  };

  var Combined_Bids = {
    x: rate_bin,
    y: tot_bid,
    fill: 'tozeroy',
    line: {
      color: 'rgb(0, 89, 1)',
    },
    type: 'scatter',
    name: 'Combined Bids'
  };

  var Combined_Asks = {
    x: rate_bin,
    y: tot_ask,
    fill: 'tozeroy',
    line: {
      color: 'rgb(91, 5, 0)',
    },
    type: 'scatter',
    name: 'Combined Asks'
  };

  var layout = {
    autosize: false,
    width: 475,
    height: 325,
    margin: {
      l: 35,
      // r: 10,
      b: 15,
      // t: 100,
      pad: 3
    },
    yaxis: {
      title: 'Quantity',
      tickmode: 'array',
      automargin: true
    },
    xaxis: {
      title: 'BTC / ETH rate',
      tickmode: 'array',
      automargin: true
    },
    showlegend: false,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'black'
  };

  var top_bit_r = []
  var top_bit_q = []
  var top_pol_r = []
  var top_pol_q = []

  for (var i = 0; i < rate_bin.length; i++) {    // left column
    if (bit_bids_q_bin[100-i] > 0) {
      top_bit_q = bit_bids_q_bin.slice(100-i-6, 100-i);
      top_bit_q = top_bit_q.concat(bit_asks_q_bin.slice(100-i, 100-i+6));
      top_bit_r = rate_bin.slice(100-i-6, 100-i+6);
      break;
    }
  }

  for (var j = 0; j < rate_bin.length; j++) {    // right column
    if (pol_bids_q_bin[100-j] > 0) {
      top_pol_q = pol_bids_q_bin.slice(100-j-6, 100-j);
      top_pol_q = top_pol_q.concat(pol_asks_q_bin.slice(100-j, 100-j+6));
      top_pol_r = rate_bin.slice(100-j-6, 100-j+6);
      break;
    }

  }

  top_pol_q = top_pol_q.concat(pol_asks_q_bin.slice(100-j, 100-j+6));

  var overlapz = (top_bit_r[5]+top_bit_r[0])/2 - (top_pol_r[5]+top_pol_r[0])/2;

  if (overlapz > 0) {
    overlapz = Math.abs(overlapz);
  } else {
    overlapz = 0;
  }

  var data2 = [Combined_Asks, Combined_Bids, Poloniex_Asks, Poloniex_Bids, Bittrex_Asks, Bittrex_Bids];

  res.render('index', {
    title: 'home',
    olap: overlapz,
    layouti: JSON.stringify(layout),
    bit_t: bit_asks_r.length+bit_bids_r.length,
    pol_t: pol_tot,
    datai: JSON.stringify(data2),
    imode: '{displayModeBar: false}',
    tbr: top_bit_r, //JSON.stringify(top_bit_r),
    tbq: top_bit_q, //JSON.stringify(top_bit_q),
    tpr: top_pol_r, //JSON.stringify(top_pol_r),
    tpq: top_pol_q  //JSON.stringify(top_pol_q)
  });
  // res.send('Hello World!')
});


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
