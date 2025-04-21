const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const Thread = require('../../../Domains/threads/entities/Thread');

describe('ThreadRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('verifyIdExists function', () => {
    it('should throw NotFoundError when given invalid id', async () => {
      const id = 'fakeId';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.verifyIdExists(id)).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when given valid id', async () => {
      const fakeId = 'thread-123';
      const fakeUserId = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeId, owner: fakeUserId });

      await expect(threadRepositoryPostgres.verifyIdExists(fakeId))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyOwner function', () => {
    it('should throw AuthenticationError when given invalid owner id', async () => {
      const owner1 = 'user-123';
      const owner2 = 'user-1234';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: owner1, username: 'owner-1' });
      await UsersTableTestHelper.addUser({ id: owner2, username: 'owner-2' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: owner1 });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.verifyOwner(threadId, owner2))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError when given valid owner id', async () => {
      const owner = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.verifyOwner(threadId, owner))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      const addThread = new AddThread({
        owner: 'user-123',
        title: 'test thread',
        body: 'thread body',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await UsersTableTestHelper.addUser({});

      await threadRepositoryPostgres.addThread(addThread);

      const addedThread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(addedThread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      const addThread = new AddThread({
        owner: 'user-123',
        title: 'test thread',
        body: 'thread body',
      });

      const mockAddedThread = new AddedThread({
        id: 'thread-123',
        owner: addThread.owner,
        title: addThread.title,
        body: addThread.body,
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await UsersTableTestHelper.addUser({});

      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      expect(addedThread).toStrictEqual(mockAddedThread);
    });
  });

  describe('getById function', () => {
    it('should return get thread correctly', async () => {
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRaw = await ThreadsTableTestHelper.findThreadById('thread-123');
      const { created_at: dateRaw } = threadRaw[0];

      const thread = await threadRepositoryPostgres.getById('thread-123');

      expect(thread).toStrictEqual(new Thread({
        id: 'thread-123',
        title: 'test thread',
        body: 'New test thread',
        username: 'dicoding',
        date: dateRaw.toISOString(),
      }));
    });
  });
});
