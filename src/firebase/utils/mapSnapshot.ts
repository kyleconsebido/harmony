import type { DocumentData, QueryDocumentSnapshot, getDocs } from 'firebase/firestore'

type DocumentDataWithId = DocumentData & { id: string }

type Snapshot = Awaited<ReturnType<typeof getDocs>>

type ValueOf<T, K extends keyof T> =
  | T[K]
  | ((document: QueryDocumentSnapshot<unknown, DocumentData>) => T[K])

interface MapOptions<T extends DocumentDataWithId> {
  additionalFields: Partial<{
    [K in keyof T]: ValueOf<T, K>
  }>
}

function isValue<T extends DocumentDataWithId>(value: ValueOf<T, keyof T>): value is T[keyof T] {
  return typeof value !== 'function'
}

export default <T extends DocumentDataWithId>(snap: Snapshot, opts?: MapOptions<T>) => {
  const mappedSnapshot: T[] = []

  snap.forEach((doc) => {
    const document: T = doc.data() as T
    document.id = doc.id

    if (opts?.additionalFields) {
      const additionalEntries: [keyof T, ValueOf<T, keyof T>][] = Object.entries(
        opts.additionalFields
      )

      for (const [key, value] of additionalEntries) {
        document[key] = isValue(value) ? value : value(doc)
      }
    }

    mappedSnapshot.push(document)
  })

  return mappedSnapshot
}
