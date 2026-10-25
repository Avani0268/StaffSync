const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true
    },
    checkIn: {
      type: Date,
      default: null
    },
    checkOut: {
      type: Date,
      default: null
    },
    workHours: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half-day', 'Absent', 'On Leave'],
      default: 'Present'
    },
    notes: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      enum: ['Office HQ', 'Remote', 'Client Site'],
      default: 'Office HQ'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee 1 attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
