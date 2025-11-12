server emits::

"error" =>{message}

"playerJoinedRoom", {
      success: true,
      message: `Joined room: ${playerId}`,
    }

"betPlaced", {
          success: true,
          message: `You bet ${bet_amount} on ${clan_name}`,
    }    

"last10History", {
        success: true,
        message: "No completed matches yet.",
        history: [],
    }            


    
MatchTimerStart
matchTimerTick
matchStatus
<!-- todo -->
auto match rotation   (done)
total bets (on clan)  (done)
same amount (mean 2x) 
histroy:
display total no of players




server ons::

1."joinRoom" =>{matchId, playerId, username};
    *if not exists create room and joins room


2."placeBet"  =>{ match_uuid, player_id, username, clan_name, bet_amount } = data;
