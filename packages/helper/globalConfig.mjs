import { globalConfigProd } from "./globalConfig.prod.mjs";
// config value across all projects.  
// if not defined here, use sub-package defined values
// TODO
let globalConfigLocal = {
  mongodbURI: 'mongodb://localhost:27017/',
  mqConnString: 'amqp://localhost',
  // below values both used in worker / scheduler
  // as rabbitmq's producer;
  // and used in pptr
  // as rabbitmq's consumer.
  exchange: 'testPptrTaskDelayExchange001',
  queue: 'testPptrTaskQueue001',
  queueBinding: 'testPptrBindingName',
  // pptr
  pptrThreadNum: 2,
  pptrToWorkerQueue: 'testPptrHistoryQueue001',
  nodemailer: {
    host: '',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: '',
      pass: '',
    },
    from: '',
  }
}

let globalConfig = Object.assign({}, globalConfigLocal, globalConfigProd);


export { globalConfig }