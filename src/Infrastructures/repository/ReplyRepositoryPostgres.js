/* eslint-disable camelcase */
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const Reply = require('../../Domains/replies/entities/Reply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyIdExists(id) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async verifyOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('tidak berhak mengakses resource ini');
    }
  }

  async addReply({ owner, content, commentId }) {
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: `INSERT INTO replies
             (id, content, owner, comment_id) 
             VALUES ($1, $2, $3, $4)
             RETURNING id, content, owner`,
      values: [id, content, owner, commentId],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async softDeleteById(id) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [id],
    };

    return this._pool.query(query);
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT 
              r.id, u.username, r.created_at AS date, r.content, r.is_deleted, r.comment_id
             FROM replies r 
              JOIN users u ON r.owner = u.id
              JOIN comments c ON r.comment_id = c.id
              JOIN threads t ON c.thread_id = t.id
             WHERE t.id = $1 ORDER BY r.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    const replies = result.rows.map((row) => new Reply({
      ...row,
      commentId: row.comment_id,
      date: row.date.toISOString(),
      isDeleted: row.is_deleted,
    }));
    return replies;
  }
}

module.exports = ReplyRepositoryPostgres;
