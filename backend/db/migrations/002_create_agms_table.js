/**
 * Migration: Create AGMs Table
 * Date: 2026-04-07
 * Description: Create the AGMs (Annual General Meetings) table for event management
 */

export async function up(knex) {
  return knex.schema.createTable('agms', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Foreign Key to Users (creator)
    table
      .uuid('created_by')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // AGM Information
    table.string('name', 255).notNullable();
    table.date('date').notNullable();
    table.time('time').notNullable();
    table.string('location', 500).notNullable();

    // Status: draft | scheduled | completed
    table
      .enum('status', ['draft', 'scheduled', 'completed'])
      .notNullable()
      .defaultTo('draft');

    // Timestamps
    table.timestamps(true, true); // created_at, updated_at

    // Indexes for query optimization
    table.index('created_by');
    table.index('date');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('agms');
}
