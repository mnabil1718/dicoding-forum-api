/* istanbul ignore file */
class TestHelper {
  constructor(server) {
    this._server = server;
  }

  async createAuthenticatedUser({ username = 'dicoding', password = 'secret', fullname = 'Dicoding Indonesia' }) {
    const addUserPayload = {
      username,
      password,
      fullname,
    };

    const loginUserPayload = {
      username: addUserPayload.username,
      password: addUserPayload.password,
    };

    await this._server.inject({
      method: 'POST',
      url: '/users',
      payload: addUserPayload,
    });

    const userLogin = await this._server.inject({
      method: 'POST',
      url: '/authentications',
      payload: loginUserPayload,
    });

    const { data: { accessToken } } = await JSON.parse(userLogin.payload);

    return {
      accessToken,
    };
  }

  async createNewThread(accessToken, { title = 'test title', body = 'test body' }) {
    const requestPayload = {
      title,
      body,
    };

    const response = await this._server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { data: { addedThread: { id } } } = await JSON.parse(response.payload);

    return {
      threadId: id,
    };
  }

  async createNewComment(accessToken, { content = 'test comment', threadId = 'thread-123' }) {
    const requestPayload = {
      content,
    };

    const response = await this._server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { data: { addedComment: { id } } } = await JSON.parse(response.payload);

    return {
      commentId: id,
    };
  }

  async createNewReply(accessToken, { content = 'test reply', threadId = 'thread-123', commentId = 'comment-id' }) {
    const requestPayload = {
      content,
    };

    const response = await this._server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { data: { addedReply: { id } } } = await JSON.parse(response.payload);

    return {
      replyId: id,
    };
  }

  async deleteComment(accessToken, { threadId = 'thread-123', commentId = 'comment-123' }) {
    await this._server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async deleteReply(accessToken, { threadId = 'thread-123', commentId = 'comment-123', replyId = 'reply-123' }) {
    await this._server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}

module.exports = TestHelper;
