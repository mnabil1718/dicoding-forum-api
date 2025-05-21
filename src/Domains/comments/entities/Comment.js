/* eslint-disable camelcase */

const Reply = require('../../replies/entities/Reply');

/* eslint-disable class-methods-use-this */
class Comment {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      id,
      username,
      date, content,
      isDeleted,
      likeCount,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.likeCount = likeCount;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
    this.replies = [];
  }

  _verifyPayload({
    id, username, date, content, isDeleted, likeCount,
  }) {
    if (id == null
      || username == null
      || date == null
      || content == null
      || isDeleted == null
      || likeCount == null) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof username !== 'string' || typeof content !== 'string'
      || typeof date !== 'string' || typeof isDeleted !== 'boolean' || typeof likeCount !== 'number') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  setReplies(replies) {
    if (!Array.isArray(replies)) {
      throw new Error('COMMENT.REPLIES_NOT_ARRAY');
    }

    const isAnyInvalidReply = replies.some((reply) => !(reply instanceof Reply));
    if (isAnyInvalidReply) {
      throw new Error('COMMENT.REPLIES_CONTAINS_INVALID_MEMBER');
    }

    this.replies = replies.map(({
      id, username, date, content,
    }) => ({
      id, username, date, content,
    }));
  }
}

module.exports = Comment;
