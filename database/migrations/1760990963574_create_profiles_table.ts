import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').references('id').inTable('users')
      table.string('name')
      table.date('birth_date')
      table.enum('gender', ['male', 'female']).defaultTo('female')
      table.float('weight')
      table.float('height')
      table
        .enum('health_condition', ['type1', 'type2', 'gestational', 'prediabetes', 'none', 'other'])
        .defaultTo('none')
      table.integer('gestational_week').nullable()
      table.enum('activity_level', ['low', 'moderate', 'high']).defaultTo('low')
      table.string('goal') // "reduzir picos", "monitorar gravidez", etc.
      table.boolean('is_primary_profile').defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
