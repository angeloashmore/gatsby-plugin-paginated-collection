# gatsby-plugin-paginated-collection

Gatsby plugin which paginates a collection of data from your sources.

This plugin tries to be unopinionated in how you use the paginated data. For
example, you could use the pagination information to:

- Create a page within your site for each page of data.
- Create true client-side "Load More" by saving JSON files for each page of
  data.
- Create next/previous buttons for articles on your site.

You can use this plugin multiple times per site for different collections of
data. For example, you could paginate blog posts and products individually by
using the plugin twice.

## Table of Contents

- [Features](#features)
- [Install](#install)
- [How to use](#how-to-use)
- [How to query](#how-to-query)
  - [Query Pages](#query-pages)

## Features

- Groups data into pages of any size.
- Provides helpful pagination information like `hasNextPage` and `totalPages`.
- Collects your data to paginate using a GraphQL query. This could include data
  from multiple sources.

## Install

```sh
npm install --save gatsby-source-paginated-collection
```

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  /**
   * You can have multiple instances of this plugin to create separate
   * collections of data using different names.
   */
  {
    resolve: 'gatsby-source-paginated-collection',
    options: {
      /**
       * A name to identify your collection. If you have multiple instances of
       * this plugin, this will allow you to identify each collection. This is
       * required.
       */
      name: 'blogPosts',

      /**
       * GraphQL query used to fetch all data for the collection. All data
       * returned from the query will be available in the normalizer function
       * to shape your data. This is required.
       */
      query: `
        {
          allMarkdownRemark {
            nodes {
              id
              frontmatter {
                path
                title
                excerpt
              }
            }
          }
        }
      `,

      /**
       * The number of nodes to include in each page. Default: 10.
       */
      pageSize: 10,

      /**
       * The number of nodes to include in the first page. This is optional. If
       * no value is given, the first page will be the same size as all other
       * pages.
       */
      firstPageSize: 16,

      /**
       * Function used to map the result of the GraphQL query to nodes in the
       * collection. This should return an array of items to paginate. This is
       * required.
       */
      normalizer: ({ data }) =>
        data.allMarkdownRemark.nodes.map(node => ({
          id: node.id,
          path: node.frontmatter.path,
          title: node.frontmatter.title,
          excerpt: node.frontmatter.excerpt,
        })),
    },
  },
]
```

## How to query

You can query your collections using GraphQL like the following:

**Note**: Learn to use the GraphQL tool and Ctrl+Spacebar at
<http://localhost:8000/___graphql> to discover the types and properties of your
GraphQL model.

```graphql
{
  paginatedCollection {
    pages {
      id
      nodes
    }
  }
}
```

If you have multiple instances of this plugin, you can use the name argument to
query a specific collection.

```graphql
{
  paginatedCollection(name: { eq: "blogPosts" }) {
    pages {
      id
      nodes
    }
  }
}
```

### Query Pages

TODO

```graphql
{
  paginatedCollection {
    pages {
      id
    }
  }
}
```
