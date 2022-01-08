import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class FileUploadValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    img: schema.file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png'],
    })
  })

  public messages = {
    required: '缺少字段 {{ field }} '
  }
}