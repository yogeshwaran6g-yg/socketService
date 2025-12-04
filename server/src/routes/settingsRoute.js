const express = require("express");
const sRouter = express.Router();
const settingsController = require("../controller/settingsController");


sRouter.get("/games", settingsController.fetchGames);
sRouter.get("/fixed-winner", settingsController.fetchFixedWinners);
sRouter.post("/fixed-winner", settingsController.updateFixedWinner);
sRouter.post("/fixed-winner/toggle", settingsController.toggleFixedWinner);
// GET /api/games

module.exports = sRouter;