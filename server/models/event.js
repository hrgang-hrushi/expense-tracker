import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  location: { type: String, default: '' },
  capacity: { type: Number, default: 0 },
  published: { type: Boolean, default: false }
}, { timestamps: true })

const Event = mongoose.model('Event', eventSchema)
export default Event
