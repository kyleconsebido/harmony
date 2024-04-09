const errorHandling: PagesFunction = async (context) => {
  try {
    const response = await context.next()
    return response
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export const onRequest = [errorHandling]
