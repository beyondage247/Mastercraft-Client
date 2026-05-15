import { gql } from "@apollo/client";

export const CLIENT_BOARD_ID = String(
  import.meta.env.VITE_MONDAY_CLIENT_BOARD_ID ?? "",
);

export const GET_CLIENTS = gql`
  query GetClients($boardId: [ID!]) {
    boards(ids: $boardId) {
      items_page {
        items {
          id
          name
          column_values {
            id
            text
            value
          }
        }
      }
    }
  }
`;
