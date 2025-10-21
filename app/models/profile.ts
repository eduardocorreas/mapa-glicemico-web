import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Measurement from './measurement.js'

export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare birthDate: Date

  @column()
  declare gender: string

  @column()
  declare weight: number

  @column()
  declare height: number

  @column()
  declare healthCondition: string

  @column()
  declare gestationalWeek: number

  @column()
  declare activityLevel: string

  @column()
  declare goal: string

  @column()
  declare isPrimaryProfile: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Measurement)
  declare measurements: HasMany<typeof Measurement>
}
