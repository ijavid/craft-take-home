export function insertAtIndex<T>(array: T[], item: T, index: number = array.length) {

  if (index > array.length) {
    index = array.length
  }
  if (index < 0) {
    throw new Error('Invalid argument');
  }

  for (let i = array.length; i > index; i--) {
    array[i] = array[i-1];
  }
  array[index] = item; // i === index
  return array;
}

export function insertAfterItem<T>(array: T[], item: T, afterItem: T) {
  let i;
  for (i = array.length; i >= 0; i--) {
    if (array[i-1] == afterItem) {
      break;
    }
    array[i] = array[i-1];
  }
  array[i] = item;
  return array;
}


// https://stackoverflow.com/questions/30304719/javascript-fastest-way-to-remove-object-from-array
export function removeFromArray<T>(array: T[], predicate: (o: T) => boolean) {
  let i, j;
  for (i = 0, j = 0; i < array.length; ++i) {
    if (predicate(array[i])) {
      array[j] = array[i];
      ++j;
    }
  }
  while (j < array.length) {
    array.pop();
  }
}
