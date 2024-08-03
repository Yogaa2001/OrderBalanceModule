import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'crypto-trading-api',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();

export const produceMessage = async (topic: string, message: any) => {
    await producer.connect();
    await producer.send({
        topic,
        messages: [
            { value: JSON.stringify(message) }
        ]
    });
    await producer.disconnect();
};
