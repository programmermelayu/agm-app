import Joi from 'joi';

/**
 * Validate request body against a Joi schema
 * Usage: app.post('/endpoint', validate(schema), handler)
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: messages,
        },
      });
    }

    req.validatedBody = value;
    next();
  };
};

/**
 * Validate request query against a Joi schema
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query validation failed',
          details: messages,
        },
      });
    }

    req.query = value;
    next();
  };
};

/**
 * Validate request params against a Joi schema
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Path validation failed',
          details: messages,
        },
      });
    }

    req.params = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({ 'string.email': 'Must be a valid email address' }),

  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
    }),

  uuid: Joi.string()
    .uuid()
    .required()
    .messages({ 'string.uuid': 'Must be a valid UUID' }),

  agmName: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'AGM name is required',
      'string.max': 'AGM name must be 255 characters or less',
    }),

  date: Joi.date()
    .iso()
    .min('now')
    .required()
    .messages({
      'date.min': 'Date must be in the future or today',
    }),

  time: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):[0-5]\d:[0-5]\d$/)
    .required()
    .messages({
      'string.pattern.base': 'Time must be in HH:MM:SS format (24-hour)',
    }),

  location: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Location is required',
      'string.max': 'Location must be 500 characters or less',
    }),

  emailArray: Joi.array()
    .items(Joi.string().email().lowercase())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one email address is required',
    }),
};

export default {
  validate,
  validateQuery,
  validateParams,
  schemas,
};
