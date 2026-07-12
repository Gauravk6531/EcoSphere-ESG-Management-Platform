const { z } = require("zod");

const idParam = z.object({ id: z.string().min(1) });

function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!parsed.success) {
      return res.status(400).json({ detail: parsed.error.issues.map((i) => i.message).join(", ") });
    }
    next();
  };
}

module.exports = { idParam, validate };
