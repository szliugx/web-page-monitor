import { normalChecker, errorChecker } from './checker.mjs';
import * as amqp from 'amqplib';

import { CONFIG } from "./CONFIG.mjs";

let connString = CONFIG.mqConnString

async function main() {

  async function fakeTaskOne (){
    return new Promise((resolve, reject) => {
      setTimeout(function(){
        console.log('fake task executed on', new Date())
        resolve('ok');
      }, 3000)
    })
  }

  async function intervalExecuter (){
    let prevNormalCheckerMinute;
    let prevErrorCheckerMinute;
    let conn = await amqp.connect(connString);
    let channel = await conn.createChannel();

    setInterval(async function(){
      let nowDate = new Date();
      let now = nowDate.valueOf()
      let nowMinute = nowDate.getMinutes();

      // normalChecker will be executed every 5 minutes
      if ( nowMinute % 5 === 0 && prevNormalCheckerMinute !== nowMinute ){
        prevNormalCheckerMinute = nowMinute;
        // setInterval may not await, but errors can be easily catched.
        try {
          await normalChecker(now, conn, channel);
        } catch (error) {
          console.error(error)
        }
      }

      // errorChecker will be executed every 5 minutes
      // errorChecker not send MQ, only change nextExecuteTime
      if ( nowMinute % 5 === 0 && prevErrorCheckerMinute !== nowMinute ){
        prevErrorCheckerMinute = nowMinute;
        // setInterval may not await, but errors can be easily catched.
        try {
          await errorChecker(now);
        } catch (error) {
          console.error(error)
        }
      }

    }, 18*1000);

  }

  function pptrResultSaver(){

  }

  intervalExecuter()
}


main()