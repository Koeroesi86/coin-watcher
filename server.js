import express from "express";
import request from "request";

const app = express();
const port = 3000;
request("https://api.coinmarketcap.com/v1/ticker/bitcoin/?convert=GBP", function(error, response, body) {
    body = JSON.parse(body);
    const firstHit = body[0];
    const parsed = {
        symbol: firstHit.symbol,
        name: firstHit.name,
        prices: {
            USD: firstHit.price_usd,
            GBP: firstHit.price_gbp,
            BTC: firstHit.price_btc
        },
        caps: {
            USD: firstHit.market_cap_usd,
            GBP: firstHit.market_cap_gbp
        }
    };
    console.log('firstHit: ', firstHit);
    console.log('parsed: ', parsed);
});

app.get('/', (req, resp) => {
    resp.send('Hello from Express!');
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
});