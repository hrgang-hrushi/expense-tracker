import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  message: { type: String, default: '' },
  phone: { type: String, default: '' },
  source: { type: String, default: 'website' },
  read: { type: Boolean, default: false },
  archived: { type: Boolean, default: false }
}, { timestamps: true })

const Contact = mongoose.model('Contact', contactSchema)
export default Contact
