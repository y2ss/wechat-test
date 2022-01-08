import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class SkuHistory extends BaseModel {

  public static table = 'sku_history'

  @column({ isPrimary: true })
  public id: number

  @column()
  public spuNumber: String

  @column()
  public skuNumber: String

  @column()
  public bundle: String

  @column()
  public updatedBy: number

  @column()
  public version: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
