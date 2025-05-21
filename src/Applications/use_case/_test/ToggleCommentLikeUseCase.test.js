const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentLikeRepository = require('../../../Domains/comment_likes/CommentLikeRepository');
const ToggleCommentLikeUseCase = require('../ToggleCommentLikeUseCase');

describe('ToggleCommentLikeUseCase', () => {
  it('should throw error when use case payload missing properties', async () => {
    const useCasePayload = {};
    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({});

    await expect(toggleCommentLikeUseCase.execute(useCasePayload))
      .rejects
      .toThrow('TOGGLE_COMMENT_LIKE_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when use case payload not meet data type specification', async () => {
    const useCasePayload = {
      threadId: 123, commentId: false, owner: {},
    };
    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({});

    await expect(toggleCommentLikeUseCase.execute(useCasePayload))
      .rejects
      .toThrow('TOGGLE_COMMENT_LIKE_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating add comment like action correctly if user had not liked the comment', async () => {
    const payload = {
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.hasUserLikedComment = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockCommentLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    await expect(toggleCommentLikeUseCase.execute(payload)).resolves.not.toThrow();
    expect(mockThreadRepository.verifyIdExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyIdExists).toHaveBeenCalledWith('comment-123');
    expect(mockCommentLikeRepository.hasUserLikedComment).toHaveBeenCalledWith('user-123', 'comment-123');
    expect(mockCommentLikeRepository.addLike).toHaveBeenCalledWith('user-123', 'comment-123');
  });

  it('should orchestrating remove comment like action correctly if user already liked the comment', async () => {
    const payload = {
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.hasUserLikedComment = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentLikeRepository.removeLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    await expect(toggleCommentLikeUseCase.execute(payload)).resolves.not.toThrow();
    expect(mockThreadRepository.verifyIdExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyIdExists).toHaveBeenCalledWith('comment-123');
    expect(mockCommentLikeRepository.hasUserLikedComment).toHaveBeenCalledWith('user-123', 'comment-123');
    expect(mockCommentLikeRepository.removeLike).toHaveBeenCalledWith('user-123', 'comment-123');
  });
});
