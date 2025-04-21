/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    owner = 'user-123',
    content = 'a new reply',
    commentId = 'comment-123',
    date = undefined,
    isDeleted = false,
  }) {
    const query = {
      text: 'INSERT INTO replies (id, owner, content, comment_id, is_deleted, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, owner, content, commentId, isDeleted, date ?? new Date()],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT * FROM replies 
             WHERE comment_id = $1
             ORDER BY created_at`,
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
