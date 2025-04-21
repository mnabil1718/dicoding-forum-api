const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const TestHelper = require('../../../../tests/TestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 400 when request payload not contain needed property', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });

      const requestPayload = {};

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });

      const requestPayload = {
        content: 123,
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should respond with 404 when thread id is invalid', async () => {
      const fakeThreadId = 123;
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });

      const requestPayload = {
        content: 'a new comment',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should respond with 404 when comment id is invalid', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});

      const requestPayload = {
        content: 'a new comment',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${123}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 201 and persisted reply', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });

      const requestPayload = {
        content: 'a new reply',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should respond with 404 when thread id is invalid', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });
      const { replyId } = await testHelper.createNewReply(accessToken, { threadId, commentId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${123}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should respond with 404 when comment id is invalid', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });
      const { replyId } = await testHelper.createNewReply(accessToken, { threadId, commentId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${123}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should respond with 404 when reply id is invalid', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });
      await testHelper.createNewReply(accessToken, { threadId, commentId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${123}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ditemukan');
    });

    it('should respond with 403 when owner id is invalid', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken: accessToken1 } = await testHelper.createAuthenticatedUser({ username: 'user1' });
      const { threadId } = await testHelper.createNewThread(accessToken1, {});
      const { commentId } = await testHelper.createNewComment(accessToken1, { threadId });
      const { replyId } = await testHelper.createNewReply(accessToken1, { threadId, commentId });
      const { accessToken: accessToken2 } = await testHelper.createAuthenticatedUser({ username: 'user2' });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak berhak mengakses resource ini');
    });

    it('should response 200 and status success', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });
      const { replyId } = await testHelper.createNewReply(accessToken, { threadId, commentId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
