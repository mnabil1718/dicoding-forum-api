const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const TestHelper = require('../../../../tests/TestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 400 when request payload not contain needed property', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});

      const requestPayload = {
        title: null,
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});

      const requestPayload = {
        title: 123,
        body: false,
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted thread', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});

      const requestPayload = {
        title: 'test thread',
        body: 'a new thread',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when given invalid thread Id', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${123}`,
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 200 and return correct thread detail with empty comments', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(0);
    });

    it('should response 200 and return correct thread detail with not empty comments and empty replies', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      await testHelper.createNewComment(accessToken, { threadId });
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });
      await testHelper.deleteComment(accessToken, { threadId, commentId });

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].content).toEqual('test comment');
      expect(responseJson.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
    });

    it('should response 200 and return correct thread detail with not empty comments and not empty replies', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});

      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });
      const { replyId } = await testHelper
        .createNewReply(accessToken, { threadId, commentId });
      await testHelper.createNewReply(accessToken, { threadId, commentId });
      await testHelper.deleteReply(accessToken, { threadId, commentId, replyId });
      await testHelper.deleteComment(accessToken, { threadId, commentId });

      const { commentId: commentId2 } = await testHelper
        .createNewComment(accessToken, { threadId });
      await testHelper.createNewReply(accessToken, { threadId, commentId: commentId2 });
      const { replyId: replyId2 } = await testHelper
        .createNewReply(accessToken, { threadId, commentId: commentId2 });
      await testHelper.deleteReply(accessToken,
        { threadId, commentId: commentId2, replyId: replyId2 });

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();

      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].content).toEqual('**komentar telah dihapus**');
      expect(responseJson.data.thread.comments[1].content).toEqual('test comment');

      expect(responseJson.data.thread.comments[0].replies).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].replies[0].content).toEqual('**balasan telah dihapus**');
      expect(responseJson.data.thread.comments[0].replies[1].content).toEqual('test reply');

      expect(responseJson.data.thread.comments[1].replies).toHaveLength(2);
      expect(responseJson.data.thread.comments[1].replies[0].content).toEqual('test reply');
      expect(responseJson.data.thread.comments[1].replies[1].content).toEqual('**balasan telah dihapus**');
    });
  });
});
