const Thread = require('../../../Domains/threads/entities/Thread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'Test Title',
      content: 'Test Content',
      owner: 'user-123',
    };

    const mockResolve = {
      id: 'thread-123',
      title: useCasePayload.title,
      content: useCasePayload.content,
      owner: 'user-123',
    }

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
        .mockImplementation(() => Promise.resolve(mockResolve));

    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const result = await getThreadUseCase.execute(useCasePayload);

    expect(result).toStrictEqual({
      id: 'thread-123',
      title: useCasePayload.title,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    expect(mockThreadRepository.addThread).toBeCalledWith(new Thread({
      title: useCasePayload.title,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
  });
});
