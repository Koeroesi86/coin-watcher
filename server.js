import express from "express";
import request from "request";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const io = require('socket.io')(server);

const port = 3000;
let currentState = {};
const conversions = ["AUD", "BRL", "CAD", "CHF", "CLP", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HUF", "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PKR", "PLN", "RUB", "SEK", "SGD", "THB", "TRY", "TWD", "ZAR"].sort();

app.set('json spaces', 4);

const updateData = (currentConversions, newState) => {
    if(!newState) {
        newState = {};
    }

    if(currentConversions.length === 0) {
        if(!currentState["BTC"]) {
            currentState = newState;
            console.info(`Initialized all coins.`);
        }

        if(newState["BTC"] && currentState["BTC"].last_updated < newState["BTC"].last_updated) {
            currentState = newState;
            console.info(`Updated all coins.`);
        }
        return;
    }

    const currentCurrency = currentConversions.splice(0, 1);

    request(`https://api.coinmarketcap.com/v1/ticker/?convert=${currentCurrency}`, function(error, response, body) {
        body = JSON.parse(body);
        for(let currency of body) {
            if(!newState[currency.symbol]) {
                newState[currency.symbol] = {
                    symbol: currency.symbol,
                    name: currency.name,
                    prices: {
                        USD: currency.price_usd || "0",
                        BTC: currency.price_btc || "0"
                    },
                    caps: {
                        USD: currency.market_cap_usd || "0"
                    },
                    last_updated: currency.last_updated
                };
            }

            newState[currency.symbol].prices[currentCurrency] = currency[`price_${currentCurrency.toString().toLowerCase()}`] || "0";
            newState[currency.symbol].caps[currentCurrency] = currency[`market_cap_${currentCurrency.toString().toLowerCase()}`] || "0";
        }

        console.info(`Updated data for ${currentCurrency}`);
        setTimeout(() => {
            updateData(currentConversions, newState);
        }, 500);
    });
};

app.get('/coins', (req, resp) => {
    resp.json(currentState);
});
app.get('/coins/list', (req, resp) => {
    let coins = [];
    for (let coin in currentState) {
        coins.push(currentState[coin]);
    }
    resp.json(coins);
});
app.get('/coins/:coin', (req, resp) => {
    const coin = req.params.coin;
    if(currentState[coin]) {
        resp.json(currentState[coin]);
    } else {
        resp.status(404).send(`No data for ${coin}`)
    }
});

io.on('connection', socket => {
    console.log("Someone just connected.");

    socket.emit('request', /* */); // emit an event to the socket
    io.emit('broadcast', /* */); // emit an event to all connected sockets
    socket.on('reply', () => { /* */ }); // listen to the event
});

server.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }

    console.log(`Server is listening on ${port}`);
});

updateData(conversions);
setInterval(() => {
    updateData(conversions);
}, 480 * 1000);