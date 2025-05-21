const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const TestHelper = require('../../../../tests/TestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 401 when user not authenticated', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      expect(response.statusCode).toEqual(401);
    });

    it('should respond with 404 when thread id is invalid', async () => {
      const fakeThreadId = 123;
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${fakeThreadId}/comments/${commentId}/likes`,
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

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${123}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = await JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 200 when user have not liked a comment', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const response2 = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = await JSON.parse(response.payload);
      const responseJson2 = await JSON.parse(response2.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      expect(responseJson2.data.thread.comments[0].likeCount).toEqual(1);
    });

    it('should response 200 when user have liked a comment', async () => {
      const server = await createServer(container);
      const testHelper = new TestHelper(server);

      const { accessToken } = await testHelper.createAuthenticatedUser({});
      const { threadId } = await testHelper.createNewThread(accessToken, {});
      const { commentId } = await testHelper.createNewComment(accessToken, { threadId });

      await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const response2 = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = await JSON.parse(response.payload);
      const responseJson2 = await JSON.parse(response2.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      expect(responseJson2.data.thread.comments[0].likeCount).toEqual(0);
    });
  });
});
