var rpio = require('rpio');
var AWS = require('aws-sdk'); //require AWS SDK
// For variables that ask for region input, please use region code such as us-west-2 or us-east-1
AWS.config.update({ accessKeyId: '', secretAccessKey: '', region: 'us-east-1' }); //configure AWS credentials
var snsEast1 = new AWS.SNS({ region: 'us-east-1' }); // establish the SNS connection
var snsEast2 = new AWS.SNS({ region: 'us-east-2' });
var snsWest1 = new AWS.SNS({ region: 'us-west-1' });
var snsWest2 = new AWS.SNS({ region: 'us-west-2' });

var zombieSensor = rpio.open(11, rpio.INPUT, rpio.PULL_DOWN); //setup digital read on Digital pin #11
//var led = rpio.open(3, rpio.OUTPUT, rpio.LOW);
rpio.poll(11, periodicActivity);

var location =
  [
    ["Southpoint Building 1", 30.253333, -81.58907],
    ["Southpoint Building 2", 30.252738, -81.590432],
    ["550 Building 550 Water St.", 30.325798, -81.6650521],
    ["CSX HQ 500 Water St.", 30.324513, -81.664107],
  ]



//logic starts here.


//Function to generate a randomNumber to be used for selecting random cities
function roundedNumberFunc(callback) {

  var randomNumber = Math.random() * (3 - 0) + 0;
  var roundedNumber = Math.round(randomNumber)
  generateAlert(roundedNumber, location) //call the function to send the alert to SNS

}

// function to form the message with a random city and send it to SNS
function generateAlert(roundedNumber, location) {
  console.log("roundedNumber="+roundedNumber)
  var message = '{"message":"A Zombie has been detected in ' + location[roundedNumber][0] + '!", "value":"1", "city":"' + location[roundedNumber][0] + '", "longitude":"' + location[roundedNumber][2] + '", "latitude":"' + location[roundedNumber][1] + '"}'
  var params = {
    Message: message, /* required */
    Subject: "Zombie Alert",
    TopicArn: ""
  };
  publish(params, snsEast1);

  params.TopicArn = "";
  publish(params, snsEast2);

  params.TopicArn = "";
  publish(params, snsWest1);

  params.TopicArn = "";
  publish(params, snsWest2);

  console.log("Zombie Detected")
}

function publish(params, sns) {
  sns.publish(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data + " Message successfully sent to SNS");           // successful response
  });
}

// Period function to run every second and read the sensor vlaue.
function periodicActivity(pin) {
  var sensorValue = rpio.read(pin);
  console.log("sensorValue = " + sensorValue);
  if (sensorValue == 1) {
    roundedNumberFunc() // Sensor value is 1 (motion detected), start function to generate random number and publish message to SNS
  }
  else {
    console.log("The Coast is Clear") //No motion detected
  };
}

