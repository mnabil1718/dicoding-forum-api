const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should throw error when use case payload missing properties', async () => {
    const useCasePayload = {};
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrow('DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when use case payload not meet data type specification', async () => {
    const useCasePayload = {
      threadId: 123, commentId: false, replyId: {}, owner: {},
    };
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrow('DELETE_REPLY_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete reply action correctly', async () => {
    const payload = {
      owner: 'user-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.softDeleteById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(deleteReplyUseCase.execute(payload)).resolves.not.toThrow();
    expect(mockThreadRepository.verifyIdExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyIdExists).toHaveBeenCalledWith('comment-123');
    expect(mockReplyRepository.verifyIdExists).toHaveBeenCalledWith('reply-123');
    expect(mockReplyRepository.verifyOwner).toHaveBeenCalledWith('reply-123', 'user-123');
    expect(mockReplyRepository.softDeleteById).toHaveBeenCalledWith('reply-123');
  });
});
