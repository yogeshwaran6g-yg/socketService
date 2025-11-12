require('dotenv').config();


let env = process.env.NODE_ENV==="development"?"127.0.0.1" : "0.0.0.0";

module.exports = {

        
        env,
        db:{
            HOST : env,
            USERNAME : "root",
            PASSWORD : "",
            DB_NAME  : "socketservice"
        },
        

    
    }