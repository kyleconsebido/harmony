export const onRequest: PagesFunction<Env> = async () => {
  return Response.json({ message: 'Hello World!' })
}
