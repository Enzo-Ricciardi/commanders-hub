import { GameData } from '../types';
import { functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';

// This is the single point of entry for the frontend to get game data.
// It now calls a secure backend (Firebase Cloud Function) which will
// eventually handle the entire OAuth 2.0 flow with Frontier.

const getGameDataFunction = httpsCallable(functions, 'getGameData');

export const loginAndFetchData = async (): Promise<GameData> => {
  try {
    console.log("Requesting data from Firebase backend...");
    
    // This function call triggers our backend Firebase Function.
    // In a real scenario, we might pass an auth token here.
    const result = await getGameDataFunction();
    
    // The data returned from the function is in `result.data`.
    const gameData = result.data as GameData;
    
    console.log("Data successfully received from Firebase backend.");
    return gameData;
    
  } catch (error) {
    console.error("Error fetching data from Firebase backend:", error);
    // In a real app, we would show an error message to the user.
    // For now, we'll throw the error to be caught by the calling component.
    throw new Error('Failed to connect to the mothership. Please check your network and try again.');
  }
};