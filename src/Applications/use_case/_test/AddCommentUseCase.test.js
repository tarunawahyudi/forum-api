const Comment = require('../../../Domains/comments/entities/Comment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      content: 'Test Content',
      owner: 'user-123'
    };

    const mockResolve = {
      id: 'comment-123',
      threadId: 'thread-123',
      content: useCasePayload.content,
      owner: 'user-123'
    }

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.addComment = jest.fn()
        .mockImplementation(() => Promise.resolve(mockResolve));

    mockThreadRepository.checkThreadAvailability = jest.fn()
        .mockImplementation(() => Promise.resolve());

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await addCommentUseCase.execute(useCasePayload);

    expect(result).toStrictEqual({
      id: 'comment-123',
      threadId: 'thread-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    expect(mockThreadRepository.checkThreadAvailability)
        .toBeCalledWith(useCasePayload);

    expect(mockCommentRepository.addComment).toBeCalledWith(new Comment({
      threadId: useCasePayload.threadId,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
  });
});
