import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { getPortalToken } from "../../auth/session";

const GRAPHQL_URI = import.meta.env.VITE_GRAPHQL_URI ?? "/api/graphql";

const authLink = new SetContextLink(({ headers }) => {
  const portalToken = getPortalToken();

  return {
    headers: {
      ...headers,
      ...(portalToken ? { authorization: `Bearer ${portalToken}` } : {}),
    },
  };
});

const httpLink = new HttpLink({ uri: GRAPHQL_URI });

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
