import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostNewGoodValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    spuName: schema.string(),
    intro: schema.string.nullableAndOptional(),
    image: schema.string.nullableAndOptional(),
  })

  public messages = {
    required: '缺少字段 {{ field }} '
  }
}