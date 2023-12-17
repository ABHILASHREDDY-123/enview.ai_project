const express = require("express");
const app = express.Router();
const fiveMinDiff = 5*60*1000;
var events = [];
var alerts = [];

var thresholdsReached = {
    "highway":0,
    "city_center":0,
    "commercial":0,
    "residential":0
};
const THRESHOLDS = require("./thresholds");
var start = 0;
const shiftEvent = (presTime) =>{
    while(start+1<events.length){
        if(presTime - events[start].timestamp > fiveMinDiff){
          thresholdsReached[events[start].location_type]--;
          start++;
        }
        else{
          break;
        }
    }
}
const GenerateAlert = () =>{
    if(alerts.length){
       const presTime = new Date(Date.now()).getTime();
       const lastTime = new Date(alerts[alerts.length-1].timeStamp).getTime();
       if(presTime-lastTime>fiveMinDiff){
          const alert = {
            alert_id:alerts.length,
            timeStamp : new Date(Date.now()).toISOString()
          }
          alerts.push(alert)
       }
    }
    else {
        let date = new Date(Date.now()).toISOString()
        const alert = {
            alert_id:alerts.length,
            timeStamp:  date
        }
        alerts.push(alert)

    }
}

app.get("/alert/:id",(req,res)=>{
    try{
      const num = Number(req.params.id);
      if(alerts.length<=num){
        res.send({"message":`${num+1} no of alerts have not been generated yet`});
      }
      else {
        res.send(alerts[num])
      }
    }
    catch {
         res.send({"error":"Id must be number from 0 to alerts.length-1"})
    }

})

app.post("/event",(req,res)=>{
   var obj  = req.body;
  const milliseconds = new Date(obj.timestamp).getTime();
  obj.timestamp = milliseconds;
  shiftEvent(milliseconds);
  thresholdsReached[obj.location_type]++;
  events.push(obj);
  for(let key in THRESHOLDS){
    if(thresholdsReached[key]>=THRESHOLDS[key]){
       GenerateAlert()
    }
  }
  console.log(events);
  res.send({"message":`Event added`})
})

module.exports = app;

