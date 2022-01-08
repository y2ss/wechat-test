import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import PageValidator from 'App/Validator/PageValidator'
import { Snowflake } from 'App/Utils/SnowFlake'
import Env from '@ioc:Adonis/Core/Env'
import Sku from 'App/Models/Sku'
import PurchaseSkuValidator from 'App/Validator/PurchaseSkuValidator'
import IdValidator from 'App/Validator/IdValidator'
import ErrorCode from 'App/Exceptions/ErrorCode'
import ResultBuild from 'App/Utils/Result'
import MQPool from 'App/Utils/MQPool'
import RedisUtils from 'App/Utils/RedisUtils'
import Order from 'App/Models/Order'
import PaymentValidator from 'App/Validator/PaymentValidator'
import { OrderStatus } from 'App/Enum/OrderStatus'
import Utils from 'App/Utils/Utils'

export default class SaleController {

  constructor() {
    this.registerRemainConsumer()
    this.registerPurchaseConsumer()
  }

  private static REDIS_REMAIN = 2
  private static MYSQL_REMAIN = 1

  public async index() {
    return "<p>Hello</p>"
  }

  /**
   * 获取可购买商品
   */
  public async fetchProducts(ctx: HttpContextContract) {
    await ctx.request.validate(PageValidator)
    let name = ctx.request.input('name')
    const query = Database.query()
    if (name != null && name != '') {
      query.where('title', "like", "%" + name + "%")
    }
    const goods = await query.from('sku').where('is_deleted', 0).where('is_sale', 1).where('is_hot', 0)
      .paginate(ctx.request.input('page'), ctx.request.input('limit'))
    return ResultBuild.build(ErrorCode.SUCCESS, goods.toJSON())
  }

  /**
   * 获取sku详情
   */
  public async fetchProductDetail(ctx: HttpContextContract) {
    await ctx.request.validate(IdValidator)
    const good = await Sku.findBy("sku_number", ctx.request.input('number'))
    if (good == null) {
      return ResultBuild.build(ErrorCode.SKU_NOT_IN_SALE)
    } else {
      return ResultBuild.build(ErrorCode.SUCCESS, good.toJSON())
    }
  }

  /**
   * 普通商品下单
   */
  public async purchaseProduct(ctx: HttpContextContract) {
    await ctx.request.validate(PurchaseSkuValidator)
    const skuNumber = ctx.request.input('skuNumber')
    const good = await Sku.query().where("sku_number", skuNumber).where('is_sale', 1).limit(1).first()
    if (good == null) {
      return ResultBuild.build(ErrorCode.SKU_NOT_IN_SALE)
    }
    const uid: number = ctx.request.input('uid')
    const num: number = ctx.request.input('num') ?? 1
    // 判断库存
    if (good.num < num) {
      return ResultBuild.build(ErrorCode.SKU_NOT_ENOUGH)
    }
    // 预扣库存
    const trx = await Database.transaction()
    try {
      await Sku.query()
        .where('sku_number', skuNumber)
        .where('version', good.version)
        .where('num', '>=', num)
        .update({ version: good.version + 1, num: good.num - num })
        .debug(true)
        .useTransaction(trx)
      console.log("准备扣库存")
      const purchaseTime = BigInt((new Date()).valueOf())
      // 成功发送mq创建订单
      // 两分钟后库存回滚
      console.log("准备发送消息")
      let gen = new Snowflake({ workerId: Number.parseInt(Env.get('PROCESS_ID')), seqBitLength: 7 })
      let orderNumber = "O" + gen.NextNumber().toString()
      const result = await MQPool.instance.delaySend(
        "M-EXCHANGE-DIRECT", "M-ROUNTING-KEY-DIRECT", "M-PURCHASE-DIRECT", {
        skuNumber: skuNumber,
        num: num,
        uid: uid,
        purchaseTime: purchaseTime,
        orderNumber: orderNumber,
        type: SaleController.MYSQL_REMAIN
      }, 120
      )
      console.log("扣库存中")
      if (!result) {
        await trx.rollback()
        return ResultBuild.build(ErrorCode.NETWORK_ERROR)
      }
      // 创建订单
      console.log("创建订单")
      const order = new Order()
      order.orderNumber = orderNumber
      order.skuNumber = skuNumber
      order.uid = uid
      order.buyTime = purchaseTime
      order.num = num
      order.price = good.price * num
      order.useTransaction(trx)
      await order.save()
      // 提交事务
      await trx.commit()
      return ResultBuild.build(ErrorCode.SUCCESS, { orderNumber: order.orderNumber })
    } catch (error) {
      console.log(error)
      await trx.rollback()
    }
    return ResultBuild.build(ErrorCode.NETWORK_ERROR)
  }

  /**
   * 支付
   */
  public async payment(ctx: HttpContextContract) {
    await ctx.request.validate(PaymentValidator)
    const orderNumber = ctx.request.input('orderNumber')
    const order = await Order.query().where("order_number", orderNumber)
      .where('status', OrderStatus.PAYING).limit(1).first()
    if (order == null) {
      return ResultBuild.build(ErrorCode.OREDER_STATUS_ERROR)
    }
    const uid: number = ctx.request.input('uid')
    const trx = await Database.transaction()
    await Order.query()
      .where('order_number', orderNumber)
      .where('version', order.version)
      .update({ version: order.version + 1, status: OrderStatus.SUCCESS })
      .useTransaction(trx)
    try {
      // 支付 优化地方：分布式事务
      if (this.fakePay()) {
        const sku = await Sku.query().where('sku_number', order.skuNumber.toString()).where('is_hot', 1).limit(1).first()
        if (sku != null) {
          sku.num -= order.num
          sku.useTransaction(trx)
          await sku.save()
        }
        this.paymentSuccess(uid, orderNumber)
        await trx.commit()
      } else {
        // 支付失败
        await trx.rollback()
      }
    } catch (error) {
      console.log(error)
      await trx.rollback()
    }
  }

  // 支付成功
  public async paymentSuccess(uid: number, orderNumber: string) {
    const flag = await MQPool.instance.send("M-EXCHANGE", "M-ROUNTING-KEY", "M-PAYMENT", { uid: uid, orderNumber: orderNumber })
    if (!flag) {
      console.log("发送失败")
    }
  }

  private fakePay(): boolean {
    console.log("装假rpc调用支付服务")
    return true
  }

  /**
   * 获取热点商品
   */
  public async fetchHotProduct() {
    // 写死
    try {
      const cache = await RedisUtils.instance.client.get('HOT_GOOD')

      if (cache != null && cache != "") {
        if (cache == "empty") {
          return ResultBuild.build(ErrorCode.EMPTY)
        } else {
          var value = JSON.parse(cache)
          console.log(value)
          let totalRemain = await RedisUtils.instance.client.get(RedisUtils.PRODUCT_REMAIN_KEY + value.sku_number)
          let totalPurchase = await RedisUtils.instance.client.get(RedisUtils.PRODUCT_PURCHASE_KEY + value.sku_number)
          console.log("remain:" + totalRemain + ", current: " + totalPurchase)
          value.num = totalRemain - totalPurchase
          return ResultBuild.build(ErrorCode.SUCCESS, value)
        }
      }
    } catch (error) {
      console.log(error)
    }

    var good = await Sku.query()
      .where('is_deleted', 0).where('is_sale', 1).where('is_hot', 1).limit(1).first()
    if (good == null) {
      // 没有数据种个短空值
      RedisUtils.instance.client.set('HOT_GOOD', "empty", 'EX', 30)
      return ResultBuild.build(ErrorCode.EMPTY)
    }
    // 库存
    let totalRemain = await RedisUtils.instance.client.get(RedisUtils.PRODUCT_REMAIN_KEY + good.skuNumber)
    let totalPurchase = await RedisUtils.instance.client.get(RedisUtils.PRODUCT_PURCHASE_KEY + good.skuNumber)
    good.num = totalRemain - totalPurchase
    RedisUtils.instance.client.set('HOT_GOOD', JSON.stringify(good), 'EX', 120)
    return ResultBuild.build(ErrorCode.SUCCESS, good)
  }

  /**
   * 热点商品下单
   */
  public async hotPurchase(ctx: HttpContextContract) {
    await ctx.request.validate(PurchaseSkuValidator)
    const skuNumber = ctx.request.input('skuNumber')
    const good = await Sku.query().where("sku_number", skuNumber).where('is_sale', 1).limit(1).first()
    if (good == null) {
      return ResultBuild.build(ErrorCode.SKU_NOT_IN_SALE)
    }
    const uid: number = ctx.request.input('uid')
    const num: number = ctx.request.input('num') ?? 1
    let totalRemainKey = RedisUtils.PRODUCT_REMAIN_KEY + skuNumber
    const totalRemain = await RedisUtils.instance.client.get(totalRemainKey)
    if (totalRemain == null) {
      // 回填库存
      const flag = await RedisUtils.instance.tryLock("GET:DL:TT", 5)
      if (flag) {
        await RedisUtils.instance.client.set(totalRemainKey, good.num)
      }
      return ResultBuild.build(ErrorCode.SKU_NOT_ENOUGH)
    }
    let totalPurchaseKey = RedisUtils.PRODUCT_PURCHASE_KEY + skuNumber
    try {
      const remainResult = await RedisUtils.instance.client
        .eval(
          "local remain = redis.call('GET', KEYS[1])\n " +
          "if not remain then\n " +
          "return -1\n " +
          "end \n" +
          "local sku = tonumber(redis.call('GET', KEYS[2]))" +
          "local value = tonumber(remain)\n " +
          "if value < tonumber(sku) then \n" +
          "redis.call('INCRBY', KEYS[1], ARGV[1]) \n" +
          "return 1 \n" +
          "elseif value == tonumber(sku) then \n" +
          "return 0 \n" +
          "end \n" +
          "return -2",
          2,
          totalPurchaseKey,
          totalRemainKey,
          num)
      console.log("remainResult:", remainResult)
      if (remainResult == -2 || remainResult == -1 || remainResult == 0) {
        // 库存不足
        if (remainResult == -1) {
          // 初始化库存
          // lock
          const flag = await RedisUtils.instance.tryLock("GET:DL", 5)
          if (flag) {
            console.log("get lock")
            // 拿到锁 回填缓存
            // double check
            const _v = await RedisUtils.instance.client.get(totalPurchaseKey)
            console.log("当前已用库存:", _v)
            if (_v == null || _v == 0) {
              const count = await Database.query().where('sku_number', skuNumber).where('status', OrderStatus.SUCCESS).from('order').getCount()
              RedisUtils.instance.client.set(totalPurchaseKey, count)
            }
          }
        }
        // 库存丢失的情况回填后 一样当作下单失败处理 当然也可以直接通过 库存增加值-1
        return ResultBuild.build(ErrorCode.SKU_NOT_ENOUGH)
      }
      // 异步通知mysql库存变动
      // 扣库存成功
      // 可优化：可以用mysql保证不超卖 或者 定时校验库存
      const purchaseTime = BigInt((new Date()).valueOf())
      // 成功发送mq创建订单
      // 两分钟后库存回滚
      console.log("准备发送消息")
      let gen = new Snowflake({ workerId: Number.parseInt(Env.get('PROCESS_ID')), seqBitLength: 7 })
      let orderNumber = "O" + gen.NextNumber().toString()
      const result = await MQPool.instance.delaySend(
        "M-EXCHANGE-DIRECT", "M-ROUNTING-KEY-DIRECT", "M-PURCHASE-DIRECT", {
        skuNumber: skuNumber,
        num: num,
        uid: uid,
        purchaseTime: purchaseTime,
        orderNumber: orderNumber,
        type: SaleController.REDIS_REMAIN
      }, 120)
      console.log("扣库存中")
      if (!result) {
        // 回补库存
        RedisUtils.instance.client.incrby(totalPurchaseKey, -num)
        return ResultBuild.build(ErrorCode.NETWORK_ERROR)
      }
      // 创建订单
      console.log("创建订单")
      const order = new Order()
      order.orderNumber = orderNumber
      order.skuNumber = skuNumber
      order.uid = uid
      order.buyTime = purchaseTime
      order.num = num
      order.price = good.price * num
      await order.save()
      console.log("remain:" + await RedisUtils.instance.client.get(totalRemainKey)
        + ", current: " + await RedisUtils.instance.client.get(totalPurchaseKey))
      // 提交事务
      return ResultBuild.build(ErrorCode.SUCCESS, { orderNumber: order.orderNumber })
    } catch (error) {
      console.log(error)
      // 回补库存
      RedisUtils.instance.client.incrby(totalPurchaseKey, -num)
    }
    return ResultBuild.build(ErrorCode.NETWORK_ERROR)
  }


  /**
   * 回退库存消费者
   */
  private async registerRemainConsumer() {
    await Utils.sleep(1500)
    console.log("registerRemainConsumer")
    // 订单回退库存处理
    MQPool.instance.receiveQueueMsg("M-PURCHASE-DIRECT", onRemainBackCallback, onRemainErrorCallback)
    async function onRemainBackCallback(msg: string): Promise<boolean> {
      console.log(msg)
      const data = JSON.parse(msg)
      let orderNumber: string = data['orderNumber']
      let skuNumber: string = data['skuNumber']
      let num: number = Number(data['num'])
      let type: number = Number(data['type'])
      // 检测订单状态 如果订单是未支付的 归还库存
      try {
        const order = await Order.findBy('order_number', orderNumber)
        if (order != null) {
          // 先检查订单状态 避免处理重复消息
          if (order.status == OrderStatus.PAYING) {
            // 回退
            const trx = await Database.transaction()
            await Order.query()
              .where('order_number', orderNumber)
              .where('version', order.version)
              .update({ version: order.version + 1, status: OrderStatus.INVALID })
              .debug(true)
              .useTransaction(trx)

            if (type == SaleController.MYSQL_REMAIN) {
              const sku = await Sku.findBy('sku_number', skuNumber)
              if (sku != null) {
                sku.num += num
                sku.useTransaction(trx)
                await sku.save()
              }
            } else {
              // TODO redis 异常处理
              RedisUtils.instance.client.incrby(RedisUtils.PRODUCT_PURCHASE_KEY + skuNumber, -num)
            }
            await trx.commit()
            console.log("回退库存成功")
          }
        }
      } catch (error) {
        console.log("回退库存异常")
        console.log(error)
        return false
      }
      return true
    }

    function onRemainErrorCallback(err: Error) {
      console.log(err)
    }
  }


  /**
   * 模拟下游服务
   */
  private async registerPurchaseConsumer() {
    await Utils.sleep(1500)
    console.log("registerPurchaseConsumer")
    // 订单回退库存处理
    MQPool.instance.receiveQueueMsg("M-PAYMENT", onRemainBackCallback, onRemainErrorCallback)
    async function onRemainBackCallback(msg: string): Promise<boolean> {
      console.log("有人购物成功了准备发货", msg)
      return true
    }

    function onRemainErrorCallback(err: Error) {
      console.log(err)
    }
  }


}

