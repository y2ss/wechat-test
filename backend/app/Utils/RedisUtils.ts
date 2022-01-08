import IORedis, { Redis } from 'ioredis'
import Utils from './Utils'

export default class RedisUtils {

    static uuid: String = Utils.guid()

    private static _instance: RedisUtils
    public static get instance() {
        if (!this._instance) {
            this._instance = new RedisUtils()
        }
        return this._instance
    }

    // redis key
    public static PRODUCT_REMAIN_KEY = "PRODUCT_REMAIN_KEY:"
    public static PRODUCT_PURCHASE_KEY = "PRODUCT_PURCHASE_KEY:"
    public static TOKEN_KEY = "ACCOUNT_TOKEN_KEY"

    public client: Redis
    private constructor() {
        try {
            this.connect()
        } catch(err) {
            console.error(err)
        }
    }

    private connect() {
        this.client = new IORedis({
            port: 6379,          // Redis port
            host: '118.24.64.47',   // Redis host
            family: 4,           // 4 (IPv4) or 6 (IPv6)
            password: 'a20020202',
            db: 0
          })
    }

    /**
     * 分布式锁
     * @param key 
     * @param expire unit: seconds
     */
    public async tryLock(key: String, expire: number): Promise<boolean> {
        let result = await this.client.eval(
            "local lockClientId = redis.call('GET', KEYS[1])\n" +
                "if lockClientId == ARGV[1] then\n" +
                "  redis.call('PEXPIRE', KEYS[1], ARGV[2])\n" +
                "  return 1\n" +
                "elseif not lockClientId then\n" +
                "  redis.call('SET', KEYS[1], ARGV[1], 'PX', ARGV[2])\n" +
                "  return 1\n" +
                "end\n" +
            "return 0",
            1, key, RedisUtils.uuid, expire * 1000
        )
        if (result == 1) return true
        else return false
    }

   
}