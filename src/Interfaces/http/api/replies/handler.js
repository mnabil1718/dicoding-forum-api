const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postRepliesHandler = this.postRepliesHandler.bind(this);
    this.deleteRepliesHandler = this.deleteRepliesHandler.bind(this);
  }

  async postRepliesHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const { content } = request.payload;

    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute({
      owner,
      content,
      threadId,
      commentId,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteRepliesHandler(request, h) {
    const { threadId, commentId, replyId } = request.params;
    const { id: owner } = request.auth.credentials;

    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute({
      owner,
      threadId,
      commentId,
      replyId,
    });

    const response = h.response({
      status: 'success',
    });
    return response;
  }
}

module.exports = RepliesHandler;
