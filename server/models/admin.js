import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },

  // Two-factor authentication (TOTP) fields
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null },       // store encrypted in production
  twoFactorTempSecret: { type: String, default: null }    // used during setup verification
}, { timestamps: true })

const Admin = mongoose.model('Admin', adminSchema)
export default Admin
