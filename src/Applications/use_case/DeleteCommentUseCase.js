const Comment = require('../../Domains/comments/entities/Comment');

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.checkThreadAvailability(useCasePayload);
    await this._commentRepository.verifyComment(useCasePayload);
    await this._commentRepository.isOwner(useCasePayload);
    return await this._commentRepository.deleteComment(useCasePayload);
  }
}

module.exports = DeleteCommentUseCase;
