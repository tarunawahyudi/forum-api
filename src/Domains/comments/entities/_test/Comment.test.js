const Comment = require('../Comment');

describe('Comment Entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      wrong: 'xxx',
    };

    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      threadId: true,
      content: 123,
      owner: 'user-123',
    };

    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });


  it('should create thread object correctly', () => {
    const payload = {
      threadId: 'thread-123',
      content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      owner: 'user-123',
    };

    const { threadId, content, owner } = new Comment(payload);
    expect(threadId).toEqual(payload.threadId);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
