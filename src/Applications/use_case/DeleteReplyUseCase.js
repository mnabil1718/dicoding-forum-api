/* eslint-disable class-methods-use-this */
class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    this._verifyPayload(payload);
    const {
      threadId, commentId, replyId, owner,
    } = payload;
    await this._threadRepository.verifyIdExists(threadId);
    await this._commentRepository.verifyIdExists(commentId);
    await this._replyRepository.verifyIdExists(replyId);
    await this._replyRepository.verifyOwner(replyId, owner);
    await this._replyRepository.softDeleteById(replyId);
  }

  _verifyPayload({
    threadId, commentId, replyId, owner,
  }) {
    if (threadId == null || commentId == null || replyId == null || owner == null) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string'
      || typeof commentId !== 'string'
      || typeof replyId !== 'string'
      || typeof owner !== 'string') {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyUseCase;
