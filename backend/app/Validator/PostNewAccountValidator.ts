import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostNewAccountValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    account: schema.string(),
    pwd: schema.string(),
    source: schema.number([
      rules.range(0, 3)
    ])
  })

  public messages = {
    required: '缺少字段 {{ field }} '
  }
}