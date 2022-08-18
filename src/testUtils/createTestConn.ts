import { getConnectionOptions, createConnection } from "typeorm";

export const createTestConn = async (resetDB: boolean = false) => {
  const connectionOptions = await getConnectionOptions("test");
  return createConnection({
    ...connectionOptions,
    name: "default",
    synchronize: resetDB,
    dropSchema: resetDB,
  });
};
