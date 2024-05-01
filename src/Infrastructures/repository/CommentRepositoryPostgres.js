const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(payload) {

    const { threadId, content, owner } = payload;

    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, thread_id, content, owner',
      values: [id, threadId, content, owner, createdAt],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async deleteComment(payload) {

    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [payload.id],
    }

    await this._pool.query(query);
  }

  async verifyComment(payload) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [payload.id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async isOwner(payload) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [payload.id],
    };

    const result = await this._pool.query(query);
    const comment = result.rows[0];
    if (comment.owner !== payload.owner) {
      throw new AuthorizationError('anda tidak berhak hapus resource ini');
    }
  }

  async findCommentByThreadId(threadId) {
    const commentQuery = {
      text: 'SELECT c.id, u.username, c.created_at, c.content, c.is_delete FROM comments c LEFT JOIN users u ON c.owner = u.id WHERE c.thread_id = $1',
      values: [threadId]
    }

    const resultComment = await this._pool.query(commentQuery);
    return resultComment.rows;
  }
}

module.exports = CommentRepositoryPostgres;
