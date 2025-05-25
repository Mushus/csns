import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getItem, putItem } from './dynamodb'; // The module we're testing
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PutCommand, GetCommand } from '@aws-sdk/client-dynamodb'; // We don't mock these directly, but check their usage

// Mock the DynamoDBDocumentClient
const mockSend = vi.fn();
vi.mock('@aws-sdk/lib-dynamodb', async (importOriginal) => {
  const actual = await importOriginal<typeof DynamoDBDocumentClient>();
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: mockSend,
      }),
    },
  };
});


describe('DynamoDB Library', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockSend.mockReset();
    // vi.clearAllMocks(); // Alternative, if more mocks are involved
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore any other mocks if necessary
  });

  describe('putItem', () => {
    const tableName = 'TestTable';
    const item = { id: '123', data: 'test-data' };

    it('should call PutCommand with the correct TableName and Item', async () => {
      mockSend.mockResolvedValue({}); // Simulate successful send

      await putItem(tableName, item);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command).toBeInstanceOf(PutCommand);
      expect(command.input.TableName).toBe(tableName);
      expect(command.input.Item).toEqual(item);
    });

    it('should log and re-throw an error if DynamoDBDocumentClient.send fails', async () => {
      const testError = new Error('DynamoDB put error');
      mockSend.mockRejectedValue(testError);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(putItem(tableName, item)).rejects.toThrow(testError);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error putting item into table ${tableName}:`,
        testError
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getItem', () => {
    const tableName = 'TestTable';
    const id = '123';
    const expectedKey = { id };

    it('should call GetCommand with the correct TableName and Key', async () => {
      mockSend.mockResolvedValue({ Item: { id: '123', data: 'test-data' } }); // Simulate successful send

      await getItem(tableName, id);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command).toBeInstanceOf(GetCommand);
      expect(command.input.TableName).toBe(tableName);
      expect(command.input.Key).toEqual(expectedKey);
    });

    it('should return the item if found', async () => {
      const expectedItem = { id: '123', data: 'test-data' };
      mockSend.mockResolvedValue({ Item: expectedItem });

      const result = await getItem(tableName, id);

      expect(result).toEqual(expectedItem);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should return undefined if item is not found', async () => {
      mockSend.mockResolvedValue({ Item: undefined }); // Simulate item not found

      const result = await getItem(tableName, id);

      expect(result).toBeUndefined();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should log and re-throw an error if DynamoDBDocumentClient.send fails', async () => {
      const testError = new Error('DynamoDB get error');
      mockSend.mockRejectedValue(testError);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(getItem(tableName, id)).rejects.toThrow(testError);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error getting item with id ${id} from table ${tableName}:`,
        testError
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
