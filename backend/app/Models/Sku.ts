import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Sku extends BaseModel {

  public static table = 'sku'

  @column({ isPrimary: true })
  public id: number

  @column()
  public skuNumber: String

  @column()
  public spuNumber: String

  @column()
  public title: String

  @column()
  public num: number
  
  @column()
  public image: String

  @column()
  public price: number

  @column()
  public version: number

  @column()
  public updatedBy: number

  @column()
  public isSale: number

  @column()
  public isDeleted: number

  @column()
  public isHot: number

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
    return `title (${this.title}), num (${this.num}, image: (${this.image}), price: (${this.price}))`
  }
}
