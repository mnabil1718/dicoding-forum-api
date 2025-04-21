/* eslint-disable class-methods-use-this */
class AddComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { content, owner, threadId } = payload;

    this.content = content;
    this.threadId = threadId;
    this.owner = owner;
  }

  _verifyPayload({ content, owner, threadId }) {
    if (content == null || owner == null || threadId == null) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string') {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddComment;
