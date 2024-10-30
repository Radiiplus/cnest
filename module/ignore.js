module.exports = (ignoredPath) => async (request, reply) => {
  if (request.raw.url === ignoredPath) {
    reply.code(204).send();
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
};