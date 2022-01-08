import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RedisUtils from 'App/Utils/RedisUtils'

export default class Auth {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    const jwt = request.header('Authorization', '')
    if (jwt == null || jwt == "") {
      response.unauthorized({ error: '请登陆' })
      return
    }
    const uid = await RedisUtils.instance.client.get(RedisUtils.TOKEN_KEY + jwt)
    if (uid == null || uid == '') {
      response.unauthorized({ error: '请登陆' })
      return
    }
    var body = request.all()
    body['uid'] = uid
    request.updateBody(body)
    await next()
  }
}