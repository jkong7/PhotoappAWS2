//
// app.post('/image/:userid', async (req, res) => {...});
//
// Uploads an image to the bucket and updates the database,
// returning the asset id assigned to this image.
//
const photoapp_db = require('./photoapp_db.js')
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { photoapp_s3, s3_bucket_name, s3_region_name } = require('./photoapp_s3.js');

const uuid = require('uuid');

exports.post_image = async (req, res) => {

  console.log("**Call to post /image/:userid...");

  try {

    let data = req.body;  // data => JS object
    let assetname = data["assetname"]; 
    let userid = req.params.userid; 

    let search_sql = `    
    select * from users where userid = ?; 
    `;

    let insert_sql = `
    insert into assets (userid, assetname, bucketkey) values (?, ?, ?);
    `;

    let mysql_search_promise = query_database(photoapp_db, search_sql, [userid]); 
    let search = await mysql_search_promise; 

    if (search.length===0) {
      return res.status(400).json({
        "message": "no such user...", 
        "assetid": -1
      })
    }
    let name = uuid.v4(); 
    name = "/" + name + ".jpg"; 
    let S = req.body.data; 
    let bytes = Buffer.from(S, 'base64'); 

    let input = {
      Bucket: s3_bucket_name, 
      Key: name, 
      Body: bytes, 
      ContentType: "image/jpg", 
      ACL: "public-read"
    }

    let command = new PutObjectCommand(input); 
    try 
    {
      await photoapp_s3.send(command); 
      let insert = await query_database(photoapp_db, insert_sql, [userid, assetname, name]);
      res.json({
        "message": "success", 
        "assetid": insert.insertId
      }) 
    }
    catch (err)
    {
      res.status(400).json({
        "message": err.message, 
        "assetid": -1
      })
    }
	
  }//try
  catch (err) {
    console.log("**Error in /image");
    console.log(err.message);
    
    res.status(500).json({
      "message": err.message,
      "assetid": -1
    });
  }//catch

}//post


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