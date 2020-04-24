var amqp = require('amqplib/callback_api');


function sendByAmqp(data){
amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        console.log(error0)
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        console.log(data)
        var queue = 'Diana-queue';
        var msg = data

        channel.assertQueue(queue, {
            durable: false
        });

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));

        console.log(" [x] Sent %s", msg);
    });
    setTimeout(function() {
        connection.close();
    }, 500);
});
}


exports.sendByAmqp=sendByAmqp