const {queryRunner} = require("../config/db");
const { v4: uuidv4 } = require("uuid");


async function createNewMatch() {
  const match_uuid = uuidv4();
  const match_name = `Arena Match ${new Date().toISOString().slice(11, 19)}`;
  await db.query(
    `INSERT INTO matches (match_uuid, match_name, status, created_at)
     VALUES (?, ?, 'pending', NOW())`,
    [match_uuid, match_name]
  );

  // Random clans
  const clans = ["Tiger", "Dragon", "Snake", "Phoenix"];
  const chosen = clans.sort(() => 0.5 - Math.random()).slice(0, 2);

  for (const clan of chosen) {
    await db.query(
      `INSERT INTO match_clans (match_uuid, clan_name) VALUES (?, ?)`,
      [match_uuid, clan]
    );
  }

  console.log(`🎮 Created match: ${match_uuid} with clans ${chosen.join(" vs ")}`);
  return match_uuid;
}

async function startMatch(match_uuid) {
  await db.query(
    `UPDATE matches SET status='ongoing', start_time=NOW() WHERE match_uuid=?`,
    [match_uuid]
  );
  console.log(`⚡ Match started: ${match_uuid}`);
}

async function endMatch(match_uuid) {
  console.log(`🏁 Match ending: ${match_uuid}`);

  // Calculate total bets for each clan
  const [rows] = await db.query(
    `SELECT clan_name, SUM(bet_amount) AS total
     FROM bets
     WHERE match_uuid=?
     GROUP BY clan_name`,
    [match_uuid]
  );

  if (!rows.length) {
    console.log("❌ No bets placed, no winner.");
    await db.query(
      `UPDATE matches SET status='completed', end_time=NOW() WHERE match_uuid=?`,
      [match_uuid]
    );
    return null;
  }

  // Find clan with minimum total
  const winner = rows.reduce((min, row) =>
    row.total < min.total ? row : min
  );

  await db.query(
    `UPDATE matches
     SET status='completed', end_time=NOW(), winner_clan=?
     WHERE match_uuid=?`,
    [winner.clan_name, match_uuid]
  );

  console.log(`🏆 Winner for ${match_uuid}: ${winner.clan_name}`);
  return winner.clan_name;
}

async function matchScheduler(io) {
  console.log("🕒 Arena match scheduler running...");

  async function cycleMatch() {
    const match_uuid = await createNewMatch();

    // Emit pending state to all
    io.to("arenaBets").emit("matchStatus", {
      match_uuid,
      status: "pending",
    });

    // Start after 10 seconds
    setTimeout(async () => {
      await startMatch(match_uuid);

      // Fetch clans for emit
      const [clans] = await db.query(
        `SELECT clan_name FROM match_clans WHERE match_uuid=?`,
        [match_uuid]
      );
      io.to("arenaBets").emit("matchStart", {
        match_uuid,
        clans: clans.map((c) => c.clan_name),
      });

      // End after 1 minute
      setTimeout(async () => {
        const winner = await endMatch(match_uuid);

        io.to("arenaBets").emit("matchEnd", {
          match_uuid,
          winner,
        });
      }, 60 * 1000);
    }, 10 * 1000);
  }

  // Run immediately, then every 2 minutes
  await cycleMatch();
  setInterval(cycleMatch, 2 * 60 * 1000);
}

module.exports = { matchScheduler };
