const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const Comment = require('../../../Domains/comments/entities/Comment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {

  beforeEach(async () => {

    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'user',
      password: 'secret',
      fullname: 'User Testing',
    });

    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'Test Title',
      content: 'Test Content',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment', async () => {
      // arrange
      const comment = new Comment({
        threadId: 'thread-123',
        content: 'Test Content',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(comment);
      const resultComment = await CommentTableTestHelper.findCommentsById('comment-123');
      expect(resultComment).toHaveLength(1);
    });

    it('should return response thread correctly', async () => {
      const comment = new Comment({
        threadId: 'thread-123',
        content: 'Test Content',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const resultComment = await commentRepositoryPostgres.addComment(comment);

      expect(resultComment).toStrictEqual({
        id: 'comment-123',
        thread_id: 'thread-123',
        content: 'Test Content',
        owner: 'user-123',
      });
    });


  });

  describe('deleteComment Function', () => {
    it('should success delete comment', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Testing Comment',
        owner: 'user-123',
      });

      const payload = {
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      }

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);


      await expect(commentRepositoryPostgres.deleteComment(payload))
          .resolves.not.toThrowError();

      const result = await CommentTableTestHelper.findCommentsById('comment-123');
      expect(result[0].is_delete).toEqual(true);
    });
  });

  describe('verifyComment function', () => {
    it('should throw not found error when the comment not available', async () => {

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Testing Comment',
        owner: 'user-123',
      });

      const payload = {
        id: 'xxx',
        threadId: 'thread-123',
        owner: 'user-123',
      }

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await expect(commentRepositoryPostgres.verifyComment(payload)).rejects.toThrow(NotFoundError);
    });

    it('should success verify comment', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Testing Comment',
        owner: 'user-123',
      });

      const payload = {
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      }

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await expect(commentRepositoryPostgres.verifyComment(payload)).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('isOwner function', () => {
    it('should throw authorization error when the user is not capability', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Testing Comment',
        owner: 'user-123',
      });

      const payload = {
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'xxx',
      }

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await expect(commentRepositoryPostgres.isOwner(payload)).rejects
          .toThrowError(AuthorizationError);
    });

    it('should success is owner', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Testing Comment',
        owner: 'user-123',
      });

      const payload = {
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      }

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await expect(commentRepositoryPostgres.isOwner(payload)).resolves.not
          .toThrowError(AuthorizationError);
    });
  });

  describe('findCommentByThreadId', () => {
    it('should return response comment', async () => {

      const payload = {
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Testing Comment',
        owner: 'user-123',
        createdAt: new Date('2024-01-01').toISOString(),
      };

      await CommentTableTestHelper.addComment(payload);

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const resultComment = await commentRepositoryPostgres.findCommentByThreadId(payload.threadId);

      expect(resultComment).toHaveLength(1);
      expect(Array.isArray(resultComment)).toBe(true);

      const [ comment ] = resultComment;

      expect(typeof comment).toBe('object');

      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('username');
      expect(comment).toHaveProperty('created_at');
      expect(comment).toHaveProperty('content');
      expect(comment).toHaveProperty('is_delete');

      expect(typeof comment.id).toBe('string');
      expect(typeof comment.username).toBe('string');
      expect(typeof comment.created_at).toBe('string');
      expect(typeof comment.content).toBe('string');
      expect(typeof comment.is_delete).toBe('boolean');

      expect(comment.id).toEqual(payload.id);
      expect(comment.content).toEqual(payload.content);
      expect(comment.username).toEqual(payload.owner.split('-')[0]);
      expect(comment.created_at).toEqual(payload.createdAt);
      expect(comment.is_delete).toBeFalsy();
    });
  });
});
