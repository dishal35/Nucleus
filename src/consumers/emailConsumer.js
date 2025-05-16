import { getChannel } from "../utils/rabbitmq.js";
import sendMail from "../utils/sendMail.js";

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

const consumeEmailQueue = async () => {
    const channel = getChannel();
    
    // Setup dead-letter exchange and queue
    await channel.assertExchange("dlx.email", "direct");
    await channel.assertQueue("email.dlq", {
        durable: true,
        arguments: {
            "x-message-ttl": 24 * 60 * 60 * 1000, // 24 hours TTL for dead letters
        }
    });
    await channel.bindQueue("email.dlq", "dlx.email", "email");

    // Setup main email queue with dead-letter configuration
    await channel.assertQueue("emailQueue", {
        durable: true,
        arguments: {
            "x-dead-letter-exchange": "dlx.email",
            "x-dead-letter-routing-key": "email"
        }
    });

    // Setup retry queue
    await channel.assertQueue("email.retry", {
        durable: true,
        arguments: {
            "x-message-ttl": RETRY_DELAY,
            "x-dead-letter-exchange": "",
            "x-dead-letter-routing-key": "emailQueue"
        }
    });

    channel.consume("emailQueue", async (msg) => {
        if (!msg) return;

        try {
            const emailData = JSON.parse(msg.content.toString());
            const retryCount = msg.properties.headers?.["x-retry-count"] || 0;
            
            console.log("🔔 Processing email:", {
                to: emailData.to,
                subject: emailData.subject,
                retryCount
            });

            try {
                await sendMail({
                    email: emailData.to,
                    subject: emailData.subject,
                    html: emailData.html
                });
                
                channel.ack(msg);
                console.log("✅ Email sent successfully");
                
            } catch (error) {
                console.error("❌ Error sending email:", error);
                
                if (retryCount < MAX_RETRIES) {
                    // Increment retry count and send to retry queue
                    const retryMessage = {
                        ...emailData,
                        headers: {
                            "x-retry-count": retryCount + 1
                        }
                    };
                    
                    channel.publish("", "email.retry", Buffer.from(JSON.stringify(retryMessage)), {
                        persistent: true,
                        headers: { "x-retry-count": retryCount + 1 }
                    });
                    
                    channel.ack(msg);
                    console.log(`📤 Message scheduled for retry ${retryCount + 1}/${MAX_RETRIES}`);
                    
                } else {
                    // Max retries reached, send to dead-letter queue
                    console.log("❌ Max retries reached, moving to dead-letter queue");
                    channel.reject(msg, false);
                    
                    // Log failure for monitoring
                    console.error("📝 Email delivery permanently failed:", {
                        to: emailData.to,
                        subject: emailData.subject,
                        error: error.message,
                        retryCount
                    });
                }
            }
        } catch (error) {
            console.error("❌ Error processing message:", error);
            channel.reject(msg, false);
        }
    });

    console.log("✅ Email consumer started with dead-letter and retry support");
};

export default consumeEmailQueue;
