import * as amqp from 'amqplib';

async function testRabbitMQSend(){
  // https://rabbitmq.com/tutorials/tutorial-one-javascript.html
  // https://github.com/amqp-node/amqplib#promise-api-example

  let conn = await amqp.connect('amqp://localhost');
  let channel = await conn.createChannel();

  var queue = 'hello';
  var msg = 'Hello world';

  await channel.assertQueue(queue, {
    durable: false
  });

  channel.sendToQueue(queue, Buffer.from(msg));
  console.log(" [x] Sent %s", msg);

  // DO NOT CLOSE the conn!!
  // await conn.close()

}
async function testRabbitMQReceive(){

  let conn = await amqp.connect('amqp://localhost');
  let channel = await conn.createChannel();

  var queue = 'hello';

  console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);


  await channel.assertQueue(queue, {
    durable: false
  });

  await channel.consume(queue, function(message){
    // console.log(message)
    if (message !== null) {
      console.log(" [x] Received %s", message.content.toString());
    }
  }, {
    noAck: true
  })

  // DO NOT CLOSE the conn!!
  // await conn.close()

}

export { testRabbitMQSend, testRabbitMQReceive }