const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const Comment = require('../../../Domains/comments/entities/Comment');

describe('CommentRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('verifyIdExists function', () => {
    it('should throw NotFoundError when given invalid id', async () => {
      const id = 'fakeId';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyIdExists(id)).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when given valid id', async () => {
      const fakeId = 'comment-123';
      const fakeThreadId = 'thread-123';
      const fakeUserId = 'user-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await CommentsTableTestHelper.addComment({
        threadId: fakeThreadId,
        owner: fakeUserId,
        id: fakeId,
      });

      expect(commentRepositoryPostgres.verifyIdExists(fakeId)).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyOwner function', () => {
    it('should throw AuthenticationError when given invalid owner id', async () => {
      const owner1 = 'user-123';
      const owner2 = 'user-1234';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: owner1, username: 'owner-1' });
      await UsersTableTestHelper.addUser({ id: owner2, username: 'owner-2' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: owner1 });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: owner2 });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyOwner(commentId, owner1))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError when given valid owner id', async () => {
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, owner });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyOwner(commentId, owner))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      const addComment = new AddComment({
        owner: 'user-123',
        content: 'A New Comment',
        threadId: 'thread-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await UsersTableTestHelper.addUser({ id: addComment.owner });
      await ThreadsTableTestHelper.addThread({ id: addComment.threadId, owner: addComment.owner });

      await commentRepositoryPostgres.addComment(addComment);

      const addedComment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(addedComment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      const addComment = new AddComment({
        owner: 'user-123',
        threadId: 'thread-123',
        content: 'A New Comment',
      });

      const mockAddedComment = new AddedComment({
        id: 'comment-123',
        owner: addComment.owner,
        content: addComment.content,
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await UsersTableTestHelper.addUser({ id: addComment.owner });
      await ThreadsTableTestHelper.addThread({ id: addComment.threadId, owner: addComment.owner });

      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      expect(addedComment).toStrictEqual(mockAddedComment);
    });
  });

  describe('softDeleteById function', () => {
    it('should change isDeleted to true in database', async () => {
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner });
      const newComment = await CommentsTableTestHelper.findCommentById(commentId);
      const { is_deleted: oldIsDeleted } = newComment[0];

      await commentRepositoryPostgres.softDeleteById(commentId);

      const finalComment = await CommentsTableTestHelper.findCommentById(commentId);
      const { is_deleted: newIsDeleted } = finalComment[0];
      expect(finalComment).toHaveLength(1);
      expect(oldIsDeleted).toEqual(false);
      expect(newIsDeleted).toEqual(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments from threadId correctly', async () => {
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        isDeleted: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        threadId: 'thread-123',
        owner: 'user-123',
        isDeleted: true,
      });
      const commentsRaw = await CommentsTableTestHelper.getCommentsByThreadId('thread-123');

      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      expect(comments).toStrictEqual([
        new Comment({
          id: 'comment-123',
          username: 'dicoding',
          content: 'a new comment',
          isDeleted: false,
          date: commentsRaw[0].created_at.toISOString(),
        }),
        new Comment({
          id: 'comment-456',
          username: 'dicoding',
          content: 'a new comment',
          isDeleted: true,
          date: commentsRaw[1].created_at.toISOString(),
        }),
      ]);
    });
  });
});
