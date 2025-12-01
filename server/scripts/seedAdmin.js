#!/usr/bin/env node
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import Admin from '../models/admin.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/moonbase'

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  console.log('Connected to MongoDB')

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.SEED_ADMIN_PASSWORD || 'change-me-please'
  const name = process.env.SEED_ADMIN_NAME || 'Administrator'

  let admin = await Admin.findOne({ email })
  if (admin) {
    console.log('Admin already exists:', email)
    process.exit(0)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  admin = new Admin({ name, email, passwordHash })
  await admin.save()
  console.log('Created admin:', email)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
