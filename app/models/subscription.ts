import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Plan from './plan.js'
import Payment from './payment.js'

export default class Subscription extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare planId: number

  @column()
  declare status: string

  @column()
  declare trialStartDate: Date

  @column()
  declare trialEndDate: Date

  @column()
  declare startDate: Date

  @column()
  declare endDate: Date

  @column()
  declare renewalDate: Date

  @column()
  declare cancelledAt: Date

  @column()
  declare paymentProvider: string

  @column()
  declare externalId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Plan)
  declare plan: BelongsTo<typeof Plan>

  @hasOne(() => Payment)
  declare payment: HasOne<typeof Payment>
}
