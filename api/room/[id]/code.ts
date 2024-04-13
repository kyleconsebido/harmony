import type { xVercelApiHandler } from '@vercel/node'
import middleware from '../../_middleware'
import crypto from 'crypto'
import { db } from '../../_app'

const getMiddle = (input: string) => {
  const LENGTH = 9
  const middle = input.length / 2
  return input.slice(middle - LENGTH / 2, middle + LENGTH / 2)
}

const generateCode = (currentDay: Date, roomId: string) => {
  const code = crypto
    .createHmac('sha256', process.env.INVITE_KEY || '')
    .update(currentDay.getTime() + roomId)
    .digest('base64url')
  return getMiddle(code)
}

const verifyCode = (code: string, currentDay: Date, roomId: string) => {
  return code === generateCode(currentDay, roomId)
}

const handler: xVercelApiHandler = async (req, res) => {
  const now = Date.now()
  const today = new Date()
  today.setMinutes(0, 0, 0)

  const { id } = req.query

  if (!id) {
    res.status(404).send({ error: 'Room ID not found' })
    return
  }

  const roomId = typeof id === 'string' ? id : id[0]

  switch (req.method) {
    case 'GET': {
      const { verify } = req.query

      if (verify) {
        const code = typeof verify === 'string' ? verify : verify[0]
        const isVerified = verifyCode(code, today, roomId)

        if (isVerified) {
          res.send({ data: true })
        } else {
          res.status(400).send({ error: 'Invalid Code' })
        }

        return
      }

      const roomDoc = await db.doc(`rooms/${roomId}`).get()

      if (!roomDoc.data()?.users[req._user?.uid || '']) {
        res.status(404).send({ error: 'Room ID not found' })
        return
      }

      const todayEnd = new Date(today).setMinutes(0, 0, 999)
      const remainingTime = Math.floor((todayEnd - now) / 1000)

      const invite = generateCode(today, roomId)

      res.setHeader('Cache-Control', `max-age=${remainingTime}`)
      res.send({ data: invite })
      break
    }
    case 'POST': {
      const { code } = req.body

      if (!code) {
        res.status(404).send({ error: 'Code not found' })
        return
      }

      const isVerified = verifyCode(code, today, roomId)

      if (!isVerified) {
        res.status(400).send({ error: 'Invalid Code' })
        return
      }

      /**TODO: Add user to room  */

      res.send({ data: 'OK' })
      break
    }
    default:
      res.status(501).send({ error: 'Method not implemented' })
  }
}

export default middleware(handler)
