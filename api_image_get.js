//
// app.get('/image/:assetid', async (req, res) => {...});
//
// downloads an asset from S3 bucket and sends it back to the
// client as a base64-encoded string.
//
const photoapp_db = require('./photoapp_db.js')
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { photoapp_s3, s3_bucket_name, s3_region_name } = require('./photoapp_s3.js');

exports.get_image = async (req, res) => {

  console.log("**Call to get /image/:assetid...");

  try {
    let assetid = req.params.assetid; 

    console.log("/image-get: calling RDS to get bucketkey..."); 

    let sql = `
    select * from assets where assetid = ?; 
    `;

    let mysql_promise = query_database(photoapp_db, sql, [assetid]); 
    let result = await mysql_promise; 

    if (result.length===0) {
      return res.status(400).json({
        "message": "no such asset...", 
        "user_id": -1, 
        "asset_name": "?", 
        "bucket_key": "?", 
        "data": []
      })
    }

    let bucketkey = result[0]["bucketkey"]; 
    
    console.log("/image-get: calling S3...")
    let input = {
      Bucket: s3_bucket_name, 
      Key: bucketkey
    }
    let command = new GetObjectCommand(input); 
    let S3_promise = photoapp_s3.send(command); 
    let S3_result = await S3_promise;
    var datastr = await S3_result.Body.transformToString("base64"); 

    console.log("/image-get done, sending response...")
    res.json({
      "message": "success", 
      "user_id": result[0]["userid"],
      "asset_name": result[0]["assetname"],
      "bucket_key": result[0]["bucketkey"],
      "data": datastr
    })

  }//try
  catch (err) {
    console.log("**Error in /image");
    console.log(err.message);
    
    res.status(500).json({
      "message": err.message,
      "user_id": -1,
      "asset_name": "?",
      "bucket_key": "?",
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