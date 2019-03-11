import {
  Node, Document, ProcessingInstruction,
  NodeType
} from "./interfaces"
import { CharacterDataImpl } from "./CharacterDataImpl"

/**
 * Represents a processing instruction node.
 */
export class ProcessingInstructionImpl extends CharacterDataImpl implements ProcessingInstruction {

  protected _target: string

  /**
   * Initializes a new instance of `ProcessingInstruction`.
   *
   * @param ownerDocument - the parent document
   * @param data - the text content
   */
  public constructor(ownerDocument: Document | null = null,
    target: string, data: string | null = null) {
    super(ownerDocument, data)
    this._target = target
  }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): number { return NodeType.ProcessingInstruction }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return this._target }

  /** 
   * Gets the target of the {@link ProcessingInstruction} node.
   */
  get target(): string { return this._target }

  /**
   * Returns a duplicate of this node, i.e., serves as a generic copy 
   * constructor for nodes. The duplicate node has no parent 
   * ({@link parentNode} returns `null`).
   *
   * @param deep - if `true`, recursively clone the subtree under the 
   * specified node; if `false`, clone only the node itself (and its 
   * attributes, if it is an {@link Element}).
   */
  cloneNode(deep: boolean = false): Node {
    let clonedSelf = new ProcessingInstructionImpl(this.ownerDocument,
      this.target, this.data)
    return clonedSelf
  }

  /**
   * Determines if the given node is equal to this one.
   * 
   * @param node - the node to compare with
   */
  isEqualNode(node?: Node): boolean {
    if (!node || !super.isEqualNode(node))
      return false

    return (this.target === (<ProcessingInstruction>node).target)
  }
}