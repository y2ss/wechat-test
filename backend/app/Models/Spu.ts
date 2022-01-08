import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Spu extends BaseModel {

  public static table = 'spu'

  @column({ isPrimary: true })
  public id: number

  @column()
  public spuNumber: String

  @column()
  public name: String

  @column()
  public intro: String

  @column()
  public image: String

  @column()
  public updatedBy: number

  @column()
  public isDeleted: number

  @column()
  public version: number

  @column.dateTime({ 
    autoCreate: true,
    serialize: (value: DateTime | null) => {
      return value ? value.setZone('Asia/Shanghai').toFormat('yyyy-MM-dd HH:mm:ss') : value
    }
   })
  public createdAt: DateTime

  @column.dateTime({
    autoCreate: true, 
    autoUpdate: true,
    serialize: (value: DateTime | null) => {
      return value ? value.setZone('Asia/Shanghai').toFormat('yyyy-MM-dd HH:mm:ss') : value
    }
  })
  public updatedAt: DateTime

  public toString = () : string => {
    return `Name (${this.name}), Intro (${this.intro}, image: (${this.image}))`
  }
}
