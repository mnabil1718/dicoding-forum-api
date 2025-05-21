/* eslint-disable camelcase */
const Reply = require('../../replies/entities/Reply');
const Comment = require('../entities/Comment');

describe('a Comment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      content: 'Dicoding Comment',
      username: 'user-123',
    };

    expect(() => new Comment(payload)).toThrow('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      date: '2025-05-10',
      content: false,
      username: 456,
      isDeleted: true,
      likeCount: '',
    };

    expect(() => new Comment(payload)).toThrow('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Comment object correctly when isDeleted true', () => {
    const hiddenContent = '**komentar telah dihapus**';
    const payload = {
      id: 'comment-123',
      date: '2025-05-10',
      content: 'Dicoding Comment',
      username: 'user-123',
      isDeleted: true,
      likeCount: 2,
    };

    const {
      id, username, date, content, likeCount,
    } = new Comment(payload);

    expect(id).toEqual(payload.id);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(hiddenContent);
    expect(username).toEqual(payload.username);
    expect(likeCount).toEqual(payload.likeCount);
  });

  it('should create Comment object correctly when isDeleted false', () => {
    const payload = {
      id: 'comment-123',
      date: '2025-05-10',
      content: 'Dicoding Comment',
      username: 'user-123',
      isDeleted: false,
      likeCount: 1,
    };

    const {
      id, username, date, content, likeCount,
    } = new Comment(payload);

    expect(id).toEqual(payload.id);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
    expect(username).toEqual(payload.username);
    expect(likeCount).toEqual(payload.likeCount);
  });

  it('should throw error when replies is not an array', () => {
    const payload = {
      id: 'comment-123',
      username: 'user1',
      date: '2025-04-15T01:00:00Z',
      content: 'A comment',
      isDeleted: false,
      likeCount: 0,
    };

    const replies = new Reply({
      id: 'reply-123',
      username: 'dicoding',
      date: '2025-04-15T01:00:00Z',
      content: 'A reply',
      isDeleted: false,
      commentId: 'comment-123',
    });

    const comment = new Comment(payload);

    expect(comment.id).toEqual(payload.id);
    expect(comment.title).toEqual(payload.title);
    expect(comment.body).toEqual(payload.body);
    expect(comment.date).toEqual(payload.date);
    expect(comment.username).toEqual(payload.username);
    expect(comment.likeCount).toEqual(payload.likeCount);
    expect(() => comment.setReplies(replies)).toThrow('COMMENT.REPLIES_NOT_ARRAY');
  });

  it('should throw error when replies contains invalid member', () => {
    const payload = {
      id: 'comment-123',
      username: 'user1',
      date: '2025-04-15T01:00:00Z',
      content: 'A comment',
      isDeleted: false,
      likeCount: 0,
    };

    const replies = [
      new Reply({
        id: 'reply-123',
        username: 'dicoding',
        date: '2025-04-15T01:00:00Z',
        content: 'A reply',
        isDeleted: false,
        commentId: 'comment-123',
      }),
      {
        id: 'reply-456',
        username: 'dicoding',
        date: '2025-04-15T01:00:00Z',
        content: 'A reply',
        isDeleted: true,
        commentId: 'comment-123',
      },
    ];

    const comment = new Comment(payload);

    expect(comment.id).toEqual(payload.id);
    expect(comment.title).toEqual(payload.title);
    expect(comment.body).toEqual(payload.body);
    expect(comment.date).toEqual(payload.date);
    expect(comment.username).toEqual(payload.username);
    expect(comment.likeCount).toEqual(payload.likeCount);
    expect(() => comment.setReplies(replies)).toThrow('COMMENT.REPLIES_CONTAINS_INVALID_MEMBER');
  });

  it('should not throw error when replies are valid', () => {
    const payload = {
      id: 'comment-123',
      username: 'user1',
      date: '2025-04-15T01:00:00Z',
      content: 'A comment',
      isDeleted: false,
      likeCount: 1,
    };

    const replies = [
      new Reply({
        id: 'reply-123',
        username: 'dicoding',
        date: '2025-04-15T01:00:00Z',
        content: 'A reply',
        isDeleted: false,
        commentId: 'comment-123',
      }),
      new Reply({
        id: 'reply-456',
        username: 'dicoding',
        date: '2025-04-15T01:00:00Z',
        content: 'A reply',
        isDeleted: true,
        commentId: 'comment-123',
      }),
    ];

    const comment = new Comment(payload);

    expect(comment.id).toEqual(payload.id);
    expect(comment.title).toEqual(payload.title);
    expect(comment.body).toEqual(payload.body);
    expect(comment.date).toEqual(payload.date);
    expect(comment.username).toEqual(payload.username);
    expect(comment.likeCount).toEqual(payload.likeCount);
    expect(() => comment.setReplies(replies)).not.toThrow();
  });
});
