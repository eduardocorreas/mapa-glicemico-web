import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users')
      table.integer('plan_id').references('id').inTable('plans')
      table
        .enum('status', ['trial', 'active', 'canceled', 'expired', 'past_due'])
        .defaultTo('trial')
      table.date('trial_start_date').nullable()
      table.date('trial_end_date').nullable()
      table.date('start_date').nullable()
      table.date('end_date').nullable()
      table.date('renewal_date').nullable()
      table.timestamp('cancelled_at').nullable()
      table.string('payment_provider').defaultTo('manual') // stripe, pagarme, manual
      table.string('external_id').nullable() // id do subscription no gateway
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
