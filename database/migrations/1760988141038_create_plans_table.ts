import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name')
      table.string('slug')
      table.decimal('price_monthly', 10, 2)
      table.decimal('price_yearly', 10, 2)
      table.string('currency').defaultTo('BRL')
      table.integer('trial_days').defaultTo(7)
      table.boolean('is_active').defaultTo(true)
      table.text('description').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
