import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Account extends BaseModel {

  public static table = 'account'

  @column({ isPrimary: true })
  public id: number

  @column()
  public uid: number

  @column()
  public source: number

  @column()
  public account: String

  @column()
  public pwd: String

  @column()
  public token: String

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
