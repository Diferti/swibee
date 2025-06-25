import { useProfileStorage } from '../hooks/clearProfileData';

export default function SwipeScreen() {
    const { clearProfileData } = useProfileStorage();
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">Swipe Products</h2>
        <p>Main Menu</p>
        <button onClick={clearProfileData} className="bg-red-500 text-white px-4 py-2 rounded mt-4">
            Reset Profile Data
        </button>

      </div>
    );
  }