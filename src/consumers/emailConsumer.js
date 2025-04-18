import {getChannel} from "../utils/rabbitmq.js";
import sendMail from "../utils/sendMail.js";

const consumeEmailQueue = async () => {
    const channnel =getChannel();
    await channnel.assertQueue("emailQueue", { durable: true });

    channnel.consume("emailQueue", async(msg)=>{
        if(msg){
            const emailData = JSON.parse(msg.content.toString());
            console.log("🔔 Email data received:", emailData)
            
           try{
            await sendMail({email: emailData.to, subject: emailData.subject, html: emailData.text});
           }
        catch(error){
                console.error("❌ Error sending email:", error);
                channnel.nack(msg); // Requeue the message if there's an error
            }
    }
    });
    }
    export default consumeEmailQueue;
