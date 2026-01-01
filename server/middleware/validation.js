const allowedStatuses = ["Active", "Funded", "Adopted", "Archived"];
const allowedTypes = ["Dog", "Cat", "Rabbit", "Bird", "Other"];

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const buildErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });
};

const sanitizeString = (value, maxLength) => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (maxLength) {
    return trimmed.substring(0, maxLength);
  }
  return trimmed;
};

exports.validateCreateAnimal = (req, res, next) => {
  const errors = {};
  const payload = { ...req.body };

  payload.name = sanitizeString(payload.name, 100);
  if (!payload.name) {
    errors.name = "Name is required";
  }

  payload.type = sanitizeString(payload.type);
  if (!payload.type) {
    errors.type = "Type is required";
  } else if (!allowedTypes.includes(payload.type)) {
    errors.type = `Type must be one of: ${allowedTypes.join(", ")}`;
  }

  payload.story = sanitizeString(payload.story);
  if (!payload.story) {
    errors.story = "Story is required";
  }

  const fundingGoal = Number(payload.fundingGoal);
  if (Number.isNaN(fundingGoal) || fundingGoal <= 0) {
    errors.fundingGoal = "Funding goal must be greater than 0";
  } else {
    payload.fundingGoal = fundingGoal;
  }

  // Photo is now handled by multer file upload
  // Validation is done in upload middleware

  payload.status = sanitizeString(payload.status) || "Active";
  if (!allowedStatuses.includes(payload.status)) {
    errors.status = `Status must be one of: ${allowedStatuses.join(", ")}`;
  }

  payload.adminID = Number(payload.adminID) || 1;

  if (Object.keys(errors).length > 0) {
    return buildErrorResponse(res, errors);
  }

  req.body = payload;
  next();
};

exports.validateUpdateAnimal = (req, res, next) => {
  const errors = {};
  const payload = { ...req.body };

  payload.name = sanitizeString(payload.name, 100);
  if (!payload.name) {
    errors.name = "Name is required";
  }

  payload.type = sanitizeString(payload.type);
  if (!payload.type) {
    errors.type = "Type is required";
  } else if (!allowedTypes.includes(payload.type)) {
    errors.type = `Type must be one of: ${allowedTypes.join(", ")}`;
  }

  payload.story = sanitizeString(payload.story);
  if (!payload.story) {
    errors.story = "Story is required";
  }

  const fundingGoal = Number(payload.fundingGoal);
  if (Number.isNaN(fundingGoal) || fundingGoal <= 0) {
    errors.fundingGoal = "Funding goal must be greater than 0";
  } else {
    payload.fundingGoal = fundingGoal;
  }

  const amountRaised = Number(payload.amountRaised);
  if (Number.isNaN(amountRaised) || amountRaised < 0) {
    errors.amountRaised = "Amount raised must be 0 or greater";
  } else {
    payload.amountRaised = amountRaised;
  }

  // Photo is optional for updates - can keep existing or upload new
  // Validation is done in upload middleware if file is provided

  payload.status = sanitizeString(payload.status) || "Active";
  if (!allowedStatuses.includes(payload.status)) {
    errors.status = `Status must be one of: ${allowedStatuses.join(", ")}`;
  }

  if (Object.keys(errors).length > 0) {
    return buildErrorResponse(res, errors);
  }

  req.body = payload;
  next();
};


