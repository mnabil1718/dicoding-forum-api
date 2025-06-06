const CommentLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'comment_likes',
  register: async (server, { container }) => {
    const commentLikessHandler = new CommentLikesHandler(container);
    server.route(routes(commentLikessHandler));
  },
};
