const AddedThread = require('../entities/AddedThread');

describe('an AddedThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'thread-123',
      title: 'Test thread',
    };

    expect(() => new AddedThread(payload)).toThrow('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: 123,
      owner: true,
    };

    expect(() => new AddedThread(payload)).toThrow('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'Dicoding Thread',
      owner: 'user-123',
    };

    const { id, title, owner } = new AddedThread(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
