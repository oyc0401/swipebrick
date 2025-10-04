let globalCounter = 0;

export function getNextId(): number {
  return ++globalCounter;
}