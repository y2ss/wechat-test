import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Logger {
  public async handle(
    { request }: HttpContextContract,
    next: () => Promise<void>
  ) {
    let uid = request.input("uid")
    console.log("用户: " + uid + "请求URL: " + request.url() + "; Method: " + request.method() + "; 参数: " + JSON.stringify(request.all()))
    await next()
  }
}