import { insertAtIndex } from "./utils";

describe('insertAtIndex', () => {

  it('should insert at correct position', () => {
    const input = [0, 1, 2, 3];
    const result = insertAtIndex(input, -1, 2);
    expect(result).toEqual([0, 1, -1, 2, 3]);
  });
});
