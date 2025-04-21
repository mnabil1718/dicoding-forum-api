/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'threads',
      referencesConstraintName: 'comments_thread_id_fk',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: 'FALSE',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: false,
      references: 'users',
      referencesConstraintName: 'comments_owner_fk',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.createIndex('comments', 'owner');
  pgm.createIndex('comments', 'thread_id');
};

exports.down = (pgm) => {
  pgm.dropIndex('comments', 'owner');
  pgm.dropIndex('comments', 'thread_id');
  pgm.dropTable('comments');
};
