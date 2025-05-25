import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Puts an item into a DynamoDB table.
 * @param tableName The name of the DynamoDB table.
 * @param item The item to put into the table.
 */
export const putItem = async (tableName: string, item: Record<string, any>): Promise<void> => {
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  try {
    await docClient.send(command);
    console.log(`Successfully put item into table ${tableName}`);
  } catch (error) {
    console.error(`Error putting item into table ${tableName}:`, error);
    throw error;
  }
};

/**
 * Gets an item from a DynamoDB table.
 * @param tableName The name of the DynamoDB table.
 * @param id The ID of the item to retrieve.
 * @returns The item from the table, or undefined if not found.
 */
export const getItem = async (tableName: string, id: string): Promise<Record<string, any> | undefined> => {
  const command = new GetCommand({
    TableName: tableName,
    Key: { id }, // Assuming 'id' is the primary key
  });

  try {
    const { Item } = await docClient.send(command);
    if (Item) {
      console.log(`Successfully retrieved item with id ${id} from table ${tableName}`);
    } else {
      console.log(`Item with id ${id} not found in table ${tableName}`);
    }
    return Item;
  } catch (error) {
    console.error(`Error getting item with id ${id} from table ${tableName}:`, error);
    throw error;
  }
};
