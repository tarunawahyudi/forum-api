const Thread = require('../Thread');

describe('Thread Entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'Test Title',
    };

    expect(() => new Thread(payload)).toThrowError('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 123,
      content: true,
      owner: 'user-123',
    };

    expect(() => new Thread(payload)).toThrowError('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title contains more than 100 character', () => {
    const payload = {
      title: 'prplskynjbmosmckkdtgcpsfrmvelzheniyfuwuwymjvrjcesoegrdvvzmywgueyyuhbhnwnjzjrtyomabqbsgjpyuvptbfhyveld',
      content: 'Test Body',
      owner: 'user-123',
    };

    expect(() => new Thread(payload)).toThrowError('THREAD.TITLE_LIMIT_CHAR');
  });

  it('should throw error when owner contains more than 50 character', () => {
    const payload = {
      title: 'Test Title',
      content: 'Test Content',
      owner: 'cacglrmlticeqcpdgkjdbqjnwqmxztljemqwffumsowuerumwwv',
    };

    expect(() => new Thread(payload)).toThrowError('THREAD.OWNER_LIMIT_CHAR');
  });

  it('should throw error when owner contains restricted character', () => {
    const payload = {
      title: 'Test Title',
      content: 'Test Content',
      owner: 'user 123',
    }

    expect(() => new Thread(payload)).toThrowError('THREAD.OWNER_CONTAIN_RESTRICTED_CHARACTER');
  });

  it('should create thread object correctly', () => {
    const payload = {
      title: 'Test Title',
      content: 'Test Body',
      owner: 'user-123',
    };

    const { title, content, owner } = new Thread(payload);

    expect(title).toEqual(payload.title);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
