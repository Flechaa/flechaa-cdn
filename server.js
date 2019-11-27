const express = require("express");
const app = express();
const http = require("http");
const fetch = require("node-fetch");

function checkHttps(req, res, next) {
  if (req.get("X-Forwarded-Proto").indexOf("https") != -1) {
    return next();
  } else {
    res.redirect(`https://${req.hostname}${req.url}`);
  }
}

app.set("view engine", "ejs");
app.all("*", checkHttps);
app.use(express.static("public"));

app.get("/", function(request, response) {
  response.render(`${__dirname}/views/index.ejs`);
});

app.get("/invite", (req, res) => {
  res.sendFile(`${__dirname}/views/invite.html`);
});

app.get("/discord", async (req, res) => {
  try {
  const body = await fetch(`https://discordapp.com/api/guilds/535542740138721294/widget.json`).then(res => res.json());
  res.redirect(body.instant_invite)
  } catch {
  res.send('Error')
  }
});

app.get("/leaderboard", (req, res) => {
  res.redirect("/leaderboard/1");
});

app.get("/leaderboard/:page", async function(request, response) {
  const page = Math.abs(parseInt(request.params.page, 10)) || 1;
  try {
    const body = await fetch(`http://flechaa-bot-code.glitch.me/api/get-leaderboard`).then(res => res.json());
    const url = request.url.split('/')[2];
    if (url != page) response.redirect(`/leaderboard/${page}`)
    const perpage = 15;
    const pages = Math.ceil(body.lb.length / perpage);
    if (page > pages) return response.sendStatus(404);
    response.render("leaderboard.ejs", {
      api: body,
      page: page,
      pages: pages,
      perpage: perpage
    });
  } catch (err) {
    response.send("Request Timeout.");
  }
});

app.listen(process.env.PORT);

setInterval(() => {
  http.get("http://flechaa-server.glitch.me/");
}, 120000);
