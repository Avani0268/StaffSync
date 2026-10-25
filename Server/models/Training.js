const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Technical Skills', 'Compliance & Safety', 'Leadership', 'Soft Skills', 'Onboarding'],
      default: 'Technical Skills'
    },
    trainer: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    durationHours: {
      type: Number,
      required: true,
      default: 10
    },
    status: {
      type: String,
      enum: ['Upcoming', 'In Progress', 'Completed'],
      default: 'Upcoming'
    },
    targetDepartment: {
      type: String,
      default: 'All'
    },
    enrolledEmployees: [
      {
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        enrolledAt: {
          type: Date,
          default: Date.now
        },
        status: {
          type: String,
          enum: ['Enrolled', 'In Progress', 'Completed', 'Dropped'],
          default: 'Enrolled'
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        },
        feedback: {
          type: String,
          default: ''
        },
        completedAt: {
          type: Date,
          default: null
        }
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Training', trainingSchema);
