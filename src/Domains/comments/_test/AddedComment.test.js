const AddedComment = require('../entities/AddedComment');

describe('an AddedComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      content: 'Test comment',
    };

    expect(() => new AddedComment(payload)).toThrow('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 123,
      owner: false,
    };

    expect(() => new AddedComment(payload)).toThrow('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'Dicoding Comment',
      owner: 'user-123',
    };

    const { id, content, owner } = new AddedComment(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
