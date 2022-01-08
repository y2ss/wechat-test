import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Order extends BaseModel {

  public static table = 'order'

  @column({ isPrimary: true })
  public id: number

  @column()
  public uid: number

  @column()
  public orderNumber: String

  @column()
  public skuNumber: String

  @column()
  public num: number
  
  @column()
  public buyTime: bigint

  @column()
  public price: number

  @column()
  public version: number

  @column()
  public status: number

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
}
