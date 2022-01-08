import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateSpuValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    spuNumber: schema.string(),
    spuName: schema.string.nullableAndOptional(),
    intro: schema.string.nullableAndOptional(),
    image: schema.string.nullableAndOptional(),
  })

  public messages = {
    required: '缺少字段 {{ field }} '
  }
}