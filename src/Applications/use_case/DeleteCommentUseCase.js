/* eslint-disable class-methods-use-this */
class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(payload) {
    this._verifyPayload(payload);
    const { threadId, commentId, owner } = payload;
    await this._threadRepository.verifyIdExists(threadId);
    await this._commentRepository.verifyIdExists(commentId);
    await this._commentRepository.verifyOwner(commentId, owner);
    await this._commentRepository.softDeleteById(commentId);
  }

  _verifyPayload({ threadId, commentId, owner }) {
    if (threadId == null || commentId == null || owner == null) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof owner !== 'string') {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteCommentUseCase;
