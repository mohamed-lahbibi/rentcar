const mongoose = require('mongoose');

const clientScoreSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: [true, 'Reservation is required']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [-20, 'Score cannot be less than -20'],
    max: [20, 'Score cannot exceed 20']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByType',
    required: true
  },
  createdByType: {
    type: String,
    enum: ['Admin', 'Manager'],
    required: true
  }
}, {
  timestamps: true
});

// Update client's total score after saving
clientScoreSchema.post('save', async function() {
  const Client = mongoose.model('Client');
  const scores = await this.constructor.aggregate([
    { $match: { client: this.client } },
    { $group: { _id: null, totalScore: { $sum: '$score' } } }
  ]);
  
  const totalScore = scores.length > 0 ? scores[0].totalScore : 0;
  const newScore = Math.max(0, Math.min(100, 100 + totalScore));
  
  await Client.findByIdAndUpdate(this.client, { score: newScore });
});

// Index for queries
clientScoreSchema.index({ client: 1, createdAt: -1 });

module.exports = mongoose.model('ClientScore', clientScoreSchema);
