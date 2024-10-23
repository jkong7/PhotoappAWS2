//
// app.get('/users', async (req, res) => {...});
//
// Return all the users from the database:
//
const photoapp_db = require('./photoapp_db.js')

console.log('photoapp_db:', photoapp_db);  // This should log a valid object

exports.get_users = async (req, res) => {

  console.log("**Call to get /users...");

  try {
    console.log("/users: calling RDS to get all users columns...")
    let sql = `
    select * from users order by userid asc; 
    `; 
    let mysql_promise = query_database(photoapp_db, sql); 
    let results = await mysql_promise; 
    
    console.log("/users done, sending response..."); 

    res.json({
      "message": "success", 
      "data": results 
    })

  }//try
  catch (err) {
    console.log("**Error in /users");
    console.log(err.message);
    
    res.status(500).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get


function query_database(db, sql)
{
  let response = new Promise((resolve, reject) => {
    try 
    {
      db.query(sql, (err, results, _) => {
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