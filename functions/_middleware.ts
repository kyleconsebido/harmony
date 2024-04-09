const errorHandling: PagesFunction = async (context) => {
  try {
    const response = await context.next()
    return response
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

const setCors: PagesFunction<Env> = async (context) => {
  const response = await context.next()

  if (context.env.DEV) {
    response.headers.set('Access-Control-Allow-Origin', context.env.VITE_DEV_URL)
    response.headers.set('Access-Control-Max-Age', '86400')
  }

  return response
}

export const onRequest = [errorHandling, setCors]
