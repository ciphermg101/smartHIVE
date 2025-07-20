import yaml from 'yamljs';
import path from 'path';

const swaggerSpec = yaml.load(path.join(__dirname, 'openapi.bundled.yaml'));

export { swaggerSpec }; 