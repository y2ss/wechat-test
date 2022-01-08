import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateSkuValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    skuNumber: schema.string(),
    title: schema.string.nullableAndOptional(),
    image: schema.string.nullableAndOptional(),
    num: schema.number([
      rules.range(0, 999999999)
    ]),
    price: schema.number([
      rules.range(0, 999999999)
    ]),
    onSale: schema.number.nullableAndOptional() // 0 false 1 true
  })

  public messages = {
    required: '缺少字段 {{ field }} '
  }
}