import { useEffect, useState } from 'react';
import { useAsyncStorage } from '@shopify/shop-minis-react';
import MainMenu from './pages/MainMenu';
import ProfileSetup from './pages/ProfileSetup';

export default function App() {
  const { getItem, setItem } = useAsyncStorage();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    const retrieveProfileStatus = async () => {
      try {
        const result = await getItem({ key: 'hasProfile' });
        setHasProfile(result === 'true');
      } catch (error) {
        console.error('Error retrieving profile status:', error);
        setHasProfile(false);
      }
    };

    retrieveProfileStatus();
  }, []);

  if (hasProfile === null) return <div>Loading...</div>;

  const handleComplete = async () => {
    try {
      await setItem({ key: 'hasProfile', value: 'true' });
      setHasProfile(true);
    } catch (error) {
      console.error('Failed to store profile status:', error);
    }
  };

  return hasProfile ? (
    <MainMenu />
  ) : (
    <ProfileSetup onComplete={handleComplete} />
  );
}
