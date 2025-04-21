/* eslint-disable class-methods-use-this */
class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      content, owner, commentId, threadId,
    } = payload;

    this.content = content;
    this.commentId = commentId;
    this.threadId = threadId;
    this.owner = owner;
  }

  _verifyPayload({
    content, owner, commentId, threadId,
  }) {
    if (content == null || owner == null || commentId == null || threadId == null) {
      throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof commentId !== 'string' || typeof threadId !== 'string') {
      throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddReply;
