import amqp from 'amqplib';
import AppError from './AppError.js';

let connection,channel;

export const connectRabbitMQ = async () => {
    try{
        connection= await amqp.connect(process.env.RABBUITMQ_URL);
        channel = await connection.createChannel();
        console.log("✅ RabbitMQ connected successfully.");
    }
    catch(error){
        throw new AppError("RabbitMQ connection error", 500);
    }
};

export const sendToQueue= async (queue, message) => {
    try{
        await channel.assertQueue(queue,{durable:true});
        channel.sendToQueue(queue,Buffer.from(JSON.stringify(message)),{
            persistent:true,
        });
        console.log(`✅ Message sent to queue ${queue}:`, message);
    }
    catch(error){
        throw new AppError("Error sending message to RabbitMQ", 500);
    }

};

export const getChannel= () => {
    if(!channel){
        throw new AppError("RabbitMQ channel not initialized", 500);
    }
    return channel;
};