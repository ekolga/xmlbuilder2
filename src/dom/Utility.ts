import { Node } from './Node'
import { DOMException } from './DOMException'
import { DOMImplementation } from './DOMImplementation'

export class Utility {

  static OrderedSet = class {
    /**
     * RegExp to split attribute values at ASCII whitespace
     * https://infra.spec.whatwg.org/#ascii-whitespace
     * U+0009 TAB, U+000A LF, U+000C FF, U+000D CR, or U+0020 SPACE
     */
    static WhiteSpace = /[\t\n\f\r ]/

    /**
     * Converts a whitespace separated string into an array of tokens.
     * 
     * @param value - a string of whitespace separated tokens
     */
    static parse(value: string): string[] {
      let arr = value.split(Utility.OrderedSet.WhiteSpace)

      // remove empty strings
      let filtered: string[] = []
      for (let str of arr)
        if (str) filtered.push(str)
  
      return filtered
    }

    /**
     * Converts an array of tokens into a space separated string.
     * 
     * @param tokens - an array of token strings
     */
    static serialize(tokens: string[]): string {
      return tokens.join(' ')
    }

    /**
     * Removes duplicate tokens and convert all whitespace characters
     * to space.
     * 
     * @param value - a string of whitespace separated tokens
     */
    static sanitize(value: string): string {
      return Utility.OrderedSet.serialize(Utility.OrderedSet.parse(value))
    }
  }

  /**
   * Applies the given mixins into a class.
   * 
   * @param derivedCtor - the class to receive the mixins
   * @param baseCtors - an array of mixin classes
   */
  static applyMixins(derivedCtor: any, baseCtors: any[]): void {
    baseCtors.forEach(baseCtor => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        derivedCtor.prototype[name] = baseCtor.prototype[name]
      })
    })
  }

  /**
   * Applies the given function to all descendant nodes of the given
   * node.
   * 
   * @param node - the node whose descendants will be traversed
   * @param func - the function to apply to the descendant nodes. The
   * function receives each descendant node as an argument and should
   * return a truthy value to stop iteration, or falsey value to
   * continue with the next descendant.
   * 
   * @returns the value returned from `func`
   */
  static forEachDescendant(node: Node, func: (childNode: Node) => any): any {
    for (let child of node.childNodes) {
      let res = func(child)
      if (res) {
        return res
      } else {
        let res = Utility.forEachDescendant(child, func)
        if (res) return res
      }
    }
  }

  /**
   * Determines whether `other` is a descendant of `node`.
   * 
   * @param node - a node
   * @param other - the node to check
   */
  static isDescendantOf(node: Node, other: Node): boolean {
    for (let child of node.childNodes) {
      if (child === other) return true
      if (Utility.isDescendantOf(child, other)) return true
    }

    return false
  }

  /**
   * Determines whether `other` is an ancestor of `node`.
   * 
   * @param node - a node
   * @param other - the node to check
   */
  static isAncestorOf(node: Node, other: Node): boolean {
    return Utility.isDescendantOf(other, node)
  }

  /**
   * Returns the zero-based index of `node` when counted preorder in
   * the tree rooted at `root`. Returns `-1` if `node` is not in 
   * the tree.
   * 
   * @param root - the root node of the tree
   * @param node - the node to get the index of
   */
  static treePosition(root: Node | null, node: Node): number {
    if (root === null) return -1

    let pos = 0
    let found = false

    Utility.forEachDescendant(root, function (childNode) {
      pos++
      if (!found && (childNode === node)) found = true
    })

    if (found)
      return pos
    else
      return -1
  }

  /**
   * Determines whether `other` is preceding `node`. An object A is 
   * preceding an object B if A and B are in the same tree and A comes 
   * before B in tree order.
   * 
   * @param node - a node
   * @param other - the node to check
   */
  static isPreceding(node: Node, other: Node): boolean {
    let nodePos = Utility.treePosition(node.ownerDocument, node)
    let otherPos = Utility.treePosition(other.ownerDocument, other)

    if (nodePos === -1 || otherPos === -1)
      return false
    else
      return otherPos < nodePos
  }

  /**
   * Determines whether `other` is following `node`. An object A is 
   * following an object B if A and B are in the same tree and A comes 
   * after B in tree order.
   * 
   * @param node - a node
   * @param other - the node to check
   */
  static isFollowing(node: Node, other: Node): boolean {
    let nodePos = Utility.treePosition(node.ownerDocument, node)
    let otherPos = Utility.treePosition(other.ownerDocument, other)

    if (nodePos === -1 || otherPos === -1)
      return false
    else
      return otherPos > nodePos
  }

  /**
   * Validates the given qualified name.
   * 
   * @param qualifiedName - qualified name
   */
  static validateQName(qualifiedName: string): void {
    if (!qualifiedName.match(DOMImplementation.XMLSpec.Name))
      throw DOMException.InvalidCharacterError
    if (!qualifiedName.match(DOMImplementation.XMLSpec.QName))
      throw DOMException.InvalidCharacterError
  }

  /**
   * Validates and extracts a namespace, prefix, and localName from the
   * given namespace and qualified name.
   * 
   * @param namespace - namespace
   * @param qualifiedName - qualified name
   * 
   * @returns an object with `namespace`, `prefix`, and `localName` 
   * keys.
   */
  static extractNames(namespace: string | null, qualifiedName: string): { namespace: string | null, prefix: string | null, localName: string } {
    if (!namespace) namespace = null
    Utility.validateQName(qualifiedName)

    let parts = qualifiedName.split(':')
    let prefix = (parts.length === 2 ? parts[0] : null)
    let localName = (parts.length === 2 ? parts[1] : qualifiedName)

    if (prefix && !namespace)
      throw DOMException.NamespaceError

    if (prefix === "xml" && namespace !== DOMImplementation.Namespace.XML)
      throw DOMException.NamespaceError

    if (namespace !== DOMImplementation.Namespace.XMLNS &&
      (prefix === "xmlns" || qualifiedName === "xmlns"))
      throw DOMException.NamespaceError

    if (namespace === DOMImplementation.Namespace.XMLNS &&
      (prefix !== "xmlns" && qualifiedName !== "xmlns"))
      throw DOMException.NamespaceError

    return {
      'namespace': namespace,
      'prefix': prefix,
      'localName': localName
    }
  }
}