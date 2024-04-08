import type { DocumentData, getDocs } from 'firebase/firestore'

type DocumentDataWithId = DocumentData & { id: string }

export default <T extends DocumentDataWithId>(snap: Awaited<ReturnType<typeof getDocs>>) => {
  const roomSubCollection: T[] = []

  snap.forEach((doc) => {
    const roomSubDoc = doc.data() as T
    roomSubDoc.id = doc.id
    roomSubCollection.push(roomSubDoc)
  })

  return roomSubCollection
}
