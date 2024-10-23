//
// app.get('/bucket?startafter=bucketkey', async (req, res) => {...});
//
// Retrieves the contents of the S3 bucket and returns the 
// information about each asset to the client. Note that it
// returns 12 at a time, use startafter query parameter to pass
// the last bucketkey and get the next set of 12, and so on.
//
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { photoapp_s3, s3_bucket_name, s3_region_name } = require('./photoapp_s3.js');

exports.get_bucket = async (req, res) => {

  console.log("**Call to get /bucket...");

  try {
    console.log("/bucket: calling S3...")
    let input = {
      Bucket: s3_bucket_name, 
      MaxKeys: 12
    }
    if (req.query.startafter) {
      input.StartAfter = req.query.startafter; 
    }
    let command = new ListObjectsV2Command(input); 
    let s3_promise = photoapp_s3.send(command); 
    let result = await s3_promise
    let contents = result["Contents"]

    console.log("/bucket done, sending response...")

    if (result["KeyCount"]===0) {
      res.json({
        "message": "success", 
        "data": []
      })
    }

    res.json({
      "message": "success", 
      "data": contents 
    })

  }//try
  catch (err) {
    console.log("**Error in /bucket");
    console.log(err.message);
    
    res.status(500).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get