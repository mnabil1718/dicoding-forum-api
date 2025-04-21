/* eslint-disable camelcase */
const Reply = require('../entities/Reply');

describe('a Reply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'reply-123',
      content: 'Dicoding Reply',
      username: 'user-123',
    };

    expect(() => new Reply(payload)).toThrow('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      date: '2025-05-10',
      content: false,
      username: 456,
      isDeleted: true,
      commentId: 123,
    };

    expect(() => new Reply(payload)).toThrow('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Reply object correctly when isDeleted true', () => {
    const hiddenContent = '**balasan telah dihapus**';
    const payload = {
      id: 'reply-123',
      date: '2025-05-10',
      content: 'Dicoding Reply',
      username: 'user-123',
      isDeleted: true,
      commentId: 'comment-123',
    };

    const {
      id, username, date, content, commentId,
    } = new Reply(payload);

    expect(id).toEqual(payload.id);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(hiddenContent);
    expect(username).toEqual(payload.username);
    expect(commentId).toEqual(payload.commentId);
  });

  it('should create Reply object correctly when isDeleted false', () => {
    const payload = {
      id: 'reply-123',
      date: '2025-05-10',
      content: 'Dicoding Reply',
      username: 'user-123',
      isDeleted: false,
      commentId: 'comment-123',
    };

    const {
      id, username, date, content, commentId,
    } = new Reply(payload);

    expect(id).toEqual(payload.id);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
    expect(username).toEqual(payload.username);
    expect(commentId).toEqual(payload.commentId);
  });
});
