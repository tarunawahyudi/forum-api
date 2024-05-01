const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const ShowThreadUseCase = require('../../../../Applications/use_case/ShowThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.findByIdHandler = this.findByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);

    const { title, body: content } = request.payload;
    const { id: owner } = request.auth.credentials;
    const addedThread = await addThreadUseCase.execute({ title, content, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });

    response.code(201);
    return response;
  }

  async findByIdHandler(request, h) {
    const showThreadUseCase = this._container.getInstance(ShowThreadUseCase.name);
    const { threadId } = request.params;

    const result = await showThreadUseCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: {
        thread: result,
      },
    });

    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
