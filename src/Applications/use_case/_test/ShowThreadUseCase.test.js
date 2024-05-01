const ShowThreadUseCase = require('../ShowThreadUseCase');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const {use} = require("bcrypt/promises");

describe('ShowThreadUseCase', () => {
  it('should return ThreadDetail with correct data', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    const useCasePayload = {
      id: 'thread-123',
    };

    const mockThread = {
      id: 'thread-123',
      title: 'Test Thread',
      content: 'This is a test thread',
      created_at: '2023-04-21T12:34:56Z',
      username: 'test_user',
    };

    const mockComments = [
      {
        id: 'comment-1',
        username: 'user1',
        created_at: '2023-04-21T12:34:56Z',
        content: 'This is a comment',
        is_delete: false,
      },
      {
        id: 'comment-2',
        username: 'user2',
        created_at: '2023-04-21T12:35:56Z',
        content: 'Another comment',
        is_delete: true,
      },
    ];

    mockThreadRepository.findById = jest.fn().mockResolvedValue(mockThread);
    mockCommentRepository.findCommentByThreadId = jest.fn().mockResolvedValue(mockComments);

    const showThreadUseCase = new ShowThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const constructSpy = jest.spyOn(showThreadUseCase, 'construct');
    const threadDetail = await showThreadUseCase.execute(useCasePayload.id);

    expect(constructSpy).toHaveBeenCalled();
    expect(constructSpy).toBeCalledWith(mockThread, mockComments)
    expect(mockThreadRepository.findById).toBeCalled();
    expect(mockCommentRepository.findCommentByThreadId).toBeCalled();

    expect(mockThreadRepository.findById).toBeCalledWith(useCasePayload.id);
    expect(mockCommentRepository.findCommentByThreadId).toBeCalledWith(threadDetail.id);

    expect(threadDetail).toBeInstanceOf(ThreadDetail);
    expect(threadDetail.id).toBe('thread-123');
    expect(threadDetail.title).toBe('Test Thread');
    expect(threadDetail.body).toBe('This is a test thread');
    expect(threadDetail.date).toBe('2023-04-21T12:34:56Z');
    expect(threadDetail.username).toBe('test_user');

    expect(threadDetail.comments.length).toBe(2);
    expect(threadDetail.comments[0].id).toBe('comment-1');
    expect(threadDetail.comments[0].username).toBe('user1');
    expect(threadDetail.comments[0].date).toBe('2023-04-21T12:34:56Z');
    expect(threadDetail.comments[0].content).toBe('This is a comment');

    expect(threadDetail.comments[1].id).toBe('comment-2');
    expect(threadDetail.comments[1].username).toBe('user2');
    expect(threadDetail.comments[1].date).toBe('2023-04-21T12:35:56Z');
    expect(threadDetail.comments[1].content).toBe('**komentar telah dihapus**');
  });
});
