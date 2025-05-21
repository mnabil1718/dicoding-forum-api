const CommentlikeRepository = require('../../Domains/comment_likes/CommentLikeRepository');

class CommentLikeRepositoryPostgres extends CommentlikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async hasUserLikedComment(owner, commentId) {
    const query = {
      text: 'SELECT FROM comment_likes WHERE owner=$1 AND comment_id=$2',
      values: [owner, commentId],
    };

    const res = await this._pool.query(query);

    return res.rowCount > 0;
  }

  async addLike(owner, commentId) {
    const id = `comment-like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comment_likes (id, owner, comment_id) VALUES ($1, $2, $3)',
      values: [id, owner, commentId],
    };

    await this._pool.query(query);
  }

  async removeLike(owner, commentId) {
    const query = {
      text: `DELETE FROM comment_likes
             WHERE owner=$1 AND comment_id=$2`,
      values: [owner, commentId],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentLikeRepositoryPostgres;
