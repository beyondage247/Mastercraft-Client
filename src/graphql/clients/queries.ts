import { gql } from "@apollo/client";

export const GET_CLIENTS = gql`
  query GetClients {
    clients {
      additionalEmail
      additionalPhone
      id
      clientId
      company
      contactName
      email
      name
      phone
    }
  }
`;
