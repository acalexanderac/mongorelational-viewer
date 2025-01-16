const SchemaAnalyzer = require('./core/schemaAnalyzer');

async function test() {
  const analyzer = new SchemaAnalyzer(
    'mongodb://localhost:27017',
    'test_database'
  );

  const result = await analyzer.analyzeCollection('users');
  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error); 