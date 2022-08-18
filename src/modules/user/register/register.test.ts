import * as faker from "faker";
import { Connection } from "typeorm";
import { User } from "../../../entity/User";
import { gCall } from "../../../testUtils/gCall";
import { createTestConn } from "../../../testUtils/createTestConn";

let conn: Connection;
beforeAll(async () => {
  conn = await createTestConn();
});

afterAll(async () => {
  await conn.close();
});

const registerMutation = `
mutation Register($data: RegisterInput!) {
  register(
    data: $data
  ) {
    email
  }
}
`;

describe("Register", () => {
  it.only("create user", async () => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const response = await gCall({
      source: registerMutation,
      variableValues: {
        data: user,
      },
    });
    
    if (response.errors) {
      console.log(response.errors[0].originalError);
    }

    expect(response).toMatchObject({
      data: {
        register: {
          email: user.email,
        },
      },
    });

    const dbUser = await User.findOne({ where: { email: user.email } });
    expect(dbUser).toBeDefined();
    expect(dbUser!.email).toBe(user.email);
  });
});
