const Comment = require('../../Domains/comments/entities/Comment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const comment = new Comment(useCasePayload);
    await this._threadRepository.checkThreadAvailability(comment);
    return await this._commentRepository.addComment(comment);
  }
}

module.exports = AddCommentUseCase;
