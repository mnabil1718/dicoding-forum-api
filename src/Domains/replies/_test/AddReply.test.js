const AddReply = require('../entities/AddReply');

describe('an AddReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'comment',
      commentId: 'comment-123',
    };

    expect(() => new AddReply(payload)).toThrow('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      owner: 123,
      content: false,
      commentId: 345,
      threadId: {},
    };

    expect(() => new AddReply(payload)).toThrow('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReply object correctly', () => {
    const payload = {
      content: 'content',
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const {
      content, owner, commentId, threadId,
    } = new AddReply(payload);

    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(commentId).toEqual(payload.commentId);
    expect(threadId).toEqual(payload.threadId);
  });
});
