import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PageValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    page: schema.number(),
    limit: schema.number(),
  })

  public messages = {
    required: '缺少字段 {{ field }} '
  }
}