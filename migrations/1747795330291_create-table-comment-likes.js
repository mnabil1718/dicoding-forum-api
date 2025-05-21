/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users',
      referencesConstraintName: 'comment_likes_owner_fk',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comments',
      referencesConstraintName: 'comments_likes_comment_id_fk',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addConstraint('comment_likes', 'unique_owner_comment_like', {
    unique: ['owner', 'comment_id'],
  });

  pgm.createIndex('comment_likes', 'owner');
  pgm.createIndex('comment_likes', 'comment_id');
};

exports.down = (pgm) => {
  pgm.dropIndex('comment_likes', 'owner');
  pgm.dropIndex('comment_likes', 'comment_id');
  pgm.dropTable('comment_likes');
};
