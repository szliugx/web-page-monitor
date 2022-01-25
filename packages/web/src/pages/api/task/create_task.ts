// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getDB } from '../../../lib';
import { CronTime } from '@webest/web-page-monitor-helper';
import { mongo } from '@webest/web-page-monitor-helper/node';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { 
    cronSyntax, 
    endTime, 
    cssSelector,
    pageURL, 
    userId, 
    mode,
    detectMode,
    detectWord,
  } = req.body;

  // const filter = { cronSyntax, endTime, cssSelector,pageURL, userId, mode };
  let passed = false, errorMsg = [''];
  // get next 5 times
  let nextExecuteTimeArr = CronTime.getNextTimes(cronSyntax, 50);
  // check time between
  [passed, errorMsg] = CronTime.checkTimes(nextExecuteTimeArr);
  // ensure syntax not contain '/'
  if(String(cronSyntax).includes('/')){
    [passed, errorMsg] = [false, ['Please remove / in your syntax, see FAQ for details']]
  }
  let nextExecuteTime;
  let nowTimestamp = Date.now();
  if (nextExecuteTimeArr && nextExecuteTimeArr.length && passed){
    // find 15 minutes later cron time.
    // because we need time to distribute tasks in first time.
    // TODO enhance in future.
    nextExecuteTime = nextExecuteTimeArr.find(v => (v >= nowTimestamp + 15 * 60 * 1000));
  }else{
    return res.status(400).json({ err: 'please check input value.' + Array(errorMsg).join(' ') })
  }
  // have chance not got nextExecuteTime
  if(!nextExecuteTime){
    return res.status(400).json({ err: 'please check input value.' + Array(errorMsg).join(' ') })
  }
  const newDoc = { cronSyntax, endTime, cssSelector,pageURL, userId, mode, nextExecuteTime, 
    detectMode,detectWord,
  };

  let filter = {
    cronSyntax,
    pageURL,
    cssSelector,
    userId,
    mode,
    detectMode,
    detectWord,
  }
  let db = await getDB();
  return mongo.upsertDoc(db, 'task', filter, newDoc, res)
}
