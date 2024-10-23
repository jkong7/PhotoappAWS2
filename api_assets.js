//
// app.get('/assets', async (req, res) => {...});
//
// Return all the assets from the database:
//
const photoapp_db = require('./photoapp_db.js')

exports.get_assets = async (req, res) => {

  console.log("**Call to get /assets...");

  try {
    console.log("/assets: calling RDS to get all assets columns..."); 
    let sql = `
    select * from assets order by assetid asc; 
    `;
    let mysql_promise = query_database(photoapp_db, sql); 
    let results = await mysql_promise; 

    console.log("/assets done, sending response..."); 
    res.json({
      "message": "success", 
      "data": results
    }) 

  }//try
  catch (err) {
    console.log("**Error in /assets");
    console.log(err.message);
    
    res.status(500).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get


function query_database(db, sql, params=[])
{
  let response = new Promise((resolve, reject) => {
    try 
    {
      db.query(sql, params, (err, results, _) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(results);
        }
      });
    }
    catch (err) {
      reject(err);
    }
  });
  return response;
}