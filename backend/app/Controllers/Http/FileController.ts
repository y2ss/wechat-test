
import Application from '@ioc:Adonis/Core/Application'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ErrorCode from 'App/Exceptions/ErrorCode'
import ResultBuild from 'App/Utils/Result'
import FileUploadValidator from 'App/Validator/FileUploadValidator'
export default class FileController {
  public async index() {
    return "<p>Hello</p>"
  }

  public async uploadImage(ctx: HttpContextContract) {
    const payload = await ctx.request.validate(FileUploadValidator)
    let dst = Application.tmpPath('uploads')
    await payload.img.move(dst)
    return ResultBuild.build(ErrorCode.SUCCESS, dst)
  }
}
