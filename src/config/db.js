const { createPool } = require('mysql2/promise');
const config = require('../config/index.js');

const connPool = createPool({ 

    user : config.db.USERNAME,
    host : config.db.HOST,
    password : config.db.PASSWORD,
    database: config.db.DB_NAME,
    decimalNumbers: true, 
    waitForConnections: true, 
    connectionLimit: 10,     
    queueLimit: 0 ,
    connectTimeout : 10000,
})

async function queryRunner(qry, params = []){ 

    let conn;
    try{
        conn = await createConnection();
        const [result, fields] = await conn.query(qry,params);
        
        return result;
    }
    catch(err){
        console.log("error in queryRunner",err);
        throw new Error("Error on query runner",{cause:err} );
    }
    finally{
        if(conn) await conn.release();
    }
}

async function createConnection(){
    try{
        let conn = await connPool.getConnection();
        if(conn){
            return conn;
        }
        else{
            throw  new Error("Can't get a connection")
        }
    }catch{
        throw  new Error("Can't get a connection")
    }
}

async function transactionQueryRunner(qryParamsData = []){ //data format : [{qry, [params]}, ]

    let conn;   
    try{
        conn = await createConnection();
        await conn.beginTransaction();


        let transactionResult = []
        for (const item of qryParamsData) {
            const [result, fields] = await conn.query(item.qry, item.params);
            transactionResult.push({ result });
        }
        await conn.commit();
        return transactionResult;
    }
    catch(err){
        if(conn) await conn.rollback();
        throw  new Error("Error on transactionQueryRunner", {cause:err});
    }finally{
        if(conn) conn.release();
    }

}

module.exports = {
    queryRunner,
    transactionQueryRunner
}



