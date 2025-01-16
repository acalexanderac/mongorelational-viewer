const { MongoClient, ObjectId } = require('mongodb');

class SchemaAnalyzer {
  constructor(connectionString, dbName) {
    this.connectionString = connectionString;
    this.dbName = dbName;
  }

  async analyzeCollection(collectionName) {
    const client = await MongoClient.connect(this.connectionString);
    const db = client.db(this.dbName);
    
    try {
      // Get a sample document
      const sampleDoc = await db.collection(collectionName).findOne({});
      
      if (!sampleDoc) {
        return { error: 'Collection is empty' };
      }

      // Analyze the document structure
      const structure = this.analyzeDocument(sampleDoc);
      
      // Get collection stats
      const stats = await db.collection(collectionName).stats();

      return {
        name: collectionName,
        documentCount: stats.count,
        averageDocumentSize: stats.avgObjSize,
        fields: structure
      };

    } catch (error) {
      return { error: error.message };
    } finally {
      await client.close();
    }
  }

  analyzeDocument(doc, path = '') {
    const structure = {};

    for (const [key, value] of Object.entries(doc)) {
      const fieldPath = path ? `${path}.${key}` : key;
      
      structure[fieldPath] = {
        type: this.getFieldType(value),
        sample: this.getSampleValue(value)
      };

      // If it's an embedded document, analyze it recursively
      if (value && typeof value === 'object' && !(value instanceof ObjectId)) {
        Object.assign(structure, this.analyzeDocument(value, fieldPath));
      }
    }

    return structure;
  }

  getFieldType(value) {
    if (value instanceof ObjectId) return 'ObjectId';
    if (Array.isArray(value)) return 'Array';
    if (value instanceof Date) return 'Date';
    if (value === null) return 'Null';
    return typeof value;
  }

  getSampleValue(value) {
    if (value instanceof ObjectId) return value.toString();
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return `Array(${value.length})`;
    if (value === null) return 'null';
    if (typeof value === 'object') return '[Object]';
    return String(value);
  }
}

module.exports = SchemaAnalyzer; 