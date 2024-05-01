const Reply = require('../Reply');

describe('Reply Entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      commentId: 'comment-123',
    };

    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      commentId: true,
      content: 123,
    };

    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when threadId contains more than 50 character', () => {
    const payload = {
      commentId: 'obcvxjrevdqnaurbtvettmbgdgiznpyyygjfbhfihbvlztlzqyt',
      content: 'Test Content',
    };

    expect(() => new Reply(payload)).toThrowError('REPLY.COMMENT_ID_LIMIT_CHAR');
  });

  it('should create thread object correctly', () => {
    const payload = {
      commentId: 'comment-123',
      content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    };

    const { commentId, content } = new Reply(payload);

    expect(commentId).toEqual(payload.commentId);
    expect(content).toEqual(payload.content);
  });
});
