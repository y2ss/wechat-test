
import * as amqp from 'amqplib'
import { Connection } from 'amqplib'
import { Channel, Replies } from '~amqplib/index'

class MQPool {

    private static _instance: MQPool
    public static get instance() {
        if (!this._instance) {
            this._instance = new MQPool()
        }
        return this._instance
    }

    // 实际连接缓存 channel及时关闭
    private conn: Connection
    // 生产者和消费者分开
    private consumerConn: Connection

    private constructor() {
        amqp.connect('amqp://y2ss:123456@localhost')
        .then(conn => {
            console.log("connect amqp finished")
            this.conn = conn
        }).catch(err => {
            console.log(err)
        })
        this.registerConsumer()
    }

    public receiveQueueMsg(queueName, receiveCallBack, errCallBack) {
        this.consumerConn.createChannel()
            .then(channel => {
                return channel.assertQueue(queueName)
                    .then(ok => {
                        console.log(ok)
                        return channel.consume(queueName, msg => {
                            console.log("recevie queue")
                            if (msg !== null) {
                                let data = msg.content.toString();
                                if (receiveCallBack && receiveCallBack(data)) {
                                    channel.ack(msg);
                                } else {
                                    // 消息消费失败
                                    // TODO 消费失败消息处理
                                    channel.nack(msg);
                                }
                            }
                        })
                    })
            })
            .catch(err => {
                errCallBack && errCallBack(err)
            });
    }


    // 普通消息
    public async send(exchangeName: string, rountingKey: string, queueName: string, data: any): Promise<boolean> {
        if (this.conn == null) {
            return false
        }
        
        const channel = await this.conn.createChannel()
        const exchange = await channel.assertExchange(exchangeName, "topic", { durable: true, autoDelete: false })
        const queue = await channel.assertQueue(queueName)
        await channel.bindQueue(queue.queue, exchange.exchange, rountingKey, {})
        return channel.publish(exchange.exchange, rountingKey, Buffer.from(JSON.stringify(data)))
    }

    // 延迟消息
    public async delaySend(exchangeName: string, rountingKey: string, queueName: string, data: any, delay: number): Promise<boolean> {
        if (this.conn == null) {
            console.log("rabbitmq connection closed")
            return false
        }
        
        const channel: Channel = await this.conn.createChannel()
        const exchange: Replies.AssertExchange = await channel.assertExchange(exchangeName, 'x-delayed-message', { durable: true, autoDelete: false, arguments: {
            "x-delayed-type": "direct",
        }})
        const queue: Replies.AssertQueue = await channel.assertQueue(queueName)
        console.log("binding queue")
        await channel.bindQueue(queue.queue, exchange.exchange, rountingKey, {})
        console.log("prepare publish")
        try {
            const flag = channel.publish(
                exchange.exchange, 
                rountingKey, 
                // 对bigint处理
                Buffer.from(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v)),
                {
                    headers: {
                        "x-delay": delay * 1000
                    }
                }
            )
            console.log("published")
            return flag
        } catch(error) {
            console.log(error)
        }
        console.log("failed")
        return false;
        
    }

    public close() {
        this.conn.close()
        this.consumerConn.close()
    }

    private async registerConsumer() {
        this.consumerConn = await amqp.connect('amqp://y2ss:a20020202@118.24.64.47')
        console.log("create consumer connection")
    }

}

export default MQPool;