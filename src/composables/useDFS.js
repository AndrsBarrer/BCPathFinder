import { ref, onMounted, onUnmounted } from 'vue'

export function useDFS() {
  class Graph {
    constructor(numberNodes) {
      this.numberNodes = numberNodes
      // 1) Creates a new array with empty spaces
      // 2) Those spaces are empty, fill makes them undefined
      // 3) map then calls an anonymous function that returns an array, so each spot in the array now has an array
      this.adjacencyList = new Array(numberNodes).fill().map(() => [])
    }

    // If a list has already been creaed, add an edge from one place to another
    // Adds an edge from one city to another
    addEdge(from, to) {
      // If the key hasnt already been created
      if (!this.adjacencyList[from]) {
        // Create the key with an empty association
        this.adjacencyList[from] = []
      }
      // If the key hasnt already been created in reverse
      if (!this.adjacencyList[to]) {
        // Create the key with an empty association
        this.adjacencyList[to] = []
      }

      // Add both ways to the hashmap
      this.adjacencyList[from].push(to)
      this.adjacencyList[to].push(from)
    }

    getNeighbors(node) {
      return this.adjacencyList[node] || []
    }
  }

  class Stack {
    constructor() {
      this.items = []
    }

    pop() {
      // Check if the stack is empty
      if (this.isEmpty()) {
        console.log('Stack is empty! Cannot pop.')
        return null // or throw an error if you prefer
      }
      return this.items.pop()
    }

    push(element) {
      this.items.push(element)
    }

    isEmpty() {
      return this.items.length === 0
    }
  }

  // DFS implementation using the Graph and Stack classes
  const dfs = (graph, start, goal) => {
    let stack = new Stack() // Stack for the nodes that need to be visited
    let visited = new Set() // Set ensures that all values are unique, used to ensure nodes are only visited once

    // Put the starting place in the stack
    stack.push(start)

    while (!stack.isEmpty()) {
      const currentVisit = stack.pop()
      if (currentVisit === goal) {
        console.log(`Goal reached: ${currentVisit}`)
        visited.add(currentVisit)
        return visited
      }

      // If this is the first time this node is being visited
      if (!visited.has(currentVisit)) {
        // Add the node to the visited list
        visited.add(currentVisit)
        console.log(`Visiting: ${currentVisit}`)

        const neighbors = graph.getNeighbors(currentVisit)

        neighbors.forEach((neighbor) => {
          // Do not want to visit the neighbors of that node, iterate through all nodes for the current node
          if (!visited.has(neighbor)) {
            // Fresh node to visit, add that to the stack so we can visit it
            stack.push(neighbor)
          }
        })
      }
    }

    console.log('Goal not found')
  }

  return { Graph, Stack, dfs }
}
