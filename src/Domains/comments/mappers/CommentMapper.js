/* eslint-disable class-methods-use-this */
const Reply = require('../../replies/entities/Reply');
const Comment = require('../entities/Comment');

class CommentMapper {
  static mapCommentsWithReplies(payload) {
    this._verifyPayload(payload);
    const { comments, replies } = payload;

    return comments.map((comment) => {
      const repliesByCommentId = replies.filter((reply) => reply.commentId === comment.id);
      comment.setReplies(repliesByCommentId);
      return comment;
    });
  }

  static _verifyPayload({ comments, replies }) {
    if (!Array.isArray(comments)) {
      throw new Error('COMMENT_MAPPER.COMMENTS_NOT_ARRAY');
    }

    if (!Array.isArray(replies)) {
      throw new Error('COMMENT_MAPPER.REPLIES_NOT_ARRAY');
    }

    const isAnyInvalidComment = comments.some((comment) => !(comment instanceof Comment));
    if (isAnyInvalidComment) {
      throw new Error('COMMENT_MAPPER.COMMENTS_CONTAINS_INVALID_MEMBER');
    }

    const isAnyInvalidReply = replies.some((reply) => !(reply instanceof Reply));
    if (isAnyInvalidReply) {
      throw new Error('COMMENT_MAPPER.REPLIES_CONTAINS_INVALID_MEMBER');
    }
  }
}

module.exports = CommentMapper;
