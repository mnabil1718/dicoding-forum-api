const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    const addReply = new AddReply(payload);
    await this._threadRepository.verifyIdExists(addReply.threadId);
    await this._commentRepository.verifyIdExists(addReply.commentId);
    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
