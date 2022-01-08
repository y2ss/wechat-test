import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class IdValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    number: schema.string(),
  })

  public messages = {
    required: '缺少字段 {{ field }} '
  }
}