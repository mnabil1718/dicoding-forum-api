/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comments',
      referencesConstraintName: 'replies_comment_id_fk',
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
      referencesConstraintName: 'replies_owner_fk',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.createIndex('replies', 'owner');
  pgm.createIndex('replies', 'comment_id');
};

exports.down = (pgm) => {
  pgm.dropIndex('replies', 'owner');
  pgm.dropIndex('replies', 'comment_id');
  pgm.dropTable('replies');
};
