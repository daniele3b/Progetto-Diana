var amqp = require('amqplib/callback_api');
const config=require('config')


function sendByAmqp(data){
amqp.connect(config.get('amqp_server'), function(error0, connection) {
    if (error0) {
        console.log(error0)
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }


        data.push(
            {
                reg_date: "1970-12-12",
                value: 300,
                types: "SO2",
                sensor:"nome_sensore",
                uid:"id",
                lat:"45.7",
                long:"76"
            }
        )
        console.log(data)

        var queue = config.get('amqp_queue');
        var msg = data

        channel.assertQueue(queue, {
            durable: true
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