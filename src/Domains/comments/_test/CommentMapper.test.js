/* eslint-disable camelcase */
const Reply = require('../../replies/entities/Reply');
const Comment = require('../entities/Comment');
const CommentMapper = require('../mappers/CommentMapper');

describe('CommentMapper', () => {
  it('should throw error when comments is not an array', () => {
    const comments = new Comment({
      id: 'comment-id',
      username: 'dicoding',
      content: 'a comment',
      date: '2025-04-15T01:00:00Z',
      isDeleted: false,
      likeCount: 0,
    });

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
        date: '2025-04-16T01:00:00Z',
        content: 'A reply',
        isDeleted: false,
        commentId: 'comment-123',
      }),
    ];

    expect(() => CommentMapper.mapCommentsWithReplies({ comments, replies })).toThrow('COMMENT_MAPPER.COMMENTS_NOT_ARRAY');
  });

  it('should throw error when replies is not an array', () => {
    const comments = [
      new Comment({
        id: 'comment-123',
        username: 'dicoding',
        content: 'a comment',
        date: '2025-04-15T01:00:00Z',
        isDeleted: false,
        likeCount: 0,
      }),
      new Comment({
        id: 'comment-456',
        username: 'dicoding',
        content: 'a comment',
        date: '2025-04-15T01:00:00Z',
        isDeleted: false,
        likeCount: 1,
      }),
    ];

    const replies = {};

    expect(() => CommentMapper.mapCommentsWithReplies({ comments, replies })).toThrow('COMMENT_MAPPER.REPLIES_NOT_ARRAY');
  });

  it('should throw error when comments contains invalid member', () => {
    const comments = [
      new Comment({
        id: 'comment-123',
        username: 'dicoding',
        content: 'a comment',
        date: '2025-04-15T01:00:00Z',
        isDeleted: false,
        likeCount: 1,
      }),
      {
        id: 'comment-456',
        username: 'dicoding',
        content: 'a comment',
        date: '2025-04-15T01:00:00Z',
        isDeleted: false,
        likeCount: 0,
      },
    ];

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
        date: '2025-04-16T01:00:00Z',
        content: 'A reply',
        isDeleted: false,
        commentId: 'comment-123',
      }),
    ];

    expect(() => CommentMapper.mapCommentsWithReplies({ comments, replies })).toThrow('COMMENT_MAPPER.COMMENTS_CONTAINS_INVALID_MEMBER');
  });

  it('should throw error when replies contains invalid member', () => {
    const comments = [
      new Comment({
        id: 'comment-123',
        username: 'dicoding',
        content: 'a comment',
        date: '2025-04-15T01:00:00Z',
        isDeleted: false,
        likeCount: 0,
      }),
      new Comment({
        id: 'comment-456',
        username: 'dicoding',
        content: 'a comment',
        date: '2025-04-15T01:00:00Z',
        isDeleted: false,
        likeCount: 0,
      }),
    ];

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
        date: '2025-04-16T01:00:00Z',
        content: 'A reply',
        isDeleted: false,
        commentId: 'comment-123',
      },
    ];

    expect(() => CommentMapper.mapCommentsWithReplies({ comments, replies })).toThrow('COMMENT_MAPPER.REPLIES_CONTAINS_INVALID_MEMBER');
  });

  it('should return comments with replies correctly', () => {
    const comments = [
      new Comment({
        id: 'comment-123',
        username: 'dicoding',
        content: 'a comment',
        date: '2025-04-15T01:00:00Z',
        isDeleted: false,
        likeCount: 1,
      }),
      new Comment({
        id: 'comment-456',
        username: 'dicoding',
        content: 'a comment',
        date: '2025-04-15T01:00:00Z',
        isDeleted: false,
        likeCount: 1,
      }),
    ];

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
        id: 'reply-123',
        username: 'dicoding',
        date: '2025-04-17T01:00:00Z',
        content: 'A reply',
        isDeleted: false,
        commentId: 'comment-123',
      }),
      new Reply({
        id: 'reply-456',
        username: 'dicoding',
        date: '2025-04-16T01:00:00Z',
        content: 'A reply',
        isDeleted: true,
        commentId: 'comment-456',
      }),
      new Reply({
        id: 'reply-456',
        username: 'dicoding',
        date: '2025-04-18T01:00:00Z',
        content: 'A reply',
        isDeleted: true,
        commentId: 'comment-456',
      }),
    ];

    const expectedComment1 = new Comment({
      id: 'comment-123',
      username: 'dicoding',
      content: 'a comment',
      date: '2025-04-15T01:00:00Z',
      isDeleted: false,
      likeCount: 1,
    });
    expectedComment1.setReplies([
      new Reply({
        id: 'reply-123',
        username: 'dicoding',
        date: '2025-04-15T01:00:00Z',
        content: 'A reply',
        isDeleted: false,
        commentId: 'comment-123',
      }),
      new Reply({
        id: 'reply-123',
        username: 'dicoding',
        date: '2025-04-17T01:00:00Z',
        content: 'A reply',
        isDeleted: false,
        commentId: 'comment-123',
      }),
    ]);

    const expectedComment2 = new Comment({
      id: 'comment-456',
      username: 'dicoding',
      content: 'a comment',
      date: '2025-04-15T01:00:00Z',
      isDeleted: false,
      likeCount: 1,
    });
    expectedComment2.setReplies([
      new Reply({
        id: 'reply-456',
        username: 'dicoding',
        date: '2025-04-16T01:00:00Z',
        content: 'A reply',
        isDeleted: true,
        commentId: 'comment-456',
      }),
      new Reply({
        id: 'reply-456',
        username: 'dicoding',
        date: '2025-04-18T01:00:00Z',
        content: 'A reply',
        isDeleted: true,
        commentId: 'comment-456',
      }),
    ]);

    const expectedCommentsWithReplies = [
      expectedComment1,
      expectedComment2,
    ];

    const commentsWithReplies = CommentMapper.mapCommentsWithReplies({ comments, replies });

    expect(commentsWithReplies).toStrictEqual(expectedCommentsWithReplies);
  });
});
