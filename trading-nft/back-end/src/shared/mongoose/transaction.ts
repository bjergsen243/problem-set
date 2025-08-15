import { ClientSession, Connection } from 'mongoose';

export async function withTransaction<R = any>(
  connection: Connection,
  fn: (session: ClientSession) => Promise<R>,
  defaultSession?: ClientSession,
): Promise<R> {
  if (defaultSession) return await fn(defaultSession);
  const session = await connection.startSession();
  let result: R;
  try {
    await session.withTransaction(async (ses) => {
      result = await fn(ses);
    });
    return result;
  } catch (e) {
    throw e;
  } finally {
    await session.endSession();
  }
}
