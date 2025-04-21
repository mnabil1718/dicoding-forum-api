const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const Reply = require('../../../Domains/replies/entities/Reply');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

describe('ReplyRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('verifyIdExists function', () => {
    it('should throw NotFoundError when given invalid id', async () => {
      const id = 'fakeId';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyIdExists(id)).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when given valid id', async () => {
      const fakeId = 'reply-123';
      const fakeCommentId = 'comment-123';
      const fakeThreadId = 'thread-123';
      const fakeUserId = 'user-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await CommentsTableTestHelper.addComment({
        threadId: fakeThreadId,
        owner: fakeUserId,
        id: fakeCommentId,
      });
      await RepliesTableTestHelper.addReply({
        id: fakeId,
        owner: fakeUserId,
        commentId: fakeCommentId,
      });

      expect(replyRepositoryPostgres.verifyIdExists(fakeId)).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyOwner function', () => {
    it('should throw AuthenticationError when given invalid owner id', async () => {
      const owner1 = 'user-123';
      const owner2 = 'user-1234';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({ id: owner1, username: 'owner-1' });
      await UsersTableTestHelper.addUser({ id: owner2, username: 'owner-2' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: owner1 });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: owner1 });
      await RepliesTableTestHelper.addReply({ id: replyId, owner: owner1, commentId });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyOwner(replyId, owner2))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError when given valid owner id', async () => {
      const owner1 = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({ id: owner1, username: 'owner-1' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: owner1 });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: owner1 });
      await RepliesTableTestHelper.addReply({ id: replyId, owner: owner1, commentId });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyOwner(replyId, owner1))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      const addReply = new AddReply({
        owner: 'user-123',
        content: 'A New Reply',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await UsersTableTestHelper.addUser({ id: addReply.owner });
      await ThreadsTableTestHelper.addThread({ id: addReply.threadId, owner: addReply.owner });
      await CommentsTableTestHelper
        .addComment({
          id: addReply.commentId,
          owner: addReply.owner,
          threadId: addReply.threadId,
        });

      await replyRepositoryPostgres.addReply(addReply);

      const addedReply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(addedReply).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      const addReply = new AddReply({
        owner: 'user-123',
        content: 'A New Reply',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const mockAddedReply = new AddedReply({
        id: 'reply-123',
        content: 'A New Reply',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await UsersTableTestHelper.addUser({ id: addReply.owner });
      await ThreadsTableTestHelper.addThread({ id: addReply.threadId, owner: addReply.owner });
      await CommentsTableTestHelper
        .addComment({
          id: addReply.commentId,
          owner: addReply.owner,
          threadId: addReply.threadId,
        });

      const addedReply = await replyRepositoryPostgres.addReply(addReply);
      expect(addedReply).toStrictEqual(mockAddedReply);
    });
  });

  describe('softDeleteById function', () => {
    it('should change isDeleted to true in database', async () => {
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner });
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner });
      const newReply = await RepliesTableTestHelper.findReplyById(replyId);
      const { is_deleted: oldIsDeleted } = newReply[0];

      await replyRepositoryPostgres.softDeleteById(replyId);

      const finalReply = await RepliesTableTestHelper.findReplyById(replyId);
      const { is_deleted: newIsDeleted } = finalReply[0];
      expect(finalReply).toHaveLength(1);
      expect(oldIsDeleted).toEqual(false);
      expect(newIsDeleted).toEqual(true);
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return replies from threadId correctly', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        isDeleted: false,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'a reply',
        isDeleted: false,
        date: new Date('2025-04-16T22:45:07.371Z'),
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-456',
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'a reply',
        isDeleted: true,
        date: new Date('2025-04-13T22:45:07.371Z'),
      });

      const repliesRaw = await RepliesTableTestHelper.getRepliesByCommentId('comment-123');

      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      expect(replies).toStrictEqual([
        new Reply({
          id: 'reply-456',
          username: 'dicoding',
          content: 'a reply',
          isDeleted: true,
          commentId: 'comment-123',
          date: repliesRaw[0].created_at.toISOString(),
        }),
        new Reply({
          id: 'reply-123',
          username: 'dicoding',
          content: 'a reply',
          isDeleted: false,
          commentId: 'comment-123',
          date: repliesRaw[1].created_at.toISOString(),
        }),
      ]);
    });
  });
});
