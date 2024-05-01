const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

async function getToken() {
  const server = await createServer(container);

  // registration users
  const userPayload = {
    username: 'admin',
    password: 'admin123',
    fullname: 'Admin Testing',
  };

  await server.inject({
    method: 'POST',
    url: '/users',
    payload: userPayload,
  });

  // authentication users
  const authenticationPayload = {
    username: userPayload.username,
    password: userPayload.password,
  };

  const authResponse = await server.inject({
    method: 'POST',
    url: '/authentications',
    payload: authenticationPayload,
  });

  const authResponseJson = JSON.parse(authResponse.payload);
  return authResponseJson.data.accessToken;
}

async function getThread() {

  await UsersTableTestHelper.addUser({
    id: 'user-123',
    username: 'user',
    password: 'secret',
    fullname: 'User Testing',
  });

  const payload = {
    id: 'thread-123',
    title: 'Test Title',
    content: 'Test Content',
    owner: 'user-123',
  }
  await ThreadsTableTestHelper.addThread(payload);
  return payload.id;
}

async function getComment() {
  const threadId = await getThread();

  const payload = {
    id: 'comment-123',
    owner: 'user-123',
    content: 'test content',
    threadId,
  };

  await CommentsTableTestHelper.addComment(payload);
  return { id: payload.id, threadId };
}

describe('/threads endpoint', () => {
  afterEach(async () =>{
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted threads', async () => {
      const server = await createServer(container);
      const token = await getToken();

      const threadPayload = {
        title: 'test title',
        body: 'test content',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const threadResponseJson = JSON.parse(threadResponse.payload);

      expect(threadResponse.statusCode).toEqual(201);
      expect(threadResponseJson.status).toEqual('success');
      expect(threadResponseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Test Title',
      };
      const server = await createServer(container);
      const token = await getToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 30,
        body: 'Test Content',
      };
      const server = await createServer(container);
      const token = await getToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 400 when title more than 100 character', async () => {
      // Arrange
      const requestPayload = {
        title: 'iebmjhhiqkzmafvgowbuupffxvjijxwdsljsxzszftjifxuichwzomeihxziolwynqxmxxrpdgumarbdosfcnvlitjzrxpydfhzaa',
        body: 'Test Content',
      };
      const server = await createServer(container);
      const token = await getToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena karakter title melebihi batas limit: max_character[100]');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 404 not found when the thread is not available', async () => {
      const server = await createServer(container);
      const token = await getToken();

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/xxx/comments/comment-123`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 not found when the comment is not available', async () => {
      const server = await createServer(container);
      const token = await getToken();
      const threadId = await getThread();

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/xxx`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 403 access forbidden when the user is not granted', async () => {
      const server = await createServer(container);
      const token = await getToken();
      const comment = await getComment();

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${comment.threadId}/comments/${comment.id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak hapus resource ini');
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment in', async () => {
      const server = await createServer(container);
      const token = await getToken();
      const threadId = await getThread();

      const commentPayload = {
        content: 'Test Comment',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const commentResponseJson = JSON.parse(commentResponse.payload);
      expect(commentResponse.statusCode).toEqual(201);
      expect(commentResponseJson.status).toEqual('success');
      expect(commentResponseJson.data.addedComment).toBeDefined();
    });

    it('should response 404 when the threads is not available', async () => {
      const server = await createServer(container);
      const token = await getToken();

      const commentPayload = {
        content: 'Test Comment',
      }

      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-123/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 404 when thread is not found', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'GET',
        url: '/threads/xxx',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should show detail thread when id is correctly', async () => {
      const server = await createServer(container);
      const threadId = await getThread();

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toHaveProperty('thread');
      expect(responseJson.data.thread).toHaveProperty('id');
      expect(responseJson.data.thread).toHaveProperty('title');
      expect(responseJson.data.thread).toHaveProperty('body');
      expect(responseJson.data.thread).toHaveProperty('date');
      expect(responseJson.data.thread).toHaveProperty('username');
      expect(responseJson.data.thread).toHaveProperty('comments');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {

    it('should response 403 access forbidden when the user is not granted', async () => {
      const server = await createServer(container);

      await UsersTableTestHelper.addUser({
        id: 'testing-123',
        fullname: 'testing account',
        username: 'testing',
        password: 'testing123',
      });

      const userPayload = {
        username: 'admin',
        password: 'admin123',
        fullname: 'Admin Testing',
      };

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userPayload,
      });

      // authentication users
      const authenticationPayload = {
        username: userPayload.username,
        password: userPayload.password,
      };

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: authenticationPayload,
      });

      const authResponseJson = JSON.parse(authResponse.payload);
      const token = authResponseJson.data.accessToken;

      // end authentications

      const payloadThread = {
        id: 'thread-123',
        title: 'Test Title',
        content: 'Test Content',
        owner: 'testing-123',
      }
      await ThreadsTableTestHelper.addThread(payloadThread);

      const payloadComment = {
        id: 'comment-123',
        owner: 'testing-123',
        content: 'test content',
        threadId: `${payloadThread.id}`,
      };

      await CommentsTableTestHelper.addComment(payloadComment);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${payloadThread.id}/comments/${payloadComment.id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak hapus resource ini');
    });

    it('should response 404 when comment is not found', async () => {
      const server = await createServer(container);

      const userPayload = {
        username: 'admin',
        password: 'admin123',
        fullname: 'Admin Testing',
      };

      const user = await server.inject({
        method: 'POST',
        url: '/users',
        payload: userPayload,
      });

      const userJson = JSON.parse(user.payload);
      const userId = userJson.data.addedUser.id;

      // authentication users
      const authenticationPayload = {
        username: userPayload.username,
        password: userPayload.password,
      };

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: authenticationPayload,
      });

      const authResponseJson = JSON.parse(authResponse.payload);
      const token = authResponseJson.data.accessToken;

      // end authentications

      const payloadThread = {
        id: 'thread-123',
        title: 'Test Title',
        content: 'Test Content',
        owner: userId,
      }
      await ThreadsTableTestHelper.addThread(payloadThread);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${payloadThread.id}/comments/xxx`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should success delete', async () => {

      const server = await createServer(container);

      const userPayload = {
        username: 'admin',
        password: 'admin123',
        fullname: 'Admin Testing',
      };

      const user = await server.inject({
        method: 'POST',
        url: '/users',
        payload: userPayload,
      });

      const userJson = JSON.parse(user.payload);
      const userId = userJson.data.addedUser.id;

      // authentication users
      const authenticationPayload = {
        username: userPayload.username,
        password: userPayload.password,
      };

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: authenticationPayload,
      });

      const authResponseJson = JSON.parse(authResponse.payload);
      const token = authResponseJson.data.accessToken;

      // end authentications

      const payloadThread = {
        id: 'thread-123',
        title: 'Test Title',
        content: 'Test Content',
        owner: userId,
      }
      await ThreadsTableTestHelper.addThread(payloadThread);

      const payloadComment = {
        id: 'comment-123',
        owner: userId,
        content: 'test content',
        threadId: payloadThread.id,
      };

      await CommentsTableTestHelper.addComment(payloadComment);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${payloadThread.id}/comments/${payloadComment.id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
