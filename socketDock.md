

1."joinRoom", data =>{ playerId, username, roomName}(room name should be "TigerDreagon") ;
    *if not exists create room and joins room

    server emits=>
    "roomJoined", {
            success: true,
            message: `player: ${playerId} Joined the ${roomName}`,
          }
          
    "playerJoinedRoom", {
          success: true,
          message: `Joined room: ${playerId}`,
        }
    

2. match and room emits:

    1.'matchTimerStart', {//when the  countdown start, the notify  will happen. only for TigerDragon room 
      matchUuid1,
      countdown: startCountDownSeconds,
      status: 'countdown_started'
    }

      2.'matchTimerTick', {//ticks for 15 sec  only for TigerDragon room
        matchUuid1,
        remaining
    }

    3.'matchStatus', { // when the countdown ends, the notify will happen 
            matchUuid1,
            status: 'started',
            message: 'Match has started!'
    }




3."placeBet" , data =>{match_uuid  player_id  username  clan_name  bet_amount} ()
    "error":{
        message:""
    }  


    1."betPlaced", {
      success: true,
      message: `You bet ${bet_amount} on ${clan_name}`,}


    2."PlayerTotalBetUpdate", {
      match_uuid,
      totals: betSummary
      }




4.match and room emits

        error", {
            message: "Failed to fetch last 10 history.",
        }

        "matchStatus":{
            matchUuid1,
            status: 'ended',
            winner: winClan,
            message: 'Match has ended!'
        }


        "last10History": {
            success: true,
            message: "No completed matches yet.",
            history: [data],
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


