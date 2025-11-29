const CareerContext = require('../models/CareerContext');
const HealthContext = require('../models/HealthContext');
const NutritionContext = require('../models/NutritionContext');
const LifestyleContext = require('../models/LifestyleContext');
const NotesContext = require('../models/NotesContext');

// Generic upsert helpers for other contexts (examples)
exports.upsertCareerContext = async (userId, payload) => {
  await CareerContext.updateOne({ userId }, { $set: payload, $setOnInsert: { lastUpdated: new Date() } }, { upsert: true });
};

exports.upsertHealthContext = async (userId, payload) => {
  await HealthContext.updateOne({ userId }, { $set: payload, $setOnInsert: { lastUpdated: new Date() } }, { upsert: true });
};

exports.upsertNutritionContext = async (userId, payload) => {
  await NutritionContext.updateOne({ userId }, { $set: payload, $setOnInsert: { lastUpdated: new Date() } }, { upsert: true });
};

exports.upsertLifestyleContext = async (userId, payload) => {
  await LifestyleContext.updateOne({ userId }, { $set: payload, $setOnInsert: { lastUpdated: new Date() } }, { upsert: true });
};

exports.upsertNotesContext = async (userId, payload) => {
  await NotesContext.updateOne({ userId }, { $set: payload, $setOnInsert: { lastUpdated: new Date() } }, { upsert: true });
};
