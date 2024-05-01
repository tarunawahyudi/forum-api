class Thread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, content, owner } = payload;
    this.title = title;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({ title, content, owner }) {
    if (!title || !content || !owner) {
      throw new Error('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (title.length > 100) {
      throw new Error('THREAD.TITLE_LIMIT_CHAR');
    }

    if (owner.length > 50) {
      throw new Error('THREAD.OWNER_LIMIT_CHAR');
    }

    if (!owner.match(/^[a-zA-Z0-9-_]+$/)) {
      throw new Error('THREAD.OWNER_CONTAIN_RESTRICTED_CHARACTER');
    }
  }
}

module.exports = Thread;
