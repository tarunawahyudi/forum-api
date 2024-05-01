const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  it('should delete comment correctly', async () => {
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    const useCasePayload = {
      id: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    mockCommentRepository.deleteComment = jest.fn()
        .mockImplementation(() => Promise.resolve());

    mockThreadRepository.checkThreadAvailability = jest.fn()
        .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyComment = jest.fn()
        .mockImplementation(() => Promise.resolve());

    mockCommentRepository.isOwner = jest.fn()
        .mockImplementation(() => Promise.resolve());


    const deleteThreadUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteThreadUseCase.execute(useCasePayload);
    expect(mockThreadRepository.checkThreadAvailability)
        .toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.verifyComment)
        .toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.isOwner)
        .toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.deleteComment)
        .toBeCalledWith(useCasePayload);
  });
});
