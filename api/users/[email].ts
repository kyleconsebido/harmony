import { xVercelApiHandler } from '@vercel/node'
import middleware from '../_middleware'
import { sendJson } from '../_utils'

const getUserByEmail = async (req: Request) => {
  console.log(req._user)
  return sendJson({ data: 'OK' })
}

const handler: xVercelApiHandler = (req, res) => {
  console.log('heress')

  res.redirect(`${process.env.APP_HOST}/login`)
  //   res.send('OK')
}

// export default handler
export const GET = middleware(getUserByEmail)
