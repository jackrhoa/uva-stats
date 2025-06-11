function saveState(key: string, state: any): void {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem(key, serializedState);
  } catch (error) {
    console.error("Error saving state to sessionStorage:", error);
  }
}
function loadState(key: string): any {
  try {
    const serializedState = sessionStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Error loading state from sessionStorage:", error);
    return undefined;
  }
}
export { saveState, loadState };
// This code provides utility functions to save and load state from localStorage.
