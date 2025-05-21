const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');

describe('CommentLikeRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('hasUserLikedComment function', () => {
    it('should return false when given invalid owner id and comment id', async () => {
      const owner1 = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: owner1, username: 'owner-1' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: owner1 });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: owner1 });
      await CommentLikesTableTestHelper.addCommentLike({ owner: owner1, commentId });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      await expect(commentLikeRepositoryPostgres.hasUserLikedComment('user-124', 'comment-124'))
        .resolves.toBe(false);
    });

    it('should return true when given valid owner id and comment id', async () => {
      const owner1 = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: owner1, username: 'owner-1' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: owner1 });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: owner1 });
      await CommentLikesTableTestHelper.addCommentLike({ owner: owner1, commentId });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      await expect(commentLikeRepositoryPostgres.hasUserLikedComment(owner1, commentId))
        .resolves.toBe(true);
    });
  });

  describe('addLike function', () => {
    it('should persist add comment like correctly', async () => {
      const fakeIdGenerator = () => '123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      await commentLikeRepositoryPostgres.addLike('user-123', 'comment-123');

      const res = await CommentLikesTableTestHelper.findCommentLikeById('comment-like-123');
      expect(res).toHaveLength(1);
    });
  });

  describe('removeLike function', () => {
    it('should persist remove comment like correctly', async () => {
      const fakeIdGenerator = () => '123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await CommentLikesTableTestHelper.addCommentLike({ id: 'comment-like-123', commentId: 'comment-123', owner: 'user-123' });

      await commentLikeRepositoryPostgres.removeLike('user-123', 'comment-123');

      const res = await CommentLikesTableTestHelper.findCommentLikeById('comment-like-123');
      expect(res).toHaveLength(0);
    });
  });
});
