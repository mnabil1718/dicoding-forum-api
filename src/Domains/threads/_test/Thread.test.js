const Thread = require('../entities/Thread');
const Comment = require('../../comments/entities/Comment');

describe('Thread entity', () => {
  it('should throw error when missing required properties', () => {
    const payload = {
      title: 'Missing ID',
      body: 'Body content',
      date: '2025-04-15T00:00:00Z',
      username: 'dicoding',
      comments: [],
    };

    expect(() => new Thread(payload)).toThrow('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when data types are invalid', () => {
    const payload = {
      id: 'thread-123',
      title: 'Sample Title',
      body: 'Body',
      date: '2025-04-15T00:00:00Z',
      username: 123,
    };

    expect(() => new Thread(payload)).toThrow('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when comments is not an array', () => {
    const payload = {
      id: 'thread-123',
      title: 'Sample Title',
      body: 'Thread body content',
      date: '2025-04-15T00:00:00Z',
      username: 'dicoding',
    };

    const comments = new Comment({
      id: 'comment-123',
      username: 'user1',
      date: '2025-04-15T01:00:00Z',
      content: 'A comment',
      isDeleted: false,
    });

    const thread = new Thread(payload);

    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.date).toEqual(payload.date);
    expect(thread.username).toEqual(payload.username);
    expect(() => thread.setComments(comments)).toThrow('THREAD.COMMENTS_NOT_ARRAY');
  });

  it('should throw error when comments contains invalid member', () => {
    const payload = {
      id: 'thread-123',
      title: 'Sample Title',
      body: 'Thread body content',
      date: '2025-04-15T00:00:00Z',
      username: 'dicoding',
    };

    const comments = [
      new Comment({
        id: 'comment-123',
        username: 'user1',
        date: '2025-04-15T01:00:00Z',
        content: 'A comment',
        isDeleted: false,
      }),
      {
        id: 'comment-456',
        username: 'user2',
        date: '2025-04-15T01:00:00Z',
        content: 'A comment',
        isDeleted: true,
      },
    ];

    const thread = new Thread(payload);

    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.date).toEqual(payload.date);
    expect(thread.username).toEqual(payload.username);
    expect(() => thread.setComments(comments)).toThrow('THREAD.COMMENTS_CONTAINS_INVALID_MEMBER');
  });

  it('should create Thread correctly with comments', () => {
    const payload = {
      id: 'thread-123',
      title: 'Sample Title',
      body: 'Thread body content',
      date: '2025-04-15T00:00:00Z',
      username: 'dicoding',
    };
    const comments = [
      new Comment({
        id: 'comment-123',
        username: 'user1',
        date: '2025-04-15T01:00:00Z',
        content: 'A comment',
        isDeleted: false,
      }),
      new Comment({
        id: 'comment-456',
        username: 'user2',
        date: '2025-04-15T02:00:00Z',
        content: 'Another comment',
        isDeleted: true,
      }),
    ];

    const thread = new Thread(payload);
    thread.setComments(comments);

    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.date).toEqual(payload.date);
    expect(thread.username).toEqual(payload.username);
    expect(thread.comments).toHaveLength(2);
    expect(thread.comments.every((comment) => comment instanceof Object)).toBe(true);
    expect(thread.comments[0].content).toEqual('A comment');
    expect(thread.comments[1].content).toEqual('**komentar telah dihapus**');
  });
});
