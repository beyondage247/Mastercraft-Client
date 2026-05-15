import { gql } from "@apollo/client";

const METRIC_FIELDS = gql`
  fragment MetricFields on Metric {
    icon
    label
    value
    tone
    pill {
      label
      tone
    }
  }
`;

export const GET_DASHBOARD = gql`
  ${METRIC_FIELDS}
  query GetDashboard {
    dashboard {
      activeProjects {
        category
        estimate
        location
        name
        status
        tone
      }
      homeMetrics {
        ...MetricFields
      }
      projectMetrics {
        ...MetricFields
      }
      quoteMetrics {
        ...MetricFields
      }
      recentActivity {
        project
        title
        time
      }
    }
  }
`;

export const GET_PROJECTS = gql`
  ${METRIC_FIELDS}
  query GetProjects {
    projects {
      metrics {
        ...MetricFields
      }
      projects {
        id
        category
        dueDate
        location
        progress
        status
        title
      }
    }
  }
`;

export const GET_QUOTES = gql`
  ${METRIC_FIELDS}
  query GetQuotes {
    quotes {
      metrics {
        ...MetricFields
      }
      quotes {
        amount
        description
        id
        status
        title
        uid
        validUntil
      }
    }
  }
`;

export const GET_DOCUMENTS = gql`
  query GetDocuments {
    documents {
      documents {
        date
        id
        imageUrl
        project
        title
        type
      }
    }
  }
`;

export const GET_INVOICES = gql`
  ${METRIC_FIELDS}
  query GetInvoices {
    invoices {
      metrics {
        ...MetricFields
      }
      invoices {
        amount
        dueDate
        id
        issuedDate
        project
        status
      }
    }
  }
`;

export const GET_PAYMENTS = gql`
  ${METRIC_FIELDS}
  query GetPayments {
    payments {
      metrics {
        ...MetricFields
      }
      payments {
        amount
        date
        id
        invoice
        method
        project
        reference
      }
    }
  }
`;

export const ACCEPT_QUOTE = gql`
  mutation AcceptQuote($id: String!) {
    acceptQuote(id: $id)
  }
`;

export const INVITE_CLIENT = gql`
  mutation InviteClient($input: InviteClientInput!) {
    inviteClient(input: $input) {
      id
      name
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        clientItemId
        email
        name
        role
      }
    }
  }
`;
