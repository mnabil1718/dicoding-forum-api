/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'thread-123',
    owner = 'user-123',
    content = 'a new comment',
    threadId = 'thread-123',
    isDeleted = false,
  }) {
    const query = {
      text: 'INSERT INTO comments (id, owner, content, thread_id, is_deleted) VALUES ($1, $2, $3, $4, $5)',
      values: [id, owner, content, threadId, isDeleted],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT * FROM comments 
             WHERE thread_id = $1
             ORDER BY created_at`,
      values: [threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
