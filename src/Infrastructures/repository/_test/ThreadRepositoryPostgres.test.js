const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const Thread = require('../../../Domains/threads/entities/Thread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'user',
      password: 'secret',
      fullname: 'User Testing',
    });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread', async () => {
      // arrange
      const thread = new Thread({
        title: 'Test Title',
        content: 'Test Content',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread(thread);
      const resulThread = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(resulThread).toHaveLength(1);
    });

    it('should return response thread correctly', async () => {
      const thread = new Thread({
        title: 'Test Title',
        content: 'Test Content',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const resultThread = await threadRepositoryPostgres.addThread(thread);

      expect(resultThread).toStrictEqual({
        id: 'thread-123',
        title: 'Test Title',
        content: 'Test Content',
        owner: 'user-123',
      });
    });
  });

  describe('checkThreadAvailability function', () => {
    it('should throw NotFoundError when thread is not found', async () => {

      const payload = {
        id: 'thread-123',
        title: 'test-thread',
        owner: 'user-123',
        content: 'test-content',
      }

      await ThreadsTableTestHelper.addThread(payload);

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await expect(threadRepositoryPostgres.checkThreadAvailability({})).rejects
          .toThrow(NotFoundError);
    });

    it('should not throw if thread available', async () => {

      const payload = {
        id: 'thread-123',
        title: 'test-thread',
        owner: 'user-123',
        content: 'test-content',
      }

      await ThreadsTableTestHelper.addThread(payload);
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await expect(threadRepositoryPostgres.checkThreadAvailability({ threadId: payload.id })).resolves.not
          .toThrow(NotFoundError);
    });
  });

  describe('findById function', () => {

    it('should throws not found error when thread is not found', async () => {
      const payload = {
        id: 'thread-123',
        title: 'test-thread',
        owner: 'user-123',
        content: 'test-content',
      }

      await ThreadsTableTestHelper.addThread(payload);

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await expect(threadRepositoryPostgres.findById('thread-12')).rejects.toThrowError(NotFoundError);
    });

    it('should return detail thread', async () => {

      const payload = {
        id: 'thread-123',
        title: 'test-thread',
        owner: 'user-123',
        content: 'test-content',
      }

      await ThreadsTableTestHelper.addThread(payload);

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const resulThread = await threadRepositoryPostgres.findById('thread-123');

      expect(typeof resulThread).toBe('object');

      expect(resulThread).toHaveProperty('content');
      expect(resulThread).toHaveProperty('created_at');
      expect(resulThread).toHaveProperty('id');
      expect(resulThread).toHaveProperty('title');
      expect(resulThread).toHaveProperty('username');

      expect(resulThread.id).toEqual(payload.id);
      expect(resulThread.title).toEqual(payload.title);
      expect(resulThread.username).toEqual('user');
      expect(resulThread.content).toEqual(payload.content);
    });
  });
});
