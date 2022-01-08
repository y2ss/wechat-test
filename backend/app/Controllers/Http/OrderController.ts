import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import ErrorCode from 'App/Exceptions/ErrorCode'
import ResultBuild from 'App/Utils/Result'
import PageValidator from 'App/Validator/PageValidator'
export default class OrderController {
  public async index() {
    return "<p>Hello</p>"
  }

  /**
   * 获取订单
   */
  public async fetchOrders(ctx: HttpContextContract) {
    await ctx.request.validate(PageValidator)
    let flag = ctx.request.input('flag')
    const query = Database.query()
    if (flag != null && flag != '') {
        query.where('uid', 'like', "%" + ctx.request.input('uid') + "%")
    }
    const orders = await query.from('order').orderBy('order_number', 'desc')
      .paginate(ctx.request.input("page"), ctx.request.input("limit"));
    return ResultBuild.build(ErrorCode.SUCCESS, orders)
  }


}
