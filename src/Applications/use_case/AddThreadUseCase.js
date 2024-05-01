const Thread = require('../../Domains/threads/entities/Thread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const thread = new Thread(useCasePayload);
    return await this._threadRepository.addThread(thread);
  }
}

module.exports = AddThreadUseCase;
