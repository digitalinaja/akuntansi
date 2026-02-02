const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../middleware/auth')

const router = express.Router()

// Helper function to get user by email
function getUserByEmail(db, email) {
  return db('users').where({ email }).first()
}

// Register
router.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  try {
    const db = req.app.get('db')

    // Check if user already exists
    const existingUser = await getUserByEmail(db, email)
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const [userId] = await db('users').insert({
      name,
      email,
      password_hash: passwordHash
    })

    // Generate tokens
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' })
    const refreshToken = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })

    // Get created user
    const user = await db('users').where({ id: userId }).first()

    // Return user and tokens (excluding password)
    const { password_hash, ...userWithoutPassword } = user
    res.status(201).json({
      user: userWithoutPassword,
      token,
      refreshToken
    })
  } catch (error) {
    next(error)
  }
})

// Login
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const db = req.app.get('db')

    const user = await getUserByEmail(db, email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate tokens
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })
    const refreshToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

    // Return user and tokens (excluding password)
    const { password_hash, ...userWithoutPassword } = user
    res.json({
      user: userWithoutPassword,
      token,
      refreshToken
    })
  } catch (error) {
    next(error)
  }
})

// Get current user
router.get('/me', async (req, res, next) => {
  try {
    const db = req.app.get('db')
    const userId = req.user.userId

    const user = await db('users').where({ id: userId }).first()
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { password_hash, ...userWithoutPassword } = user
    res.json({ user: userWithoutPassword })
  } catch (error) {
    next(error)
  }
})

module.exports = router
