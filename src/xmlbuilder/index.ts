import { _applyMixin } from '../util'

// Import implementation classes
import { XMLBuilderOptions, XMLBuilder, ExpandObject } from './interfaces'
import { XMLBuilderImpl } from './XMLBuilderImpl'
import { XMLStringifierImpl } from './XMLStringifierImpl'
import { isString } from 'util'
import { 
  DOMImplementationInstance, 
  XMLDocument as XMLDocumentImpl, 
  Element as ElementImpl 
} from '../dom'
import { DOMParser, MimeType } from '../dom/parser'


// Apply mixins
// XMLBuilder
_applyMixin(XMLDocumentImpl, XMLBuilderImpl)
_applyMixin(ElementImpl, XMLBuilderImpl)


/**
 * Creates an XML document.
 * 
 * @param options - builder options
 * 
 * @returns document node
 */
export function create(options?: XMLBuilderOptions): XMLBuilder {
  options = options || { version: "1.0" }
  if (!options.stringify) {
    options.stringify = new XMLStringifierImpl(options)
  }

  const doc = DOMImplementationInstance.createDocument('', '') as any
  doc._options = options
  return <XMLBuilder><unknown>doc
}


/**
 * Creates an XML document by parsing the given document representation.
 * 
 * @param document - a string containing an XML document or a JS object 
 * representing nodes to insert
 * @param options - builder options
 * 
 * @returns document node
 */
export function parse(document: string | ExpandObject, options?: XMLBuilderOptions): XMLBuilder {
  options = options || { version: "1.0" }
  if (!options.stringify) {
    options.stringify = new XMLStringifierImpl(options)
  }

  if (isString(document)) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(document, MimeType.XML) as any
    doc._options = options
    return <XMLBuilder><unknown>doc
  } else {
    const doc = DOMImplementationInstance.createDocument('', '') as any
    doc._options = options
    const builder = <XMLBuilder><unknown>doc
    builder.ele(document)
    return builder
  }
}
