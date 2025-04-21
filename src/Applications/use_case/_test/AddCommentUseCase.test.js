const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const payload = {
      owner: 'user-123',
      content: 'My New Comment',
      threadId: 'thread-123',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'My New Comment',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyIdExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedComment({
        id: 'comment-123',
        content: 'My New Comment',
        owner: 'user-123',
      })));

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const addedComment = await addCommentUseCase.execute(payload);

    expect(addedComment).toStrictEqual(mockAddedComment);
    expect(mockThreadRepository.verifyIdExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(new AddComment({
      owner: 'user-123',
      content: 'My New Comment',
      threadId: 'thread-123',
    }));
  });
});
