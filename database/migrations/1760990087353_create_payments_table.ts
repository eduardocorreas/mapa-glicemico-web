import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('subscription_id').references('id').inTable('subscriptions')
      table.decimal('amount', 10, 2)
      table.string('currency').defaultTo('BRL')
      table.enum('status', ['paid', 'pending', 'failed', 'refunded']).defaultTo('pending')
      table.date('payment_date')
      table.string('transaction_id')
      table.json('provider_response')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
