import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const MONDAY_URI =
  import.meta.env.VITE_MONDAY_API_URL ?? "https://api.monday.com/v2";
const MONDAY_TOKEN = import.meta.env.VITE_MONDAY_TOKEN ?? "";
const MONDAY_API_VERSION =
  import.meta.env.VITE_MONDAY_API_VERSION ?? "2026-04";

const authLink = new SetContextLink(({ headers }) => {
  return {
    headers: {
      ...headers,
      Authorization: MONDAY_TOKEN,
      "API-Version": MONDAY_API_VERSION,
    },
  };
});

const httpLink = new HttpLink({ uri: MONDAY_URI });

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
