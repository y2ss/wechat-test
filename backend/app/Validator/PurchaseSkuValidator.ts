import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PurchaseSkuValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    skuNumber: schema.string(),
    num: schema.number([
      rules.range(0, 999999999)
    ]),
  })

  public messages = {
    required: '缺少字段 {{ field }} '
  }
}