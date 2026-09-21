const Counter = require('../models/Counter');

// Atomically returns the next number for a named counter (e.g. 'chapter').
// Using $inc on a dedicated document avoids collisions even if two chapters
// are created at the same moment, and numbers are never reused after a delete.
async function nextCounterValue(name) {
  const doc = await Counter.findOneAndUpdate({ name }, { $inc: { value: 1 } }, { new: true, upsert: true });
  return doc.value;
}

module.exports = { nextCounterValue };
