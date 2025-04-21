/* eslint-disable camelcase */
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const Comment = require('../../Domains/comments/entities/Comment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyIdExists(id) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('tidak berhak mengakses resource ini');
    }
  }

  async addComment({ owner, content, threadId }) {
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: `INSERT INTO comments
             (id, content, owner, thread_id) 
             VALUES ($1, $2, $3, $4)
             RETURNING id, content, owner`,
      values: [id, content, owner, threadId],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async softDeleteById(id) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [id],
    };

    return this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT c.id, u.username, c.created_at AS date, c.content, c.is_deleted
             FROM comments c JOIN users u ON c.owner = u.id
             WHERE c.thread_id = $1 ORDER BY c.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    const comments = result.rows.map((row) => new Comment({
      ...row,
      date: row.date.toISOString(),
      isDeleted: row.is_deleted,
    }));
    return comments;
  }
}

module.exports = CommentRepositoryPostgres;
