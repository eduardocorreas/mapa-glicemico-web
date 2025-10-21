import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Subscription from './subscription.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Plan extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare priceMonthly: number

  @column()
  declare priceYearly: number

  @column()
  declare currency: string

  @column()
  declare trialDays: number

  @column()
  declare isActive: boolean

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Subscription)
  declare subscriptions: HasMany<typeof Subscription>
}
