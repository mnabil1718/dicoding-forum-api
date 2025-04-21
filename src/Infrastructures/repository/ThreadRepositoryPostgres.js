const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const Thread = require('../../Domains/threads/entities/Thread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyIdExists(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async verifyOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('tidak berhak mengakses resource ini');
    }
  }

  async addThread({ owner, title, body }) {
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: `INSERT INTO threads (id, title, body, owner) 
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, owner`,
      values: [id, title, body, owner],
    };

    const res = await this._pool.query(query);
    return new AddedThread({ ...res.rows[0] });
  }

  async getById(id) {
    const query = {
      text: `SELECT t.id, t.title, t.body, t.created_at AS date, u.username 
             FROM threads t JOIN users u ON u.id = t.owner 
             WHERE t.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    const { date, ...rest } = result.rows[0];

    return new Thread({ ...rest, date: date.toISOString() });
  }
}

module.exports = ThreadRepositoryPostgres;
