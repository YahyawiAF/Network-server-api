// import * as faker from "faker";
// import { Connection } from "typeorm";
// import { KYC } from "../../../entity/KYC";
// import { gCall } from "../../../testUtils/gCall";
// import { createTestConn } from "../../../testUtils/createTestConn";

// let conn: Connection;
// beforeAll(async () => {
//   conn = await createTestConn();
// });

// afterAll(async () => {
//   await conn.close();
// });

// const registerMutation = `
// mutation uploadKYCdocuments($KYCdata: KYCInput!) {
//   register(
//     KYCdata: $KYCdata
//   ) {
//     img
//   }
// }
// `;

// describe("uploadKYCdocuments", () => {
//   it.only("create kycdocument", async () => {
//     const user = {
//       email: faker.internet.email(),
//       password: faker.internet.password(),
//     };

//     const response = await gCall({
//       source: registerMutation,
//       variableValues: {
//         data: user,
//       },
//     });

//     if (response.errors) {
//       console.log(response.errors[0].originalError);
//     }

//     expect(response).toMatchObject({
//       data: {
//         register: {
//           email: user.email,
//         },
//       },
//     });

//     const dbUser = await KYC.findOne({ where: { email: user.email } });
//     expect(dbUser).toBeDefined();
//     expect(dbUser!.img).toBe(user.email);
//   });
// });
