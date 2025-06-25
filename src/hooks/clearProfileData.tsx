import { useAsyncStorage } from '@shopify/shop-minis-react';

export function useProfileStorage() {
  const { getItem, setItem, removeItem } = useAsyncStorage();

  const clearProfileData = async () => {
    try {
      await removeItem({ key: 'hasProfile' });
      await removeItem({ key: 'gender' });
      await removeItem({ key: 'categories' });
    } catch (error) {
      console.error('Error clearing profile data:', error);
    }
  };

  return { getItem, setItem, clearProfileData };
}
