const CommentRepository = require('../../../Domains/comments/CommentRepository');
const Comment = require('../../../Domains/comments/entities/Comment');
const CommentMapper = require('../../../Domains/comments/mappers/CommentMapper');
const Reply = require('../../../Domains/replies/entities/Reply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const Thread = require('../../../Domains/threads/entities/Thread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should throw error when thread id is missing', async () => {
    const useCasePayload = {};
    const getThreadDetailUseCase = new GetThreadDetailUseCase({});

    await expect(getThreadDetailUseCase.execute(useCasePayload))
      .rejects
      .toThrow('GET_THREAD_DETAIL_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when thread id is not string', async () => {
    const useCasePayload = { threadId: 123 };
    const getThreadDetailUseCase = new GetThreadDetailUseCase({});

    await expect(getThreadDetailUseCase.execute(useCasePayload))
      .rejects
      .toThrow('GET_THREAD_DETAIL_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should get thread detail with empty comments', async () => {
    const useCasePayload = { threadId: 'thread-123' };

    const mockThread = new Thread({
      id: 'thread-123',
      title: 'A Thread',
      body: 'Thread body',
      date: '2025-05-10',
      username: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getById = jest.fn()
      .mockImplementation(() => Promise.resolve(new Thread({
        id: 'thread-123',
        title: 'A Thread',
        body: 'Thread body',
        date: '2025-05-10',
        username: 'user-123',
      })));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const thread = await getThreadDetailUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyIdExists).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getById).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(thread).toStrictEqual(mockThread);
  });

  it('should get thread detail with comments and empty replies', async () => {
    const useCasePayload = { threadId: 'thread-123' };

    const mockThread = new Thread({
      id: 'thread-123',
      title: 'A Thread',
      body: 'Thread body',
      date: '2025-05-10',
      username: 'user-123',
    });

    mockThread.setComments([
      new Comment({
        id: 'comment-123',
        username: 'user-123',
        date: '2025-05-10',
        content: 'A comment',
        isDeleted: false,
      }),
      new Comment({
        id: 'comment-456',
        username: 'user-456',
        date: '2025-05-11',
        content: 'A comment 2',
        isDeleted: true,
      }),
    ]);

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getById = jest.fn()
      .mockImplementation(() => Promise.resolve(new Thread({
        id: 'thread-123',
        title: 'A Thread',
        body: 'Thread body',
        date: '2025-05-10',
        username: 'user-123',
      })));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        new Comment({
          id: 'comment-123',
          username: 'user-123',
          date: '2025-05-10',
          content: 'A comment',
          isDeleted: false,
        }),
        new Comment({
          id: 'comment-456',
          username: 'user-456',
          date: '2025-05-11',
          content: 'A comment 2',
          isDeleted: true,
        }),
      ]));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const thread = await getThreadDetailUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyIdExists).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getById).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(thread).toStrictEqual(mockThread);
  });

  it('should get thread detail with comments and replies', async () => {
    const thread = new Thread({
      id: 'thread-123',
      title: 'A Thread',
      body: 'Thread body',
      date: '2025-05-8',
      username: 'user-123',
    });

    const comments = [
      new Comment({
        id: 'comment-123',
        username: 'user-123',
        date: '2025-05-11',
        content: 'A comment',
        isDeleted: true,
      }),
      new Comment({
        id: 'comment-456',
        username: 'user-123',
        date: '2025-05-11',
        content: 'A comment',
        isDeleted: true,
      }),
    ];

    const replies = [
      new Reply({
        id: 'reply-123',
        username: 'user-123',
        date: '2025-10-11',
        content: 'A reply',
        isDeleted: false,
        commentId: 'comment-123',
      }),
      new Reply({
        id: 'reply-456',
        username: 'user-123',
        date: '2025-10-12',
        content: 'A reply',
        isDeleted: true,
        commentId: 'comment-123',
      }),
    ];

    const commentsWithReplies = CommentMapper.mapCommentsWithReplies({ comments, replies });
    thread.setComments(commentsWithReplies);

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getById = jest.fn()
      .mockImplementation(() => Promise.resolve(new Thread({
        id: 'thread-123',
        title: 'A Thread',
        body: 'Thread body',
        date: '2025-05-8',
        username: 'user-123',
      })));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        new Comment({
          id: 'comment-123',
          username: 'user-123',
          date: '2025-05-11',
          content: 'A comment',
          isDeleted: true,
        }),
        new Comment({
          id: 'comment-456',
          username: 'user-123',
          date: '2025-05-11',
          content: 'A comment',
          isDeleted: true,
        }),
      ]));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        new Reply({
          id: 'reply-123',
          username: 'user-123',
          date: '2025-10-11',
          content: 'A reply',
          isDeleted: false,
          commentId: 'comment-123',
        }),
        new Reply({
          id: 'reply-456',
          username: 'user-123',
          date: '2025-10-12',
          content: 'A reply',
          isDeleted: true,
          commentId: 'comment-123',
        }),
      ]));
    jest.spyOn(CommentMapper, 'mapCommentsWithReplies');

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const threadDetail = await getThreadDetailUseCase.execute({ threadId: 'thread-123' });

    expect(mockThreadRepository.verifyIdExists).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getById).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(CommentMapper.mapCommentsWithReplies).toHaveBeenCalled();
    expect(threadDetail).toStrictEqual(thread);
  });
});
