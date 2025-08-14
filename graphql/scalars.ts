import { GraphQLScalarType, Kind } from "graphql";

// Date Scalar
export const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",

  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error("GraphQL Date Scalar serializer expected a `Date` object");
  },

  parseValue(value: unknown): Date {
    if (typeof value === "string") {
      return new Date(value);
    }
    throw new Error("GraphQL Date Scalar parser expected a `string`");
  },

  parseLiteral(ast): Date | null {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Upload Scalar (placeholder for file uploads)
export const UploadScalar = new GraphQLScalarType({
  name: "Upload",
  description: "Upload custom scalar type",

  serialize(): string {
    throw new Error("Upload scalar cannot be serialized");
  },

  parseValue(value: unknown): unknown {
    return value;
  },

  parseLiteral(): null {
    return null;
  },
});

// Export all scalars
export const scalars = {
  Date: DateScalar,
  Upload: UploadScalar,
};
