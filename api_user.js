//
// app.put('/user', async (req, res) => {...});
//
// Inserts a new user into the database, or if the
// user already exists (based on email) then the
// user's data is updated (name and bucket folder).
// Returns the user's userid in the database.
//

const photoapp_db = require('./photoapp_db.js')

exports.put_user = async (req, res) => {

  console.log("**Call to put /user...");

  try {

    let data = req.body;  // data => JS object
    let email = data["email"]; 
    let lastname = data["lastname"];
    let firstname = data["firstname"];
    let bucketfolder = data["bucketfolder"];

    let search_sql = `
    select * from users where email = ?; 
    `;

    let insert_sql = `
    insert into users (email, lastname, firstname, bucketfolder) 
    values (?,?,?,?); 
    `;
    
    let update_sql = `
    update users set lastname = ?, firstname = ?, bucketfolder = ? 
    where email = ?;
    `;
    


    let mysql_search_promise = query_database(photoapp_db, search_sql, [email]); 
    let search = await mysql_search_promise; 
    if (search.length===0) {
      let mysql_insert_promise = query_database(photoapp_db, insert_sql, [email, lastname, firstname, bucketfolder]);
      let insert_result = await mysql_insert_promise; 
      return res.json({
        "message": "inserted", 
        "userid": insert_result.insertId
      })
    } else {
      let mysql_update_promise = query_database(photoapp_db, update_sql, [lastname, firstname, bucketfolder, email]); 
      let update_result = await mysql_update_promise; 
      return res.json({
        "message": "updated", 
        "userid": search[0].userid
      })
    }
	
  }//try
  catch (err) {
    console.log("**Error in /user");
    console.log(err.message);

    res.status(500).json({
      "message": err.message,
      "userid": -1
    });
  }//catch

}//put

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