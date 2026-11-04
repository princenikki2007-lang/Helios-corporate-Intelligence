/**
 * HELIOS — Document Management Module
 * Handles documents listing, filtering, and upload workflows
 */

const HeliosDocuments = (function() {
  function getDocuments() {
    return window.HELIOS_MOCK_DOCUMENTS || [];
  }

  function getDocumentById(id) {
    const docs = getDocuments();
    return docs.find(d => d.id === id) || null;
  }

  function addDocument(doc) {
    if (!window.HELIOS_MOCK_DOCUMENTS) {
      window.HELIOS_MOCK_DOCUMENTS = [];
    }
    window.HELIOS_MOCK_DOCUMENTS.unshift(doc);
    return doc;
  }

  return {
    getDocuments,
    getDocumentById,
    addDocument
  };
})();

window.HeliosDocuments = HeliosDocuments;
