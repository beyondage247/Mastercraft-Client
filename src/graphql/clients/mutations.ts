import { gql } from "@apollo/client";

export const CLIENT_BOARD_ID = String(
  import.meta.env.VITE_MONDAY_CLIENT_BOARD_ID ?? "",
);

export const CLIENT_EMAIL_COLUMN_ID = String(
  import.meta.env.VITE_MONDAY_CLIENT_EMAIL_COLUMN ?? "",
);

export const INVITE_CLIENT = gql`
  mutation InviteClient($boardId: ID!, $name: String!, $columnValues: JSON) {
    create_item(
      board_id: $boardId
      item_name: $name
      column_values: $columnValues
    ) {
      id
      name
    }
  }
`;
