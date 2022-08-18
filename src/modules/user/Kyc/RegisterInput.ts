import { Field, InputType } from "type-graphql";
import { Length } from "class-validator";

@InputType()
export class KYCInput {
  @Field()
  userId: String;

  @Field()
  id1_type: string;

  @Field()
  id1_number: string;

  @Field()
  id1_expiry: string;

  @Field()
  id1_frontSide: string;

  @Field()
  id1_backSide: string;

  @Field()
  id2_type: string;

  @Field()
  id2_number: string;

  @Field()
  id2_expiry: string;

  @Field()
  id2_frontSide: string;

  @Field()
  id2_backSide: string;

  @Field()
  selfie: string;

  @Field()
  addressProof: string;
}

@InputType()
export class PersonalInfoInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  @Length(1, 255)
  middleName: string;
}

@InputType()
export class AccountInfoInput {
  @Field()
  dateOfBirth: string;

  @Field()
  country: string;

  @Field()
  @Length(1, 255)
  email: string;

  @Field()
  @Length(1, 255)
  phoneNumber: string;
}

@InputType()
export class AddressInfoInput {
  @Field()
  address1: string;

  @Field()
  address2: string;

  @Field()
  @Length(1, 255)
  city: string;

  @Field()
  @Length(1, 255)
  postalCode: string;
}

@InputType()
export class WalletInput {
  @Field()
  sign_message: string;

  @Field()
  wallet_address: string;
}
