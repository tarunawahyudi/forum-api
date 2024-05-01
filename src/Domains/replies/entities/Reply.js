class Reply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { commentId, content } = payload;
    this.commentId = commentId;
    this.content = content;
  }

  _verifyPayload({ commentId, content }) {
    if (!commentId || !content) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string' || typeof content !== 'string') {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (commentId.length > 50) {
      throw new Error('REPLY.COMMENT_ID_LIMIT_CHAR');
    }
  }
}

module.exports = Reply;
