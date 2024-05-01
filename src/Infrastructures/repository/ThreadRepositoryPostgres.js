const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(thread) {
    const { title, content, owner } = thread;
    const id = `thread-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, content, owner',
      values: [id, title, content, owner, createdAt],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async checkThreadAvailability(payload) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [payload.threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan')
    }
  }

  async findById(id) {
    const threadQuery = {
      text: 'SELECT t.id, t.title, t.content, t.created_at, u.username FROM threads t LEFT JOIN users u ON t.owner=u.id WHERE t.id = $1',
      values: [id],
    };

    const resultThread = await this._pool.query(threadQuery);
    if (!resultThread.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return resultThread.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
