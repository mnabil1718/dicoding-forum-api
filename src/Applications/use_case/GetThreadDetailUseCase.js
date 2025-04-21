const CommentMapper = require('../../Domains/comments/mappers/CommentMapper');

/* eslint-disable class-methods-use-this */
class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    this._verifyPayload(payload);

    const { threadId } = payload;
    await this._threadRepository.verifyIdExists(threadId);
    const thread = await this._threadRepository.getById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    const commentsWithReplies = CommentMapper.mapCommentsWithReplies({ comments, replies });
    thread.setComments(commentsWithReplies);
    return thread;
  }

  _verifyPayload({ threadId }) {
    if (threadId == null) {
      throw new Error('GET_THREAD_DETAIL_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_THREAD_DETAIL_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetThreadDetailUseCase;
