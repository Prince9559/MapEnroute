import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@map_search_history';

export const saveRouteToHistory = async (routeData) => {
  try {
    const existing = await AsyncStorage.getItem(HISTORY_KEY);
    let historyList = existing ? JSON.parse(existing) : [];

    // Duplicate check: agar same origin aur destination pehle se ho toh remove kar ke top par layenge
    historyList = historyList.filter(
      (item) =>
        !(
          item.origin.toLowerCase() === routeData.origin.toLowerCase() &&
          item.destination.toLowerCase() === routeData.destination.toLowerCase()
        )
    );

    const newEntry = {
      id: Date.now().toString(),
      origin: routeData.origin,
      destination: routeData.destination,
      distance: routeData.distance,
      duration: routeData.duration,
      searchedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    historyList.unshift(newEntry);

    // Sirf top 20 recent searches rakhein
    if (historyList.length > 20) {
      historyList = historyList.slice(0, 20);
    }

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(historyList));
  } catch (err) {
    console.log('Error saving history:', err);
  }
};

export const getSearchHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
};

export const removeHistoryItem = async (id) => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    const list = JSON.parse(data).filter((item) => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    return list;
  } catch (err) {
    return [];
  }
};

export const clearAllHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
    return [];
  } catch (err) {
    return [];
  }
};