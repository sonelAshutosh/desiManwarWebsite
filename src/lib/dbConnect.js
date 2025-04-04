import mongoose from 'mongoose'

const connection = {}

async function dbConnect() {
  if (connection.isConnected) {
    console.log('Already connected to the database')
    return
  }

  try {
    const db = await mongoose.connect(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.1jgwj.mongodb.net/` ||
        '',
      {}
    )

    connection.isConnected = db.connections[0].readyState

    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error)

    process.exit(1)
  }
}

export default dbConnect
