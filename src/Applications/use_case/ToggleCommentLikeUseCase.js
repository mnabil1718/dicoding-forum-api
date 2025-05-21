/* eslint-disable class-methods-use-this */
class ToggleCommentLikeUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(payload) {
    this._verifyPayload(payload);
    const { threadId, commentId, owner } = payload;
    await this._threadRepository.verifyIdExists(threadId);
    await this._commentRepository.verifyIdExists(commentId);
    const hasLiked = await this._commentLikeRepository.hasUserLikedComment(owner, commentId);

    if (hasLiked) {
      await this._commentLikeRepository.removeLike(owner, commentId);
    } else {
      await this._commentLikeRepository.addLike(owner, commentId);
    }
  }

  _verifyPayload({ threadId, commentId, owner }) {
    if (threadId == null || commentId == null || owner == null) {
      throw new Error('TOGGLE_COMMENT_LIKE_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof owner !== 'string') {
      throw new Error('TOGGLE_COMMENT_LIKE_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ToggleCommentLikeUseCase;
