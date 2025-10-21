import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Subscription from './subscription.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare subscriptionId: number

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column()
  declare status: string

  @column()
  declare paymentDate: Date

  @column()
  declare transactionId: string

  @column()
  declare providerResponse: object

  @column()
  declare paymentProvider: string

  @column()
  declare externalId: string

  @column()
  declare cancelledAt: Date

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Subscription)
  declare subscription: BelongsTo<typeof Subscription>
}
