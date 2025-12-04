require('dotenv').config();


let env = process.env.NODE_ENV==="development"?"127.0.0.1" : "0.0.0.0";

module.exports = {

        
        env,
        db:{
            HOST : env,
            USERNAME : process.env.DB_USERNAME || "root",
            PASSWORD : process.env.DB_PASSWORD || "",
            DB_NAME  : process.env.DB_NAME || "socketservice",
            PORT     : process.env.DB_PORT || 3306
        },
        // !todo confirm the clan name cases 
        gameWinx : {
            TigerDragon: {
                clanData: {
                    clanNames: ["tiger", "dragon", "tie"],
                    tiger: { winx: 2 },
                    dragon: { winx: 2 },
                    tie: { winx: 9 },
                    lowestWinx: "tiger",
                    highestWinx: "tie",
                },
            },
            AndarBahar: {
                clanData: {
                    clanNames: ["andar", "bahar",],
                    andar: { winx: 2 },
                    bahar: { winx: 2 },
                    lowestWinx: "andar",
                    highestWinx: "bahar",
                },
            },
            "7Up7Down" : {
                clanData: {
                    clanNames: ["lessThan7", "equalTo7", "moreThan7"],
                    lessThan7: { winx: 2 },
                    equalTo7:  { winx: 9 },
                    moreThan7: { winx: 2 },
                    lowestWinx: "lessThan7",
                    highestWinx: "equalTo7",
                },
            },
            JhandiMunda: {
                clanData: {
                    clanNames: ["fig1", "fig2", "fig3", "fig4", "fig5", "fig6"],
                    fig1: { winx: 5 },
                    fig2: { winx: 5 },
                    fig3: { winx: 5 },
                    fig4: { winx: 5 },
                    fig5: { winx: 5 },
                    fig6: { winx: 5 },
                    lowestWinx: "fig6",
                    highestWinx: "fig1",
                },
            },
            CarRoulette: {
                clanData: {
                    clanNames: ["ferrari", "lamborghini", "porsche", "mercedes", "bmw", "audi", "mahindra", "tataMotors"],
                    ferrari: { winx: 40 },
                    lamborghini: { winx: 25 },
                    porsche: { winx: 15 },
                    mercedes: { winx: 10 },
                    bmw: { winx: 5 },
                    audi: { winx: 5 },
                    mahindra: { winx: 5 },
                    tataMotors: { winx: 5 },
                    lowestWinx: "tataMotors",
                    highestWinx: "ferrari",
                },
            }
        }
    
    }

    /*
Andar Bahar Game
	values
		Andar 
		Bahar
	Time
		time = 15 sec stop bet 
		time = 10 result
		time = 0 game end 
		new game should reset within 3sec or 4sec

7Up 7 Down
	values
		less then 7
		equla to 7
		more then 7
	Time
		time = 15 sec stop bet 
		time = 10 result
		time = 0 game end 
		new game should reset within 3sec or 4sec
		
Jhandi Munda
	values
		Fig 1
		Fig 2
		Fig 3
		Fig 4
		Fig 5
		Fig 6
	Time
		time = 15 sec stop bet 
		time = 10 result
		time = 0 game end 
		new game should reset within 3sec or 4sec
		
Car Roulette
	values
		Ferrari
		Lamborghini
		Porsche
		Mercedes
		BMW
		Audi
		Mahindra
		TataMotors
	Time
		time = 15 sec stop bet 
		time = 10 result
		time = 0 game end 
		new game should reset within 3sec or 4sec
    */