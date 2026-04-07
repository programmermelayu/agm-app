/**
 * Migration: Create Invitations Table
 * Date: 2026-04-07
 * Description: Create the invitations table for RSVP tracking
 */

export async function up(knex) {
  return knex.schema.createTable('invitations', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Foreign Keys
    table
      .uuid('agm_id')
      .notNullable()
      .references('id')
      .inTable('agms')
      .onDelete('CASCADE');

    // Attendee Information
    table.string('attendee_email', 255).notNullable();

    // RSVP Status
    table
      .enum('rsvp_status', ['pending', 'attending', 'not_attending', 'maybe'])
      .notNullable()
      .defaultTo('pending');

    // RSVP Token for secure, stateless RSVP responses
    table.string('rsvp_token', 255).notNullable().unique();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('responded_at').nullable();

    // Indexes for query optimization
    table.index('agm_id');
    table.index('rsvp_token');
    table.unique(['agm_id', 'attendee_email']);
    table.index('created_at');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('invitations');
}
