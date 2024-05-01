const ThreadDetail = require('../ThreadDetail');

describe('ThreadDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'Test Title',
    };

    expect(() => new ThreadDetail(payload)).toThrowError('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: true,
      body: 'xxx',
      date: 'xxx',
      username: 'xxx',
      comments: [],
    };

    expect(() => new ThreadDetail(payload)).toThrowError('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should validate comments as an array of objects', () => {
    const payload = {
      id: 'thread-123',
      title: 'Test Title',
      body: 'Test body content',
      date: '2023-04-21T12:34:56Z',
      username: 'test_user',
      comments: [
        {
          id: 'comment-1',
          username: 'user1',
          date: '2023-04-21T12:34:56Z',
          content: 'This is a comment',
        },
        {
          id: 'comment-2',
          username: 'user2',
          date: '2023-04-21T12:35:56Z',
          content: 'Another comment',
        },
      ],
    };

    const threadDetail = new ThreadDetail(payload);

    expect(threadDetail).toHaveProperty('id');
    expect(threadDetail).toHaveProperty('title');
    expect(threadDetail).toHaveProperty('body');
    expect(threadDetail).toHaveProperty('date');
    expect(threadDetail).toHaveProperty('username');

    expect(typeof threadDetail.id).toBe('string');
    expect(typeof threadDetail.title).toBe('string');
    expect(typeof threadDetail.body).toBe('string');
    expect(typeof threadDetail.date).toBe('string');
    expect(typeof threadDetail.username).toBe('string');

    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.username).toEqual(payload.username);

    expect(Array.isArray(threadDetail.comments)).toBe(true);

    threadDetail.comments.forEach((comment, index) => {
      expect(typeof comment).toBe('object');
      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('username');
      expect(comment).toHaveProperty('date');
      expect(comment).toHaveProperty('content');

      expect(typeof comment.id).toBe('string');
      expect(typeof comment.username).toBe('string');
      expect(typeof comment.date).toBe('string');
      expect(typeof comment.content).toBe('string');

      expect(comment.id).toEqual(payload.comments[index].id);
      expect(comment.username).toEqual(payload.comments[index].username);
      expect(comment.date).toEqual(payload.comments[index].date);
      expect(comment.content).toEqual(payload.comments[index].content);

    });
  });
});
