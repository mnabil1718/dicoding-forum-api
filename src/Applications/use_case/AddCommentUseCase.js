const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(payload) {
    const addComment = new AddComment(payload);
    await this._threadRepository.verifyIdExists(payload.threadId);
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
