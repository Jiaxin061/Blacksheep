// Request logging middleware

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - ${ip}`);
  
  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const body = { ...req.body };
    // Remove sensitive fields if any
    delete body.password;
    console.log('Body:', JSON.stringify(body, null, 2));
  }
  
  next();
};

module.exports = requestLogger;