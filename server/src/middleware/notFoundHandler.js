export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint "${req.originalUrl}" does not exist.`,
    },
  });
}
