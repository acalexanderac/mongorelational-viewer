class RelationDetector {
  detectRelations(schema) {
    const relations = [];

    Object.entries(schema).forEach(([collectionName, collectionSchema]) => {
      Object.entries(collectionSchema).forEach(([fieldName, fieldInfo]) => {
        if (fieldInfo.types.has('ObjectId')) {
          // Look for naming patterns that suggest relationships
          const possibleTargetCollection = this.inferTargetCollection(fieldName);
          if (schema[possibleTargetCollection]) {
            relations.push({
              from: collectionName,
              to: possibleTargetCollection,
              type: this.inferRelationType(fieldName),
              field: fieldName
            });
          }
        }
      });
    });

    return relations;
  }

  inferTargetCollection(fieldName) {
    // Remove common suffixes like 'Id', '_id'
    return fieldName.replace(/(Id|_id)$/i, '');
  }

  inferRelationType(fieldName) {
    // Basic relationship type inference
    if (fieldName.endsWith('Ids') || fieldName.includes('_ids')) {
      return 'many';
    }
    return 'one';
  }
}

module.exports = RelationDetector; 