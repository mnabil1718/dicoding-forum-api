const AddedReply = require('../entities/AddedReply');

describe('an AddedReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'reply-123',
      content: 'Test reply',
    };

    expect(() => new AddedReply(payload)).toThrow('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 123,
      owner: false,
    };

    expect(() => new AddedReply(payload)).toThrow('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'Dicoding reply',
      owner: 'user-123',
    };

    const { id, content, owner } = new AddedReply(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
