/**
 * Migration: Create Users Table
 * Date: 2026-04-07
 * Description: Create the users table for authentication and user management
 */

export async function up(knex) {
  return knex.schema.createTable('users', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // User Information
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['admin', 'attendee']).notNullable().defaultTo('admin');

    // Timestamps
    table.timestamps(true, true); // created_at, updated_at

    // Indexes for query optimization
    table.index('email');
    table.index('created_at');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('users');
}
