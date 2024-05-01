const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class ShowThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(id) {
    const thread = await this._threadRepository.findById(id);
    const comments = await this._commentRepository.findCommentByThreadId(thread.id);
    return this.construct(thread, comments);
  }

  construct(thread, comments) {

    comments.map((comment) => {
      if (comment.is_delete) {
        comment.content = '**komentar telah dihapus**';
      }
    });

    return new ThreadDetail({
      id: thread.id,
      title: thread.title,
      body: thread.content,
      date: thread.created_at,
      username: thread.username,
      comments: comments.map((comment) => ({
        id: comment.id,
        username: comment.username,
        date: comment.created_at,
        content: comment.content,
      })),
    });
  }
}

module.exports = ShowThreadUseCase;
