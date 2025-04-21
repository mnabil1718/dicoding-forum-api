const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const payload = {
      owner: 'user-123',
      content: 'My New Reply',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'My New Reply',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedReply({
        id: 'reply-123',
        content: 'My New Reply',
        owner: 'user-123',
      })));

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const addedReply = await addReplyUseCase.execute(payload);

    expect(addedReply).toStrictEqual(mockAddedReply);
    expect(mockThreadRepository.verifyIdExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyIdExists).toHaveBeenCalledWith('comment-123');
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(new AddReply({
      owner: 'user-123',
      content: 'My New Reply',
      commentId: 'comment-123',
      threadId: 'thread-123',
    }));
  });
});
