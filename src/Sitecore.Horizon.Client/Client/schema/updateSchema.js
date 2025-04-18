/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

const fs = require('fs');
const path = require('path');
const { buildClientSchema, getIntrospectionQuery, printSchema } = require('graphql');
const { parse, print, Source } = require('graphql/language');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const SERVER_SCHEMA_FILE_NAME = 'horizon.schema.server.graphqls';
const FRAGMENT_TYPES_FILE_NAME = 'horizon.schema.server.fragment-types.json';
const WORKING_DIR = __dirname;
const DEFAULT_API_GATEWAY_URI = 'https://xmcloudcm.localhost/sitecore/api/ssc/horizon/query/?sc_horizon=api&sc_headless_mode=api';

(async function () {
  // Disable certificate validation
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    let bearerToken = process.argv[2];
    if (!bearerToken) {
      bearerToken = await new Promise((resolve) => readline.question('Enter JWT token: ', (val) => resolve(val)));
      console.log();
    }

    apiUri = DEFAULT_API_GATEWAY_URI;

    await refreshServerSchema(apiUri, bearerToken);
    applySchemaFixes(SERVER_SCHEMA_FILE_NAME);
    await updateFragmentTypes(apiUri, bearerToken);

    process.exit(0);
  } catch (ex) {
    logErr(ex.toString());
    process.exit(1);
  }
})();

async function refreshServerSchema(apiUri, bearerToken) {
  logStarting('Updating GraphQL server schema');

  logInfo('Fetch introspection query result');
  const queryResult = await makeGraphqlQuery(getIntrospectionQuery(), apiUri, bearerToken);

  logInfo('Convert result to schema definition');
  const schema = buildClientSchema(queryResult);
  const printedSchema = printSchema(schema);

  logInfo('Writing the schema file');
  fs.writeFileSync(path.join(WORKING_DIR, SERVER_SCHEMA_FILE_NAME), printedSchema);

  LogFinished('Updated GraphQL server schema');
}

function applySchemaFixes(schemaFileName) {
  logStarting(`Applying schema fixes for ${schemaFileName}`);

  const mergedSchemaPath = path.join(WORKING_DIR, schemaFileName);
  const content = fs.readFileSync(mergedSchemaPath, { encoding: 'utf-8' });
  const source = new Source(content, mergedSchemaPath);
  const ast = parse(source);

  const scalarTypesUsage = ast.definitions
    .filter((def) => def.kind === 'ScalarTypeDefinition')
    .map((def) => ({ def, isUsed: false }));

  const markTypeUsage = (type) => {
    scalarTypesUsage.forEach((tu) => {
      if (type.kind === 'NamedType' && tu.def.name.value === type.name.value) {
        tu.isUsed = true;
      }
    });
  };

  // Remove description part, because syntax is not supported by the VS Code extension.
  logInfo('Removing field and argument descriptions');
  ast.definitions.forEach((def) => {
    def.description = undefined;

    if (def.fields) {
      def.fields.forEach((fld) => {
        fld.description = undefined;
        markTypeUsage(fld.type);

        if (fld.arguments) {
          fld.arguments.forEach((arg) => {
            arg.description = undefined;
            markTypeUsage(arg.type);
          });
        }
      });
    }
  });

  // Remove non-used scalar types.
  logInfo('Removing scalar types which are not used');
  ast.definitions = ast.definitions.filter(
    (def) => scalarTypesUsage.findIndex((st) => st.def == def && !st.isUsed) === -1,
  );

  logInfo('Writing back the modified GraphQL schema');
  const alteredAst = print(ast);
  fs.writeFileSync(mergedSchemaPath, alteredAst, { encoding: 'utf-8' });

  LogFinished(`Applied schema fixes for ${schemaFileName}`);
}

async function updateFragmentTypes(apiUri, bearerToken) {
  logStarting('Updating fragment types information');

  logInfo('Fetching fragment types from server');
  const tinyIntrospectionQuery = `
    {
      __schema {
        types {
          kind
          name
          possibleTypes {
            name
          }
        }
      }
    }
  `;

  const queryResult = await makeGraphqlQuery(tinyIntrospectionQuery, apiUri, bearerToken);

  logInfo('Writing fragment types to file');
  const fragmentTypesFilePath = path.join(WORKING_DIR, FRAGMENT_TYPES_FILE_NAME);
  fs.writeFileSync(fragmentTypesFilePath, JSON.stringify(queryResult, null, 2), { encoding: 'utf-8' });

  LogFinished('Updated fragment types information');
}

function logInfo(msg) {
  console.log(`\x1b[33m[Updater]: ${msg}\x1b[0m`);
}

function logStarting(msg) {
  console.log(`\x1b[35m[Updater]: **********************\x1b[0m`);
  console.log(`\x1b[35m[Updater]: ${msg}\x1b[0m`);
}

function LogFinished(msg) {
  console.log(`\x1b[32m[Updater]: ${msg}\x1b[0m`);
  console.log(`\x1b[32m[Updater]: **********************\x1b[0m`);
}

function logErr(msg) {
  console.log(`\x1b[31m${msg}\x1b[0m`);
}

async function makeGraphqlQuery(query, apiUri, token) {
  if (!token.startsWith('Bearer ')) {
    token = 'Bearer ' + token;
  }

  const response = await fetch(apiUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token },
    body: JSON.stringify({ query: query }),
  });

  if (response.status === 401) {
    throw Error(`Endpoint '${apiUri}' replied with is '401 Unauthorized'. Disable GQL authentication and run again.`);
  }

  const jsonData = await response.json();
  return jsonData.data;
}
