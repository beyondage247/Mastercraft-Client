import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const MONDAY_URI = import.meta.env.VITE_MONDAY_URI;
const MONDAY_TOKEN = import.meta.env.VITE_MONDAY_TOKEN;

const authLink = new SetContextLink(({ headers }) => {
  const token = MONDAY_TOKEN;
  return {
    headers: {
      ...headers,
      authorization: token,
    },
  };
});

const httpLink = new HttpLink({ uri: MONDAY_URI });

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
