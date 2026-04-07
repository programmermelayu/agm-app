/**
 * Migration: Create Attendance Table
 * Date: 2026-04-07
 * Description: Create the attendance table for tracking AGM check-ins
 */

export async function up(knex) {
  return knex.schema.createTable('attendance', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Foreign Keys
    table
      .uuid('agm_id')
      .notNullable()
      .references('id')
      .inTable('agms')
      .onDelete('CASCADE');

    table
      .uuid('invitation_id')
      .nullable()
      .references('id')
      .inTable('invitations')
      .onDelete('SET NULL');

    // Attendee Information
    table.string('attendee_name', 255).notNullable();
    table.string('attendee_email', 255).notNullable();

    // Check-in Information
    table.timestamp('checked_in_at').notNullable().defaultTo(knex.fn.now());
    table.string('checked_in_by', 255).nullable(); // Email of who checked them in

    // Notes
    table.text('notes').nullable();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes for query optimization
    table.index('agm_id');
    table.index('invitation_id');
    table.index('attendee_email');
    table.index('checked_in_at');
    table.unique(['agm_id', 'attendee_email']); // Prevent duplicate check-ins
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('attendance');
}
