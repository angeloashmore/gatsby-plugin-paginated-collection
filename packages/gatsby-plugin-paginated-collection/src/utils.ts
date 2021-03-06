import { CreatePagesArgs } from 'gatsby'

import {
  PluginOptions,
  ID,
  NormalizedNode,
  NodeType,
  CollectionNodeInput,
  PageNodeInput,
} from './types'

/**
 * Formats a message suitable to display to a user.
 *
 * @param msg Message to format.
 *
 * @returns Formatted message.
 */
export const fmtMsg = (msg: string) =>
  `gatsby-plugin-paginated-collection - ${msg}`

/**
 * Creates an array of elements split into groups of the provided size.
 *
 * @param size - Length of each chunk.
 * @param array - The array to split.
 *
 * @returns An array containing chunked arrays. If array cannot be split evenly, the final chunk will be the remaining elements.
 */
export const chunk = <T>(size: number, arr: T[]): T[][] =>
  arr.reduce(
    (array, item, i) =>
      i % size === 0
        ? [...array, [item]]
        : [...array.slice(0, -1), [...array.slice(-1)[0], item]],
    [] as T[][],
  )

/**
 * Creates a Gatsby Node representing a page in a collection of nodes.
 *
 * @param chunk Nodes for the page.
 * @param id UUID for the page. Used as a pseudo cursor to identify the page.
 * @param index Index of the page within the collection.
 * @param chunkTuples Tuples of page UUIDs and nodes.
 * @param gatsbyContext Gatsby createPages context.
 * @param pluginOptions Options provided to the plugin by the user.
 *
 * @returns The created Gatsby Node.
 */
const createPageNode = (
  chunk: NormalizedNode[],
  id: ID,
  index: number,
  chunkTuples: [ID, NormalizedNode[]][],
  collectionId: ID,
  gatsbyContext: CreatePagesArgs,
): PageNodeInput => {
  const { actions, createContentDigest } = gatsbyContext
  const { createNode } = actions

  const nextChunkTuple = chunkTuples[index + 1]
  const previousChunkTuple = chunkTuples[index - 1]

  const node: PageNodeInput = {
    id,
    collection: collectionId,
    index,
    nextPage: nextChunkTuple?.[0],
    hasNextPage: Boolean(nextChunkTuple),
    previousPage: previousChunkTuple?.[0],
    hasPreviousPage: Boolean(previousChunkTuple),
    nodeCount: chunk.length,
    nodes: chunk,
    internal: {
      type: NodeType.Page,
      contentDigest: createContentDigest(chunk),
    },
  }

  createNode(node)

  return node
}

/**
 * Creates a Gatsby Node representing a collection of pages of nodes.
 *
 * @param chunks Array of a nodes grouped by page.
 * @param gatsbyContext Gatsby createPages context.
 * @param pluginOptions Options provided to the plugin by the user.
 *
 * @returns The created Gatsby Node.
 */
export const createCollectionNode = (
  chunks: NormalizedNode[][],
  gatsbyContext: CreatePagesArgs,
  pluginOptions: PluginOptions,
): ID => {
  const { actions, createNodeId, createContentDigest } = gatsbyContext
  const { createNode } = actions
  const { name, pageSize } = pluginOptions

  const id = createNodeId(`${NodeType.Collection} ${name}`)

  const pageNodes = chunks
    .map<[ID, NormalizedNode[]]>((chunk, index) => [
      createNodeId(`${NodeType.Page} ${name} ${index}`),
      chunk,
    ])
    .map(([pageId, chunk], index, arr) =>
      createPageNode(chunk, pageId, index, arr, id, gatsbyContext),
    )

  const nodeCount = pageNodes.reduce(
    (count, pageNode) => (count += pageNode.nodes.length),
    0,
  )

  const pageNodeIds = pageNodes.map(pageNode => pageNode.id)

  const node: CollectionNodeInput = {
    id,
    name,
    pageSize,
    firstPageSize: pageNodes[0].nodes.length,
    lastPageSize: pageNodes[pageNodes.length - 1].nodes.length,
    nodeCount,
    pageCount: pageNodes.length,
    pages: pageNodeIds,
    internal: {
      type: NodeType.Collection,
      contentDigest: createContentDigest(pageNodes),
    },
  }

  createNode(node)

  return node.id
}
