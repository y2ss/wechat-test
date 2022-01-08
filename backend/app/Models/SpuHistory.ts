import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class SpuHistory extends BaseModel {

  public static table = 'spu_history'

  @column({ isPrimary: true })
  public id: number

  @column()
  public spuNumber: String

  @column()
  public entity: String

  @column()
  public updatedBy: number

  @column()
  public version: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
