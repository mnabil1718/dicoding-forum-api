const AddThread = require('../entities/AddThread');

describe('an AddThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'Test thread',
    };

    expect(() => new AddThread(payload)).toThrow('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      owner: 123,
      title: 123,
      body: true,
    };

    expect(() => new AddThread(payload)).toThrow('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddThread object correctly', () => {
    const payload = {
      title: 'Dicoding Thread',
      body: 'Test thread content',
      owner: 'user-123',
    };

    const { title, body, owner } = new AddThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
