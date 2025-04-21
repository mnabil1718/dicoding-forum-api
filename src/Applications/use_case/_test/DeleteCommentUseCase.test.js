const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should throw error when use case payload missing properties', async () => {
    const useCasePayload = {};
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when use case payload not meet data type specification', async () => {
    const useCasePayload = { threadId: 123, commentId: false, owner: {} };
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow('DELETE_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    const payload = {
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.softDeleteById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await expect(deleteCommentUseCase.execute(payload)).resolves.not.toThrow();
    expect(mockThreadRepository.verifyIdExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyIdExists).toHaveBeenCalledWith('comment-123');
    expect(mockCommentRepository.verifyOwner).toHaveBeenCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.softDeleteById).toHaveBeenCalledWith('comment-123');
  });
});
