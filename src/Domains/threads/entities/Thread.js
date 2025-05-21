/* eslint-disable class-methods-use-this */
const Comment = require('../../comments/entities/Comment');

class Thread {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, title, body, date, username,
    } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
    this.comments = [];
  }

  _verifyPayload({
    id, title, body, date, username,
  }) {
    if (id == null || title == null || body == null || date == null
      || username == null) {
      throw new Error('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof title !== 'string' || typeof body !== 'string'
      || typeof date !== 'string' || typeof username !== 'string') {
      throw new Error('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  setComments(comments) {
    if (!Array.isArray(comments)) {
      throw new Error('THREAD.COMMENTS_NOT_ARRAY');
    }

    const isAnyInvalidComment = comments.some((comment) => !(comment instanceof Comment));
    if (isAnyInvalidComment) {
      throw new Error('THREAD.COMMENTS_CONTAINS_INVALID_MEMBER');
    }

    this.comments = comments.map(({
      id, username, content, date, likeCount, replies,
    }) => ({
      id, username, content, date, likeCount, replies,
    }));
  }
}

module.exports = Thread;
