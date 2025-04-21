const AddComment = require('../entities/AddComment');

describe('an AddComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'comment',
      threadId: 'thread-123',
    };

    expect(() => new AddComment(payload)).toThrow('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      owner: 123,
      content: false,
      threadId: 345,
    };

    expect(() => new AddComment(payload)).toThrow('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddComment object correctly', () => {
    const payload = {
      content: 'content',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const { content, owner, threadId } = new AddComment(payload);

    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(threadId).toEqual(payload.threadId);
  });
});
