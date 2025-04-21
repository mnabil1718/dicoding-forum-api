/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
class Reply {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      id, username, date, content, isDeleted, commentId,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.commentId = commentId;
    this.content = isDeleted ? '**balasan telah dihapus**' : content;
  }

  _verifyPayload({
    id, username, date, content, isDeleted, commentId,
  }) {
    if (id == null
      || username == null
      || date == null
      || content == null
      || isDeleted == null
      || commentId == null) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      || typeof isDeleted !== 'boolean'
      || typeof commentId !== 'string') {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;
